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
