# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Jekyll-based academic website using the **al-folio** theme. It's a personal homepage/blog for Miguel Cabrera hosted on GitHub Pages at `https://mfcabrera.github.io`.

## Development Commands

### Local Development (Docker - Recommended)
```bash
# Pull and run the site locally
docker compose pull
docker compose up

# Alternative: Use slim image (smaller, same functionality)
docker compose -f docker-compose-slim.yml up

# Build custom image
docker compose up --build
```
The site will be available at `http://localhost:8080` with live reload enabled.

### Local Development (Ruby/Jekyll)
```bash
# Install dependencies
bundle install
pip install jupyter  # For Jupyter notebook support

# Serve locally
bundle exec jekyll serve
# Site available at http://localhost:4000
```

### Build and Deploy
```bash
# Build static site
bundle exec jekyll build

# Build with custom destination
bundle exec jekyll build --destination /path/to/destination

# Purge unused CSS (optional optimization)
purgecss -c purgecss.config.js
```

### Code Quality
```bash
# Format code with Prettier
npx prettier --write .

# The repository uses GitHub Actions for automated checks:
# - Prettier formatting
# - Link checking with lychee
# - Automated deployment to gh-pages branch
```

## Site Architecture

### Content Structure
- `_pages/`: Main site pages (about, blog, cv, projects, publications, etc.)
- `_posts/`: Blog posts in Markdown format
- `_projects/`: Project portfolio items
- `_news/`: News/announcement items
- `_bibliography/`: BibTeX files for publications
- `_data/`: YAML data files (CV, repositories, venues, coauthors)

### Key Configuration
- `_config.yml`: Main Jekyll configuration and site settings
- `Gemfile`: Ruby gem dependencies
- `package.json`: Node.js dependencies (Prettier)

### Layouts and Templates
- `_layouts/`: Page layout templates (Liquid)
- `_includes/`: Reusable template components
- `_sass/`: SCSS stylesheets and theme variables
- `assets/`: Static assets (images, CSS, JS, fonts)

### Content Management
- **Blog**: Posts in `_posts/` with YAML front matter
- **Publications**: Managed via `_bibliography/papers.bib` (BibTeX format)
- **CV**: Data-driven from `_data/cv.yml` or `assets/json/resume.json`
- **Projects**: Portfolio items in `_projects/` collection
- **GitHub Integration**: Repository data via `_data/repositories.yml`

## Key Features
- Responsive Jekyll theme optimized for academics
- Publications management via Jekyll Scholar
- Jupyter notebook integration
- Math typesetting with MathJax
- Code syntax highlighting
- Dark/light mode support
- GitHub Pages deployment with automated CI/CD
- Docker containerization for development

## File Locations
- Main content: `_pages/about.md`
- Blog configuration: `_config.yml` (blog_name, pagination settings)
- Styling: `_sass/_themes.scss`, `_sass/_variables.scss`
- Images: `assets/img/`
- Publications: `_bibliography/papers.bib`