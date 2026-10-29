# SPEC: Unstuck

Last updated: 2026-10-29 · Owner: Farid Pacheco Salum (individual project, no partner assigned)

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

## Money rules

Every rule below is implemented as a commented function.

1. **Allocation by horizon.** The suggested split depends on when the user says she
   would need the money:
   - under 2 years: 100% short term
   - 2 to 5 years: 40% short, 40% medium, 20% long
   - over 5 years: 20% short, 30% medium, 50% long

   The horizon decides, not the risk answer, because a long-term instrument can be
   down exactly when the money is needed.
2. **Risk adjustment.** The answer to "what would you do if the balance dropped 10
   percent" shifts the split, it does not set it:
   - "I would sell": move 20 points from long to short
   - "I would hold": no change
   - "I would invest more": move 10 points from short to long

   A shift is capped at what the source bucket actually holds. Under a 2-year
   horizon the split is already 100% short, so "I would sell" changes nothing:
   there is nothing more conservative to move to. Percentages never go below 0 or
   above 100, and always sum to 100.

3. **No instrument is named.** The output is a split across horizon buckets, with one
   sentence each. Naming a security would require the asesor en inversiones
   registration. `TODO-verify`

4. **Amounts in integer centavos.** No floating-point arithmetic for money.

5. **Rounding.** Amounts are split in integer centavos. When a percentage split
   leaves a remainder, the remainder goes to the bucket with the largest
   percentage, so the three buckets always sum exactly to the amount invested. When
   two buckets tie for the largest percentage, the order is short, then medium,
   then long: the leftover centavos go to the most conservative of the tied
   buckets.

6. **Bucket explanations.** Each bucket is shown with one sentence, naming no
   instrument:
   - Short term: money you may need soon. It moves very little, and it is there
     when you ask for it.
   - Medium term: money you can leave for a few years. It moves more, and it has
     time to recover.
   - Long term: money you will not touch. It moves the most, and the years do the
     work.

7. **Confirmed amount.** The user confirms the amount she actually transferred,
   which may differ from the suggested amount. The buckets are recalculated with the
   same percentages and the same remainder rule. Zero and negative amounts are
   rejected. The app never requires the suggested amount: step 5 exists because the
   transfer cannot be detected, and requiring a match would ask the user to lie.

## The guide's fictional screens

The execution guide demonstrates "Casa de Bolsa Demo". Every screen is invented and
labelled "Demo mode". Four steps:

1. **Open the account.** The institution asks for: full name, CURP, date of birth,
   address, and a photo of an official ID. Expect to wait one business day for
   approval.
2. **Fund the account.** The institution shows a CLABE in your own name. Transfer to
   it from your bank, exactly as you would to any other account. The money arrives
   the same day.
3. **Choose where it goes.** The institution's screen lists its options grouped by
   term. Match each of your three buckets to the group with the same term.
4. **Confirm.** The institution shows the amount and the term before you confirm.
   Check that the amount matches what you intended.

No real institution's interface is reproduced, and no instrument is named.

The transfer screen shows no usable account number. The destination is a visibly
non-transferable placeholder, not a plausible CLABE, labelled "Demo mode". A
realistic-looking account number could be copied and used by mistake.

## Demo inputs

Until steps 1 and 2 exist, steps 3 and 4 run with these hardcoded values:

- Amount to invest: 2,000,000 centavos (MXN 20,000.00)
- Horizon: 2 to 5 years
- Risk answer: "I would hold"

Expected result under Money rules 1 and 2: 40% short, 40% medium, 20% long —
800,000 / 800,000 / 400,000 centavos.

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
- Guides for a real institution. The execution guide demonstrates a fictional
  institution, "Casa de Bolsa Demo", with invented screens labelled "Demo mode".
  Imitating a real institution's interface would borrow its brand and would need
  maintenance every time it changes.
- More than one user role (no adviser view, no admin view).
- Integration with any real financial institution.
- Automatic confirmation of transfers. Step 5 is in scope: the user types the amount
  she transferred and the position moves from pending to confirmed. Detecting the
  transfer automatically is not.

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
| 2026-10-27 | Added Money rules section: allocation by horizon, risk adjustment, integer centavos | The allocation logic was described in the core flow but never specified as rules, so there was nothing for the agent to implement or for me to defend | Farid Pacheco Salum |
| 2026-10-27 | Specified rounding, bucket explanations and a fictional institution for the guide | The agent stopped and asked rather than inventing these; the answers are product decisions and belong in the source of truth | Farid Pacheco Salum |
| 2026-10-27 | Specified the guide's fictional screens, demo inputs, and that step 5 is in scope | The agent could not plan without them, and the scope boundary around confirmation was ambiguous | Farid Pacheco Salum |
| 2026-10-29 | Recorded the confirmed-amount rule and the fake destination placeholder | The agent refused to plan until both were in the source of truth, which is rule 1 working as intended | Farid Pacheco Salum |
| 2026-10-29 | Added a tie-break to the rounding rule | The 40/40 split has no uniquely largest bucket, so the remainder had no defined destination | Farid Pacheco Salum |
| 2026-10-29 | Capped the risk shift at the source bucket's balance | A 100% short split has nothing in long to move, so the shift had no defined behaviour | Farid Pacheco Salum |