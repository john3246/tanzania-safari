# Image Management Guide

This project follows a strict and organized directory structure for managing images for Destinations and Safari Packages. This ensures that the dynamic pages can always locate the main images without requiring complex database mappings for the primary hero image.

## Directory Structure

All dynamic images are stored inside the `public/images` folder:

```text
public/images/
├── destinations/
│   ├── mikumi/
│   │   └── main.jpg
│   ├── serengeti-national-park/
│   │   └── main.jpg
│   ├── tarangire-national-park/
│   │   └── main.jpg
│   └── ...
└── safaris/
    ├── 2-day-tarangire-ngorongoro-safari/
    │   └── main.jpg
    └── ...
```

## How Images are Linked

The frontend views (e.g., `views/destinations.html`, `views/safaris.html`) use the URL slug of the destination or package to automatically resolve the image path.

For example, if a destination in the database has the `park_slug` set to `serengeti-national-park`, the HTML will attempt to load the image from:
`/images/destinations/serengeti-national-park/main.jpg`

### Important Rules
1. **No Loose Files:** Do not place images directly in `public/images/` for packages or destinations.
2. **Slug Matching:** The folder name inside `destinations/` or `safaris/` **must exactly match** the `park_slug` or `package_slug` in the database.
3. **Primary Image:** The primary/hero image for a destination or package must always be named `main.jpg` (all lowercase).

## How to Update or Add an Image

### Updating an Existing Image
1. Locate the correct folder inside `public/images/destinations/` or `public/images/safaris/`.
2. Delete or overwrite the existing `main.jpg`.
3. Save your new image in that folder and name it exactly `main.jpg`.

### Adding Images for a New Destination/Safari
1. Create a new folder inside `public/images/destinations/` (or `safaris/`) that exactly matches the URL slug you used when creating the item in the Admin CMS. 
   - *Example: If you created a safari titled "5 Day Luxury Migration", the slug is likely `5-day-luxury-migration`.*
2. Create a folder named exactly `5-day-luxury-migration`.
3. Save your image into that folder and name it `main.jpg`.

*Note: If you need to add gallery images in the future, you can place them in this same directory (e.g., `gallery-1.jpg`, `gallery-2.jpg`) and add them to the `image_urls` text array column in the database.*
