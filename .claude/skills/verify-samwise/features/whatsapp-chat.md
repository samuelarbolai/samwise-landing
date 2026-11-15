# WhatsApp chat

The main Samwise surface. A user writes (text, photo of a handwritten journal page, or voice note) to +1 507 920 1622; Telnyx posts `message.received` to `samwise.life/api/hooks/telnyx`, which forwards it to n8n "Samwise WhatsApp Chat" `ut3Upvt03EfI2lIS` (webhook `telnyx-whatsapp`). That saves the inbound row, runs "Samwise Chat Brain" `dw1xl4U1AzpzvXkB` (Gemini agent with tools: set ritual time, support contacts, create ritual doc, photo to doc, day notes, set language...), sends the reply through Telnyx and saves the outbound row. Unknown senders are ignored.

## Sub-features
- Text reply (setup chat for users `in_setup`, companion chat otherwise).
- Voice notes: transcribed by Whisper, body saved as `[voice note] <transcript>` (since 2026-11-14).
- Photos of the handwritten journal: "Samwise Ritual Photo to Doc" `YoW3Hj3ACPUYdxAE` appends a dated entry to the user's Google Doc.
- Tool actions: change call time, add trusted person, change call language.

## How to get to it (user POV)
Open WhatsApp, write to Samwise (+1 507 920 1622). Sign-up ends with an "Open WhatsApp" button prefilled with "Hi Samwise".

## Driving it with Samuel's WhatsApp tools + Neon + n8n
Only Samuel's own WhatsApp (user 16), 07:00-22:00 Bogota, neutral text (e.g. "Verification ping, no action needed"). Never write slip, relapse, risk, or a ritual answer: it becomes real context and can trigger Health Check findings or support flows. Each message = 1 counted n8n run.
1. Doctor: n8n `search_workflows` -> `ut3Upvt03EfI2lIS` and `dw1xl4U1AzpzvXkB` active; `search_workflow_executions` (workflowId `ut3Upvt03EfI2lIS`, status error, last 24 h) empty.
2. Send: `Samuel_s_Personal_WS` `send_text` to the Samwise number (check `session_status` first).
3. Wait about 30-60 s, then observe all three:
   - Neon: `select id, direction, left(body,80), created_at from messages where user_id = 16 and channel = 'whatsapp' order by id desc limit 2` -> one `inbound` with the text, one `outbound` after it.
   - n8n: newest execution of `ut3Upvt03EfI2lIS` -> `success`; record its id.
   - Samuel's WhatsApp `read_messages` on the Samwise chat -> the same outbound text arrived.
4. Record with `scripts/record.py`, verdict PASS only if all three agree.

## Gotchas
- `zb6qoI4NdzC449aF` is the old test loop (unpublished backup), not the live chat.
- A reply can take 20-40 s (agent + profile refresh). Wait before calling it a failure; a missing outbound row after 5 min is the Health Check's failure rule.
- Chat Brain's live prompt is `options.systemMessage`; a nested copy is ignored. Fetch it before reasoning about a reply.
- Samuel's WhatsApp tools may be disconnected (`session_status`); then this feature can only be checked from past `messages` rows, and the report must say so.
