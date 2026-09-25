# Demo video script — target 2:30–3:00

Written as talking points, not a word-for-word script — say it in your own
words, but hit these beats in this order so the video maps cleanly onto
the judging criteria (innovation, completeness, technical execution, X
Layer integration, growth potential).

Before recording: run `cd apps/api && pnpm verify` and confirm 3/3 passes.
Don't record against broken data.

---

**0:00–0:25 — The hook (innovation + problem)**
Say the core insight out loud, concretely: "Right now, Yuan deposits are
out-yielding dollar deposits, and USD borrowing costs are climbing — but
unless you're on an institutional trading desk, there's no easy way to
even see that, let alone act on it." Show nothing yet — this is voice
over a blank screen or your face. It's the pitch, and it should land
before any UI does.

**0:25–1:00 — The rate dashboard (product value)**
Cut to the running app. Point at the four-currency comparison table.
Read the actual spread number out loud (e.g. "USD is currently yielding
X points more than JPY — that's the gap"). Mention, briefly and
honestly, that China/Japan data updates slower than US/EU — this is a
credibility point, not a weakness to hide from judges who might check.

**1:00–1:45 — X Layer integration (technical execution + X Layer fit)**
Scroll to the tokenized-stocks table. Click one contract address link —
let the X Layer block explorer actually load on screen. This ten seconds
is the single most important shot in the video: it's proof the addresses
are real, not hardcoded. Say plainly: "These addresses aren't stored in
our code — they're resolved live from OKX's own Market API every time
the page loads, filtered specifically to X Layer." That sentence is doing
a lot of work; say it clearly.

**1:45–2:15 — How it's built (technical execution)**
Quick screen-share of the repo structure or `SESSION_REPORT.md` — enough
to show this is a real TypeScript monorepo (Next.js + Express +
Supabase), not a single HTML file. Mention the verification script by
name — it signals you tested against real credentials, not just a UI
that looks right.

**2:15–2:45 — What's next (growth potential)**
One sentence each, fast: goal-based investing that rebalances across
currencies toward a target return; a borrowing layer where collateral
doesn't carry a passport; eventually an AI agent layer that acts on the
rate signal automatically. Make clear these are roadmap, not claimed as
built today — don't overstate this part.

**2:45–3:00 — Close**
Restate the one-line pitch from `SUBMISSION.md` verbatim as your closing
line. Judges watching many videos back to back will remember a repeated,
crisp line more than a new one improvised at the end.

---

## Shot list (so you're not improvising screens mid-recording)

1. Face/voiceover only, or blank slide with the pitch text
2. Home page — rate comparison table, ticker rail visible at top
3. Tokenized-stocks table — click one contract address
4. X Layer block explorer page for that address (let it visibly load)
5. Repo structure or SESSION_REPORT.md, a few seconds
6. Back to face/voiceover for the close

## What NOT to do

- Don't demo the sign-up flow unless asked — it's plumbing, not the pitch.
- Don't apologize on camera for unbuilt features — state roadmap items
  once, matter-of-factly, and move on.
- Don't skip the explorer-link click. It's the single piece of footage
  that proves this isn't a mockup.
