# Self-improvement loop

Samwise improves itself from its own calls and chats. Five stages, each with its own proof and its own failure rule. A stage without a rule can stall for weeks without anyone noticing (it did: on 2026-11-16 two prompt proposals had waited up to 14 days and Health Check findings up to 30 days).

| # | Stage | Where | Proof it ran | Failure rule (Health Check `n0c7zZBjAk5fwx8P`) |
|---|---|---|---|---|
| 1 | Feedback eval: reads each finished call and chat day, writes `feedback_items` | n8n "Samwise Feedback Eval" `egBbLG3bCCgdtYop` (per call from Call Ended Handler + daily 04:30), Claude Sonnet | a live `feedback_checks` row per call with a transcript; items have `invalid_reason` when they fail the "is it the person's own words" guard | `feedback_eval_stalled`, `feedback_safety_not_person`, `feedback_mislabel_rate_high` (function `samwise_feedback_health_checks`) |
| 2 | Weekly review: up to 5 ranked proposals | n8n "Samwise Weekly Review" `sZn7vlvCyGgiu68Q`, Monday 07:30 Bogota, Claude Opus | live `prompt_proposals` rows with this week's `review_week` | `loop_review_missing` (no live rows by Monday 15:00 UTC) |
| 3 | Prompt test check: replays a prompt edit on 18 saved cases before it goes live | n8n "Samwise Prompt Check" `lKapepp0whNa4TyO` + job `MlCpsnSuN15oglec` | `prompt_test_runs` row passed/failed, `prompt_proposals.test_status` | none yet; agreement metric planned for ~2026-12-14 (see project memory samwise-prompt-check) |
| 4 | Dev builds it: requests, prompt edits, open findings | hourly scheduled task "Samwise hourly check", PART 3 a-c | `prompt_proposals.status` leaves request/pending within 48 h, with `dev_note`; findings leave `open` | `loop_proposal_stuck`, `loop_finding_stale` (function `samwise_loop_health_checks`) |
| 5 | Outcome 7 days later, automatic undo when worse | hourly check PART 3 d, Neon `samwise_change_outcome(id)` | `prompt_proposals.outcome` + `outcome_at` | `loop_change_not_measured`, `loop_change_worse` |

## Drive it (MCP only, read-mostly, costs under $1)
1. Doctor: n8n `search_workflows` shows the three workflows active; `search_workflow_executions` (status error, last 7 days) for each is empty or explained.
2. Stage 1: Neon: calls 2-24 h old with a transcript vs. those with a live `feedback_checks` row (must be equal). Dry run: `execute_workflow` `egBbLG3bCCgdtYop` manual, trigger "Dry Run (manual)" (rows saved with `dry_run = true`, no email). Read node "Parse Items and Signals": `ok: true` per conversation.
3. Stage 2: dry run `sZn7vlvCyGgiu68Q` manual, trigger "Dry Run (manual)". Node "Check Proposals" must succeed (it fails when the model's JSON is cut off). Dry rows have `dry_run = true` and status `dry_run`.
4. Stage 3: in `lKapepp0whNa4TyO` set node "Manual Settings" to one case (`only_slugs: ['normal-ready'], reps: 1`), run "Run by Hand", wait ~2 min, read `prompt_test_runs` (status passed/failed, `verdict.errors = 0`), then restore the settings and publish. About $0.23.
5. Stage 4 and 5: `select * from samwise_loop_health_checks()` must return no `loop_proposal_stuck`, `loop_finding_stale`, `loop_change_not_measured` or `loop_change_worse` rows. Also `select outcome->>'verdict', count(*) from prompt_proposals where outcome_at > now() - interval '30 days' group by 1`.
6. Record each step with `scripts/record.py`; end with a verdict.

## Gotchas
- Claude nodes return a thinking block plus the text, and thinking shares `maxTokens`. At 8000 the Opus review was cut mid-JSON (2026-11-16). Keep eval >= 6000 and review >= 20000.
- Feedback Eval's model node continues on error: a dead Anthropic key looks like "no feedback", not an error. Stage 1's rule catches it within 2 hours of the next call.
- The OpenAI nodes in both workflows are a disabled fallback (rewire to them if the Anthropic key dies). They read the system prompt from the Claude node, so edit prompts there.
- Weekly Review dry runs start a real Prompt Check for any prompt proposal (2 cases x 1 rep, about $0.25 each).
- The eval and the review can be wrong: before building a request, check its evidence in Neon (feedback_items with `invalid_reason is null`).
- Outcome verdicts compare all users' check-in calls 7 days before vs after; two changes applied the same day share a window and cannot be told apart.

## Last proven
2026-11-16 22:46 UTC: FAIL at stages 4 and 5 (no rules; stalled items), stages 1-3 PASS. Rules and outcome check added the same evening. Evidence `/mnt/project-files/verification/2026-11-16-self-improvement-loop/steps.jsonl`.
