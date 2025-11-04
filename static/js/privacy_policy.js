document.addEventListener("DOMContentLoaded", () => {
    console.log("Privacy Policy Page Loaded");

    // Smooth fade-in animation for sections
    const fadeElements = document.querySelectorAll(
        ".summary-item, .eligibility-item, .step, .exchange-option, .timeline-item, .non-returnable-item, .satisfaction-guarantee"
    );

    const fadeIn = (el) => {
        el.classList.add("visible");
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) fadeIn(entry.target);
            });
        },
        { threshold: 0.2 }
    );

    fadeElements.forEach((el) => {
        el.classList.add("fade");
        observer.observe(el);
    });

    // Dynamic Last Updated text
    const footer = document.querySelector(".satisfaction-guarantee p");
    if (footer) {
        const date = new Date();
        const formatted = date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        footer.insertAdjacentHTML(
            "beforeend",
            `<br><small>Last Updated: ${formatted}</small>`
        );
    }

    // Optional: Cookie consent banner (demo)
    if (!localStorage.getItem("cookieConsent")) {
        const banner = document.createElement("div");
        banner.className = "cookie-banner";
        banner.innerHTML = `
            <p>We use cookies to enhance your browsing experience. 
            <button id="acceptCookies" class="btn btn-primary btn-sm">Accept</button></p>
        `;
        document.body.appendChild(banner);

        document.getElementById("acceptCookies").addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true");
            banner.remove();
        });
    }
});
