document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("wholesaleForm");
    const success = document.getElementById("wholesaleSuccess");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {};
        formData.forEach((v, k) => { payload[k] = v; });

        try {
            const resp = await fetch(form.action || '/wholesale-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            if (resp.ok && data.success) {
                form.style.display = "none";
                success.style.display = "block";
                success.scrollIntoView({ behavior: "smooth" });
            } else {
                alert(data.error || data.warning || 'Submission failed.');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        }
    });
});
