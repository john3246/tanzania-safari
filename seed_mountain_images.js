/**
 * Apply mountain-trek image galleries from the local manifest to safari_packages.
 * Run after scripts/sync_mountain_trek_images.js (or on deploy when assets exist).
 *
 * Usage: node seed_mountain_images.js
 */
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const { buildPackageImages, detectMountainFamily } = require('./utils/localImages');

const MANIFEST = path.join(__dirname, 'scripts', 'mountain_trek_images_manifest.json');

async function applyManifest() {
  if (!fs.existsSync(MANIFEST)) {
    console.warn('No mountain_trek_images_manifest.json — run: node scripts/sync_mountain_trek_images.js');
    return { updated: 0 };
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  let updated = 0;

  for (const [slug, info] of Object.entries(manifest.packages || {})) {
    const family = info.family || detectMountainFamily({ packageSlug: slug }) || 'kilimanjaro';
    const parkSlugs =
      family === 'meru'
        ? ['arusha-national-park']
        : family === 'lengai'
          ? ['ol-doinyo-lengai']
          : family === 'meru_lengai'
            ? ['arusha-national-park', 'ol-doinyo-lengai']
            : ['mount-kilimanjaro-national-park'];

    const gallery = buildPackageImages({
      categorySlug: 'kilimanjaro',
      parkSlugs,
      packageSlug: slug,
      featuredImageUrl: info.featured_image_url,
      imageUrls: info.image_urls || [],
      minCount: 4,
      maxCount: 12,
    });

    if (!gallery.featured_image_url) {
      console.warn(`skip ${slug}: no images`);
      continue;
    }

    const res = await db.query(
      `UPDATE safari_packages
       SET featured_image_url = $1,
           image_urls = $2,
           updated_at = NOW()
       WHERE package_slug = $3
       RETURNING package_name`,
      [gallery.featured_image_url, gallery.image_urls, slug]
    );
    if (res.rowCount) {
      updated += 1;
      console.log(`✓ ${slug} ← ${gallery.image_urls.length} imgs (${family})`);
    }
  }

  // Also re-sync any active trek packages that match mountain names but aren't in manifest
  const extras = await db.query(
    `SELECT package_slug, package_name
     FROM safari_packages
     WHERE is_active = true
       AND (
         package_slug ILIKE '%meru%'
         OR package_slug ILIKE '%lengai%'
         OR package_slug ILIKE '%kilimanjaro%'
         OR package_slug ILIKE '%machame%'
         OR package_slug ILIKE '%marangu%'
         OR package_slug ILIKE '%lemosho%'
       )`
  );

  for (const row of extras.rows) {
    if (manifest.packages?.[row.package_slug]) continue;
    const family = detectMountainFamily({ packageSlug: row.package_slug });
    if (!family) continue;
    const parkSlugs =
      family === 'meru'
        ? ['arusha-national-park']
        : family === 'lengai'
          ? ['ol-doinyo-lengai']
          : family === 'meru_lengai'
            ? ['arusha-national-park', 'ol-doinyo-lengai']
            : ['mount-kilimanjaro-national-park'];
    const gallery = buildPackageImages({
      categorySlug: 'kilimanjaro',
      parkSlugs,
      packageSlug: row.package_slug,
      minCount: 4,
      maxCount: 12,
    });
    if (!gallery.featured_image_url) continue;
    await db.query(
      `UPDATE safari_packages
       SET featured_image_url = $1, image_urls = $2, updated_at = NOW()
       WHERE package_slug = $3`,
      [gallery.featured_image_url, gallery.image_urls, row.package_slug]
    );
    updated += 1;
    console.log(`✓ ${row.package_slug} ← ${gallery.image_urls.length} imgs (${family}) [auto]`);
  }

  return { updated };
}

async function main() {
  const result = await applyManifest();
  console.log(`Mountain images applied: ${result.updated} packages`);
  await db.pool.end();
}

if (require.main === module) {
  main().catch(async (err) => {
    console.error(err);
    try {
      await db.pool.end();
    } catch (_) {}
    process.exit(1);
  });
}

module.exports = applyManifest;
