document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("distributorForm");
    const successMessage = document.getElementById("formSuccess");

    const showError = (msg) => {
        alert(msg || 'Submission failed. Please try again later.');
        form.style.display = 'block';
        successMessage.style.display = 'none';
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = {};
        formData.forEach((v, k) => { payload[k] = v; });

        try {
            const resp = await fetch('/become-distributor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();
            if (resp.ok && data.success) {
                form.style.display = 'none';
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Server error', data);
                showError(data.error || data.warning || 'Submission failed.');
            }
        } catch (err) {
            console.error('Network or server error', err);
            showError('Unable to submit form. Please check your connection.');
        }
    });
});
