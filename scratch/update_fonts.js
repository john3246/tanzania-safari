const fs = require('fs');
const path = require('path');

function updateFonts(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            updateFonts(filePath);
        } else if (filePath.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            content = content.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+/g, 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;500;600;700;800&family=Nunito+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated fonts in', filePath);
            }
        }
    }
}

updateFonts('views');
console.log('Done replacing fonts in HTML files.');
