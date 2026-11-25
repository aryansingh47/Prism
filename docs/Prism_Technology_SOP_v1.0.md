# TECHNOLOGY OPERATIONS

# STANDARD OPERATING PROCEDURES

A practical operating system for website delivery, software engineering, customer information, security, infrastructure and continuity.

| **DOCUMENT CONTROL**           | **VALUE**                                                                                                                 |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| **Document ID**                | PRISM-TECH-SOP-001                                                                                                        |
| **Version**                    | 1.0                                                                                                                       |
| **Prepared**                   | 18 November 2026                                                                                                          |
| **Business**                   | Prism Travels & Advisory Limited                                                                                          |
| **Scope**                      | Website, Domain, Hosting, Development, Customer Enquiries, Accounts, Data, Email, Suppliers, and Future Technical Products|
| **Classification**             | Internal - Confidential Operational Guidance                                                                              |
| **Proposed Accountable Owner** | Technology Lead                                                                                                           |
| **Approval authority**         | Director                                                                                                                  |
| **Review cycle**               | Quarterly, and following material changes or incidents                                                                    |


# How to use this manual

A Standard Operating Procedure (SOP) is a repeatable sequence of actions that identifies the trigger, who acts, what must be done, what must be recorded, and the evidence required to declare a task complete. This manual is meant to be used during normal operations and incidents, not merely stored as a reference.

**INTERPRETATION OF NORMATIVE LANGUAGE**

| **TERM**            | **MEANING**                                                                      |
|---------------------|----------------------------------------------------------------------------------|
| **MUST**            | Required before the procedure is considered followed.                            |
| **SHOULD**          | Recommended default; deviations require a recorded reason.                       |
| **MAY**             | Optional implementation choice.                                                  |
| **PROPOSED TARGET** | Internal service objective requiring management sign-off; not a legal guarantee. |
| **VERIFY**          | Environment or implementation has not been independently confirmed.              |

# Contents and procedure directory

| **PART**                | **COVERAGE**                                            |
|-------------------------|---------------------------------------------------------|
| **Governance**          | Roles, cadence, risk, inventory, operating rules        |
| **Delivery**            | Work intake, projects, development, testing and release |
| **Platform operations** | Hostinger, domain/DNS, mail, monitoring, backups        |
| **Trust and data**      | Access, secrets, customer records, privacy, incidents   |
| **Business enablement** | Packages, vendors, UX, analytics, AI                    |
| **Control library**     | Checklists, templates, registers and references         |

Procedure identifiers are permanent. If the SOP is reorganised, keep the same ID and update its version/owner in the Procedure Register.

# 1. Operating governance

## 1.1 Purpose, scope and business outcomes

The technology function exists to keep Prism accessible, trustworthy and maintainable; safely capture and route customer enquiries; protect traveller information; publish accurate packages; and enable the business to operate online and offline. Success is measured by customer outcomes, recoverability, controllable risk and predictable delivery.

## 1.2 Decision and role register

| **ROLE**                                      | **ACCOUNTABILITY**                                                                                                            | **MINIMUM AUTHORITY**                                          |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| **Director / CEO**               | Approves spending, business-critical changes, customer-impact risk acceptance, supplier agreements and crisis communications. | Final business owner; no routine admin password sharing.       |
| **Technology Lead (TL)**                      | Owns architecture, backlog, production access, release approval, backups, cybersecurity coordination and SOP maintenance.     | Admin access only where necessary; approves high-risk changes. |
| **Developer / Maintainer (DEV)**              | Implements issues, tests, documents and assists with deployments.                                                             | Write to code repository; least privilege on production.       |
| **Operations / General Manager (OPS/GM)**           | Owns service catalogue, travel-package pricing, supplier terms, enquiry SLA (service level agreement) and customer communications.                      | Content editorial approval; staff dashboard access if needed.  |
| **Security & Privacy Coordinator (SPC)**      | Coordinates access reviews, incidents, data requests, retention, regulatory counsel and evidence.                             | Read-only audit access where possible; incident triage.        |
| **Customer Support / Travel Consultant (CS)** | Reviews assigned enquiries, contacts customers, updates statuses and escalates complaints.                                    | Restricted enquiry access; no DB admin.                        |
| **External vendor**                           | Provides bounded support for an approved service.                                                                             | Named time-limited access under contract.                      |

## 1.3 RACI for high-impact decisions

| **ACTIVITY**                       | **A** | **R** | **C / I**                                        |
|------------------------------------|---------------------|---------------------|--------------------------------------------------|
| **Public site release**            | TL                  | DEV                 | OPS/GM consulted; CEO informed                 |
| **Pricing / itinerary publishing** | CEO                 | OPS/GM      | TL consulted                                     |
| **New vendor / recurring spend**   | CEO            | TL                  | GM consulted                            |
| **Privacy incident response**      | CEO            | SPC + TL            | Legal adviser consulted; affected teams informed |
| **Database restore**               | TL                  | TL/DEV            | CEO & OPS/GM informed                          |
| **Customer enquiry handling**      | OPS                 | CS                  | TL for technical faults                          |
| **Access grant / termination**     | TL                  | TL / DEV  | HR and SPC                             |
| **SOP revision**                   | TL                  | Process owner       | Director approves policy changes                 |

## 1.4 Proposed operational cadence

| **FREQUENCY**             | **REQUIRED ACTIVITY**                                                                                                          | **OWNER / EVIDENCE**                |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Daily (business days)** | Check live homepage, enquiry submission/alert queue, mailbox, outstanding incidents, backup status and new GitHub alerts.      | OPS/TL / Daily operations checklist |
| **Twice weekly**          | Triage new GitHub issues; review ageing enquiries and open high-priority bugs.                                                 | TL + OPS / Issue board              |
| **Weekly**                | Dependency/security review; roadmap stand-up; validate one restore artifact; review content accuracy.                          | TL / Weekly review record           |
| **Monthly**               | Access review, cost/subscription reconciliation, uptime/error review, sitemap and broken links, supplier risk assessment.      | TL + SPC / Control register         |
| **Quarterly**             | Restore drill, incident tabletop, privacy/data inventory review, SOP effectiveness, vendor renewal outlook, UX sample testing. | TL + CEO / Quarterly sign-off  |
| **Annually**              | Comprehensive SOP review, domain and certificate plan, contract audit, security assessment, recovery exercise.                 | CEO + TL / Annual review       |

## 1.5 Classification and evidence

Information classification: PUBLIC (website materials approved for publication), INTERNAL (non-customer planning/issues), CONFIDENTIAL (nonpublic supplier terms, finances), RESTRICTED (customer PII, credentials, tokens, database exports, security evidence). Customer passport/identity data, if ever needed, requires a separate collection and retention approval.

Evidence location: GitHub issues/PRs for non-sensitive development records; a restricted company drive or approved ticket system for customer data, access logs, incident records and vendor contracts. Never attach raw PII to a public GitHub repository. Every major action must have an owner, date, reference, verification and next-review date.

# SOP 01 \| Work request and issue triage

| **FIELD**                  | **PROCEDURE CONTROL**                                                                        |
|----------------------------|----------------------------------------------------------------------------------------------|
| **Process owner**          | TL; OPS/GM for business priority                                                                |
| **Trigger / frequency**    | New idea, complaint, bug, support request or recurring improvement                           |
| **Preconditions / inputs** | Requester specifies impact and business need; no sensitive customer content in public issue. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                    |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Create a GitHub Issue before coding. Write an imperative title: “Add…”, “Fix…”, “Update…”. Link related pages and incidents; describe problem, user impact and desired result.                        |
| **2**  | Categorise: incident, defect, security, enhancement, content update, technical debt, compliance or experiment. Add labels for area (frontend, backend, content, infrastructure), priority and status. |
| **3**  | Record acceptance criteria as observable behaviours, not vague opinions. For bugs capture reproducible steps, expected/actual output, browser/device, affected URL and redacted evidence.             |
| **4**  | Screen for data/security sensitivity. If customer PII or a vulnerability is involved, open a restricted record and create only a sanitised public work item.                                          |
| **5**  | Triage severity using the priority matrix; assign one accountable owner, rough estimate and due-date or milestone. Split work so one issue has one clear deliverable.                                 |
| **6**  | Move work board from Backlog → Ready → In Progress → Review → Done. Link PR, release and evidence; record scope changes in issue comments.                                                            |
| **7**  | Close only after acceptance criteria are met, deployment (if required) is verified and the requester or product owner accepts the outcome.                                                            |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Issue with type, owner, severity, estimate, acceptance criteria, review references, closure note and release ID.

**COMPLETION GATE**

No orphan code changes; every merged nontrivial change maps to a ticket.

**ESCALATION / EXCEPTION**

P0/P1 requests enter incident or emergency change SOP immediately.

**CONTROL NOTE**

Adapted from issue-first methodology in \[A2\]; GitHub replaces GitLab.

# SOP 02 \| Project initiation, scope and planning

| **FIELD**                  | **PROCEDURE CONTROL**                                                           |
|----------------------------|---------------------------------------------------------------------------------|
| **Process owner**          | CEO; TL                                                |
| **Trigger / frequency**    | New integration, major feature, website redesign, account system or new product |
| **Preconditions / inputs** | Approved problem statement and named sponsor.                                   |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Create project charter: purpose, customer/financial value, sponsor, assumptions, exclusions, dependencies and success metrics.                              |
| **2**  | Identify stakeholders: customers, travel consultants, finance, vendors, privacy, technical maintainers. Determine data types collected and threat exposure. |
| **3**  | Capture requirements using MoSCoW or equivalent, each with ID, acceptance criteria, priority, owner and evidence source.                                    |
| **4**  | Develop an incremental work breakdown: discovery, UX, design, build, data migration, testing, operational readiness and closure.                            |
| **5**  | Estimate effort, cost, vendor spend and schedule; add 15–25% planning contingency as a proposed planning heuristic, not a promise.                          |
| **6**  | Open risk register with probability, impact, response, owner, review date; identify top 3 project risks and recovery/rollback strategy.                     |
| **7**  | Create milestone(s), GitHub Project view, responsibility map and communication plan. Obtain sponsor approval before external commitments.                   |
| **8**  | Review scope, cost, dependencies and risk weekly; seek reapproval for changes affecting customer data, delivery deadline or budget.                         |
| **9**  | Close with sponsor acceptance, deployed evidence, support handover, updated inventory, runbooks and lessons learned.                                        |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Project charter, issue tree, risk log, milestone, estimates, approved definition of done and handover record.

**COMPLETION GATE**

Operational owner, support documentation and measurable acceptance are recorded.

**ESCALATION / EXCEPTION**

Stop scope expansion when risk/cost exceeds delegated authority.

**CONTROL NOTE**

Implements initiation/planning/execution/control/closing described in \[A1\] and \[A2\].

# SOP 03 \| GitHub repositories and branch lifecycle

| **FIELD**                  | **PROCEDURE CONTROL**                                                           |
|----------------------------|---------------------------------------------------------------------------------|
| **Process owner**          | TL; DEV                                                                         |
| **Trigger / frequency**    | Every code change                                                               |
| **Preconditions / inputs** | Authenticated GitHub identity with MFA; local git installed; clean main branch. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                    |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Maintain company-approved repo inventory. Prefer company-owned GitHub organisation; evaluate making the existing public website repo private once public Pages is no longer required. |
| **2**  | Protect main using a branch ruleset when supported by the plan: require PR, review, passing checks and block force pushes. Limit admin privileges.                                    |
| **3**  | Clone repository; \`git fetch origin && git checkout main && git pull --rebase origin main\`; verify clean worktree and current deployment baseline.                                  |
| **4**  | Create \`feature/\<issue\>-\<slug\>\`, \`fix/\<issue\>-\<slug\>\`, or \`hotfix/\<issue\>-\<slug\>\`; never make normal changes directly on main.                                      |
| **5**  | Make small cohesive commits using Conventional Commits such as \`feat(packages): Add Rajasthan itinerary\` or \`fix(contact): Validate dates\`.                                       |
| **6**  | Open PR linked to issue; include purpose, diff summary, screenshots/recordings without PII, test results, data/privacy change and rollback instructions.                              |
| **7**  | Assign reviewer independent of author. Reviewer inspects logic, performance, security, accessibility, config, license/asset provenance and customer effects.                          |
| **8**  | Resolve comments and rerun checks after modification; merge using repository-approved strategy; tag production release when deployed.                                                 |
| **9**  | If a secret is exposed, stop normal workflow and invoke credential rotation + incident review; deleting commit alone is insufficient.                                                 |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Issue → branch → commits → PR → checks → approval → release tag → deploy verification.

**COMPLETION GATE**

At least one meaningful independent review for normal production changes; high-risk changes require TL approval.

**ESCALATION / EXCEPTION**

No unreviewed force-push to main; exception path SOP 06.

**CONTROL NOTE**

GitHub features/rules are plan-dependent. Consult \[E2\], \[A2\].

# SOP 04 \| Secure engineering and local test

| **FIELD**                  | **PROCEDURE CONTROL**                                               |
|----------------------------|---------------------------------------------------------------------|
| **Process owner**          | DEV; TL                                                             |
| **Trigger / frequency**    | Any frontend, PHP, JS, data, authentication or integration change   |
| **Preconditions / inputs** | Issue accepted; test environment and synthetic test data available. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Check requirements and data flow before coding; identify whether change handles PII, financial information, identity or third-party APIs.                                                                       |
| **2**  | Validate all incoming fields on the server with length/type/allowlist rules; escape output; parameterise SQL; prevent CSRF on state-changing requests; check authorization per resource.                        |
| **3**  | For accounts: use secure password hashing (PHP \`password_hash\`/\`password_verify\`), secure cookies, session regeneration, rate limits, token expiry, email verification and server-side staff authorization. |
| **4**  | Keep credentials out of tracked files; use private config outside web root where supported; no API keys in browser JavaScript.                                                                                  |
| **5**  | Run static checks and dependency/vulnerability review; \`php -l\` for PHP files, \`node --check\` for JS where available, HTML/CSS validation and broken-link checks.                                           |
| **6**  | Execute unit, integration and negative tests: invalid input, duplicate submissions, expired tokens, unauthorized customer access, guest enquiry and database outage.                                            |
| **7**  | Run accessibility keyboard focus, labels, contrast, responsive widths 320/375/768/1440px, reduced motion and major browser checks.                                                                              |
| **8**  | Use synthetic accounts only for testing; record exact build hash, commands, pass/fail, screenshots and known limitations.                                                                                       |
| **9**  | Block release on high/critical vulnerabilities, exposed secrets, broken enquiry submission, wrong package price, authentication bypass or absent rollback.                                                      |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Test checklist, automated check logs, security review, UX screenshots, PR evidence.

**COMPLETION GATE**

Business acceptance + technical checks + privacy gate pass before release.

**ESCALATION / EXCEPTION**

Critical issues: incident SOP 18 or privacy SOP 19.

**CONTROL NOTE**

Align with NIST SSDF \[E3\], OWASP ASVS 5.0 \[E4\], OWASP password/session guidance \[E5\].

# SOP 05 \| Standard release to Hostinger

| **FIELD**                  | **PROCEDURE CONTROL**                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------|
| **Process owner**          | TL (approver); DEV (deployer); OPS/GM (business sign-off)                                     |
| **Trigger / frequency**    | Approved merge requiring public deployment                                                 |
| **Preconditions / inputs** | Production access; verified backup; approved PR; tested package of exactly deployed files. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Schedule a release window and announce affected functionality; confirm owner and backout lead available.                                                                                                    |
| **2**  | Identify precise commit SHA/release tag; record files changed, schema migrations, config dependencies and asset count. Keep a release manifest.                                                             |
| **3**  | Export/download a restorable current backup of website files and MySQL, where applicable; independently confirm backup timestamp and safe storage.                                                          |
| **4**  | Check Hostinger target \`public_html\` and private backend config placement. DO NOT deploy \`.git/\`, credentials, development scripts, local \`.env\`, SQL dumps, test fixtures or arbitrary ZIP contents. |
| **5**  | For static files, upload only changed assets and HTML via Hostinger File Manager/SFTP/approved CI. Verify that \`index.html\` and paths resolve. For PHP changes, verify PHP version, modules and config.   |
| **6**  | If schema migration is required, take extra DB snapshot; execute reviewed migration, log result, avoid destructive change without a tested rollback/migration plan.                                         |
| **7**  | Check production homepage and at least one flow from each affected area. Verify form submission end-to-end with test email, notifications, staff visibility, login/logout when changed.                     |
| **8**  | Check browser network console, HTTPS, CSS/JS, mobile layout, robots/sitemap, error logs and monitoring. Compare deployment with release manifest.                                                           |
| **9**  | If verification fails or unexpected impact occurs, stop rollout and invoke rollback. If successful, log time, deployer, approver, SHA, outcomes and customer-facing notes.                                  |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Release log, SHA/tag, backup ID, deployment artifacts, production smoke test, sign-off.

**COMPLETION GATE**

Post-release smoke tests pass; linked issue(s) closed after verification.

**ESCALATION / EXCEPTION**

Call SOP 06 for urgent reversal; notify OPS about enquiries lost or delayed.

**CONTROL NOTE**

Hostinger supports file/database import and backup management; features and scheduling vary by plan \[E6\].

# SOP 06 \| Emergency change, rollback and hotfix

| **FIELD**                  | **PROCEDURE CONTROL**                                                          |
|----------------------------|--------------------------------------------------------------------------------|
| **Process owner**          | TL; CEO for material impact                                               |
| **Trigger / frequency**    | Broken payments/enquiry, site outage, breach, critical bad price, exposed data |
| **Preconditions / inputs** | Incident ticket, severity assigned and snapshot taken where safe.              |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                 |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Declare emergency change with incident ID and affected services; freeze nonessential deployments.                                                                  |
| **2**  | Capture current code SHA, recent release ID, error sample, timestamp, affected data and user scope; protect sensitive logs.                                        |
| **3**  | Choose least-risk remedy: feature disablement, prior release restore, config rollback, hotfix or temporary maintenance page.                                       |
| **4**  | Obtain TL verbal/written approval; for a serious customer or legal impact notify Director before or immediately after urgent action.                               |
| **5**  | Back up potentially changed database before rollback if doing so does not delay containment; never overwrite new customer enquiries without a reconciliation plan. |
| **6**  | Apply rollback or minimal fix, repeat critical customer flow tests, check server errors and response status.                                                       |
| **7**  | Publish internal status; inform affected customers or partners if required by policy/law; record deviations.                                                       |
| **8**  | Within one business day, create retrospective and permanent corrective issue; backfill code review, tests and release record.                                      |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Emergency release log, incident timeline, approver, rollback steps, data reconciliation result, postmortem.

**COMPLETION GATE**

Core service restored and permanent preventive action assigned.

**ESCALATION / EXCEPTION**

If incident is personal-data or security related, follow SOP 18 in parallel.

# SOP 07 \| Domain, DNS, SSL and search-console control

| **FIELD**                  | **PROCEDURE CONTROL**                                                                 |
|----------------------------|---------------------------------------------------------------------------------------|
| **Process owner**          | TL                                                                                    |
| **Trigger / frequency**    | Domain renewal, DNS changes, SSL warning, domain migration, search indexing issue     |
| **Preconditions / inputs** | Domain registrar/hosting panel access; approved change and backup of current records. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Register all active domains and aliases, registrar, DNS provider, billing owner, renewal date, automatic renewal, recovery email and MFA in asset register. |
| **2**  | Before a DNS change, export/screenshot exact existing records and TTL values; record desired A/AAAA/CNAME/TXT/MX/SPF/DKIM/DMARC impact.                     |
| **3**  | Confirm target hosting IP/hostname using Hostinger account details; never copy an old IP from a generic tutorial.                                           |
| **4**  | Apply only approved DNS changes; preserve mail records when updating website A/CNAME. Use a reasonable TTL and schedule propagation window.                 |
| **5**  | Verify domain via multiple resolvers, HTTPS certificate, www/apex redirect policy, canonical URL, 404 and no mixed content.                                 |
| **6**  | Validate \`robots.txt\` and sitemap availability; use Search Console URL Inspection for important pages. Do not promise indexing immediately.               |
| **7**  | Check renewal alerts at 90/30/7 days; verify payment method and auto-renewal; record yearly domain ownership evidence.                                      |
| **8**  | After any certificate/redirect incident document cause, outage, fix and recurrence prevention.                                                              |

**REQUIRED RECORDS / AUDIT EVIDENCE**

DNS change log, zone snapshot, SSL check, domain inventory entry, Search Console evidence.

**COMPLETION GATE**

HTTPS works on selected canonical hostname; no email disruption; renewal recorded.

**ESCALATION / EXCEPTION**

Escalate impending expiry or hijack to Director immediately.

**CONTROL NOTE**

Google Search guidance \[E7\].

# SOP 08 \| Corporate mailbox, delivery and phishing

| **FIELD**                  | **PROCEDURE CONTROL**                                                   |
|----------------------------|-------------------------------------------------------------------------|
| **Process owner**          | TL (admin); OPS/GM (mail owner)                                            |
| **Trigger / frequency**    | New mailbox/alias, SMTP change, delivery failure, phishing report       |
| **Preconditions / inputs** | Approved mailbox purpose, assigned custodian, MFA and recovery details. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                            |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Inventory company mailboxes, aliases and forwarding routes with named owners; avoid using one shared Google/Chrome account for every employee.                                |
| **2**  | Set strong unique credentials and MFA where supported; if mailbox shared, use delegation/authorised access features, never distribute one password.                           |
| **3**  | Validate domain MX/SPF/DKIM/DMARC records through provider instructions; record a before/after screenshot for DNS mail edits.                                                 |
| **4**  | Configure application SMTP secret privately and use a controlled From address; test both outgoing verification mail and incoming reply.                                       |
| **5**  | Route new enquiry notifications to monitored mailbox with backup coverage; record responsibility for reviewing spam and delivery failures.                                    |
| **6**  | When suspicious mail arrives: do not open links/attachments; capture headers (safe) and report; investigate account sign-in and reset credentials if compromise is suspected. |
| **7**  | Monthly: test incoming/outgoing mail, review bounce volume, aliases, unused accounts and retention/backup obligations.                                                        |
| **8**  | During staff departure revoke mail/delegated access, rotate shared credentials and preserve business records under approved retention policy.                                 |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Mailbox register, DNS evidence, test messages (redacted), mail incident record.

**COMPLETION GATE**

New mailbox sends/receives and is owned/monitored.

**ESCALATION / EXCEPTION**

Escalate suspected business email compromise under SOP 19.

# SOP 09 \| Identity, employee onboarding and offboarding

| **FIELD**                  | **PROCEDURE CONTROL**                                                   |
|----------------------------|-------------------------------------------------------------------------|
| **Process owner**          | TL; HR                                                      |
| **Trigger / frequency**    | Joiner, role change, exit, temporary contractor or compromised account  |
| **Preconditions / inputs** | Approved role and employment/contract status; central access inventory. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                           |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Create individual identities wherever possible: GitHub, Hostinger, Google properties, analytics, mail, supplier dashboard, customer CRM/staff view.                          |
| **2**  | Grant only role-defined permissions; turn on MFA; avoid sharing production admin accounts and root/database passwords.                                                       |
| **3**  | Collect access request with requested system, business purpose, permission, expiry, approver and ticket.                                                                     |
| **4**  | On day 1 provide approved workstation configuration, password manager and secure communication rules; verify policy acknowledgement.                                         |
| **5**  | For contractors, limit scope and set mandatory expiry/review date; monitor vendor-admin access.                                                                              |
| **6**  | On role change, revoke previous privileges before granting new ones if conflict exists.                                                                                      |
| **7**  | On exit, disable sessions and accounts at separation time; revoke tokens/SSH keys, rotate any shared secrets, recover devices and transfer ownership of issues/docs/domains. |
| **8**  | Monthly reconcile access register against active team and actual permissions; director signs off privileged exceptions.                                                      |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Access request record, grant confirmation, quarterly/montly access review, exit checklist.

**COMPLETION GATE**

No ex-employee retains access, including recovery contacts and personal accounts.

**ESCALATION / EXCEPTION**

Critical if owner of domain, repository or business email leaves; appoint second approved recovery administrator.

# SOP 10 \| Secrets and configuration management

| **FIELD**                  | **PROCEDURE CONTROL**                                                  |
|----------------------------|------------------------------------------------------------------------|
| **Process owner**          | TL; DEV                                                                |
| **Trigger / frequency**    | New API key/password, deployment environment change, leaked credential |
| **Preconditions / inputs** | Registered systems, credential owner and safe vault.                   |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                  |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Store secrets only in an approved password/secret manager or protected server-side environment; never in GitHub, code, public CSS/JS, front-end source maps or shared spreadsheets. |
| **2**  | Create separate credentials for development, staging and production; enforce least privilege on database and external APIs.                                                         |
| **3**  | Put web application private config outside \`public_html\` when available; if unavoidable, validate direct HTTP denial and server rules.                                            |
| **4**  | Give database users only necessary rights; use different account for migrations and normal application queries.                                                                     |
| **5**  | In code, commit example config with placeholders; \`.gitignore\` excludes real config, local secrets and SQL exports.                                                               |
| **6**  | Before PR/deploy, run secret scan and manually inspect new files; update secret register with owner, purpose, renewal/rotation and revoke instructions.                             |
| **7**  | When exposure occurs rotate immediately, revoke sessions, inspect usage/audit logs, purge public distribution as feasible and classify incident. Do not rely on commit deletion.    |
| **8**  | Test application after rotation and confirm old credential no longer works.                                                                                                         |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Secret metadata register (no secret values), approval, rotation date, verification and incident notes.

**COMPLETION GATE**

No secrets publicly exposed; all production credentials have an owner and rotation/revoke process.

**ESCALATION / EXCEPTION**

Leak of production credentials: P1 incident pending assessment.

**CONTROL NOTE**

OWASP secrets guidance \[E5\].

# SOP 11 \| Customer registration, guest access and authentication

| **FIELD**                  | **PROCEDURE CONTROL**                                                          |
|----------------------------|--------------------------------------------------------------------------------|
| **Process owner**          | TL; DEV; OPS                                                                   |
| **Trigger / frequency**    | Enable or modify customer portal                                               |
| **Preconditions / inputs** | PHP/MySQL backend verified in staging; privacy notice and data model approved. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                    |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Allow travel enquiry as guest without forced registration unless business purpose requires an account; explain login benefits plainly.                |
| **2**  | For sign-up, require essential data only; validate email, password and optional fields server-side; send time-limited verification link.              |
| **3**  | Store only password hashes using modern library defaults; never send existing passwords by email or log them.                                         |
| **4**  | Apply rate-limits, anti-automation safeguards and generic error messages that do not expose whether an email exists.                                  |
| **5**  | Enforce secure sessions (HttpOnly, Secure, SameSite), regenerate session IDs on login/privilege change and revoke sessions on logout/password change. |
| **6**  | Keep staff roles on server and deny unauthorized records by object-level checks; hiding the button is not sufficient.                                 |
| **7**  | Test sign-up, duplicate email, verification expiry, password reset, guest enquiry, session expiry, user role changes and account deletion flows.      |
| **8**  | Log security-relevant events without credentials; provide customer-facing account/privacy support channel and emergency disable mechanism.            |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Account test cases, security review, privacy notice version, access logs without tokens.

**COMPLETION GATE**

No account or data exposure bypass; guests can enquire; staff see only permitted records.

**ESCALATION / EXCEPTION**

If production account system is not yet deployed, mark portal UNAVAILABLE; do not show a misleading login link.

**CONTROL NOTE**

OWASP ASVS \[E4\] and session/password cheat sheets \[E5\].

# SOP 12 \| Customer enquiry capture, routing and follow-up

| **FIELD**                  | **PROCEDURE CONTROL**                                                                |
|----------------------------|--------------------------------------------------------------------------------------|
| **Process owner**          | OPS/GM; CS; TL for technical faults                                                     |
| **Trigger / frequency**    | Website contact form, guest form, registered customer enquiry or offline lead        |
| **Preconditions / inputs** | Published privacy notice, working backend and operational mailbox; designated owner. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                 |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Validate fields before submission; only collect what is needed for a quotation: name, contact method, destination, date range, travellers, interests, approximate budget and special requirements. |
| **2**  | Display accurate price disclaimers, consent/notice and a clear submit outcome. Distinguish an enquiry acknowledgement from an actual reservation.                                                  |
| **3**  | Save enquiry transactionally with unique reference, timestamp, channel, status New and minimal necessary source metadata.                                                                          |
| **4**  | Trigger staff notification via SMTP; failures go into error monitoring/retry queue where implemented. Never claim an email was delivered solely because a DB insert succeeded.                     |
| **5**  | Consultant acknowledges enquiry using approved channel: proposed targets 4 business hours for first acknowledgement, 1 business day for first substantive response (management to approve).        |
| **6**  | Validate customer requirements and supplier availability before issuing a quote. Do not promise indicative package pricing or hotel/vehicle availability.                                          |
| **7**  | Update status New → Contacted → Quote Sent → Awaiting Customer → Closed/Booked/Declined (where implemented); add next action and responsible consultant.                                           |
| **8**  | If personal data is exported, use approved restricted storage only; use masked sample information in issue reports.                                                                                |
| **9**  | Close when customer outcome recorded and data retention disposition scheduled; review stale enquiries each business day.                                                                           |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Enquiry ID, response timestamp, assigned employee, action trail, quotation version and consent evidence as applicable.

**COMPLETION GATE**

Every submitted enquiry either assigned and acknowledged or flagged as delivery failure.

**ESCALATION / EXCEPTION**

No new enquiries visible for \>1 hour in normal hours: raise technical issue; suspected deletion/exposure: incident SOP.

**CONTROL NOTE**

If current backend lacks assignment or a retry queue, track these as implementation backlog, not existing functionality.

# SOP 13 \| Database administration and customer-data extraction

| **FIELD**                  | **PROCEDURE CONTROL**                                                      |
|----------------------------|----------------------------------------------------------------------------|
| **Process owner**          | TL; SPC                                                                |
| **Trigger / frequency**    | Schema change, backup, approved customer export or investigation           |
| **Preconditions / inputs** | Approved purpose; privileged named access; valid ticket and privacy basis. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                         |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Confirm environment (production vs staging), database host, schema and safe backup timestamp before executing statements.                                  |
| **2**  | Prefer staff dashboard for consultants; restrict phpMyAdmin/SSH to technical administrators; audit privileged sessions.                                    |
| **3**  | For routine retrieval use scoped \`SELECT\` with date range, limit and required fields, not \`SELECT \*\` from all customers.                              |
| **4**  | Never export hashed passwords, reset tokens, full authentication logs or unrelated customer records for marketing or general reporting.                    |
| **5**  | Approve export request with purpose, lawful basis, recipients, minimised fields, permitted storage and deletion date.                                      |
| **6**  | Use CSV export only into an access-controlled company workspace; encrypt in transit and at rest where appropriate; do not email raw customer spreadsheets. |
| **7**  | For schema migration use backward-compatible versioned SQL where possible; capture rollback/backup before DDL changes.                                     |
| **8**  | Validate affected row counts and application queries after changes. Review slow queries, indices, user privileges and unused accounts monthly.             |
| **9**  | Delete temporary exports at expiry; maintain export audit log and respond to suspicious queries via incident process.                                      |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Database change request, query/output count (not content), export approval, retention deadline and deletion confirmation.

**COMPLETION GATE**

Only necessary data accessed; restore possible; export lifecycle controlled.

**ESCALATION / EXCEPTION**

Unauthorized customer export triggers privacy/security incident.

**CONTROL NOTE**

Hostinger DB admin/import guidance \[E6\].

# SOP 14 \| Backup, retention and recovery drill

| **FIELD**                  | **PROCEDURE CONTROL**                                                              |
|----------------------------|------------------------------------------------------------------------------------|
| **Process owner**          | TL; OPS/GM for business validation                                                    |
| **Trigger / frequency**    | Automatic daily/weekly backup, release backup, quarterly restore drill             |
| **Preconditions / inputs** | Documented plan features, secure backup destination, access and encrypted storage. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                          |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Inventory critical data: code, \`public_html\`, private PHP config, SQL database, DNS zone, email configuration, supplier rate documents and company documents.                                             |
| **2**  | Set proposed targets: business-critical DB RPO ≤24 hours, website RTO ≤4 business hours; management must approve feasibility/cost. If business needs tighter, upgrade to transactional backups/replication. |
| **3**  | Confirm Hostinger backup capabilities and retention for the actual subscription; do not assume all plans include daily database backups.                                                                    |
| **4**  | Run or verify automated backups and record timestamp, size, status, site/DB components and off-provider copy status.                                                                                        |
| **5**  | Keep a separate restricted off-provider copy for critical assets; test decryption and access. Never store unencrypted PII in developer laptops or public GitHub.                                            |
| **6**  | Quarterly: restore files and database into isolated test environment; verify login using synthetic account, enquiry retrieval and package pages.                                                            |
| **7**  | Measure restore duration and data loss; compare with approved RTO/RPO; record screenshots/logs without production PII.                                                                                      |
| **8**  | For real restoration, freeze writes or reconcile the differential, notify operations and track any enquiries submitted after backup time.                                                                   |
| **9**  | Update playbook after failed drill and open corrective GitHub Issue for broken dependency.                                                                                                                  |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Backup inventory, daily success check, quarterly restore proof, RTO/RPO measurements, remediation ticket.

**COMPLETION GATE**

Restore tested, not merely backup file created.

**ESCALATION / EXCEPTION**

If backup missing or corrupt, flag P1 risk; do not run destructive migrations.

**CONTROL NOTE**

Hostinger backup documents \[E6\].

# SOP 15 \| Availability, performance and service monitoring

| **FIELD**                  | **PROCEDURE CONTROL**                                                |
|----------------------------|----------------------------------------------------------------------|
| **Process owner**          | TL; OPS/GM                                                              |
| **Trigger / frequency**    | Daily health check; uptime alert; deployment                         |
| **Preconditions / inputs** | Defined URLs/critical journeys, alert recipient and monitoring tool. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Monitor apex+www domain, HTTPS expiry, homepage \`200\`, \`packages.html\`, \`contact.html\`, API health, database connectivity (restricted) and mail deliverability.             |
| **2**  | Configure independent uptime monitoring every 5 minutes where possible; alert TL and backup contact, but do not publish internal API details.                                     |
| **3**  | Check page load/response trends, availability, 4xx/5xx errors, broken images, browser JS errors, disk/DB quota and certificate lifecycle.                                         |
| **4**  | Perform synthetic customer journey with test record: package selection → enquiry form → acknowledgement → staff visibility; delete synthetic data after validation.               |
| **5**  | Create incident when agreed thresholds are breached; identify hosting vs application vs DNS vs mail cause.                                                                        |
| **6**  | Record proposed SLO: 99.5% monthly site availability, 95% enquiry submissions processed successfully, customer acknowledgement targets from SOP 12. Revise with actual baselines. |
| **7**  | Publish weekly scorecard: uptime, failures, enquiries received/acknowledged, failed email events, open P1/P2 tickets and outstanding security updates.                            |
| **8**  | After fixing recurring issues, add a regression test/alert and record root cause.                                                                                                 |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Dashboard link, monitor test date, alert log, weekly operations report.

**COMPLETION GATE**

Critical alerts route to a reachable person and tested backup.

**ESCALATION / EXCEPTION**

If external monitoring not yet available, manual checks are temporary only.

# SOP 16 \| Package content, quotes and travel-supplier validity

| **FIELD**                  | **PROCEDURE CONTROL**                                                               |
|----------------------------|-------------------------------------------------------------------------------------|
| **Process owner**          | OPS/GM (acountable); CS                                              |
| **Trigger / frequency**    | New package, rate update, expiry, customer quote                                    |
| **Preconditions / inputs** | Written supplier estimates and dates, inclusion/exclusion details, editor identity. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                     |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Create content issue listing package ID, destination, itinerary days, number of nights, hotel suggestion, room estimate, transfer route, passenger assumptions, vehicle capacity and excluded tickets. |
| **2**  | Classify each price as indicative or confirmed; record calculation inputs, supplier quote timestamp, tax conditions and validity window.                                                               |
| **3**  | Verify all itinerary names, day sequence, geography, route durations, activities and seasonal/union vehicle restrictions with OPS before publication.                                                  |
| **4**  | Display visible disclaimers: per-person twin share, two adults assumption, flights/trains excluded unless specified, hotel/vehicle subject to availability and final quote.                            |
| **5**  | Confirm photo rights, attribution, image optimisation, alt text and consistency with destination; avoid hotlinked images without licensing assurance.                                                  |
| **6**  | Obtain business approval for copy and numbers independently of code reviewer; map package to enquiry prefill and test the submitted destination.                                                       |
| **7**  | Publish with version/date and review-by date; if estimate is stale, mark “Request current quote” or temporarily unpublish price.                                                                       |
| **8**  | For booking, verify current supplier availability and obtain written customer approval before treating a proposal as confirmed.                                                                        |
| **9**  | Record corrections promptly across site and quotes; notify customers if an issued quotation materially changes.                                                                                        |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Rate card version, supplier source, approval, publish date, expiry, page URL and test record.

**COMPLETION GATE**

No unapproved rate presented as guaranteed; enquiry maps to correct package.

**ESCALATION / EXCEPTION**

Material incorrect pricing/claims: immediate content hold and corrective release.

# SOP 17 \| Vulnerabilities, patching and dependency hygiene

| **FIELD**                  | **PROCEDURE CONTROL**                                                               |
|----------------------------|-------------------------------------------------------------------------------------|
| **Process owner**          | TL; DEV                                                                             |
| **Trigger / frequency**    | Weekly review, dependency alert, pen-test finding, disclosed CVE                    |
| **Preconditions / inputs** | Inventory of running PHP version, libraries, JS dependencies and vendor components. |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Maintain dependency list with version, origin, license, end-of-support and security contact. Cover PHP libraries, CDN scripts, plugins and hosting runtime.     |
| **2**  | Scan repository and dependencies with available GitHub/third-party tools; manually check PHP and vendored scripts not tracked by package manager.               |
| **3**  | Triage each finding for exploitability in Prism, exposure, affected data and remediation path rather than severity score alone.                                 |
| **4**  | Proposed SLA: critical exploited/publicly exposed within 24h; high within 7 calendar days; medium within 30 days; low via routine backlog (approve exceptions). |
| **5**  | Implement patch on feature/hotfix branch, test functionality and regression, and review vendor release notes.                                                   |
| **6**  | If no fix exists, apply approved mitigation such as disabling feature, access restriction, WAF rule or isolation; document expiry.                              |
| **7**  | After release verify scanner resolves the issue and no new regression; record version and affected deployment.                                                  |
| **8**  | Quarterly review deprecated software and plan removal before end-of-support.                                                                                    |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Vulnerability register, affected asset, severity, owner, remediation/exception, retest proof.

**COMPLETION GATE**

Critical/high findings meet approved SLA or have signed time-bound risk exception.

**ESCALATION / EXCEPTION**

Actively exploited issue invokes SOP 19.

**CONTROL NOTE**

NIST SSDF \[E3\], OWASP ASVS \[E4\].

# SOP 18 \| Security incident triage and containment

| **FIELD**                  | **PROCEDURE CONTROL**                                                                       |
|----------------------------|---------------------------------------------------------------------------------------------|
| **Process owner**          | TL (incident commander); SPC; CEO                                                      |
| **Trigger / frequency**    | Suspected intrusion, leaked credential, compromised mailbox, data exposure or severe outage |
| **Preconditions / inputs** | Safe incident channel, on-call contacts and restricted evidence location.                   |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                                                                                                       |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Record first detection time (IST), observer, affected systems, evidence link and preliminary severity. Open restricted incident ticket; do not use a public GitHub issue for personal data.                                                                                              |
| **2**  | Assess whether malicious activity is ongoing and whether customer information or accounts are affected. Separate suspected from confirmed facts.                                                                                                                                         |
| **3**  | Contain: revoke tokens, disable compromised users, isolate affected endpoint, suspend vulnerable upload/script or restrict access. Preserve logs first if safe.                                                                                                                          |
| **4**  | Preserve chain-of-custody: evidence source, capture date/time, collector, cryptographic hash if applicable, storage and access log.                                                                                                                                                      |
| **5**  | Assess notification obligations with legal adviser immediately. CERT-In directions require reportable incident types to be reported within six hours of noticing/being brought to notice; assess applicability and reporting duties rather than waiting for complete information. \[E8\] |
| **6**  | For personal data breaches, identify applicable DPDP provisions and effective dates; the 2025 rules are phased and require separate analysis of user/Board notice when operative. \[E9\]                                                                                                 |
| **7**  | Eradicate root cause, patch, rotate keys and recover from clean tested backup. Verify authentication, logging and enquiry integrity.                                                                                                                                                     |
| **8**  | Communicate approved factual status internally and externally; only Director/authorised spokesperson contacts customers, regulators or press.                                                                                                                                            |
| **9**  | Within 5 business days after containment, run blame-free postmortem: timeline, root cause, impact, controls failed, actions, owners and deadlines.                                                                                                                                       |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Restricted incident report, timeline, forensic evidence, legal decision log, notifications, restoration verification, postmortem.

**COMPLETION GATE**

Threat contained, customer data integrity assessed and assigned corrective actions tracked.

**ESCALATION / EXCEPTION**

P0 escalate to CEO and TL immediately; legal counsel decides reportability and applicable statutory deadlines.

**CONTROL NOTE**

CERT-In directions and phased DPDP rules require specialist review; do not substitute this SOP for legal advice.

# SOP 19 \| Privacy, consent, data rights and retention

| **FIELD**                  | **PROCEDURE CONTROL**                                                                        |
|----------------------------|----------------------------------------------------------------------------------------------|
| **Process owner**          | SPC; TL; OPS/GM                                                                                 |
| **Trigger / frequency**    | New data collection, customer request, vendor transfer, new analytics tool, deletion request |
| **Preconditions / inputs** | Approved privacy inventory and legal review of applicable law and commencement.              |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                     |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Inventory each collection point: forms, cookies/analytics, sign-up, account history, support mail, supplier booking documents and third-party tools.                                                   |
| **2**  | Document purpose, data fields, collection notice, legal basis/consent logic where applicable, recipient/vendor, region, retention trigger and owner.                                                   |
| **3**  | Provide clear customer-facing notice and consent controls where legally required; separate service enquiry from optional marketing consent.                                                            |
| **4**  | Upon customer access/correction/deletion request, verify requester identity proportionately; open restricted case, record receipt time and applicable response deadline (to be confirmed by counsel).  |
| **5**  | Search all relevant systems: database, CRM, mailbox, attachments, vendor services and backup lifecycle; avoid promising instant purge from immutable backups.                                          |
| **6**  | Fulfil approved request and record what was changed, exception/legal hold, vendor notifications and secure reply; minimise disclosure to unauthorised persons.                                         |
| **7**  | Apply retention schedule approved by counsel. The DPDP Rules 2025 have phased commencement and certain logging/retention provisions; do not use a single generic “delete after 30 days” policy. \[E9\] |
| **8**  | Conduct pre-launch privacy review for analytics, AI chatbot, accounts, passports, payment gateways or a new vendor processor.                                                                          |
| **9**  | Quarterly perform deletion/retention sample check and confirm no raw PII appears in issues, public repo, screenshots or test databases.                                                                |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Data inventory, notice versions, request register, consent record where used, retention/deletion log.

**COMPLETION GATE**

Data use is purpose-limited and requests are resolved within counsel-confirmed deadlines.

**ESCALATION / EXCEPTION**

Potential breach handled under SOP 18.

**CONTROL NOTE**

Privacy schedule is a required approval artifact, not finalised in this draft.

# SOP 20 \| SEO, accessibility and visual quality

| **FIELD**                  | **PROCEDURE CONTROL**                            |
|----------------------------|--------------------------------------------------|
| **Process owner**          | OPS/GM; TL                                          |
| **Trigger / frequency**    | New page, content change, quarterly SEO/UX audit |
| **Preconditions / inputs** | Approved content, URLs and brand assets.         |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Provide unique page \`\<title\>\`, meta description, \`h1\`, canonical URL, headings, alt text and navigable internal links.                                      |
| **2**  | Check server returns correct status code; \`robots.txt\` does not accidentally block intended public pages; generate/update sitemap and submit in Search Console. |
| **3**  | Ensure enquiry-only/private URLs are not advertised as public search results; robots.txt is not a security mechanism; use auth and noindex where appropriate.     |
| **4**  | Test on Chrome, Safari and Firefox at desktop/mobile widths; no horizontal scroll, broken layouts, inaccessible buttons or missing photos.                        |
| **5**  | Perform keyboard-only navigation, label association, colour contrast, visible focus, reduced-motion checks and screen reader spot tests.                          |
| **6**  | Check image licensing/source, dimensions, WebP/AVIF support fallback, descriptive alt and lazy-loading where appropriate.                                         |
| **7**  | After deployment run live URL inspection for strategic pages and check crawl/index reports later; explain indexing is not immediate/guaranteed.                   |
| **8**  | Once per quarter conduct SUS or task-based formative study; capture usability problems as separate prioritised issues.                                            |

**REQUIRED RECORDS / AUDIT EVIDENCE**

SEO checklist, Search Console evidence, accessibility audit, UX issue list, asset-license register.

**COMPLETION GATE**

No critical accessibility navigation failure; images and metadata render correctly.

**ESCALATION / EXCEPTION**

Accessibility issues blocking enquiry submission should be treated as high-priority product defects.

**CONTROL NOTE**

Google Search guidance \[E7\].

# SOP 21 \| Service providers, procurement and subscriptions

| **FIELD**                  | **PROCEDURE CONTROL**                                                    |
|----------------------------|--------------------------------------------------------------------------|
| **Process owner**          | CEO; TL; OPS/GM                                                |
| **Trigger / frequency**    | New SaaS, domain/hosting renewal, payment, vendor change or contract end |
| **Preconditions / inputs** | Supplier request with service need and expected data access.             |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                     |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Raise purchase/technology request: problem, alternatives, annualised cost, owner, use case and approval threshold.                                     |
| **2**  | Assess vendor stability, support, data processing/access, hosting region, security measures, breach contacts, lock-in and exit/export terms.           |
| **3**  | Check license suitability for commercial use; no purchase of software/assets outside authorised sourcing process.                                      |
| **4**  | Assign contract owner and record renewal, billing cycle, plan entitlements, cancellation conditions, MFA/admin recovery and vendor escalation channel. |
| **5**  | Before connection share only necessary company/customer data; complete processor/privacy review where applicable.                                      |
| **6**  | Reconcile invoices against technology register monthly; avoid duplicate subscriptions or employee-owned recurring purchases.                           |
| **7**  | At least 45 days before renewal review use, cost, service quality, and security posture; approve renew/replace/cancel.                                 |
| **8**  | At exit export necessary data, revoke keys, remove integrations, terminate billing and validate deletion/retention obligations.                        |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Technology register, quote, approval, contract, renewal calendar, vendor evaluation and offboarding record.

**COMPLETION GATE**

Owner and renewal mechanism exist; no silent uncontrolled recurring spend.

**ESCALATION / EXCEPTION**

Critical provider outage: SOP 15 and BCP SOP 23.

# SOP 22 \| Third-party APIs, AI assistant and automated responses

| **FIELD**                  | **PROCEDURE CONTROL**                                                       |
|----------------------------|-----------------------------------------------------------------------------|
| **Process owner**          | TL; OPS/GM; SPC                                                                |
| **Trigger / frequency**    | Any AI chatbot, API integration, automated quote or personalization feature |
| **Preconditions / inputs** | Approved vendor, data-flow review, documented customer experience.          |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                              |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Define exact business task and limits: recommend destinations, gather constraints, provide general advice or hand off to consultant.                            |
| **2**  | Never represent unverified model outputs as confirmed hotel availability, price, travel restrictions, visa rules or bookings.                                   |
| **3**  | Create API threat model: credentials, rate limiting, spend cap, request validation, logging, vendor retention and prompt-injection controls.                    |
| **4**  | Only send customer information needed for that response; provide notice/consent controls as applicable; mask IDs and avoid sensitive records.                   |
| **5**  | Test refusal/uncertainty handling, off-topic inputs, malicious prompt injection, hallucinated rates, language support and escalation to a human.                |
| **6**  | Use server-side API keys, budget alerts, analytics and monitoring; disable chatbot without disrupting the underlying contact form.                              |
| **7**  | Make it clear to visitors they interact with an AI system, and give direct access to human support.                                                             |
| **8**  | Quarterly review conversations in redacted aggregate, accuracy, feedback, privacy risks and vendor updates; delete transcripts per approved retention schedule. |

**REQUIRED RECORDS / AUDIT EVIDENCE**

AI feature register, data-flow approval, test cases, spend cap, incident route, evaluation results.

**COMPLETION GATE**

Automated system cannot issue binding quotes or access unauthorized customer records.

**ESCALATION / EXCEPTION**

Any new generative feature requires a separate formal privacy/security go-live approval.

**CONTROL NOTE**

NIST SSDF AI profile \[E10\].

# SOP 23 \| Business continuity and dependency failure

| **FIELD**                  | **PROCEDURE CONTROL**                                                                     |
|----------------------------|-------------------------------------------------------------------------------------------|
| **Process owner**          | CEO; TL; OPS                                                                         |
| **Trigger / frequency**    | Hostinger outage, mailbox failure, DNS incident, staff unavailability, vendor termination |
| **Preconditions / inputs** | Approved RTO/RPO, offline enquiry intake and emergency contact list.                      |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                    |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Identify single points of failure: domain/registrar login, hosting account, one corporate mailbox, database, payment account, GitHub owner, sole developer and one travel consultant. |
| **2**  | Maintain secure emergency contact sheet (hosting, DNS, registrar, mail, legal, suppliers), backup admins and offline copies of nonsecret procedures.                                  |
| **3**  | If website down, use verified temporary status page or separate channel with company-approved phone/email; never publish secret admin details.                                        |
| **4**  | If online enquiry submission unavailable, capture minimum necessary details into restricted manual intake register with reference and later reconciliation.                           |
| **5**  | If mailbox down, use approved alternate notification channel and keep evidence of attempted contacts.                                                                                 |
| **6**  | Restore platform from known-good backups according to SOP 14; reconcile enquiries against mail, DB and manual intake before resuming.                                                 |
| **7**  | Director authorises customer-facing outage message; advise staff about outstanding obligations and revised response times.                                                            |
| **8**  | After recovery test full journey, close recovery incident and update dependency/continuity plan; run annual simulation.                                                               |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Continuity activation log, manual lead register, restored system test, customer notice approval, lessons learned.

**COMPLETION GATE**

Critical services restored within approved targets or communicated exception; no lead silently discarded.

**ESCALATION / EXCEPTION**

Escalate possible lost PII or compromised backup to security/privacy incident.

# SOP 24 \| Staff device and local development security

| **FIELD**                  | **PROCEDURE CONTROL**                                       |
|----------------------------|-------------------------------------------------------------|
| **Process owner**          | TL; each employee                                           |
| **Trigger / frequency**    | New device, laptop replacement, loss, routine monthly check |
| **Preconditions / inputs** | Approved user identity and registered device.               |

## Execution steps

| **\#** | **Required action / verification**                                                                                                               |
|--------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Enrol device in inventory with custodian, OS version, encryption, screen lock, update policy, antivirus/EDR where available and recovery status. |
| **2**  | Keep macOS/Windows and browsers current; install development tools only from trusted sources; avoid pirated software.                            |
| **3**  | Enable full-disk encryption and automatic lock; require unique OS passwords and MFA for SaaS accounts.                                           |
| **4**  | Use separate work/browser profiles as convenient, but do not treat a Chrome profile as security boundary or share its password.                  |
| **5**  | Use secure networks for production admin; avoid unknown public Wi-Fi without approved VPN or equivalent protections.                             |
| **6**  | Never download live customer DB locally without approved exceptional ticket; use synthetic data for development.                                 |
| **7**  | On device loss, immediately revoke GitHub/Hostinger/mail sessions/tokens, rotate exposed secrets, assess remote wipe and classify incident.      |
| **8**  | At offboarding recover and sanitise corporate devices with documented evidence.                                                                  |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Device inventory, compliance checks, lost-device ticket, disposal/wipe evidence.

**COMPLETION GATE**

Every active privileged user uses a managed or documented compliant device.

**ESCALATION / EXCEPTION**

Missing encrypted device with PII: immediate incident assessment.

# SOP 25 \| Routine reporting, metrics and improvement

| **FIELD**                  | **PROCEDURE CONTROL**                                            |
|----------------------------|------------------------------------------------------------------|
| **Process owner**          | TL; OPS/GM                                                          |
| **Trigger / frequency**    | Weekly operations review, monthly business review, retrospective |
| **Preconditions / inputs** | Defined data sources, baseline and owner.                        |

## Execution steps

| **\#** | **Required action / verification**                                                                                                                                                                        |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Extract metrics from authoritative systems, not approximate screenshots: GitHub PR timestamps, live monitoring, Hostinger logs, enquiry table and mail delivery reports.                                  |
| **2**  | Measure proposed KPIs: monthly uptime, form success %, enquiry first-response time, backlog age, escaped defects, change failure rate, lead time to production, recovery time and backup-restore success. |
| **3**  | Define each metric numerator/denominator and exclusions; label unavailable data as Not Measured rather than zero.                                                                                         |
| **4**  | Protect personal data in reports; aggregate customer metrics and restrict access to lead-level records.                                                                                                   |
| **5**  | At weekly review assign corrective issues for breached thresholds; at monthly review present trend, explanation and owner.                                                                                |
| **6**  | Use quarterly retrospective to compare estimates with actual work, review incident actions and reprioritise top risks.                                                                                    |
| **7**  | Publish an internal one-page scorecard with three decisions: continue, change or stop.                                                                                                                    |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Metric dictionary, weekly scorecard, monthly improvement log, issue references and decisions.

**COMPLETION GATE**

Metrics are reproducible, accurate and linked to follow-up ownership.

**ESCALATION / EXCEPTION**

Rising enquiry failures or long response times are service issues, not mere reporting anomalies.

**CONTROL NOTE**

Inspired by DevOps quality/feedback emphasis in \[A2\].

# SOP 26 \| Project closeout, documentation and decommissioning

| **FIELD**                  | **PROCEDURE CONTROL**                                            |
|----------------------------|------------------------------------------------------------------|
| **Process owner**          | TL; CEO                                                      |
| **Trigger / frequency**    | Project accepted, service replaced, obsolete integration retired |
| **Preconditions / inputs** | Completed delivery/retirement plan, owner approval.              |

## Execution steps

| **\#** | **Required action / verification**                                                                                               |
|--------|----------------------------------------------------------------------------------------------------------------------------------|
| **1**  | Confirm acceptance criteria, open defects, service-level support owner, documentation and rollback window.                       |
| **2**  | Update architecture diagram, data inventory, repository references, environment instructions, runbooks, DNS and vendor register. |
| **3**  | Identify data requiring transfer, deletion or legal retention; obtain approval before destroying customer records.               |
| **4**  | For retired app revoke tokens, deactivate webhooks, remove DNS/routes, cancel subscriptions and disable public API endpoints.    |
| **5**  | Archive necessary artifacts including release notes, security findings, source tag and vendor exit evidence.                     |
| **6**  | Validate that no old domain/endpoint points to exposed files and no former contractor maintains access.                          |
| **7**  | Close GitHub epic/project with metrics, retrospective, budget result, accepted risks and next ownership.                         |
| **8**  | Schedule review of retained archives and confirm retention deletion dates.                                                       |

**REQUIRED RECORDS / AUDIT EVIDENCE**

Signoff, handover, retirement manifest, data disposition and lessons learned.

**COMPLETION GATE**

No orphan users, billing, domains, secrets or customer data.

**ESCALATION / EXCEPTION**

If closed system is subject to investigation/legal hold, obtain legal decision before deleting.

# 2. Service priorities and operational decision rules

## 2.1 Severity matrix

| **PRIORITY**    | **ILLUSTRATIVE EVENT**                                                                                  | **RESPONSE TARGET (PROPOSED)**                                               | **AUTHORITY**           |
|-----------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|-------------------------|
| **P0 - Crisis** | Confirmed active account/data compromise, major customer harm, complete site loss during peak campaign. | Immediate acknowledgement; escalate CEO + TL; continue until contained. | CEO & Incident Owner |
| **P1 - High**   | Enquiry form unavailable, broad login failure, exposed secret, materially wrong live package price.     | Acknowledge ≤30 min in coverage hours; workaround within 4h where possible.  | TL                      |
| **P2 - Normal** | Broken destination photo, limited feature failure, nonurgent content inconsistency.                     | Triage by next business day; plan in current/next sprint.                    | TL / OPS/GM                |
| **P3 - Low**    | Cosmetic polish, backlog suggestion, minor copy change.                                                 | Triage within 5 business days.                                               | OPS/GM / backlog owner     |

These are internal proposed targets rather than guaranteed availability; formally define after-hours contact coverage and customer-facing response hours.

## 2.2 Mandatory go-live gate

- [ ] Business content and package prices approved by OPS/GM.

- [ ] Code change linked to issue and reviewed PR.

- [ ] Security/privacy impact considered; secrets not committed.

- [ ] All required automated and manual tests pass.

- [ ] Pre-release files and database backup verified.

- [ ] Production deployment plan includes owner, rollback, timestamp and affected pages.

- [ ] Enquiry end-to-end smoke test and email notification performed when relevant.

- [ ] After deployment, errors, responsiveness, accessibility and SEO checked.

- [ ] Release evidence and open exceptions recorded.

## 2.3 Daily opening and closing checks

| **OPENING (first hour of business day)**                   | **CLOSING (last hour)**                                     |
|------------------------------------------------------------|-------------------------------------------------------------|
| Load homepage and 3 priority pages on mobile + desktop.    | Confirm outstanding P0/P1 assigned and escalation coverage. |
| Check last-night website and database backup status.       | Review unacknowledged enquiries vs daily count and status.  |
| Review central email inbox/spam and enquiry notifications. | Review backup and deployment notices received that day.     |
| Check form and customer-portal smoke-test status.          | Record incident/changes and update next-day handover.       |
| Check open GitHub high-severity issue alerts.              | Ensure no customer exports remain in local Downloads.       |

# 3. System inventory and data map

## 3.1 Initial asset/service register - verify ownership and state

| **ASSET / SERVICE**                           | **SYSTEM OF RECORD**                                  | **EXPECTED OWNER** | **VERIFICATION STATUS**                                         |
|-----------------------------------------------|-------------------------------------------------------|--------------------|-----------------------------------------------------------------|
| **Public website: tripbyprism.co.in**         | Hostinger \`public_html\`, DNS records, GitHub source | TL                 | Known domain; live deployment not independently audited         |
| **Source code and issue tracking**            | GitHub aryansingh47/Prism                             | TL                 | Public main structure verified 18 Nov 2026 \[E1\]               |
| **Customer enquiry form and staff dashboard** | PHP application / MySQL (if installed)                | OPS/GM + TL           | Implementation requires deployment confirmation                 |
| **Customer identities and passwords**         | PHP authentication database (if installed)            | TL + SPC           | Requires security review and production check                   |
| **Company mailbox and aliases**               | Hostinger Email                                       | OPS/GM + TL           | Email reported as created; mail ownership/alerts unverified     |
| **Domain / DNS / certificate**                | Hostinger registrar/DNS/host                          | TL                 | Record actual registrar and DNS operator in asset register      |
| **Google Search Console**                     | Google property for domain                            | OPS/GM + TL           | Previously configured; revalidate ownership and staff roles     |
| **Analytics / marketing tools**               | Unconfirmed                                           | OPS/GM + SPC          | Record once approved                   |
| **Travel packages, hotels and vendor rates**  | Approved supplier sheets / website content            | OPS/GM                | Written indicative package inputs supplied; review dates needed |
| **SOP / access register / incidents**         | Restricted company workspace                          | TL / SPC           | Choose approved storage and retention                           |

## 3.2 Data handling matrix - initial proposed classification

| **DATA**                                                   | **CLASS**                        | **PRIMARY PURPOSE**                            | **HANDLING RESTRICTION**                                     |
|------------------------------------------------------------|----------------------------------|------------------------------------------------|--------------------------------------------------------------|
| **Public package pages, terms, published company contact** | Public                           | Marketing and information                      | Business approval, versioning, asset rights                  |
| **Vendor rate cards and negotiated prices**                | Confidential                     | Quoting and procurement                        | No public sharing without supplier permission                |
| **Guest enquiry name/email/phone/itinerary/budget**        | Restricted                       | Customer consultation and quote                | Limited staff roles; retention and notice approval           |
| **Registered accounts, verification metadata**             | Restricted                       | Identity and account operations                | Hash passwords; limit auth logs                              |
| **Passport/government IDs if ever collected**              | Highly restricted                | Only if needed for confirmed travel operations | Separate data minimisation/retention and supplier agreements |
| **System logs/IP addresses**                               | Restricted when linked to person | Security, troubleshooting                      | Limit access, secure retention, masking                      |
| **Source code (without secrets)**                          | Internal / potentially public    | Maintenance and deployment                     | Review open-source exposure and license                      |

# 4. Standard checklists, registers and forms

## 4.1 Issue template

• Title (imperative): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Business problem / desired customer outcome: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Scope and exclusions: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Affected URL(s), system and environment: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Acceptance criteria (testable checklist): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Risk and data sensitivity: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Estimate, priority, owner, due date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Test plan and evidence links: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Deployment / rollback impact: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Definition of Done approval: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## 4.2 Pull request and security review template

• Linked issue and branch/commit: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• What changed and why (not only how): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Screenshots or screen recording (redacted): \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Affected forms, users, endpoints and database tables: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Security check: authorization, injection, XSS, CSRF, logging, secrets, rate limits: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Privacy check: fields, notice, vendor disclosures, retention: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Checks run and exact results: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Content/price approval: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Backup / migration / rollback plan: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

• Reviewer approval and exceptions: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## 4.3 Release record

| **FIELD**                                    | **ENTER HERE**                                                 |
|----------------------------------------------|----------------------------------------------------------------|
| **Release ID / date & IST time**             | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **GitHub commit SHA/tag / PR**               | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Business approver and technical deployer** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Files, migrations and config changes**     | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Pre-change backup identifier**             | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Smoke-test results / customer journey**    | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Errors detected and action**               | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Rollback action, if used**                 | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Final status and sign-off**                | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

## 4.4 Incident record

| **FIELD**                                     | **ENTER HERE**                                                 |
|-----------------------------------------------|----------------------------------------------------------------|
| **Incident ID and priority**                  | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **First noticed (IST) and reporter**          | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Systems and customer impact**               | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Suspected vs confirmed facts**              | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Timeline, containment and evidence links**  | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **CERT-In/DPDP legal assessment and adviser** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Internal/external notices and approval**    | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Restore, recovery time and data integrity** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Root cause / corrective issues / owner**    | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

## 4.5 Access request and termination checklist

| **GRANT / CHANGE**                           | **REVOKE / EXIT**                                   |
|----------------------------------------------|-----------------------------------------------------|
| Identity + job role + business justification | End time and HR/manager instruction                 |
| Target systems and least-privilege rights    | GitHub invitations, SSH keys, tokens, web sessions  |
| Approval, expiry and MFA evidence            | Hostinger, email, Google properties, suppliers      |
| Security training and device inventory       | Rotate shared keys and recovery accounts            |
| Account owner and next access-review date    | Transfer ownership, check devices, archive evidence |

## 4.6 Backup restore test

| **CHECK**                                                       | **RESULT / EVIDENCE**             |
|-----------------------------------------------------------------|-----------------------------------|
| **Backup date and off-provider location**                       | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Contains website files and private configuration**            | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Contains complete DB and schema**                             | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Restored into isolated environment**                          | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Login/logout, synthetic guest enquiry and staff data tested** | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **RTO and RPO measured**                                        | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Permissions/logging after restore verified**                  | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |
| **Follow-up corrective ticket**                                 | Pass / Fail: \_\_\_\_\_\_\_\_\_\_ |

## 4.7 Data request register

| **FIELD**                                        | **ENTER HERE**                                                 |
|--------------------------------------------------|----------------------------------------------------------------|
| **Request ID, verified customer reference**      | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Received timestamp and request type**          | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Legal basis / deadline / adviser**             | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Systems searched and processors contacted**    | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Actions performed / exceptions / legal holds** | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Response timestamp and custodian**             | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| **Backup disposition / final closure**           | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

## 4.8 Technology purchase and subscription register - recommended columns

Asset ID \| Category \| Vendor \| System / URL \| Purpose \| Business owner \| Technical owner \| Plan \| Licences/seats \| Billing currency \| Price and GST \| Renewal date \| Autopay / payment owner \| Notice period \| Customer data shared? \| Admin recovery \| SLA/support contact \| Risk tier \| Contract link \| Exit plan \| Last reviewed \| Status.

## 4.9 Risk register - example

| **RISK**                                         | **LIKELIHOOD**  | **IMPACT** | **OWNER / MITIGATION**                                             |
|--------------------------------------------------|-----------------|------------|--------------------------------------------------------------------|
| Single company email inbox inaccessible          | Medium          | High       | TL: second recovery admin, alternate alert and periodic login test |
| Production database not included in backups      | Medium (verify) | Critical   | TL: test backup export and quarterly restore                       |
| Supplier package price changes after publication | High            | High       | OPS: indicative labels, quote validity and monthly content audit   |
| Public repository contains a leaked API key      | Medium          | Critical   | TL: secret scanning, key rotation and restricted secrets           |
| Enquiry notification email fails silently        | Medium          | High       | OPS/TL: monitor DB-to-mail mismatch and retry path                 |
| Hostinger access held by only one person         | Medium          | High       | CEO: name secondary recovery admin                            |

# 6. Reference framework and source mapping

Source references have two levels: A = Prism-provided material (methodological source), E = independently checked external primary technical or regulatory guidance. 

| **ID**  | **REFERENCE**                                                                                                                                                                                                                                                        | **HOW USED**                                                                                                                                        |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| **A1**  | Private Notes.                                                                                                                                                                                   | Framework vs methodology, process groups, knowledge areas, scope/time/cost/quality, stakeholder and risk controls.                                  |
| **A2**  | Private Notes.                                                                                                                                                                         | Issue-first workflow, one-purpose tasks, feature branches, review, conventional commits, CI, retrospectives and risk management; adapted to GitHub. |
| **E1**  | https://github.com/aryansingh47/Prism                                                                                                                                                                                                                                | Public repository listing, checked 18 Nov 2026; static files visible in main. Does not attest live Hostinger PHP configuration.                     |
| **E2**  | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets                                                                                                                            | GitHub ruleset capabilities subject to repository/account settings.                                                                                 |
| **E3**  | https://csrc.nist.gov/pubs/sp/800/218/final                                                                                                                                                                                                                          | NIST SSDF v1.1; secure development practices.                                                                                                       |
| **E4**  | https://asvs.owasp.org/                                                                                                                                                                                                                                              | OWASP ASVS 5.0; web security verification reference.                                                                                                |
| **E5**  | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html and /Session_Management_Cheat_Sheet.html and /Secrets_Management_Cheat_Sheet.html                                                                                                   | Password hashing, session security and secrets management.                                                                                          |
| **E6**  | https://www.hostinger.com/support/1884234-how-to-upload-backups-at-hostinger/ and https://www.hostinger.com/support/5981435-how-to-download-backups-at-hostinger/ and https://www.hostinger.com/support/1864324-how-to-upload-and-set-up-your-database-at-hostinger/ | Website/SQL upload, database setup and backup handling; verify current plan.                                                                        |
| **E7**  | https://developers.google.com/search/docs/fundamentals/get-started                                                                                                                                                                                                   | Google Search Central SEO, crawling/indexing principles.                                                                                            |
| **E8**  | https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf                                                                                                                                                                                                 | CERT-In directions on reporting of specified cyber incidents and logging; legal interpretation and applicability required.                          |
| **E9**  | https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf and https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf                                                                                        | DPDP Act phased commencement notification G.S.R. 843(E) and DPDP Rules 2025 G.S.R. 846(E), both dated 13 Nov 2025.                                  |
| **E10** | https://csrc.nist.gov/pubs/sp/800/218/a/final                                                                                                                                                                                                                        | NIST SSDF AI and dual-use generative AI community profile.                                                                                          |

 **Legal status:** This manual is not a legal opinion. 

# 7. Approval and revision history

| **VERSION** | **DATE**       | **SUMMARY**                                                                                                    | **APPROVAL**              |
|-------------|----------------|----------------------------------------------------------------------------------------------------------------|---------------------------|
| 1.0         | 18 Nov 2026    | Initial comprehensive technology SOP: governance, 26 operating procedures, control templates and rollout plan. | Pending management review |
| 1.1         | To be assigned | Populate owners, verify live environment, approve privacy/security and targets.                                | Pending                   |

Next review: 18 February 2027, or immediately after a material security incident, new booking/payment platform, change in hosting/ownership, or new legal requirement.

End of controlled document. Printed and downloaded copies must be checked against the company-controlled latest approved version before use.
