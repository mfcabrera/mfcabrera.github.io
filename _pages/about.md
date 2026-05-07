---
layout: page
permalink: /about/
title: about
nav: true
nav_order: 4
---

<header class="rb-post-header">
  <div class="rb-eyebrow rb-eyebrow--muted">About</div>
  <h1 class="post-title">Hello, I'm Miguel.</h1>
</header>

<div class="rb-prose" markdown="1">

I'm a data and AI engineer based in **Berlin**. Colombian-German, two languages at home plus a working stack of German on top of that. I've been building data, ML, and AI systems for 17+ years — from Java enterprise integrations in Medellín, to an MSc thesis on word2vec for German document retrieval at TU Munich, to NLP pipelines over hotel reviews, to demand forecasting for fast fashion, to product analytics at a publicly-traded e‑commerce platform, and now to LLM-driven sales intelligence at a Series-A startup.

I'm currently **Head of AI at [Plato](https://www.platoapp.ai/)** — a Berlin B2B SaaS building **sales intelligence for distributors and wholesalers**. Our customers are wholesale companies with thousands of sales reps making customer visits every week; our job is to turn their messy enterprise data into the three or four things a sales rep actually needs before walking into a meeting. I joined when the AI/Data function was zero people, and I've grown it into a 5-person team across **Sales Insights**, **Document Processing** (RAG over genuinely awful B2B documents), and **Search**. Day-to-day I'm part architect, part hiring manager, part hands-on builder, part company-internal storyteller — most weeks I'm doing all four.

Before Plato I was a **Senior Data Scientist at [Shopify](https://www.shopify.com/)** working on product analytics and predictive models on the merchant platform; before that **Senior/Staff Data Scientist at New Yorker**, where I led a small multidisciplinary team on demand forecasting and inventory optimization for a European fast-fashion retailer; and before that **Senior Engineer / Tech Lead at TrustYou** in Munich, designing NLP and information-retrieval pipelines that extracted structured signals from millions of hotel reviews. My first production ML role was at **Gini** (document classification with word vectors and LibSVM, back when that was the leading edge). Before any of that, I was a Java enterprise software engineer in Colombia at Accenture and Seguros Sura.

Education: BEng Systems & Informatics from **Universidad Nacional de Colombia (Medellín)**, MSc Informatics from **TU Munich**, plus the **CDTM Honours Master in Technology Management** (joint TUM/LMU).

## What I write about

This site is mostly a notebook. I write when I've learned something concrete and I want to keep it findable later. The topics tend to cluster:

- **Data engineering** — pipelines, validation, the gap between "the notebook works" and "the pipeline runs at 3 a.m. on a different tenant's data."
- **Machine learning in production** — what changes when models leave the lab; what doesn't; what to instrument so you'll know which it is next time.
- **Python tooling and software practice** — type hints, testing, the small things that make code outlast the person who wrote it.
- **Agentic systems and Claude Code** — what works, what's hype, what's actually shippable inside a real production codebase.

## How I work

Things I've come to believe after a decade and a half of doing this:

- **Deployment beats brilliance.** The best model is the one that's actually serving users next week, not the one that beat SOTA on a benchmark you'll never re-run.
- **Boring infrastructure is competitive advantage.** Every minute spent on a reliable build, a sane data model, or a clean deploy is a minute that compounds.
- **Write things down.** For your future self, for your team, and now for the AI agents that work alongside you. The shape of your `CLAUDE.md`, your skills, your runbooks — that's becoming as important as the shape of your code.
- **Generalists who can lead beat specialists who can't.** Eight years deep on one stack is great until the platform shifts under you.

## Now

*(Updated {{ "now" | date: "%B %Y" }})*

- Building AI tooling for sales reps at Plato. Recently: a multi-tenant onboarding pipeline that took us from days of manual config per customer down to about 30 minutes — [a talk about it](/talks/) at the **Databricks Berlin User Group** in April 2026.
- Growing the AI/Data team through Plato's Series-A prep — currently five reports, hiring two more.
- Writing weekly on **agentic systems**, **knowledge scaffolding**, and **production AI for B2B**.
- Reading: anything on **context engineering**, recsys with LLMs, and the practical edges of where agents stop being demos and start being infrastructure.
- Out of the office: Brazilian Jiu-Jitsu, cycling around Berlin on a cargo bike with my five-year-old, surviving the early months of life with a newborn.

## Community

I've spent a fair amount of time in the European Python and data community. I founded **Munich DataGeeks** (2013–15), co-organized the **PyData Berlin Conference (2017)** and **PyBerlin Meetup (2019–20)**, and have spoken at **PyData Berlin**, **PyCon DE**, **EuroPython**, **DSPT Day Porto**, and the **Databricks Berlin User Group** — the [Talks page](/talks/) has slides for most of them. I've made small contributions to **Luigi**, **Gensim**, **Catboost**, **Hooqu**, and **scikit-learn** over the years.

## Talk to me

I'm always happy to swap notes on data engineering, production ML, agentic systems, or what it's like to build an AI team from zero inside a B2B SaaS. The fastest ways to reach me:

- **Email**: <a href="mailto:miguel.cabrera@platoapp.ai">miguel.cabrera@platoapp.ai</a> *(work)* · <a href="mailto:mfcabrera@gmail.com">mfcabrera@gmail.com</a> *(personal)*
- **LinkedIn**: [linkedin.com/in/mfcabrera](https://linkedin.com/in/mfcabrera)
- **GitHub**: [github.com/mfcabrera](https://github.com/mfcabrera)
- **Twitter / X**: [@mfcabrera](https://twitter.com/mfcabrera)

</div>

<aside class="rb-quickfacts" markdown="0">
  <div class="rb-eyebrow rb-eyebrow--muted">Quick facts</div>
  <dl class="rb-quickfacts__list">
    <dt>Based in</dt><dd>Berlin, Germany</dd>
    <dt>From</dt><dd>Medellín, Colombia</dd>
    <dt>Languages</dt><dd>Spanish (native), English, German</dd>
    <dt>Education</dt><dd>MSc Informatics, TU Munich · CDTM Honours, Tech Management</dd>
    <dt>Currently</dt><dd>Head of AI, <a href="https://www.platoapp.ai/">Plato</a></dd>
    <dt>Previously</dt><dd>Shopify, New Yorker, TrustYou, Gini</dd>
    <dt>OSS</dt><dd>Luigi, Gensim, Catboost, Hooqu, scikit-learn</dd>
  </dl>
</aside>
