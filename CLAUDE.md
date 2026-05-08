# CLAUDE.md

Guidance for Claude Code when working in this repository.

> **Repo owner**: additional private guidance lives in `CLAUDE.local.md` (gitignored). Read it too if it exists.

## What this is

The source for **https://mfcabrera.com** (also reachable at `mfcabrera.github.io`). Personal site and blog. Jekyll on the al-folio v0.16.3 theme, deployed via GitHub Pages from `master`.

It is **not** an academic website even though al-folio was originally designed for academics. The al-folio "academic" surfaces (publications, projects, news, books, teaching, structured CV) have been removed. What remains: home, writing (blog), talks, code, about.

## Visual identity (read before touching SCSS)

The look is **the Runbook design language**, ported across from the repo owner's Databricks Berlin talk deck. Same person, same voice, different surface. **Do not propose Chirpy / Hydejack / Tufte / a different theme** without checking first — this aesthetic was a deliberate decision and has identity continuity with the slides.

Tokens (in `_sass/_runbook.scss`):

- Palette: paper `#F5F1E8`, paper-alt `#EBE4D2`, ink `#141414`, muted `#6B6B6B`, rule `rgba(20,20,20,0.22)`, accent `#D93A1A`, rb-black `#0E0E0E`
- Type stack: **Source Serif 4** (display, italic for emphasis), **Inter** (body), **JetBrains Mono** (chrome, labels, eyebrows; uppercase, 0.14–0.22em tracking)

Discipline (non-negotiable):

- One accent per surface, applied to ≤1 element. The `<strong>` tag is **ink at 600**, not accent. For the rare line that should pop, use `<span class="rb-pull">…</span>`.
- Body links are ink with a hairline `var(--rb-rule-color)` underline. Accent only on hover.
- Hairlines, not fills. Cards are `border: 1px solid var(--rb-rule-color); background: transparent;`.
- No shadows, no gradients, `border-radius` ≤ 2px. No emoji. No icons.
- Dark mode is the inverted paper palette (rb-black bg, paper text). Accent stays.

## Site architecture

### Content

- `_pages/home.md` — homepage at `/` (TOC layout: 01 Writing / 02 Talks / 03 Code). Uses the `home` layout. **This is the homepage**, not `_pages/about.md`.
- `_pages/about.md` — narrative About page at `/about/`.
- `_pages/blog.md` — `/blog/` archive (Runbook `rb-numrow` style).
- `_pages/talks.md` — `/talks/` page reading from `_data/talks.yml`.
- `_pages/404.md` — error page.
- `_posts/` — published posts (Markdown front-matter). Posts get Giscus comments by default via `_config.yml` defaults block.
- `_drafts/` — al-folio sample posts kept as feature reference (not published; Jekyll only emits drafts with `--drafts`).

### Data

- `_data/socials.yml` — github / linkedin / x / rss icons.
- `_data/talks.yml` — talks list. Used by both homepage section 02 and the `/talks/` page.
- `_data/repositories.yml` — curated repos for homepage section 03. Schema: `github_user` + `repos: [{name, description, lang, url}]`. Renders inline as `rb-numrow--repo`, no external github-readme-stats dependency.
- `_data/citations.yml`, `_data/coauthors.yml`, `_data/venues.yml` — Jekyll Scholar bibliography helpers, dormant (papers.bib is empty).

### Layouts (custom or modified)

- `_layouts/home.liquid` — TOC homepage. **Custom** (not stock al-folio).
- `_layouts/post.liquid` — Runbook breadcrumb header (no FA icons), mono-uppercase post-meta, hairline underline on category links.
- `_layouts/archive.liquid` — `rb-post-header` style, no FA icons.
- `_layouts/page.liquid` — used by About, Talks. Stock al-folio with Runbook overrides.
- `_layouts/about.liquid` — present but **unused** (homepage is `home`, not `about`). Safe to ignore.
- `_layouts/cv.liquid` — **deleted**.

### Styles

- `_sass/_runbook.scss` — design tokens, mixins (`rb-mono-chrome`, `rb-figure`).
- `_sass/_runbook-overrides.scss` — al-folio CSS variable remapping + base element restyling + utility classes (`.rb-eyebrow`, `.rb-pull`, `.rb-card`, `.rb-numrow`, `.rb-figure-img`, `.rb-figure-embed`, etc.). Loaded LAST in `assets/css/main.scss` so it wins the cascade.
- `_sass/_themes.scss` — al-folio's theme variables. Don't edit; override via `_runbook-overrides.scss`.

### Custom utilities

- `.rb-pull` — for the one accent line per post that should scan in a second
- `.rb-eyebrow` / `.rb-eyebrow--muted` — mono-uppercase labels
- `.rb-numrow` (and `--repo` variant) — runbook numbered row used on archive + homepage TOC
- `.rb-figure-img` / `.rb-figure-embed` — photo / iframe with hairline border + mono caption
- `.rb-prose` — long-form narrative wrapper (used on About). Use `markdown="1"` attribute when wrapping markdown content in HTML.
- `.rb-quickfacts` — sidebar definition list (used on About)

## Commenting and embeds

- **Giscus**: comments on posts via GitHub Discussions, mapping by `pathname`. Repo: `mfcabrera/mfcabrera.github.io`, category: `General`. Default-on for posts via `_config.yml` defaults block. Container styled in `_runbook-overrides.scss` with mono "Comments" eyebrow + hairline rule.
- **Speaker Deck embeds**: use `<figure class="rb-figure-embed">` wrapping an `<iframe src="https://speakerdeck.com/player/{ID}">`. The native aspect ratio is 710:399.

## Custom domain

- Live at **https://mfcabrera.com**
- `mfcabrera.github.io` still works and redirects.
- DNS: GoDaddy. Apex has 4 A records to GitHub Pages IPs; `www` CNAME points to `mfcabrera.com`.
- `CNAME` file at repo root contains `mfcabrera.com`.
- `_config.yml` `url:` is `https://mfcabrera.com`.
- "Enforce HTTPS" enabled in repo Pages settings.

## Development

### Local (Docker, recommended — has Python jupyter baked in)

```bash
docker compose up
# http://localhost:8080
```

Restart after editing `_config.yml`, `_layouts/`, `_sass/`, or front-matter:

```bash
docker compose restart
```

### Local (Ruby/Jekyll)

```bash
bundle install
bundle exec jekyll build
bundle exec jekyll serve  # http://localhost:4000
```

### Code quality

```bash
npx prettier --write .  # before pushing — Prettier CI fails on display
```

GitHub Actions on push to `master`:

- `Deploy site` — builds and serves to `gh-pages`
- `Prettier code formatter` — runs `npx prettier . --check`. **Run `--write` locally first.**
- `Check for broken links on site` — lychee

## Deployment flow

`master` is the live branch. Pushing to `master` triggers the GitHub Pages deploy workflow which builds Jekyll and pushes the result to `gh-pages`. Live within ~2 minutes.

## Common operations

### Adding a new post

1. Create `_posts/YYYY-MM-DD-slug.md` with front matter:
   ```yaml
   ---
   layout: post
   title: "..."
   date: YYYY-MM-DD HH:MM:SS
   categories: ...
   tags: ...
   description: ...
   featured: true # if it should appear in the Featured section on /blog/
   ---
   ```
2. Comments are on by default (Giscus). To disable for a specific post: `giscus_comments: false` in front matter.
3. For images: put files in `assets/img/posts/`. Wrap with `<figure class="rb-figure-img">…<figcaption>…</figcaption></figure>`.

### Adding a talk

Edit `_data/talks.yml`. New entries on top. Schema:

```yaml
- year: 2026
  title: "..."
  venue: "..."
  format: "30 min" # optional
  url: "https://speakerdeck.com/..."
```

### Adding a repository to the homepage

Edit `_data/repositories.yml`. Schema:

```yaml
repos:
  - name: hooqu
    description: ...
    lang: Python
    url: https://github.com/...
```

### Updating the design system

Edit `_sass/_runbook.scss` (tokens) or `_sass/_runbook-overrides.scss` (everything else). Run `docker compose restart`. Hard-refresh the browser.

### Editing the homepage layout

`_layouts/home.liquid` is the homepage. Sections 01–03 (Writing, Talks, Code) are inline in that file. Add a new section by following the existing pattern: `rb-home-section` div, italic-serif numeral, mono-uppercase label, optional `__more` link.

## Things to avoid

- Reaching for a third-party theme. The Runbook system is intentional and reusable.
- Adding emoji or icons. Use mono-uppercase labels and italic-serif emphasis instead.
- Putting `<strong>` text in accent color (use `.rb-pull` for that one line per post).
- Using Google Analytics. If analytics is needed eventually, prefer privacy-respecting options like GoatCounter or Plausible.
