const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\john\\.gemini\\antigravity-ide\\brain\\00a49e69-5095-4629-acc5-2f5d250f59f1\\.system_generated\\tasks\\task-122.log';
const uploadsDir = path.join(__dirname, '..', 'uploads');

const logContent = fs.readFileSync(logPath, 'utf8');
const regex = /Optimized (.*?) -> (.*?)\.webp/g;

let match;
while ((match = regex.exec(logContent)) !== null) {
    const oldName = match[1];
    const newBasename = match[2];
    
    // get old extension
    const ext = path.extname(oldName);
    const newName = newBasename + ext;

    const oldPath = path.join(uploadsDir, oldName);
    const newPath = path.join(uploadsDir, newName);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${oldName} to ${newName}`);
    }
}
