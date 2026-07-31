# Group Safaris + Safaris Nav Hubs — Change Log

All of these changes are already committed and pushed to GitHub on branch:

`cursor/group-safaris-nav-hubs-2964`

PR: https://github.com/john3246/tanzania-safari/pull/2

## Get the changes on your local machine

```bash
cd /path/to/tanzania_safari
git fetch origin
git checkout cursor/group-safaris-nav-hubs-2964
# or merge into main:
git checkout main
git pull origin main
git merge origin/cursor/group-safaris-nav-hubs-2964
git push origin main
```

## Run SQL (required before using group safaris)

```bash
# Option A — full migration helper
node run_migration.js

# Option B — run this file manually in Postgres (pgAdmin / psql)
# database/group_safaris_schema.sql
```

## Files added

| File | Purpose |
|------|---------|
| `database/group_safaris_schema.sql` | Raw SQL: group columns, `group_departures`, booking link, category seeds |
| `repositories/GroupDepartureRepository.js` | Departures CRUD + public calendar queries |
| `controllers/groupSafari.controller.js` | Public list / detail / request trip |
| `controllers/admin/GroupDepartureController.js` | Admin departures + mark package as group |
| `routes/api/group-departures.routes.js` | `GET/POST /api/group-departures` |
| `routes/admin/group-departures.routes.js` | Admin `/api/admin/group-departures` |
| `public/admin-partials/pages/group-safaris.html` | CMS Group Safaris page |
| `public/js/admin/group-safaris.js` | CMS JS (mark tour, add/edit departures, seats) |
| `public/css/group-safaris.css` | Public group listing/detail styles |
| `public/js/group-safaris.js` | Public calendar page |
| `public/js/group-safari-detail.js` | Public departure detail + request form |
| `public/js/safari-hub.js` | Kilimanjaro / Migrations / Zanzibar hubs |
| `views/group-safaris.html` | `/group-safaris` |
| `views/group-safari-detail.html` | `/group-safaris/:slug` |
| `views/safari-hub.html` | Shared hub template for kili/migrations/zanzibar |

## Files modified

| File | Change |
|------|--------|
| `run_migration.js` | Auto-applies group safari schema steps |
| `routes/api.js` | Mounts group-departures public routes |
| `routes/admin.js` | Mounts admin group-departures routes |
| `routes/admin/tours.routes.js` | Zod fields for `is_group_tour` + group meta |
| `routes/index.js` | Page routes + sitemap entries for hubs/departures |
| `repositories/TourCMSRepository.js` | Maps group fields on create/update |
| `repositories/package.repository.js` | Excludes group tours from classic `/packages` listing |
| `public/includes/header.html` | Safaris dropdown menu |
| `public/css/main.css` | Desktop + mobile dropdown styles |
| `public/js/layout-loader.js` | Mobile accordion for Safaris dropdown |
| `public/js/main.js` | Homepage group teaser (categories cards removed) |
| `views/index.html` | Categories section → Group Safaris entry CTA |
| `public/admin-partials/sidebar.html` | Group Safaris CMS nav link |
| `public/js/admin/core.js` | Loads `group-safaris` page |
| `views/admin/index.html` | Includes `group-safaris.js` |

## Public URLs

- `/group-safaris` — departure calendar
- `/group-safaris/:slug` — departure detail (request trip)
- `/kilimanjaro`, `/migrations`, `/zanzibar` — category hubs
- `/safaris` — classic/private packages (unchanged core)

## CMS

Admin → **Group Safaris**
1. Mark an existing tour as group
2. Add fixed departures (dates, capacity, price, status)
3. Adjust seats / publish

## APIs

- `GET /api/group-departures`
- `GET /api/group-departures/:slug`
- `POST /api/group-departures/:slug/request`
- `GET/POST/PUT/DELETE /api/admin/group-departures`
- `POST /api/admin/group-departures/packages/mark`
- `PATCH /api/admin/group-departures/:id/seats`
