---
layout: default
permalink: /talks/
title: talks
nav: true
nav_order: 2
---

<div class="post rb-archive">

  <header class="rb-archive-header">
    <div class="rb-eyebrow rb-eyebrow--muted">Speaking</div>
    <h1 class="post-title">Talks I've given at conferences and meetups.</h1>
  </header>

  <section class="rb-archive-list">
    <div class="rb-eyebrow">All talks</div>

    {% for talk in site.data.talks %}
      {% if talk.url %}
        <a class="rb-numrow" href="{{ talk.url }}" target="_blank" rel="noopener">
      {% else %}
        <div class="rb-numrow">
      {% endif %}
        <span class="rb-numrow__n">{{ talk.year }}</span>
        <span>
          <span class="rb-numrow__title">{{ talk.title }}</span>
          {% if talk.venue %}
            <span class="rb-numrow__sub">{{ talk.venue }}{% if talk.format %} · {{ talk.format }}{% endif %}</span>
          {% elsif talk.format %}
            <span class="rb-numrow__sub">{{ talk.format }}</span>
          {% endif %}
        </span>
        <span class="rb-numrow__meta">{% if talk.url %}Slides &rarr;{% endif %}</span>
      {% if talk.url %}</a>{% else %}</div>{% endif %}
    {% endfor %}
  </section>

  <p class="rb-mono" style="margin-top: 2rem; font-size: 0.7rem;">
    <a href="https://speakerdeck.com/mfcabrera" target="_blank" rel="noopener">
      All slides on Speaker Deck &rarr;
    </a>
  </p>

</div>
