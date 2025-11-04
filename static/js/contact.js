// =============================
// CONTACT.JS
// =============================

// Wait until the page content loads
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form");

    if (!form) return; // safety check

    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const messageInput = form.querySelector("#message");

    // Helper: validate email format
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Helper: show temporary alert
    function showAlert(message, type = "success") {
        const alertBox = document.createElement("div");
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;

        // Style inline so it matches your design easily
        alertBox.style.cssText = `
            padding: 12px 18px;
            border-radius: 6px;
            margin-top: 15px;
            text-align: center;
            color: ${type === "success" ? "#155724" : "#721c24"};
            background-color: ${type === "success" ? "#d4edda" : "#f8d7da"};
            border: 1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"};
        `;

        form.appendChild(alertBox);
        setTimeout(() => alertBox.remove(), 5000);
    }

    // Form submission handling
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = form.querySelector("#subject").value.trim();
        const message = messageInput.value.trim();

        // Basic validation
        if (!name || !email || !message) {
            showAlert("Please fill out all required fields.", "error");
            return;
        }

        if (!isValidEmail(email)) {
            showAlert("Please enter a valid email address.", "error");
            return;
        }

        // Disable button while submitting
        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;

        try {
            // Send data to the server (Flask endpoint)
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message })
            });

            if (response.ok) {
                showAlert("Message sent successfully!");
                form.reset();
            } else {
                showAlert("Failed to send message. Please try again.", "error");
            }
        } catch (error) {
            console.error(error);
            showAlert("An error occurred. Please try again later.", "error");
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Optional: Live character count for message
    if (messageInput) {
        const counter = document.createElement("small");
        counter.style.display = "block";
        counter.style.textAlign = "right";
        counter.style.color = "white";
        messageInput.parentElement.appendChild(counter);

        messageInput.addEventListener("input", () => {
            const length = messageInput.value.length;
            counter.textContent = `${length}/1000 characters`;
        });
    }
});
