# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| tesourinha-beauty (apps/landing), 2026-11-11 | Linha de corte (new): one strip being cut; acts are cut-outs | Dashed cut line is the nav: vertical rail in the left gutter on desktop with clickable section marks, header bottom edge on phones; a scissors travels it with scroll | Pinned layered hero: outlined wordmark (far), steel-and-orange scissors that rotates to point down (mid), cut-hair snips (near), pointer-shifted light; no media | pin 1.7 > custom pin 4.0 (peak) > pan 3.2 (title held under a veil) > flow tool > flow index with reveal > pin 1.2 (flow on phones); 6 acts, ~14vh | Pinned close with magnetic CTA + footer inside the stage; the resolution is the user's own booking coupon being cut out | Scissors cut the screen in half down the seam and the halves part to reveal the real number (+90 mil formados); the same scissors snips with wheel velocity on the cut line and cuts out the completed booking coupon | Dark salon at night, steel and #FF6A13, no photography | Vite, port 4500 |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Grammar:** "linha de corte" (a page-long cut line that is also the nav).
- **Peak:** a split-screen cut where two halves part to reveal a figure on an accent ground.
- **Close:** a stateful coupon that completes and is "cut out" (selection carried from a rail into a form).
- **Hero:** a brand object that rotates over the hero's span to hand off into the next act.
- **Length band:** 6 acts at about 14vh.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
