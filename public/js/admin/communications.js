// ── Communications Module ────────────────────────────────────
function toggleCustomEmailInput() {
    const type = document.querySelector('input[name="recipientType"]:checked').value;
    const customContainer = document.getElementById('customEmailInputContainer');
    const customEmail = document.getElementById('customEmailAddress');
    
    if (type === 'custom') {
        customContainer.classList.remove('hidden');
        customEmail.required = true;
    } else {
        customContainer.classList.add('hidden');
        customEmail.required = false;
    }
}

async function sendBroadcastEmail() {
    const btn = document.getElementById('sendEmailBtn');
    setLoading(btn, true);
    
    try {
        const type = document.querySelector('input[name="recipientType"]:checked').value;
        const customEmail = document.getElementById('customEmailAddress').value;
        const subject = document.getElementById('emailSubject').value;
        const bodyHtml = document.getElementById('emailBody').value;
        
        const payload = {
            recipientType: type,
            subject,
            bodyHtml
        };
        
        if (type === 'custom') {
            payload.email = customEmail;
        }
        
        const res = await apiRequest('POST', '/communications/send', payload);
        
        showToast('Email sent successfully!', 'success');
        document.getElementById('communicationsForm').reset();
        toggleCustomEmailInput(); // Reset UI
    } catch (e) {
        showToast('Failed to send email', 'error');
    } finally {
        setLoading(btn, false);
    }
}
