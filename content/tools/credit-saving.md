# Credit-Saving Guide for Claude Pro Users

> Save 40-70% on credits without compromising output quality.

## The Problem

Claude Pro users have limited credits. Running a full workflow like `product-launch` (11 steps) can burn through credits fast if you're not strategic about it.

## The Rules This Agency Follows

This agency is built with credit efficiency in mind:

1. **Agents load on demand** — Only the agent you need is read, not all 66
2. **CLAUDE.md is lean** — Under 3k tokens, focused on routing, not bloat
3. **Templates reduce generation** — Pre-structured output means less thinking tokens
4. **Vault reuse** — Research is saved and reused, never re-done

## 7 Techniques to Save Credits

### 1. Use `/compact` at 60% Context (Not 95%)

Most people wait until Claude warns about context limits. By then it's too late — you've been paying for bloated context for the entire session.

```
After every 3-4 agent outputs, run:
/compact Focus on deliverables and client context
```

Do this while the prompt cache is still warm (within 5 minutes of your last message). The summarization step gets the cached token discount.

### 2. Batch Related Work in One Prompt

Bad (5x cost):
```
write blog post 1
write blog post 2
write blog post 3
write blog post 4
```

Good (1x cost):
```
Write all 4 blog posts from the content calendar.
Topics: [1], [2], [3], [4].
Use the blog-writer agent format for each.
```

Each separate prompt carries the full context overhead. Five prompts about related work cost roughly 5x more than one combined prompt.

### 3. Use Sonnet for 80% of Tasks

Switch to the faster model for routine work:
- Writing social posts → Sonnet
- Filling templates → Sonnet
- Data formatting → Sonnet

Save Opus for:
- Complex strategy (SWOT, positioning)
- Deep competitive analysis
- Creative copywriting that needs to be exceptional

Toggle with `/model` or start Claude Code with the model flag.

### 4. Clear Between Clients and Workflows

```
/clear
```

When switching from one workflow to another, or one client to another, start fresh. Carrying old context wastes tokens on every subsequent message.

### 5. Be Specific in Your Prompts

Bad (causes exploration):
```
do some marketing stuff for my company
```

Good (direct execution):
```
run agents/marketing/seo/keyword-researcher.md
Target: "AI customer support" keywords
Save to: vault/03-Research/NexusAI/
```

Specific prompts = fewer tokens spent exploring. Name the file, state the outcome, provide the context.

### 6. Skip Steps You Don't Need

Not every workflow step is required. If you already have competitor research in your vault:

```
Skip step 1 and 2 of the product-launch workflow.
Start from step 3 (positioning) — use the existing research
in vault/03-Research/[client]/
```

### 7. Use Lite Mode for Bulk Content

When generating bulk content (30 social posts, email sequences), tell Claude to be concise:

```
Generate 30 social posts for [client].
Format: Platform | Content | Hashtags
No explanations. No preamble. Just the posts.
```

## Credit Budget Estimates

| Workflow | Estimated Credit Usage | With Optimization |
|----------|----------------------|-------------------|
| Onboarding | Low | Low |
| Content Month (full) | High | Medium (batch posts) |
| Product Launch (full) | Very High | High (skip known steps) |
| Single Agent Run | Low | Low |
| Competitor Report | Medium | Low (if vault has data) |

## Quick Reference

```
/compact         → Compress context (do at 60%)
/clear           → Fresh start (between workflows)
/cost            → Check current usage
/model           → Switch models
Batch prompts    → Combine related tasks
Be specific      → Name files, state outcomes
Reuse vault      → Don't re-research what's saved
```
