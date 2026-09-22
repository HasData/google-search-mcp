---
description: A snapshot of who ranks for a query, with the AI Overview and the questions people ask
---

Take a keyword and report what Google actually shows for it.

Ask me for the keyword and the market if I have not given them. The market is a country and a language, and it changes the answer, so do not guess it silently.

Then:

1. Call `hasdata_google_serp_serp_getSearchResults` with the keyword, `location`, `gl` and `hl` set to that market.
2. List the top ten organic results as position, title and domain. Mark the ones that are our own domain if I named one.
3. If the response carries an AI Overview block, expand it with `hasdata_google_serp_ai_overview_getAiOverviewResponse` using the `pageToken` from that block, and list the sources it cites.
4. List the People Also Ask questions verbatim.
5. Close with what the page is made of: how many organic results, whether ads, shopping, video or a knowledge panel are present.

Report what came back. If there is no AI Overview, say so rather than describing what usually appears.
