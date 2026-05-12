---
layout: post
title: "What I had to teach Claude before it could ship to production"
date: 2026-05-13 09:00:00
categories: ai-engineering
tags: claude_code ai_coding plato databricks dabs skills context_engineering
description: Five tiers between a coding agent and a real production codebase, each one earned by a failure I watched it produce.
featured: true
published: false
---

The agent broke a tenant on a Tuesday.

It was a small change. Onboard a new wholesaler, generate the Databricks bundle, push it through CI. The agent had done this fifty times already. This time it confidently joined `dim_customer` to `order_line_transaction` on the wrong key, the pipeline went green because the join still returned rows, and the customer got an insights dashboard with the wrong customer's data on top of it. Caught in QA. No external damage. But the agent thought it had succeeded, and the tests thought it had succeeded, and that was the problem.

That afternoon I started writing down what the agent had to know before I trusted it again. I expected the list to be about prompts. It was not. It was five layers deep, and the deepest one was the one nobody writes blog posts about.

## So why does this matter?

There is a lot written right now about how to get more out of Claude Code or Codex or Cursor. Most of it is at the configuration layer. CLAUDE.md patterns. Skills. Subagents. Plugins. Memory files. Hooks. All of it useful, none of it wrong.

But it skips the floor.

If the agent does not understand the shape of your data, no amount of CLAUDE.md saves you. It will write code that compiles, passes tests, and ships nonsense. The Tuesday tenant incident was not a prompting problem. It was a data-model problem dressed up as a prompting problem.

So when I think about scaffolding a coding agent for a real production codebase (in our case, a multi-tenant ML platform with 50+ wholesale-distributor tenants, [Databricks](https://www.databricks.com/) underneath, a Python monorepo on top), I think in five tiers. Each tier earns its place because of a specific failure I have actually watched the agent produce.

## Tier 1: The data model

This is the floor. The agent has to know what your data _is_ before it can reason about what to do with it.

In our case the model is a dimensional warehouse: facts (orders, line items, quotes), dimensions (customer, article, time), aggregates published into [StarRocks](https://www.starrocks.io/) for the app to query. The names are conventional. The semantics are not. `customer_id` in the analytics layer is not the same `customer_id` your CRM thinks it is. `order_status = 'completed'` means different things for two tenants because they map their ERP states differently in onboarding.

That kind of detail does not live in column names. It lives in a `DATA_MODEL.md` document we wrote (and keep updating) that explains the dimensional model, the join paths, the tenant-specific overrides, and the gotchas. The agent reads it through a skill called `databricks-data-query` that the agent invokes any time it has to write a query. The skill description tells the agent _when_ to use it. The body tells it _what to know_.

Before this tier existed, the agent invented joins. After it existed, the agent looked things up and asked questions.

Failure mode this tier solves: <span class="rb-pull">the agent writes code that runs but means the wrong thing</span>.

## Tier 2: CLAUDE.md

This is the agent's constitution, in the sense that it is the only thing guaranteed to load at the start of every session. It is also the most over-loaded file in most repos I have seen, including ours for a while.

The temptation is to put everything there. Don't. CLAUDE.md is for the rules that should apply to _every_ session, regardless of task. Ours is short and boring. It says:

- This is a Python 3.11 monorepo using Poetry.
- We use `ruff` and `mypy` (strict). Lint failures are blocking.
- All Databricks code uses `from databricks import sql as F` (yes, we wrap it that way).
- When in doubt about data, read `DATA_MODEL.md` and then ask.
- Never bypass the bundle CI. If you cannot do something through `dabgen`, stop and explain.

It points at the other tiers. It does not try to be them.

Failure mode this tier solves: the agent forgets the basics that the team takes for granted. The unwritten rules. The boring conventions that have a one-line answer but cost a half hour every time a new joiner steps on them.

## Tier 3: Rules (the skill-level guidance)

CLAUDE.md is the constitution. Rules are the case law.

For us, "rules" live one level down: project-specific guidance documents that get loaded when the agent is doing a specific kind of work. The Databricks rules are different from the React rules are different from the data-platform rules. Loading all of them in CLAUDE.md would blow the context budget on a session that only needs one of them.

A concrete example. We have a rule that says: <span class="rb-pull">never `CREATE TABLE` inside a StarRocks publication job; always declare the schema in the bundle and let the catalog manage it</span>. That rule lives in a `databricks-rules.md` file that is referenced from the relevant skills. It is not in CLAUDE.md, because most sessions do not touch StarRocks. When a session does touch StarRocks, the rule is right there.

Failure mode this tier solves: the agent has good general instincts but no project-specific judgment. The rule layer is where local taste lives.

## Tier 4: Skills

This is the layer everyone is writing about right now (rightly, because it is the most useful new piece). A skill is a small package: a description, an optional set of instructions, and the metadata that helps the agent decide when to invoke it.

We have a handful of skills that earn their keep:

- `tenant-onboarding`: the end-to-end skill that drives a new wholesaler onboarding, from initial config to bundle generation to QA gates.
- `databricks-data-query`: query the data warehouse safely, with the DATA_MODEL.md context preloaded.
- `dabgen-bundle`: generate or modify a Databricks Asset Bundle for a tenant, including the validation step that catches 80% of mistakes before CI does.
- `fix-german-form`: yes, really. We have one because filling German bureaucracy PDFs is an annoying recurring task and a skill plus a coordinate-detection script beats Googling each form's quirks for the third time.

A skill is more than a script. A script encodes one path. A skill encodes a capability: when to use it, what to do when it fails, what to fall back to. It negotiates with the agent. The Tuesday-tenant incident is unlikely to repeat partly because `tenant-onboarding` now invokes `databricks-data-query` to verify the join before generating the bundle. The skill knows the failure mode, because we wrote it after watching the failure mode happen.

Failure mode this tier solves: the agent is good at one-shot tasks but loses the plot on multi-step workflows. Skills are how you teach it the workflow.

## Tier 5: Tools

The bottom of the agent's reach. Tools are what the agent actually invokes. CLIs, [MCP servers](https://modelcontextprotocol.io/), shell commands, the file system.

We have a strong preference for CLIs over MCP servers (the [recap post](/blog/2026/databricks-berlin-user-group-recap/) goes into why). The short version: CLIs are one tool invocation, one stdout, done. MCP servers are tokens, schemas, and a hosted service that occasionally has a hiccup mid-flow. Our default is to build the CLI first and expose it as MCP only when the convenience tax pays for itself.

Our agent's tool surface is intentionally small. A few well-chosen CLIs (`query_databricks.py`, `dabgen`, `validate_bundle.py`), the standard file/git/grep tools, and one or two MCP servers where the integration is worth it. The smaller the surface, the easier the agent's life. The agent does not need to be told which of forty tools to pick. It has six, each one specific.

Failure mode this tier solves: tool sprawl. The agent has too many ways to do the same thing, picks the wrong one half the time, and burns its context on tool definitions instead of the actual problem.

## What you get when the tiers stack

The tiers are cumulative. CLAUDE.md without a data model is wishful thinking. Skills without rules are scripts in a costume. Tools without skills are a toolbox with no instruction manual.

When the stack is right, the agent's behavior changes. It pauses to read DATA_MODEL.md before writing a query. It invokes the right skill instead of inventing one. It picks the CLI over the MCP server when both are available, because that is the local preference. It writes a one-line PR description that reads like one of ours, because CLAUDE.md taught it our tone.

What it does not do is reason about your business. That part is still yours.

## The honest bit

We did not build this scaffold up-front. We built it incident by incident. Tier 1 came from a tenant getting the wrong join. Tier 2 came from an agent that kept reinventing our linting setup. Tier 3 came from a `CREATE TABLE` that broke StarRocks publication. Tier 4 came from realizing the same five steps were happening every onboarding and the agent was redoing them from scratch each time. Tier 5 came from a long Saturday spent watching MCP roundtrips eat token budget on a job that should have been fast.

Each tier is a scar. Each scar is now a piece of scaffolding.

So if you are setting up a coding agent on a real codebase and the experience feels uneven (sometimes brilliant, sometimes confidently wrong), my advice is to look at the bottom of the stack first. Most of the configuration content I have read this year assumes the data model is already understood. In a real B2B codebase, it usually is not. That is the floor. Build it before you build the skills.

I have more to say about each tier individually (tier 1 deserves its own post, probably two). For now: five layers, each earned by a specific kind of failure, and the deepest one is the one most posts skip.
