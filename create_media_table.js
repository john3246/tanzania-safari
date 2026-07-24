const db = require('./config/db');

const sql = `
CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    folder VARCHAR(100) DEFAULT 'general',
    entity_type VARCHAR(50),
    entity_id UUID,
    alt_text VARCHAR(255),
    caption TEXT,
    tags JSONB,
    uploaded_by INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
`;

db.query(sql).then(() => {
    console.log('Table created successfully');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
