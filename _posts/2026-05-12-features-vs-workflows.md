---
layout: post
title: "Features vs. Workflows"
date: 2026-05-12 09:00:00
categories: product
tags: product management workflows mental_model b2b
description: A mental model for product teams who ship a lot and serve a little. Most products have more capability than their users can access.
featured: false
published: false # local draft; flip to true (or remove) when ready to ship
---

A few months ago I caught myself doing something I had been doing for years without noticing.

We had just shipped a new feature. It was good. Customers had asked for it, the design was clean, the data backed it up. And yet, watching someone use a product I had helped build, I realised she was doing the integration work I had assumed we had built. The feature was there. The work was still hers.

That was the moment the distinction landed for me. I had been thinking in features. She was working in a flow. And the two were related, but they were not the same thing.

## How features arrive

The default mode of product development goes like this:

1. A customer or stakeholder says "we need X."
2. The team designs and builds X.
3. X ships, with a release note.
4. Repeat for Y, Z, and the next thing.

Each feature solves a real problem. Each launch feels like progress. The roadmap advances, the backlog shrinks, the demos go well.

Over time, something breaks down. Users say the product is "hard to use" even though every individual feature works. Adoption is shallow (people use 20% of what is built). Support tickets reveal weird workarounds. The product feels like a toolbox, not a tool.

What happened?

The team kept thinking from the bottom up. Capabilities first. The user is supposed to wire them together. The implicit assumption is that if every piece is good, the experience will be good. It is not how it works.

## Two ways to think

There are two lenses you can use, and most teams default to one without realising it.

**Bottom-up (feature thinking).** Start from what you can build. "We need a dashboard." Built. "We need notifications." Built. "We need an AI summary of the account notes." Built. "We need a next-best-action suggester." Built. Each feature gets scoped, designed, and shipped on its own. Integration is an afterthought. Maybe some links between screens, maybe a shared nav, maybe an AI assistant button at the top right that does seven different things depending on which screen you are on.

The result is a powerful product on paper and a fragmented one in practice. The user inherits the integration burden. They become the glue.

**Top-down (workflow thinking).** Start from the user's job. "Someone needs to walk into a meeting prepared." Then ask: what does "prepared" mean for them? What information do they need, and when? What sequence of decisions are they making? Where do they get stuck today?

From those questions, the same capabilities can emerge, but so does the flow between them. You might end up building the same six features. They are connected by design instead of by accident.

The result is fewer "features" and more complete experiences. The user does not navigate between tools. They move through a job.

## Why bottom-up is the default

If top-down is so obviously better, why does everyone end up in feature mode anyway? Five honest reasons.

**It is how requests arrive.** Customers say "I need a report that shows X." Sales says "we lost a deal because we don't have Y." Stakeholders say "competitors have Z." These are feature-shaped requests. It takes active translation to ask "what job is behind this?" Most teams do not have the muscle for that translation, or the time, or the patience to hold the ask open until the job is clear.

**It is easy to scope.** A feature has clear boundaries. You can write a spec, estimate it, build it, demo it, ship it. A workflow is fuzzier. Where does it start? Where does it end? What is in scope? Feature thinking feels more "agile." That word does a lot of work here.

**It is easy to measure.** Features shipped. Story points completed. Release notes written. "The customer-review prep experience is 40% better" does not fit in a sprint review. Quantifying workflow quality is harder, so we measure what is easy and pretend the rest is downstream of it.

**It matches org structure.** Teams own features or modules. Nobody owns the white space between them. Workflows cross team boundaries, which means meetings, alignment, coordination. Features stay in your lane.

**It is how we learn the craft.** Design tutorials teach screens. Engineering bootcamps teach components. Most PM courses teach user stories, which are usually feature-shaped. The workflow lens is rarely part of the standard training. You pick it up later, often after watching a real user fail to use your "complete" product.

None of these are stupid. They are the reasons feature thinking is the local optimum on any given Tuesday. The cost is that it stops being the global optimum once your product matures.

## What it actually costs

For the **user**: cognitive load (they hold the mental model of how the pieces fit), navigation tax (time spent moving between screens instead of thinking about their job), missed value (features exist that would help them, but they do not know about them or forget to use them). Value delivered is not the same as value captured.

For the **product**: shallow adoption (many features, few used; "we have that" but nobody knows), churn despite capability (users leave even though the product could solve their problem; it just did not _feel_ like it did), and a support queue full of questions that are not bugs. They are gaps in flow.

For the **team**: the feature treadmill. Always shipping, never "done." The backlog never empties because features do not compound, they just accumulate. Integration debt that someone, eventually, has to pay. And a quiet loss of narrative: it gets hard to explain what the product _does_ because it does fifty things and none of them are the answer to "what is this for."

## What workflow thinking looks like in practice

Start from a job statement that has texture. Not "user wants to view the account" but something like:

> When an account manager has a quarterly business review with a customer next week, they want to walk in prepared so they can have a substantive conversation and renew or expand the relationship.

That sentence has context (a review next week), motivation (a substantive conversation), and an outcome (renew or expand). It is the anchor. Everything you design hangs from it.

Then, before designing anything, map how the user does this today. Where do they start? What screens do they touch? What information do they gather? What decisions do they make? Where do they give up or work around? This part is uncomfortable because it shows you what your users are already paying you to make them do.

Only after that, design the integrated experience. Often you are not building new capabilities. You are rearranging existing ones around the job. The entry point changes. The information that should appear together actually does. The next action is the obvious one, not the one you have to remember to navigate to.

And test the flow, not just the screens. Feature testing asks "can users find the button?" Workflow testing asks "can users complete the job? Where do they hesitate? What do they forget? How do they feel at the end?" Those are different questions and they give you different answers.

## A concrete shape

Take the account-review example. The feature view of a typical B2B SaaS platform looks something like this:

- An account overview with usage and revenue
- A pipeline view with open opportunities
- An activity log with recent touchpoints
- A meeting scheduler and task list
- A contact directory
- An AI summary of recent customer notes
- An AI-generated "next best action" suggester

Seven features. All real. All useful. All separate. The AI ones especially feel like they should be the thing that ties everything together, but they sit in their own panel, on their own screen, doing their own thing.

The workflow view starts from the job: "prepare for next week's account reviews." The current journey looks something like: open the calendar, see four reviews scheduled, for each one navigate to the account, check usage, switch to the opportunities tab, switch back for the contact list, scan the activity log for recent touches, try to remember what was promised last quarter. Repeat four times. Forty-five to seventy-five minutes. Most of it is navigation, not thinking.

The integrated experience: click on a scheduled review, see everything in one view. Account health, the top three talking points generated from the AI summary, alerts, key contacts, the suggested next best action pre-loaded into the agenda. A mobile version for the train ride. A post-meeting capture flow so the next review starts with last review's notes already loaded and a fresh summary already generated.

Same underlying capabilities, including the same AI features. Radically different experience. The account manager stops being the integrator, and the AI stops being a separate panel and becomes part of the flow.

## When feature thinking is fine

I do not want to oversell the workflow lens. Feature thinking is the right move when you are genuinely missing a capability (not a flow problem), when you are exploring or experimenting and want to build small to learn fast, and when the feature is truly standalone, which is rarer than people think but does happen.

Workflow thinking is essential when users have a clear job-to-be-done that spans multiple features, when adoption is shallow despite "having the features," when the feedback you keep hearing is "it's hard to use" or "I don't know where to find things," and when you are maturing from an MVP into a scaled product. The shift usually happens at a certain capability density. Early on, you need features. You are filling gaps. Later, you need integration. You are creating flow.

## How to make the shift

Name the jobs. Five to ten core jobs your users are hired to do. Not features they use. Jobs they need to complete. Post them on the wall.

Pick one and map it. Screen by screen. Time it. Annotate the friction. Doing this creates undeniable evidence of the integration tax your users are paying right now.

Sketch the integrated experience. It is often a "view" that pulls together existing data, not a new system. Most of the work is already in your codebase.

Measure differently. Track workflow completion, not feature usage. "% of users who completed the prep flow before their meeting" beats "% of users who opened the dashboard."

And make it a reflex. For every feature request, the team asks "what job is this part of? Are we solving the job, or just adding a tool?"

## The line I keep coming back to

Features are the building blocks. <span class="rb-pull">Workflows are the building.</span>

You can have excellent bricks and still have an unusable house. The craft is not just in the components. It is in how they come together.

Most products I have worked on have more capability than their users can access. The leverage is not in building more. It is in connecting what exists into experiences that match how people actually work.

So the question is not "what features do we need next?"

It is "what job are we solving, and does our product flow naturally toward completing it?"
