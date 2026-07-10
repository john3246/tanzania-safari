const db = require('../config/db');
async function run() {
    try {
        await db.query(`INSERT INTO system_settings (setting_key, setting_value, setting_category, setting_description) 
                        VALUES ('google_review_url', 'https://g.page/r/your-id/review', 'General', 'Google Review direct link') 
                        ON CONFLICT (setting_key) DO NOTHING`);
        await db.query(`INSERT INTO system_settings (setting_key, setting_value, setting_category, setting_description) 
                        VALUES ('google_maps_place_id', '', 'General', 'Google Maps Place ID for reviews') 
                        ON CONFLICT (setting_key) DO NOTHING`);
        console.log('Settings added');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
