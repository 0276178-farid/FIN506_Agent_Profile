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