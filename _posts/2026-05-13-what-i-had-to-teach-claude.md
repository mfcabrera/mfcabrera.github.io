---
layout: post
title: "The Agent Doesn't Know Your Stack"
subtitle: "What I had to teach Claude before it could ship to production"
date: 2026-05-13 09:00:00
categories: ai-engineering
tags: claude_code ai_coding plato databricks dabs skills context_engineering
description: Five layers between a coding agent and a real production codebase, each one earned by a failure I watched it produce. The deepest one is the one most posts skip.
featured: true
published: false
---

The [talk]({% post_url 2026-04-29-databricks-berlin-user-group-recap %}) had a slide titled "The Agent Doesn't Know Your Stack." It is the slide I keep going back to in my head, weeks after the Databricks meetup in Berlin. The punchline at the end of the section was: <span class="rb-pull">prompt-engineering gets you a demo, knowledge scaffolding gets you production</span>.

That line was earned the slow way. We did not start with five layers. We started with one big `CLAUDE.md`, watched the agent fail in five different shapes, and ended up with one layer per failure mode.

## Why does this matter?

There is a lot written right now about how to get more out of [Claude Code](https://www.claude.com/product/claude-code), [Codex](https://openai.com/codex/), or [Cursor](https://cursor.com/). Most of it is at the configuration layer: `CLAUDE.md` patterns, skills, subagents, plugins, memory files, hooks. Martin Fowler's [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html), Shrivu Shankar's [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature), and Anthropic's [Skills documentation](https://code.claude.com/docs/en/skills) all cover that layer carefully. None of it is wrong.

Most Claude Code setup writing starts at configuration. In data-heavy production systems, configuration only works after the agent has access to the data model.

If the agent does not understand the shape of your data, no amount of `CLAUDE.md` saves you. It will write code that compiles, passes tests, and ships nonsense. The same prerequisite that [Databricks Genie](https://docs.databricks.com/aws/en/genie/) imposes (clean dimensional model, consistent join keys, documented column semantics) applies to a coding agent. Genie just makes it visible because it refuses to query when the data model is a mess. The coding agent is more polite. It just guesses.

This is close to the semantic-layer conversation in data systems: [dbt's semantic layer](https://docs.getdbt.com/docs/build/about-metricflow), [Cube](https://cube.dev/), [Malloy](https://www.malloydata.dev/), and the broader push to make metrics and data semantics explicit. The shared bet is that humans, BI tools, and now LLMs all do better when the meaning of the data lives in one place. A coding agent is one more consumer of that semantic layer, just with the worst manners.

So when I think about scaffolding a coding agent for a real production codebase (in our case at [Plato](https://www.platoapp.ai/), a multi-tenant ML platform with 50+ wholesale-distributor tenants, [Databricks](https://www.databricks.com/) underneath, a Python monorepo on top), I think in five layers. Each layer earned by a specific failure I have watched the agent produce.

## The migration story

For a while we had everything in `CLAUDE.md`. SQL style. Spark wrappers. Logging conventions. The data-querying protocol. It worked, in the way a junk drawer works: you can find things if you remember which one this was.

Then the agent footprint grew. Eight skills. Multiple MCP servers. `CLAUDE.md` got long enough that the agent was spending real token budget on the constitution before it had read the actual task. New sessions started slow. Long sessions started losing the plot.

That was the moment we migrated standing knowledge out of `CLAUDE.md` into a `.claude/rules/` folder, kept `CLAUDE.md` short, and let the agent pull rules only when relevant. Three weeks later the difference was obvious. Faster sessions. Cheaper sessions. The same agent, with less irrelevant context to drag around.

That migration is the post in miniature: the right knowledge in the right layer, loaded at the right time. Below is the full shape.

## Layer 1: The data model

This is the floor. The agent has to know what your data _is_ before it can reason about what to do with it.

In our case the model is a dimensional warehouse. Facts (orders, line items, quotes), dimensions (customer, article, time), aggregates published into [StarRocks](https://www.starrocks.io/) for the app to query. The names are conventional. The semantics are not. `customer_id` in the analytics layer is not the same `customer_id` your CRM thinks it is. `order_status = 'completed'` means different things for two tenants because they map their ERP states differently in onboarding.

That kind of detail does not live in column names. It lives in a `DATA_MODEL.md` document we wrote (and keep updating) that explains the dimensional model, the join paths, the tenant-specific overrides, and the gotchas. The agent reads it through a skill called `databricks-data-query` that the agent invokes any time it has to write a SQL query. The skill description tells the agent _when_ to use it. The body tells it _what to know_.

Before this layer existed, the agent invented joins. After it existed, the agent looked things up and asked questions.

## Layer 2: `CLAUDE.md`

The agent's constitution. The only file guaranteed to load at the start of every session. It is also the most over-loaded file in most repos I have seen, including ours for a while (see the migration story above).

The temptation is to put everything there. Don't. `CLAUDE.md` is for the rules that should apply to _every_ session, regardless of task. Ours is short and boring:

- this is a Python monorepo, use Poetry
- lint failures are blocking
- Databricks code uses `from pyspark.sql import functions as F`
- when in doubt about data, read `DATA_MODEL.md` and then ask
- never bypass the bundle CI

It points at the other layers. It does not try to be them.

## Layer 3: Rules (the standing knowledge layer)

`CLAUDE.md` is the constitution. Rules are the case law.

For us, rules live in `.claude/rules/*.md`: project-specific guidance documents that get loaded when the agent is doing a specific kind of work. SQL style. Spark conventions. Logging patterns. The data-querying protocol. Loading all of them in `CLAUDE.md` would blow the context budget on a session that only needs one of them.

A concrete example. We have a rule that says: <span class="rb-pull">never `CREATE TABLE` inside a [StarRocks](https://www.starrocks.io/) publication job; always declare the schema in the bundle and let the catalog manage it</span>. That rule lives in `.claude/rules/databricks.md`, referenced from the skills that touch StarRocks. It is not in `CLAUDE.md`, because most sessions do not touch StarRocks. When a session does, the rule is right there.

## Layer 4: Skills

This is the layer most people are writing about right now (rightly, because it is the most useful new piece). A skill is a small package: a description, a body, optional resources, and the metadata that helps the agent decide when to invoke it. It is also the layer where _composition_ starts to matter. Skills invoke skills. Skills read rules. Rules reference the data model.

We have eight in active use. The two that earn their keep most visibly:

- `tenant-onboarding`: the end-to-end skill that drives a new wholesaler onboarding, from initial config to bundle generation to QA gates. One invocation, sixteen SQL queries, seven config decisions, two human confirmations. Replaces a 12-step Notion runbook.
- `bsr-issue-resolver`: an orchestrator that takes a triaged business-rule report and walks the resolution path: query Databricks, draft the annotation, push to PR.

The orchestrators sit on top of specialists (`bundle-generator`, `bsr-annotation-generator`) which sit on top of primitives (`notebook-runner`, the MCPs). Each layer of skill knows less about the world and more about its specific job. A primitive does not know it is part of an onboarding. The onboarding does not know which notebook will run.

The way we use them, a script encodes one path. A skill encodes a capability: when to use it, what to do when it fails, what to fall back to. When something goes sideways (and at 50 tenants, something is always going sideways), a script gives up at the first unhandled case. A skill gives the agent enough structure to recover.

## Layer 5: Tools

Tools are the execution surface. They are what the agent actually invokes once the knowledge layers have told it what to do. CLIs, [MCP servers](https://modelcontextprotocol.io/), shell commands, the file system.

We have a strong preference for CLIs over MCP servers (the [recap post]({% post_url 2026-04-29-databricks-berlin-user-group-recap %}) goes into why). The short version: CLIs are one tool invocation, one stdout, done. MCP servers are tokens, schemas, and a hosted service that occasionally has a hiccup mid-flow. Our default is to build the CLI first and expose it as MCP only when the convenience tax pays for itself.

Our agent's tool surface is intentionally small. A few well-chosen CLIs (`query_databricks.py`, `dabgen`, `validate_bundle.py`), the standard file/git/grep tools, and one or two MCP servers where the integration is worth it. The agent does better with a small number of sharp tools than a large number of overlapping ones.

## The stack at a glance

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5 — Tools         CLIs, MCP servers, shell, fs   │
├─────────────────────────────────────────────────────────┤
│  Layer 4 — Skills        capabilities, not scripts      │
├─────────────────────────────────────────────────────────┤
│  Layer 3 — Rules         project-specific case law      │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — CLAUDE.md     the constitution, kept short   │
├─────────────────────────────────────────────────────────┤
│  Layer 1 — Data model    the floor                      │
└─────────────────────────────────────────────────────────┘
            each layer earned by a failure it solves
```

| Layer       | What went wrong before                                          |
| ----------- | --------------------------------------------------------------- |
| Data model  | The agent wrote joins that ran but meant the wrong thing        |
| `CLAUDE.md` | The agent forgot repo-wide conventions                          |
| Rules       | The agent had general instincts but no project-specific judgment |
| Skills      | Multi-step workflows drifted halfway through                    |
| Tools       | The agent had too many ways to do the same thing                |

## What you get when the layers stack

The layers are cumulative. `CLAUDE.md` could tell the agent to be careful with data, but that did not help until there was an actual data model to read. Skills could orchestrate onboarding, but only after the StarRocks and Databricks rules were pulled out of people's heads and written down.

When the stack is right, the agent's behavior changes. It pauses to read `DATA_MODEL.md` before writing a query. It invokes the right skill instead of inventing one. It picks the CLI over the MCP server when both are available, because that is the local preference.

What it does not do is reason about your business. That part is still yours.

## The honest bit

We did not build this scaffold up-front. We built it incident by incident. The migration out of a bloated `CLAUDE.md` is one example. The `databricks-data-query` skill came after the agent wrote one too many fanciful joins. The `.claude/rules/databricks.md` was born the day a `CREATE TABLE` broke a StarRocks publication. The narrow tool surface came from a Saturday spent watching MCP roundtrips eat a token budget on a job that should have been fast.

Each layer is a scar. Each scar is now scaffolding.

So if your coding agent is sometimes brilliant and sometimes confidently wrong, do not start by adding another prompt. Look at the bottom of the stack. In a real B2B codebase, the agent usually does not understand the data model. Build that floor first. Then build the skills.

## Related reading

The configuration layer is already well covered:

- Martin Fowler, [Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
- Shrivu Shankar, [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- Dean Blank, [A Mental Model for Claude Code](https://levelup.gitconnected.com/a-mental-model-for-claude-code-skills-subagents-and-plugins-3dea9924bf05)
- Anthropic, [Skills documentation](https://code.claude.com/docs/en/skills)
- Anthropic, [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)

What I think is still under-discussed in Claude Code setup guides is the layer underneath: the data model the agent is supposed to operate on.
