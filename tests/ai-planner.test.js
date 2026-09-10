import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ai-planner.js";

const input =
  "Lavoro a turni e ho poca energia la sera. Vorrei studiare e riposare.";
function response() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}
test("AI API boundaries and upstream contract (mocked services, no external writes)", async (t) => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.N8N_AI_WEBHOOK_URL;
  const originalSecret = process.env.N8N_AI_WEBHOOK_SECRET;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.N8N_AI_WEBHOOK_URL;
    else process.env.N8N_AI_WEBHOOK_URL = originalUrl;
    if (originalSecret === undefined) delete process.env.N8N_AI_WEBHOOK_SECRET;
    else process.env.N8N_AI_WEBHOOK_SECRET = originalSecret;
  });
  await t.test("only POST is allowed", async () => {
    const res = response();
    await handler({ method: "GET" }, res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, "POST");
  });
  await t.test(
    "invalid, blank, too short and oversized input rejected before network",
    async () => {
      globalThis.fetch = () => {
        throw new Error("Must not reach network");
      };
      for (const value of [
        undefined,
        null,
        12,
        {},
        "",
        " ".repeat(30),
        "too short",
        "a".repeat(5001),
      ]) {
        const res = response();
        await handler({ method: "POST", body: { input: value } }, res);
        assert.equal(res.statusCode, 400);
      }
    },
  );
  await t.test(
    "missing configuration fails clearly without leaking a secret",
    async () => {
      delete process.env.N8N_AI_WEBHOOK_URL;
      delete process.env.N8N_AI_WEBHOOK_SECRET;
      const res = response();
      await handler({ method: "POST", body: { input } }, res);
      assert.equal(res.statusCode, 503);
    },
  );
  process.env.N8N_AI_WEBHOOK_URL = "https://workflow.example.test/webhook";
  process.env.N8N_AI_WEBHOOK_SECRET = "test-only-secret";
  await t.test(
    "forwards context with PFEV guidance and returns only the plan",
    async () => {
      globalThis.fetch = async (url, options) => {
        assert.equal(url, "https://workflow.example.test/webhook");
        assert.equal(options.headers["x-pfev-secret"], "test-only-secret");
        assert.match(JSON.parse(options.body).input, /Priorità mobili/);
        assert.ok(JSON.parse(options.body).input.includes(input));
        assert.ok(options.signal);
        return {
          ok: true,
          json: async () => ({
            plan: "# Piano\n\nRiposa.",
            internal: "do not expose",
          }),
        };
      };
      const res = response();
      await handler({ method: "POST", body: { input } }, res);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { plan: "# Piano\n\nRiposa." });
      assert.equal(res.headers["Cache-Control"], "no-store");
    },
  );
  await t.test(
    "upstream 429 preserved, other failures mapped to 502",
    async () => {
      for (const status of [401, 429, 500]) {
        globalThis.fetch = async () => ({ ok: false, status });
        const res = response();
        await handler({ method: "POST", body: { input } }, res);
        assert.equal(res.statusCode, status === 429 ? 429 : 502);
      }
    },
  );
  await t.test(
    "invalid upstream output cannot masquerade as success",
    async () => {
      for (const data of [
        {},
        { plan: "" },
        { plan: " " },
        { plan: [] },
        { plan: "a".repeat(60001) },
      ]) {
        globalThis.fetch = async () => ({ ok: true, json: async () => data });
        const res = response();
        await handler({ method: "POST", body: { input } }, res);
        assert.equal(res.statusCode, 502);
      }
    },
  );
  await t.test(
    "network failure and timeout receive recoverable statuses",
    async () => {
      for (const name of ["TypeError", "TimeoutError"]) {
        globalThis.fetch = async () => {
          const error = new Error("test");
          error.name = name;
          throw error;
        };
        const res = response();
        await handler({ method: "POST", body: { input } }, res);
        assert.equal(res.statusCode, name === "TimeoutError" ? 504 : 502);
      }
    },
  );
});
