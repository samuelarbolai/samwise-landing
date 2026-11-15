# Check-in calls

Samwise calls each user at their check-in times. "Scheduled Ritual Call Dispatcher" `HoAurIgJQ3FNu5ax` (00:01 daily) queues "Ritual Call Dispatch" `iCALBTU2pCs1zKfr`, which waits until the time, re-checks the schedule ("Still Scheduled?"), and places the call through Cartesia (agent per language; ritual-bot-en is the master prompt). After hang-up Cartesia posts to "Call Ended Handler" `oFUl0pRbGn2mzGOT`, which writes `call_logs`, may schedule a callback or call trusted people ("Support Call Dispatcher" `TadVUcNFkZAP9Ega`), and sends one missed-call WhatsApp text. "Samwise Ritual Doc Sync" `IQtCyBQcneGYrgIq` runs 20 min later.

## Sub-features
- Scheduled call at each `call_schedules` time; report-first skip of morning/midday calls when a written entry already exists.
- Missed call -> one WhatsApp text (`messages.metadata.source = 'missed_call_text'`) and callback/support deadline.
- Bad call -> support contacts called and emailed.
- Inbound call to the number -> identified caller, same agent.

## How to get to it (user POV)
The phone rings at the set time from +1 507 920 1622. Or the user calls that number.

## Driving it with n8n + Neon (+ Cartesia reads)
Placing a call is a live call: ask Samuel each time, name the time and the agent. Without that OK, verify from the last real calls:
1. Neon: `select id, call_id, called_at, status, end_reason, duration_seconds, call_type, direction from call_logs where user_id = 16 order by called_at desc limit 5` -> expected scheduled times present, statuses sensible.
2. n8n: executions of `iCALBTU2pCs1zKfr` and `oFUl0pRbGn2mzGOT` around those times -> `success`; an `error` is a finding.
3. Neon `health_findings where status = 'open'` for call-related check names.
With Samuel's OK for one call: trigger only through the product path (set a check-in time a few minutes ahead via WhatsApp chat or "Samwise Call Now" `p7q0VvJvjZI6GUTJ` if he names it), then check the new `call_logs` row, the handler execution, and the transcript summary.

## Gotchas
- Cartesia has no connector: read agents/prompts through n8n HTTP nodes with credential "Cartesia API v2026-08-14"; never change "Cartesia API (Samuel G)".
- Call Ended Handler waits 5 min before writing; don't judge a call earlier.
- Support calls go to Samuel's family (Spanish agents). A test that ends a ritual call badly can call them. Never simulate a bad call.
- Before 2026-11-14 17:23 UTC a voicemail often ended as `agent_hangup` and was stored `call_success = true`; 71 such rows were corrected to false on 2026-11-15. Judge reach by `call_success AND duration_seconds >= 30` or `direction = 'inbound'`, never by `status = 'completed'`.
- Answered is not the same as reached: read the first transcript line. "grabe su mensaje" / "contestador" is the carrier voicemail.
- Ritual Call Dispatch executions wait from 00:01 Bogota and finish on the workflow version they started with. A Dispatch change published during the day takes effect on the next day's calls.
- Health Check rules for calls: scheduled_call_missing, result_not_saved, bad_call_not_handled, support_false_alarm, callback_not_placed, user_unreachable, voicemail_agent_spoke, slip_answer_rate_low.
