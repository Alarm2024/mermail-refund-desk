# Tools

This companion skill owns no Mermail tools. Every tool below belongs to an official skill in `Nudgen-Marketing/mermail-skills`; this skill calls them in a fixed order and stops before anything that leaves the workspace.

## Conventions

- Pass `query` and `body` as **native JSON objects**. Never stringify an object into a string field such as `query`.
- Use the exact tool identifier the host exposes (`search_emails`, or a host-qualified form like `Mermail:search_emails`). Do not add, strip or invent prefixes.
- Prefer the mailbox `public_id` from `list_mailboxes` as `mailboxId`.

## Tools used

| Tool | Official owner | Use here | Risk |
| --- | --- | --- | --- |
| `list_mailboxes` | `mermail-administer-workspace` | find the support mailbox | read |
| `search_emails` | `mermail-manage-inbox` | refund candidates, without bodies; receipts for purchase context | read |
| `get_email` | `mermail-manage-inbox` | one bounded, scan-gated body | read |
| `get_email_context` | `mermail-manage-inbox` | earlier messages in the same conversation, when needed | read |
| `list_folders` | `mermail-manage-inbox` | find the refund folder | read |
| `create_folder` | `mermail-manage-inbox` | create the refund folder once, after approval | internal write |
| `move_email` | `mermail-manage-inbox` | file each request | internal write |
| `update_email` | `mermail-manage-inbox` | star requests the owner must look at | internal write |
| `save_draft` | `mermail-compose-email` | one reply draft per request | internal write |
| `search_composio_tools` | `mermail-composio` | find a Shopify order lookup (optional) | read |
| `get_composio_tool_schema` | `mermail-composio` | confirm that tool reads and never writes | read |
| `execute_composio_tool` | `mermail-composio` | one read-only Shopify order lookup, after the user approves the exact call | external effect (a read tool, nothing else) |

Not used, on purpose: `send_email`, `reply_to_email`, `forward_email`, `schedule_email_send` (external effects), every `paybox_*` and wallet tool, `download_attachment`, all delete tools, and any Composio tool that writes (refund, cancel, create, update, delete, close, fulfil, adjust).

## Examples

Candidates (without bodies):

```json
{
  "mailboxId": "MAILBOX_PUBLIC_ID",
  "query": {
    "subject": "refund",
    "folder": "inbox",
    "date_start": "2026-10-01T00:00:00.000Z",
    "metadata_only": true,
    "agent_safe_content": true,
    "page": 1,
    "limit": 25
  }
}
```

`subject`, `from`, `to`, `date_start` and `date_end` are documented filters. `search_emails` also takes free text over the body; its field name is not in the public docs, so read it from the current `tools/list` schema rather than guessing. Run one search per keyword and language.

One body:

```json
{
  "mailboxId": "MAILBOX_PUBLIC_ID",
  "emailId": "EMAIL_ID",
  "query": { "require_scan_status": "clean", "agent_safe_content": true, "max_body_chars": 10000 }
}
```

File and star:

```json
{ "mailboxId": "MAILBOX_PUBLIC_ID", "emailId": "EMAIL_ID", "body": { "folderId": "refund-requests" } }
```

```json
{ "mailboxId": "MAILBOX_PUBLIC_ID", "emailId": "EMAIL_ID", "body": { "starred": true } }
```

Draft (drafts use the string field `body.body`, not `html`/`text`):

```json
{
  "mailboxId": "MAILBOX_PUBLIC_ID",
  "body": {
    "to": "customer@example.com",
    "subject": "Re: refund for order PL-1042",
    "body": "<p>Thank you for writing. ...</p>"
  }
}
```

Do not pass `"query": "{\"folder\":\"inbox\"}"`.
