# Decisions: Unstuck

One line per choice that is expensive to undo, with the reason.

## Regulatory

- **No licence of my own; operate on a licensed partner** (casa de bolsa or fund
  distributor). Unstuck performs no regulated activity, so it needs none. Rejected
  the alternative because the capital and authorisation are out of reach.
- **Client money never touches Unstuck.** The user transfers directly to the
  institution. Routing it through the app, even briefly, would make this an IFPE:
  500,000 UDIs of paid capital, CNBV authorisation, and a prohibition on paying any
  yield. `TODO-verify`
- **No specific securities recommended by name.** That would require the asesor en
  inversiones registration under the Ley del Mercado de Valores. `TODO-verify`
  Future route: take that registration once interviews show generic guidance is not
  enough for users to pay.
- **Transfer confirmation is manual.** The user enters the amount she sent; until
  then the position is pending. Partner confirmation and account aggregation both
  need a signed agreement that does not exist.

## Product

- **Flat monthly subscription (MXN 199), not a percentage fee on assets.** Revenue
  stops depending on how much the user trusts me with early on, which is little.
- **The execution guide lives inside the core flow**, not as a separate product.
  Remove the guide and the allocation still stands; remove the allocation and all
  that is left is a course.
- **One user role only.** No adviser view, no admin view.
- **The confirmation form is visible from the start, not gated behind the guide.**
  The reviewer flagged it twice. Gating it would add state and code I would have to
  defend, for a flow a single user walks through in order anyway. The guide button
  comes first visually, which is enough.

## Technical

- **Stack: HTML, CSS and plain JavaScript.** No frameworks, no libraries, no build
  step. I have never written code, and I must be able to explain every line at the
  live defence.
- **All data is invented**, in a single seed file. Regulated steps are faked and
  labelled "Demo mode" in the interface.

## Assumptions (unit economics)

- ARPU MXN 199/month, gross margin 90%, monthly churn 8%, CAC MXN 40. Every one is
  an assumption; sources are in SPEC.md.

  ## Funding

- **Raise MXN 550,000 on a SAFE, not on shares.** The three valuation methods span
  MXN 925,000 to 1,525,000. A SAFE sets no valuation today, so I do not have to
  defend a point estimate I cannot support. At the midpoint of the three methods it
  would imply 30.9% of the company sold, but a SAFE converts at the next round's
  price, so that figure is reference, not a commitment.
- **The comparable multiple is 2.4x, not a number I picked.** It is the median
  revenue multiple of the public fintechs shown in FIN506 Session 25, whose range
  runs from 1.3x to 6.8x. I had used 3.0x, which sat above that median with nothing
  behind it. Using the class comparison set lowers my valuation by about 380,000
  and costs me two points of the company, and it is the only version I can defend.
- **Three months of buffer, not six.** The deepest cash point is MXN 285,000 in
  month 30. Six months of buffer would have pushed the raise to about 800,000 and
  cost roughly 39% of the company for a hole that is only 285,000 deep. Three
  months covers the hole with room and costs nine points less.
- **The partner revenue share is modelled at 10%.** DECISIONS.md named the partner
  before any model included its cut. Adding it moved gross margin from 90% to 80%,
  LTV/CAC from 2.80x to 2.49x, and break-even from year 2 to year 4. The business
  still works; it just works later.

## The product, redefined (22 November 2026)

- **The product sizes a maintenance reserve, it does not just suggest a split.**
  The interview said the MXN 200,000 was never idle money: it was a maintenance
  reserve she had never calculated. Running her real numbers showed she needs
  854,107 and holds 200,000. The product that matters is the one that tells her
  that.
- **The customer is a landlord, defined by irregular income.** Every savings app
  automates a fixed rule off a salary. Rent arrives late, incomplete, or not at
  all, and expenses arrive in lumps, so a fixed rule is unsafe. That is why she
  never automated, and it is the gap nobody serves.
- **Register as an asesor en inversiones, article 225 LMV.** Her one firm request
  was to be told exactly where. A filtered list is an individualised
  recommendation, and Fintual holds the same registration for the same reason.
  The cost is an estimated MXN 180,000 once and 18,000 a month, both in the P&L
  and both marked TODO-verify.
- **The three noes still hold.** An adviser does not custody, lend, or pay a
  yield. The money line and the advice line are different laws, and the business
  crosses only the second.
- **Price at MXN 299 a month, flat, not a percentage of assets.** At 199 the
  compliance cost made the business sell 65% of itself and never recover in five
  years. A percentage earns almost nothing from a client in year one and too much
  in year ten, and it pays me to gather assets rather than to tell the truth —
  which is the incentive her last adviser had, and she fired her.
- **Persistence through localStorage, and no sign-in.** The app remembers the
  reserve and each month on the person's own device. A password over localStorage
  protects nothing from anyone who opens the developer tools, so building one
  would have been theatre. Named as a gap, not hidden.
  - No sign-in. The app is a static page on GitHub Pages with no server
  and no database. A password would be compared in JavaScript that any
  visitor can read, and the session would live in the same localStorage
  it claims to protect — the appearance of security without the thing
  itself. The data never leaves the device, so there is no server-side
  store to protect. Sign-in belongs with the backend, and the backend
  belongs with the CNBV registration and real custody integration.
  - The record lives in one browser on one device. The calculation is
  portable because it is recomputed from the person's own inputs, but
  the month history does not travel. Both the history and the sign-in
  require the same thing — a server — and both belong to the version
  that has one.