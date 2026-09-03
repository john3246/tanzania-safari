function t(key, vars) {
  if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
  return key;
}

const header = document.getElementById('header');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();

document.getElementById('contactForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('contactSubmit');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('common.sending')}`;
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(e.target));
    try {
        await API.post('/contact', { ...data, enquiry_message: data.message });
        toast(t('toast.messageSuccess'), 'success');
        e.target.reset();
    } catch (err) {
        toast(err.message || t('toast.sendFail'), 'error');
    } finally {
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t('common.sendMessage')}`;
        btn.disabled = false;
    }
});
