// process.js
document.addEventListener("DOMContentLoaded", function () {
    const steps = document.querySelectorAll(".process-step");

    // Add animation when scrolling into view
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    steps.forEach(step => {
        observer.observe(step);
    });

    console.log("Our Process page loaded successfully!");
});
