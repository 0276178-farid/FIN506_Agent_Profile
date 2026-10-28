# Agent instructions: Unstuck

A web tool that helps a person with recurring rental income decide what to do with
that cash, by translating her time horizon and risk tolerance into a suggested
allocation she can compare against leaving the money in her bank account.

## Golden rules

1. `SPEC.md` is the source of truth. If a task conflicts with it, stop and say so
   instead of improvising.
2. Comment every financial formula: what it computes, and why this formula (CAC, LTV,
   contribution margin, interest, fees).
3. Never invent regulatory claims (Ley Fintech, CNBV, Banxico, Condusef, LFPDPPP).
   If a regulatory statement is needed and unverified, write `TODO-verify` next to it.
4. Ask before: adding any dependency, creating a new top-level folder, or changing the
   data model. This is an individual project with no partner, so the check is on me:
   flag it, wait for my answer, and log the decision in `BITACORA.md`.
5. Never read or write `.env` or any credentials file. This project contains no real
   secrets and no real personal data: all data is invented.
6. Prefer the simplest implementation that completes the core flow end to end. No
   features outside `SPEC.md` scope without flagging them first.
7. When a request is ambiguous, ask one clarifying question instead of guessing.
8. After significant changes, state plainly what you changed and where, so it can be
   logged in `BITACORA.md`.
9. I have never written code before. Explain what each file does and what each block
   of code is for, in plain language, so I can defend it at the live defense. Do not
   introduce patterns or abstractions I have not asked about.

## Project facts

- Vertical: wealthtech
- Core flow (the ONE flow that must work): the user enters her monthly rental income
  and how much she can set aside, answers three questions (purpose, time horizon,
  reaction to a 10 percent drop), sees a suggested allocation by horizon, records a
  simulated deposit, and sees the projected balance at 12, 36 and 60 months compared
  against leaving the money in her bank account.
- Stack: HTML, CSS and plain JavaScript. No frameworks, no external libraries, no
  build step. Every file opens directly in a browser.
- Out of scope this semester: real payments and money movement; real KYC or identity
  verification; real order execution; recommending specific named instruments; native
  mobile app; more than one user role; integration with any real financial institution.
- Fake data source: a single JavaScript file with a hardcoded array of invented users,
  goals and contributions. Names are visibly fictional. No real personal data, not
  even mine.