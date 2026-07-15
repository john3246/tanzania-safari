const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const files = walk('./views');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('rel="icon"')) {
        content = content.replace(/(<\/title>)/i, '$1\n    <link rel="icon" type="image/png" href="/images/logo.png">');
        fs.writeFileSync(file, content);
    }
});
console.log('Favicon added to HTML files.');
