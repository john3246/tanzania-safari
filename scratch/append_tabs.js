const fs = require('fs');
let js = fs.readFileSync('public/js/safari-detail.js', 'utf8');

const tabLogic = `
// Tab interaction
document.addEventListener('click', e => {
    if (e.target.classList.contains('tab-btn')) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        e.target.classList.add('active');
        const tabId = 'tab-' + e.target.dataset.tab;
        const panel = document.getElementById(tabId);
        if (panel) panel.classList.add('active');
    }
});
`;

if (!js.includes('tab-btn')) {
    fs.appendFileSync('public/js/safari-detail.js', '\n' + tabLogic);
    console.log('Appended tab logic');
}
