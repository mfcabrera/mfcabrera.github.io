---
layout: post
title: "The Agent Doesn't Know Your Stack"
subtitle: "What I had to teach Claude before it could ship to production"
date: 2026-05-13 07:00:00
categories: ai-engineering
tags: claude_code ai_coding plato databricks dabs skills context_engineering
description: Five layers between a coding agent and a real production codebase. The deepest one is the one most posts skip.
featured: true
---

The [talk]({% post_url 2026-04-29-databricks-berlin-user-group-recap %}) had a slide titled "The Agent Doesn't Know Your Stack." I keep going back to it, weeks after the Databricks meetup in Berlin. The punchline at the end of the section was: <span class="rb-pull">prompt-engineering gets you a demo, knowledge scaffolding gets you production</span>.

That line was earned the slow way. We started with one big `CLAUDE.md`, watched the agent fail in five different shapes, and ended up with one layer per failure mode.

Most Claude Code setup writing starts at configuration: `CLAUDE.md` patterns, skills, subagents, plugins, hooks. Martin Fowler's [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html), Shrivu Shankar's [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature), and Anthropic's [Skills documentation](https://code.claude.com/docs/en/skills) all cover that layer carefully. None of it is wrong. It is just not the part that breaks first in a data-heavy codebase.

In production, configuration only works after the agent has access to the data model. If it does not understand the shape of your data, no amount of `CLAUDE.md` saves you. It will write code that compiles, passes tests, and ships nonsense. The agent is not "helpful." It is confident, fluent, and prone to hallucinating joins that do not exist.

[AI/BI Genie](https://docs.databricks.com/aws/en/genie/) lives in the same neighbourhood. It does not strictly _refuse_ to work on a messy schema, but its docs and best-practice guides are very clear that it leans heavily on documented tables and columns in Unity Catalog. A star schema with good descriptions: useful answers. A junk drawer of tables with no metadata: confidently wrong answers. The coding agent is in the same spot. It is just less polite about it. It does not surface the gap. It just guesses.

This is the same conversation the semantic-layer crowd has been having for years: [dbt's semantic layer](https://docs.getdbt.com/docs/build/about-metricflow), [Cube](https://cube.dev/), [Malloy](https://www.malloydata.dev/), the broader push to make metrics and data semantics explicit. The shared bet is that humans, BI tools, and now LLMs all do better when the meaning of the data lives in one place. A coding agent is one more consumer of that semantic layer, just with the worst manners.

For context: at [Plato](https://www.platoapp.ai/) we run a multi-tenant ML platform on [Databricks](https://www.databricks.com/), 50+ wholesale-distributor tenants, Python monorepo on top. What follows is the scaffold we have on top of that. Five layers, each earned by a failure I have watched the agent produce.

## Layer 1: The data model

This is where most of the work is. It is also the layer that is invisible until it bites you.

Our model is a dimensional warehouse. Facts (orders, line items, quotes), dimensions (customer, article, time), aggregates published into [StarRocks](https://www.starrocks.io/) for the app to query. The names are conventional. The semantics are not.

The order-status example is the one that hurts the most. Our `order_line_transaction_facts` table has an `order_status` column. For some tenants it has a small set of clean values (`BILLED`, `OPEN`, `PARTIALLY_BILLED`, `NULL`) and the header and line statuses always match. For others, with messier ERPs, it has dozens of header/line combinations that can diverge, plus values like `CANCELLED`, `LOST`, `RECEIVED`, `REVISED`, `RELEASED_FOR_BILLING`. If the agent writes a "revenue last quarter" query without filtering by status, it will quietly sum cancelled and lost orders along with the real ones. Depending on the tenant, that can materially overstate the number. The query runs. The number looks plausible. The dashboard ships.

This kind of detail does not live in column names. It cannot. There is no naming convention strong enough to encode "two tenants disagree about which states count as revenue." It has to live in prose.

So it lives in `DATA_MODEL.md`, alongside a `.claude/rules/data-querying.md` rule that codifies how the agent should approach SQL: which tables are canonical, which join keys to use, which columns are tenant-specific, what to read before writing a query. We update both whenever a new tenant onboards with a new mapping quirk (most of them do).

The rule loads on demand whenever the agent does anything data-related. Before the agent writes a query, it has already read the relevant section of `DATA_MODEL.md`.

Before this layer existed, the agent invented joins and unfiltered status queries. Confidently. Fluently. After this layer existed, the agent looked things up and asked questions.

The cost is not zero. Keeping `DATA_MODEL.md` honest is a real maintenance job (someone owns it, the way someone owns the build). When a new aggregate ships and nobody updates the doc, the agent regresses to its old habits within a week. This is not free scaffolding. It is documentation that the agent reads, which means the documentation has to be correct, which means someone has to maintain it. The team underestimated this part. Twice.

Everything else in this post sits on top of this layer working.

## Layer 2: `CLAUDE.md`

The constitution. The only file guaranteed to load at the start of every session. Also the most over-loaded file in every repo I have seen, including ours for the first six months.

Keep it short. Ours is roughly:

- check for a relevant skill before implementing anything (with the keyword triggers spelled out)
- multi-tenant Databricks ML monorepo, conda env (`conda activate platoml`), `make test` / `make lint`
- catalog naming: source ERP data in `customer__{tenant}__{env}`, ML outputs in `internal__{tenant}__{env}`
- Databricks code uses `import pyspark.sql.functions as F`, type annotations on signatures, ruff format
- never use `print()`; `get_logger(__name__)` for ops logs, `DeltaLogger` for dashboard metrics
- always read `docs/DATA_MODEL.md` before writing SQL against ERP tables

That is most of it. The point of `CLAUDE.md` is to point at the other layers (six rule files do the heavy lifting).

## Layer 3: Rules

`CLAUDE.md` is the constitution. Rules are the case law.

Project-specific guidance that loads only when the agent is doing a specific kind of work. SQL style. Spark conventions. Logging patterns. The data-querying protocol. Lives in `.claude/rules/*.md` and gets pulled in by the skills that need it.

Our `.claude/rules/` folder has a handful of these: `data-querying.md`, `spark-sql.md`, `bundle-operations.md`, `logging.md`, `code-standards.md`. Each one loads when the agent does the relevant kind of work. This is where the configuration layer earns its keep: project-specific judgment, loaded on demand, not paid for on every session.

## Layer 4: Skills

A skill is a small package: description, body, optional resources, metadata telling the agent when to invoke it. This is the layer the rest of the field is writing about, and they are right to. It is the most useful new piece.

We have around eight in active use. Two carry most of the weight:

- `tenant-onboarding`: drives a new wholesaler onboarding end to end. One invocation, 16+ SQL queries, seven config decisions, two human confirmations. Replaces a 12-step Notion runbook that took a senior engineer a full day.
- `bsr-issue-resolver`: takes a triaged business-rule report, queries Databricks, drafts the annotation, pushes a PR.

The orchestrators sit on top of specialists (`bundle-generator`, `business-rules-annotation-generator`, `business-rules-executor`) which sit on top of inspectors and primitives (`job-run-inspector`, `databricks-notebook-runner`, `insight-triage-analyzer`, the MCPs). Each layer of skill knows less about the world and more about its specific job. A primitive does not know it is part of an onboarding. The onboarding does not know which notebook will run.

A script encodes one path. A skill encodes a capability: when to use it, what to do when it fails, what to fall back to. At 50 tenants something is always going sideways. A script gives up at the first unhandled case. A skill gives the agent enough structure to recover.

## Layer 5: Tools

The execution surface. CLIs, [MCP servers](https://modelcontextprotocol.io/), shell, the file system.

We prefer CLIs over MCP servers (the [recap post]({% post_url 2026-04-29-databricks-berlin-user-group-recap %}) has the long version). CLIs are one invocation, one stdout, done. MCP servers are tokens, schemas, and a hosted service that occasionally has a hiccup mid-flow. Default to a CLI, expose as MCP only when the convenience tax pays for itself.

Our tool surface is intentionally small: `query_databricks.py`, `dabgen`, plus standard file/git/grep, plus one or two MCP servers where the integration is worth it. Small sharp set beats large overlapping set every time.

## What broke before each layer existed

| Layer       | What broke                                                           |
| ----------- | -------------------------------------------------------------------- |
| Data model  | Joins ran and passed tests, but the semantics were wrong             |
| `CLAUDE.md` | Repo-wide conventions got forgotten on every long session            |
| Rules       | Good general instincts, no local judgment (e.g. publication schemas) |
| Skills      | Multi-step workflows drifted halfway through                         |
| Tools       | Too many overlapping options, token budget eaten by tool defs        |

The layers are cumulative. `CLAUDE.md` could tell the agent to be careful with data, but that did not help until there was an actual data model to read. Skills could orchestrate onboarding, but only after the publication-schema and Spark-SQL rules were pulled out of people's heads.

What the stack does not do is reason about your business. That part is still yours.

## How it actually got built

Not up-front. Incident by incident.

The migration out of a bloated `CLAUDE.md` happened when sessions started feeling heavy from the first turn. The `data-querying.md` rule was written after enough fanciful joins. The `spark-sql.md` schema rules were written down by the people who had been silently fixing the same three mistakes in PR review for months. The narrow tool surface came from a Saturday spent watching MCP roundtrips burn token budget on a job a CLI could have finished in half the time.

Each layer is a scar. Each scar is now scaffolding.

If your coding agent is sometimes brilliant and sometimes confidently wrong, do not start by adding another prompt. Look at the bottom of the stack. In a real B2B codebase, the agent usually does not understand the data model. Build that floor. Then the skills will start to mean something.

## Related reading

The configuration layer is already well covered:

- Martin Fowler, [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
- Shrivu Shankar, [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- Dean Blank, [A Mental Model for Claude Code](https://levelup.gitconnected.com/a-mental-model-for-claude-code-skills-subagents-and-plugins-3dea9924bf05)
- Anthropic, [Skills documentation](https://code.claude.com/docs/en/skills)
- Anthropic, [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)

What stays under-discussed in Claude Code setup guides is the layer underneath: the data model the agent is supposed to operate on.
