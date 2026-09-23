# เครื่องมือครู · Teacher tools

เว็บไซต์: **https://natthaphat-math.github.io/Store/**

โปรแกรมสำหรับงานกรอกและตรวจคะแนน SGS — SGS Auto-Typer และ GradeCheck

---

## For maintenance

**This output is generated. Do not edit it in the `Store` repo.**

`projects/store-page/` in the private `Claude-Code-projects` repo is the only
copy of these pages. `gradecheck.html` began life as `projects/gradecheck-landing/`,
which was deleted when this became the source, so there is no second version of
it to keep in step.

The pages are authored there, and `.github/workflows/store-page-sync.yml` copies
them to `Store` on every push to `main` that touches that folder. The sync
mirrors deletions, so anything edited directly in `Store` is overwritten on
the next run. Edit the source, push, and the site follows.

Two files exist for the deployment rather than the design:

- `.nojekyll` stops GitHub Pages running the output through Jekyll. Nothing
  here needs it, and it only adds a build step that could surprise us later.
- `CNAME` is deliberately *not* synced. If a custom domain is set in Store's
  Pages settings, GitHub writes that file into `Store`, and the sync excludes
  it so it survives.

Each page is self-contained — inline CSS, no build step, no shared
stylesheet — so any one of them can be opened straight from disk to check a
change. Internal links are relative (`./gradecheck.html`), because Pages
serves this from the `/Store/` subpath and an absolute `/gradecheck.html`
would 404 there while looking correct locally.

Download buttons point at `/releases/latest/download/`, which always
resolves to the newest published build, so a new release needs no edit here:

| Program | Downloads from |
|---|---|
| SGS Auto-Typer | `Natthaphat-math/sgs-auto-typer-releases` |
| GradeCheck | `Natthaphat-math/gradecheck-releases` |

### Thailand downloads map

`sgs-auto-typer.html` has a "ผู้ใช้ทั่วประเทศ" block in the hero, between
the download buttons and the intro video: a map of the 77 provinces coloured
by how many downloads came from each.

- A click on either app download button asks `ipapi.co` for the visitor's
  approximate location. If it is Thailand, the province (plus city and
  coordinates rounded to ~11 km) is sent to a Google Apps Script web app,
  which appends a row to a Google Sheet. Nothing is sent when the browser
  has Global Privacy Control or Do Not Track on. The notice under the
  download buttons and the note under the map say what is collected.
- The map loads D3 from cdnjs, the outlines from `data/`, and the totals from
  the same web app, and only when the section is about to scroll into view.
- `GEO_ENDPOINT` near the bottom of the page is the web app URL. Until it is
  set, nothing is sent and every province draws as "none yet".
- `tracking/` holds the Apps Script (`Code.gs`), its deployment steps, and a
  test that the page, the script and the map agree on the 77 provinces
  (`node projects/store-page/tracking/test-province-lookup.mjs`), plus
  `test-code-gs.mjs`, which runs the script against stand-ins for Google's
  services. The sync leaves `tracking/` out of `Store`.
- `data/thailand-provinces.geojson` is geoBoundaries `THA ADM1` (OpenStreetMap,
  ODbL), simplified to 6% with mapshaper and rewound so outer rings run
  clockwise, which is what D3 expects. Each feature keeps only its ISO code.
