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

### The SGS page's first screen

- Copy on the left, the intro video on the right; one column under 940px,
  with the video after the buttons.
- The four modes are labels under the intro (ผลการเรียน free, the other three
  three free tries each), not a sentence.
- A short "what you get" list sits under the download buttons: Windows and
  Mac on one licence, the practice page, the install pictures, and GradeCheck.
  The download section repeats it with the four modes added. It names no
  other product.
- On a phone the header shows ดาวน์โหลด and a เมนู button, a `<details>`
  that holds every other link. It works with no script; a small script
  closes it after a link, a tap outside, or Esc.
- The FAQ is four cards, grouped by what went wrong: ก่อนเริ่มใช้,
  กดเริ่มแล้วไม่พิมพ์, คะแนนลงไม่ถูก, ไลเซนส์และการชำระเงิน. Each card shows
  how many questions it holds; update that count when a question is added.
  Answers only restate what the page already says elsewhere.
- "ไฟล์ที่รองรับ และการตั้งค่าที่ปรับได้" is four cards in the FAQ style
  instead of a table: the file kinds, then the settings grouped as ความเร็ว,
  การเลื่อนช่อง and เบราว์เซอร์. Each setting shows its default as a green
  pill and when to change it underneath.
- The four mode cards carry both apps' 2.4.0 captures,
  `images/windows/win-2.4.0/` and `images/macos/mac-2.4.0/` (PNG plus WebP).
  `#modes[data-shots]` picks one: the visitor's own system (Windows when
  unknown, and with no script), with a Windows / Mac switch above the cards. The intro video's poster is
  still the 1.2.1 frame, because it is a frame of that video.
- วิธีใช้งาน is an `<ol class="flow">`: number beside the title, three
  columns on a laptop, a single joined path on a phone. Its text names both
  apps' ways in: Ctrl+C / ⌘C, and the practice page from "?" on Mac or
  "คู่มือการติดตั้งและใช้งาน" on Windows.
- Each FAQ question is one `<details>`, all closed, and the version
  history shows the newest three with the rest folded under
  "ดูเวอร์ชั่นก่อนหน้า". A link to an id inside a fold opens it. A new
  version goes at the top as before; move the fourth into the fold and
  update the count in its summary.
- A script in `<head>` sets `html[data-os]` to `win`, `mac`, `phone` or
  `other`. On Windows or Mac, that system's download goes first, in the
  hero and in the download cards, and the other button turns secondary.
  The buttons are moved, not rebuilt, so the install jump and the province
  count still fire. On a phone or tablet the hero says the app runs on a
  computer and offers "ส่งลิงก์หน้านี้ไปเปิดบนคอม" (share sheet, or copy the
  link). With no script, both buttons stay as they are.
- The privacy text under the map is a `<details>` (one line, "ดูรายละเอียด");
  both "รายละเอียด" links open it. The geoBoundaries / OpenStreetMap credit
  stays visible under it, as the ODbL asks.
- `tracking/test-sgs-page.mjs` checks this in Chromium at 390px and 1280px,
  with every outside request faked:
  `node projects/store-page/tracking/test-sgs-page.mjs`. Set `D3_FILE` to a
  local `d3.min.js` to include the map drawing; without it that check is
  skipped and the run says so.

### Practice page

`practice.html` is the practice target for SGS Auto-Typer, opened in the
browser instead of downloading `mock-form.html`. Three tabs, one per SGS page
the app types into (`#grades`, `#traits`, `#reading`); สมรรถนะ types into
Excel, so it has none.

- Each row has the same Tab stops as the real page, so the counts both apps
  carry (TypingMode.swift / modes.py) land exactly: ผลการเรียน runs straight
  on; คุณลักษณะ is tick box, Q1-Q10, หมายเหตุ (รวม and ผลการประเมิน are not
  stops); การอ่าน is tick box, Q1-Q5, ผลการประเมิน, หมายเหตุ. "มีช่องคั่นหลัง
  ปลายภาค" adds one box after ปลายภาค, the หลังกลางภาค case that needs 2.
- "คัดลอกข้อมูลตัวอย่าง" puts a made-up class on the clipboard as
  tab-separated text with headers the app recognises. The values are fixed,
  so the page can mark each box right or wrong; การอ่าน's sample has one ร
  to show a skipped student.
- The result line says, as the app types: nothing yet, so far so good,
  boxes moved from student N (a value in a box that must stay empty), values
  that differ from the sample, or all done.
- No tracking at all, unlike the SGS page: no map, no download count.
- Its test types the apps' own keystrokes, with the right count and one
  short, for every page and both browser behaviours:
  `node projects/store-page/tracking/test-practice-page.mjs`.

The apps still carry their own `mock-form.html`; pointing the in-app button
here needs an app release.

### Thailand downloads map

`sgs-auto-typer.html` has a "ผู้ใช้ทั่วประเทศ" section just above the
download cards: a map of the 77 provinces coloured by how many downloads came
from each.

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

### Buying and the licence status page

`buy.html` sells SGS Auto-Typer licences by PromptPay. The QR is generated
with the amount already in it, from the K PLUS e-wallet ID in the seller's
own QR. The buyer uploads their slip and chooses one of two routes:
- **Instant (+5฿):** the QR on the slip is checked with EasySlip, and the
  keys appear on the page and are emailed.
- **Manual:** the slip is saved for the seller to check. Ticking อนุมัติ in
  the orders sheet signs and emails the keys.

`license-status.html` answers "I paid, where is my key?" for one email at a
time. It is linked from the SGS page (menu, price section, FAQ, contact,
footer), the GradeCheck payment note and footer, and the store home footer.

Both talk to one Apps Script web app, `tracking/shop/`. It signs the same
keys as `licensing/generate_license.py`, with the private key held in Script
Properties, and reads and writes a private orders spreadsheet. The QR
libraries are vendored in `vendor/`: jsQR (Apache-2.0) and qrcode-generator
(MIT). Until the endpoints in the two pages are set, the buy page points to
the Tally form and the status page says the check is not open yet.
Setup: `tracking/shop/README.md`. Tests:
`node projects/store-page/tracking/shop/test-shop.mjs`.
