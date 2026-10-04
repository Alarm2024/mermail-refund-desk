// The same per-skill rules Nudgen-Marketing/mermail-skills applies in
// tests/validate.mjs, plus this skill's own promise: it uses no tool that
// sends, pays or deletes.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = "mermail-refund-desk";
const dir = path.join(root, "skills", name);
const errors = [];

const md = await readFile(path.join(dir, "SKILL.md"), "utf8");
const fm = md.match(/^---\n([\s\S]*?)\n---/);
if (!fm) errors.push("SKILL.md: missing YAML frontmatter");
else {
  const keys = [...fm[1].matchAll(/^([a-zA-Z0-9_-]+):/gm)].map((m) => m[1]);
  for (const k of keys) if (!["name", "description", "metadata"].includes(k)) errors.push(`unexpected frontmatter key ${k}`);
  if (!fm[1].includes(`name: ${name}\n`)) errors.push("name must match directory");
  if (!fm[1].includes("metadata:\n  openclaw:")) errors.push("missing metadata.openclaw");
  if (!fm[1].includes("primaryEnv: MERMAIL_API_KEY")) errors.push("primaryEnv must be MERMAIL_API_KEY");
  if (!fm[1].includes("- MERMAIL_API_KEY")) errors.push("requires.env must include MERMAIL_API_KEY");
}
if (md.includes("TODO")) errors.push("unresolved TODO");
if (md.split("\n").length > 500) errors.push("SKILL.md exceeds 500 lines");

const yaml = await readFile(path.join(dir, "agents", "openai.yaml"), "utf8");
for (const req of ["display_name:", "short_description:", `default_prompt: "Use $${name}`, 'type: "mcp"', 'url: "https://console.mermail.app/mcp"']) {
  if (!yaml.includes(req)) errors.push(`openai.yaml missing ${req}`);
}

// Tools this skill may call: reads and internal writes, nothing else.
const allowed = new Set(["list_mailboxes", "search_emails", "get_email", "get_email_context", "list_folders", "create_folder", "move_email", "update_email", "save_draft",
  "search_composio_tools", "get_composio_tool_schema", "execute_composio_tool"]);
// The one Composio call must stay gated to reads and to the user's approval.
if (!/never one containing REFUND, CANCEL, CREATE, UPDATE, DELETE/.test(md) || !/after the user approves that exact call/.test(md)) {
  errors.push("SKILL.md must keep execute_composio_tool read-only and approval-gated");
}
const tools = await readFile(path.join(dir, "references", "tools.md"), "utf8");
const table = tools.split("## Tools used")[1].split("\n\n")[1];
for (const m of table.matchAll(/^\| `([a-z_]+)`/gm)) {
  if (!allowed.has(m[1])) errors.push(`tools.md lists ${m[1]}, which this skill must not call`);
}
const workflow = md.split("## Workflow")[1].split("## Hard rules")[0];
for (const banned of ["send_email", "reply_to_email", "forward_email", "schedule_email_send", "download_attachment", "delete_email", "paybox_", "prepare_destructive_action"]) {
  if (workflow.includes(banned)) errors.push(`SKILL.md workflow calls ${banned}`);
}
for (const line of tools.split("\n")) {
  if (/"query":\s*"/.test(line) && !line.includes("Do not pass")) errors.push(`tools.md has a stringified query example: ${line.trim()}`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${name}: frontmatter, openai.yaml, tool allowlist, no send/pay/delete in the workflow`);
