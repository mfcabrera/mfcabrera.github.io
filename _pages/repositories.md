---
layout: page
permalink: /repositories/
title: code
nav: true
nav_order: 4
description:
---

<header class="rb-post-header">
  <div class="rb-eyebrow rb-eyebrow--muted">{{ site.first_name }} {{ site.last_name }} on GitHub</div>
  <h1 class="post-title">Selected repositories</h1>
</header>

{% if site.data.repositories.github_repos %}
<div class="repositories">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

<p class="rb-mono" style="margin-top: 1.5rem; font-size: 0.7rem;">
  <a href="https://github.com/{{ site.data.repositories.github_users[0] }}" target="_blank" rel="noopener">
    All repositories on GitHub &rarr;
  </a>
</p>
