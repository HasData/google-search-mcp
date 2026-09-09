# Google Search MCP Server (SERP)

<!-- mcp-name: com.hasdata/google-search -->

A hosted Model Context Protocol (MCP) server that gives Claude, Cursor, Windsurf and any other MCP client eight read-only Google Search tools. Pull the live SERP with its AI Overview and People Also Ask, run a Google AI Mode query, and read news, shopping, product detail and short-video results, all as structured JSON, with no Google Cloud project and no search-engine setup.

**1,000 free credits every month, no card required**, which is 100 full-SERP calls or 200 of the 5-credit calls.

```
https://mcp.hasdata.com/api/mcp?apis=google_serp
```

[![Glama score](https://glama.ai/mcp/servers/HasData/google-search-mcp/badges/score.svg)](https://glama.ai/mcp/servers/HasData/google-search-mcp)
[![tool contract](https://github.com/HasData/google-search-mcp/actions/workflows/contract.yml/badge.svg)](https://github.com/HasData/google-search-mcp/actions/workflows/contract.yml)
[![MCP](https://img.shields.io/badge/MCP-remote%20%7C%20streamable%20HTTP-6366f1?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/tools-8-10b981?style=flat-square)](#tools)
[![npm](https://img.shields.io/npm/v/@hasdata/google-search-mcp?style=flat-square&logo=npm&label=npm&color=cb3837)](https://www.npmjs.com/package/@hasdata/google-search-mcp)
[![PyPI](https://img.shields.io/pypi/v/hasdata-google-search-mcp?style=flat-square&logo=pypi&logoColor=white&label=PyPI&color=3775a9)](https://pypi.org/project/hasdata-google-search-mcp/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

"SERP" and "Google Search" are the same product here. This server returns Google search-engine results pages, parsed.

## Contents

- [What you need](#what-you-need)
- [Quick start](#quick-start)
- [Example prompts](#example-prompts)
- [Tools](#tools)
- [Errors and failure paths](#errors-and-failure-paths)
- [Pricing, free tier and limits](#pricing-free-tier-and-limits)
- [Tool selection](#tool-selection)
- [How it compares](#how-it-compares)
- [FAQ](#faq)
- [HasData links](#hasdata-links)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## What you need

An MCP client that speaks streamable HTTP with custom headers. A HasData API key from the [dashboard](https://app.hasdata.com/sign-up?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp), free to create with no card, and the trial covers about 100 to 200 calls depending on the tool. Nothing else. This is a remote server, so the simplest path is a URL and a header, with no Google Cloud project or Programmable Search Engine to set up. A stdio-only client can use the `@hasdata/google-search-mcp` (npm) or `hasdata-google-search-mcp` (PyPI) launcher instead.

## Quick start

| | |
| :--- | :--- |
| URL | `https://mcp.hasdata.com/api/mcp?apis=google_serp` |
| Transport | HTTP, streamable |
| Auth header | `x-api-key: HASDATA_API_KEY` |

The server URL is the same for every client. We run it hands-on in Claude Code and Claude Desktop. The other blocks follow each client's own documented format for a remote server.

Clients with OAuth support can add the same URL as a connector and sign in without putting a key in a config file.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http google-search "https://mcp.hasdata.com/api/mcp?apis=google_serp" \
  --header "x-api-key: HASDATA_API_KEY"
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Claude Desktop loads only local (stdio) servers from its config file, so it reaches a remote server through a stdio launcher. The `@hasdata/google-search-mcp` package is that launcher, and it reads the key from the environment.

`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-search": {
      "command": "npx",
      "args": ["-y", "@hasdata/google-search-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

Python instead of Node? Swap the launcher for the PyPI package, which `uvx` runs without a manual install:

```json
{
  "mcpServers": {
    "google-search": {
      "command": "uvx",
      "args": ["hasdata-google-search-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

A client with OAuth support can instead add the URL as a custom connector and skip the launcher.

</details>

<details>
<summary><b>Cursor</b></summary>

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-search": {
      "url": "https://mcp.hasdata.com/api/mcp?apis=google_serp",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "google-search": {
      "serverUrl": "https://mcp.hasdata.com/api/mcp?apis=google_serp",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Cline</b></summary>

```json
{
  "mcpServers": {
    "google-search": {
      "url": "https://mcp.hasdata.com/api/mcp?apis=google_serp",
      "type": "streamableHttp",
      "headers": { "x-api-key": "HASDATA_API_KEY" },
      "disabled": false
    }
  }
}
```

</details>

<details>
<summary><b>VS Code</b></summary>

`.vscode/mcp.json`:

```json
{
  "servers": {
    "google-search": {
      "type": "http",
      "url": "https://mcp.hasdata.com/api/mcp?apis=google_serp",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "google-search": {
      "httpUrl": "https://mcp.hasdata.com/api/mcp?apis=google_serp",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

## Example prompts

> Search Google for `best running shoes` and give me the organic top ten plus the AI Overview.

*One call, 10 credits. The SERP response carries the AI Overview inline alongside the organic results.*

> For the same query, take each People Also Ask question and pull its AI Overview answer with sources.

*One call per question, 5 credits each. Each `relatedQuestions` entry holds an `aiOverview.pageToken`, and the AI Overview tool turns that token into the answer blocks and their references.*

> Ask Google AI Mode `what is the Model Context Protocol` and give me the answer with its citations.

*One call, 10 credits. AI Mode returns the generated answer as text blocks with a reference list.*

> Search Google Shopping for `nike air max`, then pull the full product card for the top result: every store selling it, the price range and the review breakdown.

*Two calls. Shopping is 10 credits and returns a token per product, and the immersive product tool spends 5 to expand that token into stores, variants and reviews.*

> Get the latest Google News for `artificial intelligence`, and separately the short-video results for `cooking pasta`.

*Two calls, 10 credits each.*

The workflow leans on two chains. A SERP response hands back an `aiOverview` inline and a `pageToken` on every People Also Ask question, so extracting Google's generative answers is either free with the search or one 5-credit follow-up per question. A shopping result likewise hands back a token per product, so the jump from a listing to its full multi-store card is a single call.

## Tools

Eight tools, all read-only. Samples below are trimmed from real calls, and the results in them change as Google changes, so read them as shapes. Each tool name links to its endpoint reference.

The samples are the payload, not the whole response. A `tools/call` result carries one text block, and that text is itself JSON holding `url`, `status`, `text` and `json`, with the scraped data under `json`. From a raw JSON-RPC response the path is `result.content[0].text`, parsed, then `.json`. A chat client unwraps that for you and code talking to the endpoint directly does not.

### Google SERP

[`hasdata_google_serp_serp_getSearchResults`](https://docs.hasdata.com/apis/google-serp/serp?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

The full results page for a query.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | The search query, exactly as a user would type it |
| `gl` / `hl` | string | | Two-letter country and language codes |
| `location` / `uule` | string | | Geographic location for the search, by name or as a `uule` string |
| `num` | number | | Approximate results per page. Google now caps a page at about ten and ignores anything higher, so `num` above 10 fetches no more |
| `start` | number | | Result offset for paging |
| `tbm` / `tbs` | string | | Search type and advanced filters, the raw Google parameters |
| `deviceType` | string | | `desktop`, `mobile` or `tablet` |

Returns `searchInformation`, `organicResults`, `aiOverview`, `relatedQuestions`, `relatedSearches`, `perspectives`, `immersiveProducts` and `pagination`, with whichever blocks Google shows for the query. Organic entries carry `position`, `title`, `link`, `displayedLink`, `source`, `snippet`, `snippetHighlitedWords`, `date` and `images`.

> The AI Overview arrives two ways. Usually `aiOverview` is inline, with `textBlocks` and `references` you can read straight away. Sometimes Google gates it behind a token, and then `aiOverview` carries a `pageToken` and a `hasdataLink` instead of the blocks. Every `relatedQuestions` entry is that second case too. It holds a `question` and an `aiOverview` with the same `pageToken` and `hasdataLink`, which the AI Overview tool below expands. So the People Also Ask answers are AI Overviews you fetch one token at a time. The top-level `aiOverview` is inline on most queries and a token on a few, so read it both ways.

```json
{
  "organicResults": [
    {
      "position": 1,
      "title": "The 15 Best Running Shoes of 2026",
      "link": "https://www.runnersworld.com/gear/a19663621/best-running-shoes/",
      "source": "Runner's World",
      "snippet": "The Brooks Ghost is our No. 1 shoe when we recommend new trainers…"
    }
  ],
  "aiOverview": {
    "textBlocks": [ { "type": "paragraph", "snippet": "The best running shoes depend on your goal…" } ],
    "references": [ { "index": 0, "title": "7 Best Running Shoes in 2026 - RunRepeat", "link": "https://runrepeat.com/guides/best-running-shoes" } ]
  },
  "relatedQuestions": [
    { "question": "What are the top 5 best running shoes?", "aiOverview": { "pageToken": "eyJpZCI6…", "hasdataLink": "https://api.hasdata.com/scrape/google/ai-overview?pageToken=eyJpZCI6…" } }
  ],
  "pagination": { "next": "…" }
}
```

### Google AI Overview

[`hasdata_google_serp_ai_overview_getAiOverviewResponse`](https://docs.hasdata.com/apis/google-serp/ai-overview?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

Expands an AI Overview token into its answer.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `pageToken` | string | yes | An `aiOverview.pageToken` from a SERP response, including the ones on `relatedQuestions`. The same token object carries a `hasdataLink`, a ready REST URL that fetches the same answer without this tool |

Returns `aiOverview` with `textBlocks` and `references`. This is how you read the AI Overview when the SERP handed you a token rather than the blocks, and how you turn each People Also Ask question into a cited answer.

> Tokens are valid for about 4 minutes. A stale one does not come back empty, it fails as a tool error, `isError: true` with the text `HasData API error: 400 Bad Request`. Catch it the way you catch a wrong key, and re-run the SERP for a fresh token.

```json
{
  "aiOverview": {
    "textBlocks": [ { "type": "paragraph", "snippet": "The top five running shoes feature versatile options for daily training and racing…" } ],
    "references": [ { "index": 0, "title": "…", "link": "https://…" } ]
  }
}
```

### Google AI Mode

[`hasdata_google_serp_ai_mode_getAiModeResponse`](https://docs.hasdata.com/apis/google-serp/ai-mode?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

Google's AI Mode answer for a query, the conversational search result.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | The question to ask AI Mode |
| `gl` / `hl` | string | | Country and language codes |
| `location` / `uule` | string | | Geographic location |
| `continuable` | boolean | | Set true to make the answer continuable in a follow-up call |
| `subsequentRequestToken` | string | | Token from a previous AI Mode response, to continue the thread |

Returns `textBlocks` and `references`, the generated answer and the sources it cites.

### Google SERP Light

[`hasdata_google_serp_serp_light_getSearchResults`](https://docs.hasdata.com/apis/google-serp/serp-light?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

A cheaper search that returns the core of the page.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | The search query |
| `gl` / `hl` | string | | Country and language codes |
| `location` / `uule` | string | | Geographic location |
| `num` / `start` | number | | Page size and offset |

Returns `organicResults`, `aiOverview`, `relatedSearches`, `filters`, `appliedLocation`, `searchInformation` and `pagination`. It is half the credits of the full SERP, for when you want organic results and the AI Overview without the extra blocks.

### Google News

[`hasdata_google_serp_news_getGoogleNews`](https://docs.hasdata.com/apis/google-serp/news?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

The Google News results for a query or a news section.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | | A query. Omit it to read a section instead |
| `gl` / `hl` | string | | Country and language codes |
| `topicToken` / `sectionToken` / `storyToken` / `publicationToken` | string | | Drill into a topic, section, story or publication, using a token from a previous response |

Returns `newsResults`, `menuLinks`, `relatedTopics` and `relatedPublications`. Each news entry carries `position`, `title`, `link`, `source` with a `name` and `icon`, `thumbnail` and `date`.

### Google Shopping

[`hasdata_google_serp_shopping_getSearchResults`](https://docs.hasdata.com/apis/google-serp/shopping?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

Shopping results for a query.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | The product query |
| `gl` / `hl` | string | | Country and language codes |
| `location` / `uule` | string | | Geographic location |
| `start` | number | | Result offset for paging |
| `tbs` | string | | Advanced shopping filters, the raw Google parameter |

Returns `shoppingResults`, `filters`, `refineSearchFilters`, `searchInformation` and `pagination`. Each result carries `position`, `title`, `productId`, `price`, `extractedPrice`, `rating`, `reviews`, `source`, `category`, `thumbnail` and an `immersiveProductPageToken`.

> `immersiveProductPageToken` is the input to the immersive product tool below. It is a temporary token, so expand it while it is fresh if you want the product data, and re-run the shopping call for a new one if an old token fails.

```json
{
  "shoppingResults": [
    {
      "position": 1,
      "title": "Men's Nike Alphafly 3",
      "productId": "13366226642799457284",
      "price": "$285.00",
      "extractedPrice": 285,
      "rating": 4.5,
      "reviews": 120,
      "source": "Nike",
      "immersiveProductPageToken": "eyJyZHMiOiJQQ18…"
    }
  ]
}
```

### Immersive product

[`hasdata_google_serp_immersive_product_getImmersive_e29f691177`](https://docs.hasdata.com/apis/google-serp/immersive-product?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

The full product card behind a shopping result.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `pageToken` | string | yes | The `immersiveProductPageToken` from a shopping result or a SERP `immersiveProducts` entry |
| `moreStores` | boolean | | Ask for more stores |
| `nextPageToken` | string | | Page through the list of stores, using `storesNextPageToken` from the previous response |

Returns a `productResults` object with `title`, `brand`, `rating`, `reviews`, `priceRange`, a `stores` array of every seller with its price and link, plus `variants`, `reviewsImages`, `userReviews`, `topInsights`, `aboutTheProduct` and `discussionsAndForums`. This is the one call that turns a single listing into the whole cross-store picture.

```json
{
  "productResults": {
    "title": "Men's Nike Alphafly 3",
    "brand": "Nike",
    "rating": 4.4,
    "reviews": 1077,
    "priceRange": "$221-$295",
    "stores": [ { "name": "eBay", "link": "https://www.ebay.com/itm/…", "price": "$221" } ],
    "storesNextPageToken": "Mw=="
  }
}
```

Feed `storesNextPageToken` back in as the `nextPageToken` parameter to page through the stores.

### Google short videos

[`hasdata_google_serp_short_videos_getShortVideosSearchResults`](https://docs.hasdata.com/apis/google-serp/short-videos?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp)

The short-video results Google shows for a query.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `q` | string | yes | The query |
| `gl` / `hl` / `cr` | string | | Country, language and content-region codes |
| `lr` | array | | One or more language restrictions |
| `page` | number | | Result page |
| `deviceType` | string | | `desktop`, `mobile` or `tablet` |

Returns `shortVideos`, each with `position`, `title`, `link`, `source`, `sourceLogo`, `profileName`, `duration`, `clip` and `thumbnail`.

## Errors and failure paths

Your client almost never sees an HTTP error code from a tool call. The MCP layer answers 200 and puts the failure inside the result, with `isError` set to `true` and the reason as text. The agent reads a message where you might expect a status line.

**A wrong key surfaces as tool output, not as a failed connection.** Listing tools accepts any non-empty key, and the client completes its handshake and shows green. The first tool call then comes back with `isError: true` and the text `HasData API error: 401 Unauthorized`. Watch for that string, because nothing earlier in the flow reports the problem.

The one real HTTP error is a **missing key**. Authorization runs before any tool, and the connection itself fails with 401.

**An argument that breaks the schema is rejected before it becomes a search.** A search with no `q` comes back with `isError: true` and the text `MCP error -32602: Input validation error`, naming the field. Nothing is fetched and nothing is charged.

**A stale AI Overview token fails as an error.** A SERP response token is valid for about 4 minutes. Expanding one you stored earlier comes back with `isError: true` and the text `HasData API error: 400 Bad Request`, the same shape as a wrong key. Catch it and re-run the SERP to get a fresh token.

**A block Google did not show is absent, not empty.** A query with no AI Overview, no shopping pane or no People Also Ask returns a response without those keys rather than with empty ones. Test for the key before reading it.

Results that carry data also carry a `requestMetadata.id` worth quoting in support, plus `html` and `json` links to the stored artifact of that exact call.

## Pricing, free tier and limits

Credits are per tool. The full SERP, AI Mode, News, Shopping and short videos cost **10 credits** a call. SERP Light, immersive product and the AI Overview tool are **5**. The AI Overview that comes inline with a SERP response is free, part of that 10-credit call, but expanding a token with the AI Overview tool, including every People Also Ask token, is a separate 5-credit call. Response size does not change the price.

The free tier is **1,000 credits every month with no card**, which is 100 full-SERP calls or 200 of the 5-credit calls. It renews with the billing cycle, so a low-volume agent runs on the free tier indefinitely.

Paid plans start at **$49 a month** for 200,000 credits. The price per credit falls with volume, and current numbers live on the [pricing page](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp).

Your plan also sets concurrency. The free tier allows 1 request at a time, Startup 15, Business 30, Growth 50, and the high-volume plans run from 200 to 1,500. Concurrency is the only throttle. There is no separate requests-per-minute cap. Handle the overflow case defensively in anything unattended, because an agent that fans out across queries will reach the ceiling before you do.

## Tool selection

`?apis=google_serp` exposes these eight tools. The parameter takes a list, and `?apis=google_serp,google_maps` adds the Google Maps tools alongside search. Drop the parameter and you get everything HasData exposes, which is currently 57 tools.

A narrow list is usually the better default. A model choosing among eight tools picks correctly more often than one choosing among fifty-seven, and the tool descriptions themselves cost context on every turn.

## How it compares

Google no longer offers a general search API. The official route is the Custom Search JSON API, and it answers a different question from this one.

The Custom Search JSON API searches a Programmable Search Engine you configure, over the sites you list or the whole-web index if you switch it on. It is capped at 100 free queries a day and then charges per thousand up to a daily ceiling, and it returns a stripped result set. It does not return the AI Overview, People Also Ask, the local pack, shopping, news or short videos, because those are features of the live results page rather than of the API. It is the right tool when you want to search your own site or a fixed set of sites and stay inside Google's official terms for that.

This server returns the live Google results page as a visitor sees it, parsed. There is nothing to configure, the query runs against all of Google rather than a curated engine, and the AI Overview, People Also Ask, shopping and the rest come back as structured blocks.

| | Custom Search JSON API | This server |
| :--- | :--- | :--- |
| What it searches | A Programmable Search Engine you configure | The live Google results page |
| Setup | A Cloud project and a search engine | One API key |
| AI Overview and People Also Ask | Not returned | Inline, or by token |
| Shopping, news, short videos, local | Not returned | Dedicated tools |
| Free tier | 100 queries a day | 1,000 credits every month |

Two rows decide it. If you only need to search your own sites and want Google's official API for that, the Custom Search JSON API is the fit. If you need the real SERP, its AI Overview, or any of the panes Google shows a searcher, the official API does not return them and this does.

**What this server does not do.** No crawling of the pages behind the results, no ranking history, and nothing that writes. It returns the parsed results page.

## FAQ

### What is a Google Search MCP server?

A server that exposes Google search results as tools an AI client can call. The client sends a tool call over the Model Context Protocol, the server fetches the results page and returns structured JSON, and the model works with the result and never sees a page of HTML. This one exposes eight read-only tools and runs remotely, so the client connects to a URL and starts no local process.

### Is SERP the same as Google Search here?

Yes. A SERP is a search-engine results page. These tools return Google's results pages, so "SERP API" and "Google Search API" mean the same thing in this repo.

### Is there an official Google Search MCP server?

Google publishes no MCP server and no general search API. The closest official product is the Custom Search JSON API, which searches a Programmable Search Engine you configure. Several community MCP servers, this one among them, return the live results page instead.

### How do I get the AI Overview?

Run a SERP call. The `aiOverview` is usually inline with its `textBlocks` and `references`. When it comes back as a `pageToken` instead, and on every People Also Ask question, pass that token to the AI Overview tool to get the answer. Tokens expire quickly, so expand them from a fresh call.

### Do I need a Google Cloud project or a Programmable Search Engine?

No. The only credential is your HasData key. Nothing to create in Google Cloud, and no per-API quota to manage.

### Does the API key expire?

No. The key does not expire. Rotate it in the dashboard whenever you need to.

### Is the data live or cached?

Live. Each call fetches the results page at request time and carries its own `requestMetadata.id`. Two identical calls are two separate fetches and not a replay of a stored copy.

### Is this affiliated with Google?

No. HasData is an independent service and is not affiliated with, endorsed by, or sponsored by Google. Google is a trademark of its respective owner. The tools work with publicly available data only, and you are responsible for using the results in line with Google's terms and the law that applies to you.

## HasData links

| | |
| :--- | :--- |
| Product page and request builder | [Google SERP API](https://hasdata.com/apis/google-serp-api?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| Server documentation | [MCP server docs](https://docs.hasdata.com/mcp-server?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| All 57 tools in one server | [HasData/hasdata-mcp](https://github.com/HasData/hasdata-mcp) |
| Client walkthroughs | [MCP clients and integrations](https://hasdata.com/integrations/mcp?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| The other surfaces we parse | [53 more scraper APIs](https://hasdata.com/apis/?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| Plans and credit costs | [Plans and credit costs](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| Keys and usage | [HasData dashboard](https://app.hasdata.com?utm_source=github&utm_medium=syndication&utm_campaign=google-search-mcp) |
| Node launcher on npm | [@hasdata/google-search-mcp](https://www.npmjs.com/package/@hasdata/google-search-mcp) |
| Python launcher on PyPI | [hasdata-google-search-mcp](https://pypi.org/project/hasdata-google-search-mcp/) |

## Development

This repository is configuration and documentation for a remote server. There is no build step and nothing to containerize.

It does carry a contract test. The README documents eight tools with specific parameters, and the upstream tool list can change without a commit here, which would leave this file quietly lying to you. The test asserts the documented tools exist with the parameters claimed, and runs weekly in CI as well as on every push.

```bash
HASDATA_API_KEY=your_key_here npm test
```

On PowerShell:

```powershell
$env:HASDATA_API_KEY = "your_key_here"; npm test
```

The last check makes a real search and costs 10 credits, which is the price of a canary that can fail for the right reason. Listing tools succeeds with any non-empty key, so a test that only lists tools stays green with a revoked one.

## Contributing

Corrections to the tool tables and the response samples are the most useful contribution, because those are the parts that drift. Include the call you made and the response you got. Pull requests from forks run the suite without a key, and the live checks skip instead of going red.

## License

MIT. See [LICENSE](LICENSE).
