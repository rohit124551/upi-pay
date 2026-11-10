const KEY = "upi-terminal:gemini:v1";

export const FREE_MODELS = [
  ["gemini-2.5-flash", "Gemini 2.5 Flash (free tier)"],
  ["gemini-2.5-flash-lite", "Gemini 2.5 Flash-Lite (free, fastest)"],
  ["gemini-3-flash-preview", "Gemini 3 Flash preview"],
];

export const getGemini = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { key: "", model: FREE_MODELS[0][0] };
  } catch {
    return { key: "", model: FREE_MODELS[0][0] };
  }
};

export const saveGemini = (cfg) =>
  cfg.key ? localStorage.setItem(KEY, JSON.stringify(cfg)) : localStorage.removeItem(KEY);

export const aiLabel = () => (getGemini().key ? "your Gemini key" : "your Gemini API key (Settings)");

function parseJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?|```$/g, "").trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }
  return JSON.parse(cleaned);
}

async function callGeminiDirect(systemPrompt, userText, cfg) {
  const key = (cfg && cfg.key) || getGemini().key;
  if (!key) {
    throw new Error("No Gemini API key set. Paste your free key from aistudio.google.com in Settings.");
  }
  const model = (cfg && cfg.model) || getGemini().model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userText }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const msg = errorBody.error?.message || `API error ${res.status}`;
    if (msg.includes("API_KEY_INVALID") || msg.includes("not valid")) {
      throw new Error("Your Gemini API key isn't valid. Check it in Settings.");
    }
    if (msg.includes("RESOURCE_EXHAUSTED") || res.status === 429) {
      throw new Error("Gemini free quota exceeded. Wait a minute and try again.");
    }
    throw new Error(msg);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response received from Gemini.");
  }
  return parseJson(rawText);
}

const SYSTEM_PROMPT = `You read lines from a payout list. Real UPI IDs and phone numbers were replaced with placeholders like [ID-3].
For each line, decide which placeholder is being paid and how much.
Rules:
- Only use placeholders that appear in that exact line.
- "amount" must be copied exactly as written in the line (digits, commas, decimals). Never compute, add or guess.
- "name" is a person name written in the line, or null. Never invent one.
- If a line is ambiguous (two amounts, no amount, no placeholder), return it with "id_token": null and a short "note".
Reply with JSON only, no markdown:
{"entries":[{"line_no":1,"id_token":"[ID-1]","name":null,"amount":"1,634","note":null}]}`;

const VERIFY_PROMPT = `You audit a payout list before money is sent. Real IDs are placeholders like [ID-3] or [ID-3]@okaxis (bank handle kept).
You get SOURCE lines (what the user pasted, numbered) and FINAL rows (what will be paid).
Check every FINAL row:
- its ID placeholder appears in the cited source lines
- its amount equals the sum of the amounts written for that ID in the source (duplicates are merged on purpose)
- the name, if any, matches the source
Also check:
- every source line that is clearly a payment is covered by a row, unless listed in IGNORED
- bank handles that look misspelled or unusual (e.g. @okaxsi, @ybll)
Do not complain about merged duplicates, ignored lines, or a written "Total" line not matching.
Reply JSON only, no markdown:
{"all_correct":true,"issues":[{"row_ref":"R2","line_no":5,"problem":"short plain-English problem"}]}`;

const PASS_HINTS = [
  "Pass 1: check row by row, top to bottom.",
  "Pass 2: independent re-check. Start from the SOURCE lines, bottom to top, and recompute every amount yourself.",
];

/**
 * Direct browser-side AI handler - completely eliminates the need for any backend server!
 */
export async function aiPost(path, body = {}, cfg = getGemini()) {
  if (path === "/ai/test-key") {
    const data = await callGeminiDirect('Reply with JSON only: {"ok": true}', "ping", cfg);
    return { data: { ok: Boolean(data.ok), model: cfg.model } };
  }

  if (path === "/ai/resolve") {
    const lines = body.lines || [];
    const payload = lines.map((l) => `${l.line_no}: ${l.text}`).join("\n");
    const data = await callGeminiDirect(SYSTEM_PROMPT, payload, cfg);
    const allowed = Object.fromEntries(lines.map((l) => [l.line_no, l.text]));

    const entries = (data.entries || [])
      .filter((raw) => raw && raw.line_no && allowed[raw.line_no])
      .map((s) => {
        if (s.id_token && !allowed[s.line_no].includes(s.id_token)) {
          return { ...s, id_token: null, note: "AI pointed at an ID not in this line" };
        }
        return s;
      });

    return { data: { entries } };
  }

  if (path === "/ai/verify") {
    const source = (body.source || []).map((l) => `${l.line_no}: ${l.text}`).join("\n");
    const rows = (body.rows || [])
      .map((r) => `${r.ref}: ${r.identifier} | name=${r.name || "-"} | amount=${r.amount} | lines=${JSON.stringify(r.lines)}`)
      .join("\n");
    const promptBody = `SOURCE:\n${source}\n\nFINAL ROWS:\n${rows}\n\nIGNORED: ${(body.ignored_lines || []).join(", ") || "none"}`;

    const results = await Promise.all(
      PASS_HINTS.map((hint) => callGeminiDirect(VERIFY_PROMPT, `${hint}\n\n${promptBody}`, cfg))
    );

    const passes = results.map((data) => {
      const issues = (data.issues || []).filter((i) => i && i.problem);
      return {
        all_correct: Boolean(data.all_correct) && issues.length === 0,
        issues,
      };
    });

    return { data: { passes } };
  }

  throw new Error(`Unknown AI path: ${path}`);
}
