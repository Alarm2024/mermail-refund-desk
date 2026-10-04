# Refund policy file

The checker reads the shop's policy as JSON. `policy.example.json` is the published policy of Plumb 35 (https://plumb-35.elghaly.dev/refunds/): no time limit, no reason asked, money back once per purchase, to the card or wallet that paid and nowhere else, with one exception for payments made from an exchange.

| Field | Type | Meaning |
| --- | --- | --- |
| `shop` | string | name used to sign drafts |
| `policy_url` | string | the public policy the drafts follow |
| `support_address` | string | the mailbox refunds arrive at |
| `time_limit_days` | number or `null` | days after purchase a refund can be asked for; `null` = no limit |
| `reason_required` | boolean | `false` = drafts never ask why |
| `refund_destination` | `"original_payer_only"` | the checker escalates any request to pay elsewhere |
| `exchange_exception` | boolean | `true` = an exchange-origin claim is escalated for the owner instead of refused |
| `once_per_purchase` | boolean | `true` = a purchase already marked refunded is escalated |
| `reply_languages` | string[] | languages drafts may be written in |
| `folder` | string | Mermail folder refund requests are filed into |
| `order_pattern` | string, optional | regular expression whose first group is the order id; must require a digit |

Write the policy the shop actually publishes. The skill follows the file; it does not soften or tighten it.
