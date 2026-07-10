const header = document.getElementById('header');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
document.getElementById('mobileToggle')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.toggle('active'); document.getElementById('menuOverlay')?.classList.toggle('active'); });
document.getElementById('menuOverlay')?.addEventListener('click', () => { document.getElementById('mainNav')?.classList.remove('active'); document.getElementById('menuOverlay')?.classList.remove('active'); });
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

document.getElementById('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('contactSubmit');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(e.target));
    try {
        await API.post('/contact', { ...data, enquiry_message: data.message });
        toast('Message sent! We\'ll respond within 24 hours.', 'success');
        e.target.reset();
    } catch (err) {
        toast(err.message || 'Failed to send. Please try again.', 'error');
    } finally {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
    }
});