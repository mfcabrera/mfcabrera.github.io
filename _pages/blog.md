---
layout: default
permalink: /blog/
title: writing
nav: true
nav_order: 1
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 10
  sort_field: date
  sort_reverse: true
  trail:
    before: 1
    after: 3
---

<div class="post rb-archive">

  <header class="rb-archive-header">
    <div class="rb-eyebrow rb-eyebrow--muted">{{ site.blog_name | default: 'Writing' }}</div>
    <h1 class="post-title">{{ site.blog_description | default: 'Notes on data, machine learning, and software.' }}</h1>
  </header>

  {% assign featured_posts = site.posts | where: "featured", "true" %}
  {% if featured_posts.size > 0 %}
    <section class="rb-archive-featured">
      <div class="rb-eyebrow">Featured</div>
      {% for post in featured_posts %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
        {% assign year = post.date | date: "%Y" %}
        <a class="rb-numrow" href="{{ post.url | relative_url }}">
          <span class="rb-numrow__n">{{ year }}</span>
          <span>
            <span class="rb-numrow__title">{{ post.title }}</span>
            {% if post.description %}
              <span class="rb-numrow__sub">{{ post.description }}</span>
            {% endif %}
          </span>
          <span class="rb-numrow__meta">{{ read_time }} min</span>
        </a>
      {% endfor %}
    </section>
  {% endif %}

  <section class="rb-archive-list">
    <div class="rb-eyebrow">All posts</div>

    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}
      {% if post.external_source == blank %}
        {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
      {% else %}
        {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
      {% endif %}
      {% assign year = post.date | date: "%Y" %}

      {% if post.redirect == blank %}
        {% assign post_url = post.url | relative_url %}
        {% assign post_target = '' %}
      {% elsif post.redirect contains '://' %}
        {% assign post_url = post.redirect %}
        {% assign post_target = '_blank' %}
      {% else %}
        {% assign post_url = post.redirect | relative_url %}
        {% assign post_target = '' %}
      {% endif %}

      <a class="rb-numrow" href="{{ post_url }}"{% if post_target == '_blank' %} target="_blank" rel="noopener"{% endif %}>
        <span class="rb-numrow__n">{{ year }}</span>
        <span>
          <span class="rb-numrow__title">{{ post.title }}</span>
          {% if post.description %}
            <span class="rb-numrow__sub">{{ post.description }}</span>
          {% endif %}
        </span>
        <span class="rb-numrow__meta">{{ read_time }} min</span>
      </a>
    {% endfor %}
  </section>

  {% if page.pagination.enabled %}
    {% include pagination.liquid %}
  {% endif %}

</div>
