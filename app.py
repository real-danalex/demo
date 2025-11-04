from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from itsdangerous import URLSafeTimedSerializer
import os
from mysql.connector import Error
import mysql.connector
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from config import Config
from dotenv import load_dotenv


load_dotenv()

# Database Configuration
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')  # ✅ This line is REQUIRED
DB_NAME = os.getenv('DB_NAME', 'bakery_db')

# Email Configuration (Optional - for order notifications)
MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'dan286545@gmail.com')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'dan286545@gmail.com')



app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'

# Mail configuration (use env or defaults above)
app.config.update({
    'MAIL_SERVER': MAIL_SERVER,
    'MAIL_PORT': MAIL_PORT,
    'MAIL_USE_TLS': MAIL_USE_TLS,
    'MAIL_USERNAME': MAIL_USERNAME,
    'MAIL_PASSWORD': MAIL_PASSWORD,
    'MAIL_DEFAULT_SENDER': MAIL_DEFAULT_SENDER,
})

# Initialize Flask-Mail
try:
    mail = Mail(app)
except Exception as _e:
    # If Mail cannot be initialized (missing dependency/config), set mail to None
    mail = None

# MySQL Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/bakery_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # Shows SQL queries in console

db = SQLAlchemy(app)

# ============================================
# DATABASE MODELS
# ============================================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum('customer', 'distributor', 'wholesale', name='user_types'), default='customer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50), index=True)
    image = db.Column(db.String(255))
    in_stock = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Product {self.name}>'

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum('pending', 'confirmed', 'processing', 'delivered', 'cancelled', name='order_status'), default='pending')
    delivery_address = db.Column(db.Text)
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.Enum('pending', 'paid', 'failed', name='payment_status'), default='pending')
    order_date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Order {self.id} - {self.status}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Relationship to Product
    product = db.relationship('Product', backref='order_items')
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'

class Contact(db.Model):
    __tablename__ = 'contacts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('new', 'read', 'replied', name='contact_status'), default='new')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<Contact {self.email}>'

class DistributorApplication(db.Model):
    __tablename__ = 'distributor_applications'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    business_name = db.Column(db.String(200))
    location = db.Column(db.String(200))
    experience = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', name='application_status'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<DistributorApplication {self.email}>'

# ============================================
# PUBLIC ROUTES
# ============================================

@app.route('/')
def home():
    """Homepage with hero slider and mission statement"""
    products = Product.query.filter_by(in_stock=True).limit(6).all()
    return render_template('index.html', products=products)

@app.route('/about')
def about():
    """About us page - company story, mission, vision"""
    return render_template('about.html')

@app.route('/products')
def products():
    """Product catalog page"""
    category = request.args.get('category', 'all')
    search = request.args.get('search', '')
    
    query = Product.query.filter_by(in_stock=True)
    
    if category != 'all':
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Product.name.like(f'%{search}%'))
    
    products = query.all()
    categories = db.session.query(Product.category).distinct().all()
    
    return render_template('products.html', 
                         products=products, 
                         category=category, 
                         categories=categories,
                         search=search)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    """Individual product detail page"""
    product = Product.query.get_or_404(product_id)
    related_products = Product.query.filter(roduct.category == product.category,
        Product.id != product_id,
        Product.in_stock == True
    ).limit(4).all()
    return render_template('product_detail.html', product=product, related_products=related_products)

@app.route('/our-process')
def our_process():
    """Our baking process page"""
    return render_template('our_process.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact us page with form and email sending"""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        subject = request.form.get('subject', 'No Subject')
        message = request.form['message']

        # Save to database
        contact = Contact(
            name=name,
            email=email,
            subject=subject,
            message=message
        )
        db.session.add(contact)
        db.session.commit()

        # Compose email
        email_subject = f"New Contact Message: {subject}"
        email_body = f"""
        You have received a new message from Butterburst Bakery contact form.

        Name: {name}
        Email: {email}
        Subject: {subject}
        Message:
        {message}
        """

        try:
            msg = Message(email_subject, recipients=['dan286545@gmail.com'])  # your receiving email
            msg.body = email_body
            mail.send(msg)
            flash('Thank you! Your message has been sent successfully.', 'success')
        except Exception as e:
            print(f"Email sending failed: {e}")
            flash('Your message was saved but could not be sent via email. Please try again later.', 'warning')

        return redirect(url_for('contact'))

    return render_template('contact.html')


# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Customer registration/signup"""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        password = request.form['password']
        user_type = request.form.get('user_type', 'customer')
        
        # Check if user exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email already registered. Please login.', 'error')
            return redirect(url_for('register'))
        
        # Create new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            name=name,
            email=email,
            phone=phone,
            password=hashed_password,
            user_type=user_type
        )
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            session['user_type'] = user.user_type
            flash(f'Welcome back, {user.name}!', 'success')
            
            # Redirect based on user type
            if user.user_type == 'distributor':
                return redirect(url_for('distributor_dashboard'))
            else:
                return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('home'))

# ============================================
# CUSTOMER ROUTES (Requires Login)
# ============================================

@app.route('/dashboard')
def dashboard():
    """Customer dashboard"""
    if 'user_id' not in session:
        flash('Please login to access your dashboard.', 'error')
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.order_date.desc()).all()
    return render_template('dashboard.html', user=user, orders=orders)

@app.route('/cart')
def cart():
    """Shopping cart page"""
    cart_items = session.get('cart', [])
    total = 0
    products_in_cart = []
    
    for item in cart_items:
        product = Product.query.get(item['product_id'])
        if product:
            subtotal = float(product.price) * item['quantity']
            products_in_cart.append({
                'product': product,
                'quantity': item['quantity'],
                'subtotal': subtotal
            })
            total += subtotal
    
    return render_template('cart.html', cart=products_in_cart, total=total)

@app.route('/add-to-cart/<int:product_id>', methods=['POST'])
def add_to_cart(product_id):
    """Add product to cart"""
    product = Product.query.get_or_404(product_id)
    quantity = int(request.form.get('quantity', 1))
    
    if not product.in_stock:
        flash('Sorry, this product is out of stock.', 'error')
        return redirect(url_for('products'))
    
    if 'cart' not in session:
        session['cart'] = []
    
    cart = session['cart']
    
    # Check if product already in cart
    found = False
    for item in cart:
        if item['product_id'] == product_id:
            item['quantity'] += quantity
            found = True
            break
    
    if not found:
        cart.append({
            'product_id': product_id,
            'quantity': quantity
        })
    
    session['cart'] = cart
    session.modified = True
    flash(f'{product.name} added to cart!', 'success')
    return redirect(request.referrer or url_for('products'))

@app.route('/update-cart/<int:product_id>', methods=['POST'])
def update_cart(product_id):
    """Update cart item quantity"""
    quantity = int(request.form.get('quantity', 1))
    
    if 'cart' in session:
        cart = session['cart']
        for item in cart:
            if item['product_id'] == product_id:
                if quantity > 0:
                    item['quantity'] = quantity
                else:
                    cart.remove(item)
                break
        session['cart'] = cart
        session.modified = True
        flash('Cart updated successfully.', 'success')
    
    return redirect(url_for('cart'))

@app.route('/remove-from-cart/<int:product_id>')
def remove_from_cart(product_id):
    """Remove product from cart"""
    if 'cart' in session:
        cart = session['cart']
        session['cart'] = [item for item in cart if item['product_id'] != product_id]
        session.modified = True
        flash('Product removed from cart.', 'info')
    return redirect(url_for('cart'))

@app.route('/checkout', methods=['GET', 'POST'])
def checkout():
    """Checkout process"""
    if 'user_id' not in session:
        flash('Please login to checkout.', 'error')
        return redirect(url_for('login'))
    
    cart = session.get('cart', [])
    if not cart:
        flash('Your cart is empty.', 'error')
        return redirect(url_for('products'))
    
    if request.method == 'POST':
        delivery_address = request.form['delivery_address']
        payment_method = request.form.get('payment_method', 'cash')
        
        # Calculate total
        total = 0
        order_items_data = []
        
        for item in cart:
            product = Product.query.get(item['product_id'])
            if product:
                subtotal = float(product.price) * item['quantity']
                total += subtotal
                order_items_data.append({
                    'product_id': product.id,
                    'quantity': item['quantity'],
                    'price': product.price
                })
        
        # Create order
        order = Order(
            user_id=session['user_id'],
            total_amount=total,
            delivery_address=delivery_address,
            payment_method=payment_method,
            status='pending'
        )
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Add order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        # Clear cart
        session.pop('cart', None)
        session.modified = True
        
        flash('Order placed successfully! We will contact you soon.', 'success')
        return redirect(url_for('order_confirmation', order_id=order.id))
    
    # Calculate cart total for GET request
    total = 0
    cart_products = []
    for item in cart:
        product = Product.query.get(item['product_id'])
        if product:
            subtotal = float(product.price) * item['quantity']
            cart_products.append({
                'product': product,
                'quantity': item['quantity'],
                'subtotal': subtotal
            })
            total += subtotal
    
    return render_template('checkout.html', cart=cart_products, total=total)

@app.route('/order-confirmation/<int:order_id>')
def order_confirmation(order_id):
    """Order confirmation page"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != session['user_id']:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('dashboard'))
    
    return render_template('order_confirmation.html', order=order)

@app.route('/order/<int:order_id>')
def order_detail(order_id):
    """View order details"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    order = Order.query.get_or_404(order_id)
    
    if order.user_id != session['user_id']:
        flash('Unauthorized access.', 'error')
        return redirect(url_for('dashboard'))
    
    return render_template('order_detail.html', order=order)

# ============================================
# INFORMATION ROUTES
# ============================================

@app.route('/FAQs')
def FAQs():
    """Frequently Asked Questions page"""
    return render_template('FAQs.html')

# ============================================
# RETURNS POLICY ROUTE
# ============================================

@app.route('/return-policy')
def return_policy():
    """Returns & Refund Policy page"""
    return render_template('return_policy.html')

# ============================================
# PRIVACY POLICY ROUTE
# ============================================

@app.route('/privacy-policy')
def privacy_policy():
    """Privacy Policy page"""
    return render_template('privacy_policy.html')

# ============================================
# DISTRIBUTOR ROUTES
# ============================================


@app.route('/become-distributor', methods=['GET', 'POST'])
def become_distributor():
    """Distributor information and application page"""
    if request.method == 'POST':
        # Accept both JSON (AJAX) and standard form submissions
        if request.is_json:
            data = request.get_json()
        else:
            # fall back to form data
            data = request.form.to_dict()

        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        location = data.get('location')
        experience = data.get('experience')

        # Save to database (optional)
        new_app = DistributorApplication(
            name=name, email=email, phone=phone, location=location, experience=experience
        )
        db.session.add(new_app)
        db.session.commit()

        # Email to admin
        subject = f"New Distributor Application from {name}"
        body = f"""
New Distributor Application Received:

Name: {name}
Email: {email}
Phone: {phone}
Location: {location}
Experience: {experience or 'N/A'}
        """

        # Send email only if mail is configured; otherwise just return success after saving
        if mail is not None:
            try:
                msg = Message(subject, recipients=[MAIL_DEFAULT_SENDER])
                msg.body = body
                mail.send(msg)
                return jsonify({'success': True})
            except Exception as e:
                print(f"Email error: {e}")
                # still return success but include error for debugging
                return jsonify({'success': False, 'error': str(e)})
        else:
            # Mail not configured; return success but indicate no email sent
            return jsonify({'success': True, 'warning': 'mail-not-configured'})

    return render_template('become_distributor.html')


@app.route('/distributor-dashboard')
def distributor_dashboard():
    """Distributor portal"""
    if 'user_id' not in session or session.get('user_type') != 'distributor':
        flash('Access denied. Distributor account required.', 'error')
        return redirect(url_for('home'))
    
    user = User.query.get(session['user_id'])
    return render_template('distributor_dashboard.html', user=user)

# ============================================
# WHOLESALE ROUTES
# ============================================

@app.route('/wholesale', methods=['GET', 'POST'])
def wholesale():
    """Wholesale information and quote request page"""
    if request.method == 'POST':
        business_name = request.form.get('businessName')
        contact_name = request.form.get('contactName')
        email = request.form.get('email')
        phone = request.form.get('phone')
        order_details = request.form.get('orderDetails')

        # Optional: Save to DB
        # wholesale_request = WholesaleRequest(
        #     business_name=business_name,
        #     contact_name=contact_name,
        #     email=email,
        #     phone=phone,
        #     order_details=order_details
        # )
        # db.session.add(wholesale_request)
        # db.session.commit()

        # Compose email
        subject = f"New Wholesale Quote Request from {contact_name}"
        body = f"""
        New Wholesale Inquiry Received:

        Business Name: {business_name}
        Contact Name: {contact_name}
        Email: {email}
        Phone: {phone}
        Order Details:
        {order_details}
        """

        # Send to your company email
        msg = Message(subject, recipients=['dan286545@gmail.com'])
        msg.body = body
        mail.send(msg)

        flash('Your wholesale request has been sent successfully! We’ll get back to you shortly.', 'success')
        return redirect(url_for('wholesale'))

    return render_template('wholesale.html')

@app.route('/wholesale-order', methods=['GET', 'POST'])
def wholesale_order():
    """Wholesale order form"""
    if 'user_id' not in session:
        flash('Please login or register as a wholesale customer.', 'error')
        return redirect(url_for('register'))
    
    if session.get('user_type') not in ['wholesale', 'distributor']:
        flash('Wholesale account required.', 'error')
        return redirect(url_for('wholesale'))
    
    if request.method == 'POST':
        # Handle wholesale order (similar to regular order but with bulk pricing)
        flash('Wholesale order submitted! We will contact you with a quote.', 'success')
        return redirect(url_for('dashboard'))
    
    products = Product.query.all()
    return render_template('wholesale_order.html', products=products)

# ============================================
# API ROUTES (for AJAX requests)
# ============================================

@app.route('/api/products')
def api_products():
    """API endpoint to get products as JSON"""
    products = Product.query.filter_by(in_stock=True).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': float(p.price),
        'category': p.category,
        'image': p.image
    } for p in products])

@app.route('/api/cart-count')
def api_cart_count():
    """API endpoint to get cart item count"""
    cart = session.get('cart', [])
    total_items = sum(item['quantity'] for item in cart)
    return jsonify({'count': total_items})

@app.route('/api/search')
def api_search():
    """API endpoint for product search"""
    query = request.args.get('q', '')
    if len(query) < 2:
        return jsonify([])
    
    products = Product.query.filter(
        Product.name.like(f'%{query}%'),
        Product.in_stock == True
    ).limit(10).all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': float(p.price),
        'image': p.image
    } for p in products])

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def page_not_found(e):
    """404 error page"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    """500 error page"""
    db.session.rollback()
    return render_template('500.html'), 500

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_db():
    """Initialize database with sample data"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Add sample products if database is empty
        if Product.query.count() == 0:
            sample_products = [
                Product(name='White Bread', description='Soft and fluffy white bread perfect for sandwiches', 
                       price=500, category='white', image='white_bread.jpg', in_stock=True),
                Product(name='Wheat Bread', description='Wholesome wheat bread packed with nutrients', 
                       price=600, category='wheat', image='wheat_bread.jpg', in_stock=True),
                Product(name='Multigrain Bread', description='Healthy multigrain bread with seeds', 
                       price=700, category='multigrain', image='multigrain_bread.jpg', in_stock=True),
                Product(name='Sweet Bread', description='Deliciously sweet bread for breakfast', 
                       price=550, category='sweet', image='sweet_bread.jpg', in_stock=True),
                Product(name='Sandwich Loaf', description='Perfect sized loaf for sandwiches', 
                       price=450, category='white', image='sandwich_loaf.jpg', in_stock=True),
                Product(name='Family Pack', description='Large family-sized bread', 
                       price=800, category='white', image='family_pack.jpg', in_stock=True),
            ]
            db.session.add_all(sample_products)
            db.session.commit()
            print("Sample products added successfully!")

# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)