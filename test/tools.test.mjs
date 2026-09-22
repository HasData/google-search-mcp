// Tool contract test.
//
// The README documents eight tools and a specific parameter set for each. The upstream server
// exposes two more under ?apis=google_serp (an events tool Google has effectively retired, and a
// product tool that returns nothing), which this repo deliberately does not document. So the
// checks below assert that the eight documented tools exist with the parameters claimed, rather
// than that the tool list is exactly eight.
//
// One test makes a real call. Listing tools accepts any non-empty key, so a contract check that
// only lists tools stays green with a revoked or mistyped key. That single SERP call costs
// 10 credits, which is the price of a canary that can fail for the right reason.
//
// Run: HASDATA_API_KEY=your_key_here npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';

const ENDPOINT = 'https://mcp.hasdata.com/mcp?apis=google_serp';
const KEY = process.env.HASDATA_API_KEY;
const TIMEOUT_MS = 60_000;

const SERP = 'hasdata_google_serp_serp_getSearchResults';
const AI_OVERVIEW = 'hasdata_google_serp_ai_overview_getAiOverviewResponse';
const AI_MODE = 'hasdata_google_serp_ai_mode_getAiModeResponse';
const SERP_LIGHT = 'hasdata_google_serp_serp_light_getSearchResults';
const NEWS = 'hasdata_google_serp_news_getGoogleNews';
const SHOPPING = 'hasdata_google_serp_shopping_getSearchResults';
const IMMERSIVE = 'hasdata_google_serp_immersive_product_getImmersive_e29f691177';
const SHORT_VIDEOS = 'hasdata_google_serp_short_videos_getShortVideosSearchResults';

// The eight tools the README documents, with the parameters it lists and whether each is required.
const PARAMS = {
    [SERP]: { q: true, gl: false, hl: false, location: false, uule: false, num: false, start: false, tbm: false, tbs: false, deviceType: false },
    [AI_OVERVIEW]: { pageToken: true },
    [AI_MODE]: { q: true, gl: false, hl: false, location: false, uule: false, continuable: false, subsequentRequestToken: false },
    [SERP_LIGHT]: { q: true, gl: false, hl: false, location: false, uule: false, num: false, start: false },
    [NEWS]: { q: false, gl: false, hl: false, topicToken: false, sectionToken: false, storyToken: false, publicationToken: false },
    [SHOPPING]: { q: true, gl: false, hl: false, location: false, uule: false, start: false, tbs: false },
    [IMMERSIVE]: { pageToken: true, moreStores: false, nextPageToken: false },
    [SHORT_VIDEOS]: { q: true, gl: false, hl: false, cr: false, lr: false, page: false, deviceType: false },
};

// A streamable HTTP body arrives either as plain JSON or as server-sent events. One SSE event
// can span several data: lines, several events can share one response, and a server is free to
// send progress notifications before the answer. So collect every event and pick the message
// carrying our request id.
function parseRpc(raw, id) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);

    const messages = [];
    for (const event of trimmed.split(/\r?\n\r?\n+/)) {
        const data = event
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).replace(/^ /, ''))
            .join('\n');
        if (!data || data === '[DONE]') continue;
        try {
            messages.push(JSON.parse(data));
        } catch {
            // A keep-alive or a partial event is not our response.
        }
    }
    assert.ok(messages.length, `no JSON-RPC message in the response: ${raw.slice(0, 300)}`);
    const match = messages.find((m) => m.id === id);
    assert.ok(match, `no message with id ${id} in the response: ${raw.slice(0, 300)}`);
    return match;
}

let nextId = 1;

async function rpc(method, params = {}) {
    // The CI key sits on the free plan, where concurrency is 1. When several of
    // these repos are pushed at once their contract runs collide, and HasData
    // answers 429 with code concurrency_limit straight away rather than queueing.
    // That is a plan limit, not a broken contract, so the call is retried before
    // the test gives up. A 401 still fails on the first attempt.
    for (let attempt = 1; ; attempt++) {
        const id = nextId++;
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'x-api-key': KEY,
                'Content-Type': 'application/json',
                // The server answers over streamable HTTP, so accept both a plain body and a stream.
                Accept: 'application/json, text/event-stream',
            },
            body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        assert.equal(res.status, 200, `${method} returned ${res.status}`);
        const raw = await res.text();
        if (raw.includes('concurrency_limit') && attempt < 5) {
            await new Promise((r) => setTimeout(r, attempt * 4000));
            continue;
        }
        return { raw, body: parseRpc(raw, id) };
    }
}

async function callTool(name, args) {
    const { raw, body } = await rpc('tools/call', { name, arguments: args });
    assert.ok(!raw.includes('401 Unauthorized'), 'HasData rejected the key');
    assert.ok(!raw.includes('"isError":true'), `${name} failed: ${raw.slice(0, 300)}`);
    const text = body.result?.content?.[0]?.text;
    assert.ok(text, `${name} returned no text block`);
    const envelope = JSON.parse(text);
    assert.ok(envelope.json, `${name} returned an envelope with no json payload`);
    return envelope.json;
}

let toolsPromise;
function listTools() {
    toolsPromise ??= rpc('tools/list').then(({ body }) => {
        assert.ok(body.result?.tools, 'the response carried no result.tools');
        return body.result.tools;
    });
    return toolsPromise;
}

const live = { skip: KEY ? false : 'HASDATA_API_KEY is not set, skipping the live checks' };

test('all eight documented tools are present', live, async () => {
    const tools = await listTools();
    const names = new Set(tools.map((t) => t.name));
    for (const name of Object.keys(PARAMS)) {
        assert.ok(names.has(name), `documented tool ${name} is missing upstream`);
    }
});

test('every documented parameter still exists, and required stays required', live, async () => {
    const tools = await listTools();
    for (const [name, params] of Object.entries(PARAMS)) {
        const tool = tools.find((t) => t.name === name);
        assert.ok(tool, `${name} is missing upstream`);
        const props = tool.inputSchema?.properties ?? {};
        const required = tool.inputSchema?.required ?? [];
        for (const [param, isRequired] of Object.entries(params)) {
            assert.ok(props[param], `${name}.${param} is in the README but missing upstream`);
            assert.equal(
                required.includes(param),
                isRequired,
                `${name}.${param} required is now ${!isRequired}, the README says ${isRequired}`
            );
        }
    }
});

test('every documented tool carries a description', live, async () => {
    const tools = await listTools();
    for (const name of Object.keys(PARAMS)) {
        const tool = tools.find((t) => t.name === name);
        assert.ok(
            (tool?.description || '').trim().length > 10,
            `${name} has an empty or near-empty description`
        );
    }
});

// One live search. It exercises the auth path and the documented SERP shape, and returns the
// organic results the README's first example leans on. Keeping it to one call holds the canary
// at 10 credits.
test('a SERP call returns organic results with the documented fields', live, async () => {
    const serp = await callTool(SERP, { q: 'best running shoes', gl: 'us', hl: 'en' });
    assert.ok(Array.isArray(serp.organicResults), 'organicResults is documented as an array');
    const [first] = serp.organicResults;
    assert.ok(first, 'the SERP came back with no organic results for a common query');
    for (const field of ['position', 'title', 'link']) {
        assert.ok(field in first, `organic results no longer carry ${field}`);
    }
});
