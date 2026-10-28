# SPEC: Unstuck

Last updated: 2026-08-30 · Owner: Farid Pacheco Salum (individual project, no partner assigned)

## Problem

People who receive recurring income from a physical asset (rental property) let that
money pile up in a bank account earning nothing, month after month. They know how to
manage the asset they already own, but they have no criterion for deciding what to do
with the cash it generates. The options available today — the bank's pagaré, the fund
the account executive offers, an investment app — either are not explained in terms
this person can compare against what she already understands, or they present a list
of instruments without saying which one matches her time horizon and her tolerance
for loss. The result is inaction: the money sits still.

## User

Norma Salum Esper, 53, Mexico City. She manages several rental apartments and
receives monthly income that accumulates in her bank account earning nothing. She
wants to invest it and has not, because she does not know where to start or whom to
trust. Her reference point is the return on an apartment: an asset she can see,
touch and understand.

## Core flow (the MVP)

The single flow that must work end to end at Demo Day:

1. The user enters her monthly rental income and how much of it she can set aside.
2. She answers three questions: what the money is for, when she would need it, and
   what she would do if the balance dropped 10 percent.
3. The system shows a suggested allocation by time horizon (short / medium / long),
   each explained in one sentence, with no specific instruments named.
4. The app walks her through executing it: which account to open, what the institution
   will ask her for, what each field on their screen means, and how to make the
   transfer. She leaves the app, executes, and comes back.
5. She confirms the transfer by entering the amount she actually sent. Until she does,
   the position is shown as pending and is not counted as invested.
6. She sees the projected balance at 12, 36 and 60 months, compared against leaving
   the money in her bank account.

## Data model (plain words)

- **User**: name, estimated monthly income, target horizon, risk profile (the result
  of the three questions).
- **Goal**: belongs to a User. Has a description, a target amount and a horizon in
  months.
- **Contribution**: belongs to a Goal. Has an amount, a date and a status (pending or
  confirmed). A Contribution only counts towards the projection once the user has
  confirmed it by entering the amount she transferred. All are simulated.
- **Scenario**: the projection computed from the Contributions and an assumed rate.
  Not stored; recalculated on demand.
- **Guide step**: belongs to the execution walkthrough. Has an order, a short
  instruction and what the user should expect to see on the institution's screen.
  Generic to the institution, never specific to a security.

All data is invented. There is no real personal data in this repository.

## Dependencies (closed list)

Anything outside this list requires a BITACORA.md entry explaining why it was added.

- HTML, CSS and plain JavaScript. No frameworks, no external libraries, no build step.
- Nothing else.

## Out of scope this semester

Written down so the agent and I stop re-litigating it.

- Real payments and real movement of money.
- Real KYC, identity verification, client file.
- Real order execution in the market.
- Recommending specific named instruments (regulatory implications: see note below).
- Native mobile app.
- Video content. The execution guide is text and static screens only.
- Guides for more than one institution. One is enough to prove the flow works.
- More than one user role (no adviser view, no admin view).
- Integration with any real financial institution.
- Automatic confirmation of transfers, whether through a partner institution or an
  account aggregator. Confirmation is manual this semester: the user enters the amount
  she transferred. The reason is that both alternatives require a signed agreement with
  a licensed institution, which does not exist yet, and both would break the closed
  dependency list.

## Regulatory position

- The product does not receive, hold or transfer the user's money.
- The product does not grant credit.
- The product does not promise or pay a yield; any projection is shown labelled as
  an assumed scenario, not as a guarantee.
- The execution guide explains how to operate a third party's application and what its
  fields mean. It does not tell the user which security to buy. Teaching someone to use
  a tool is not investment advice; naming an instrument would be. `TODO-verify`
- The product does not confirm on the user's behalf that an investment was made. It
  shows a position as pending until the user states the amount she transferred, so the
  interface never implies money is invested when it may not be.
- Implied vehicle: no licence of my own. A real version would operate on a licensed
  partner (a casa de bolsa or a fund distributor), which would custody the money and
  execute the orders.
- TODO-verify: if the product recommended specific securities, the asesor en
  inversiones registration under the Ley del Mercado de Valores would apply. That is
  why naming specific instruments is out of scope this semester.

## Unit economics the model must show

| Number | Value | Period | Source |
|---|---|---|---|
| Price (ARPU) | MXN 199 | per user, per month | Assumption; chosen price, comparable to a streaming subscription |
| Gross margin | 90% | per month | Assumption; payment gateway ~3.6% + hosting |
| Monthly churn | 8% | per month | Assumption; value concentrates at setup |
| Average lifetime | 12.5 months | | 1 / 0.08 |
| Contribution | MXN 179 | per user, per month | 199 × 0.90 |
| CAC | MXN 40 | per paying user | Assumption; 20 hrs of my time at MXN 150/hr ÷ 80 users |
| LTV | MXN 2,238 | per user | 179 × 12.5 |
| LTV/CAC | 56x | | 2,238 / 40 |
| Payback | 0.2 months | | 40 / 179 |

Assets under management does not apply: Unstuck never holds or manages the user's
capital. The number that decides the business is subscribers × price − cost of
acquiring them.

The 56x ratio only holds while the free WhatsApp channel lasts (~80 users). At a
realistic paid CAC of MXN 800: LTV/CAC = 2.8x, payback = 4.5 months.

## Changelog

| Date | Change | Why | Approved by |
| 2026-08-30 | Initial SPEC | First project configuration | Farid Pacheco Salum |
| 2026-08-30 | Added confirmation step to core flow and status to Contribution | Without it the app could show a projection for money the user never actually transferred | Farid Pacheco Salum |
| 2026-08-30 | Added an execution guide inside step 4 | The user is not blocked by not knowing what to buy, she is blocked by not knowing how to operate the institution's app. This is where users are lost, so it belongs in the core flow rather than in a separate product | Farid Pacheco Salum |