import type {
  AttackStep,
  IntroSlide,
  KnowledgeItem,
  MissionConcept,
} from "@/components/cyber-lab/content";

export const PRINCIPLES_EN: KnowledgeItem[] = [
  {
    title: "Confidentiality, Integrity, and Availability (CIA)",
    body: "Protect sensitive data, ensure it cannot be altered without authorization, and keep essential services running. This is the foundation of any threat model.",
    framework: "ISO/IEC 27000 · NIST SP 800-12",
    examples: ["TLS protects C", "Hash + signature protects I", "Redundancy & backups protect A"],
  },
  {
    title: "Principle of Least Privilege (PoLP)",
    body: "Every user, service, and key should have only the access it strictly needs. Fewer permissions limit the blast radius when something fails.",
    framework: "NIST SP 800-53 AC-6 · CIS Control 6",
    examples: ["sudo restricted to one group", "Resource-scoped IAM", "Separate read-only DB role"],
  },
  {
    title: "Defense in Depth",
    body: "Combine layers: MFA, segmentation, logs, EDR, backups, hardening, code review, and incident response. No single layer is enough on its own.",
    framework: "NIST CSF · OWASP ASVS",
    examples: ["WAF + prepared statements + auditing", "VPN + MFA + conditional access"],
  },
  {
    title: "Zero Trust",
    body: "Never rely on network location alone. Verify identity, device, context, and behavior before granting access. 'Never trust, always verify'.",
    framework: "NIST SP 800-207",
    examples: ["mTLS between services", "Conditional Access by device posture", "Re-authentication for sensitive actions"],
  },
];

export const ATTACKS_EN: KnowledgeItem[] = [
  {
    title: "Phishing and Social Engineering",
    body: "The attacker tries to convince a victim to hand over credentials, open attachments, or approve actions. Defense: training, filtering, phishing-resistant MFA, and out-of-band verification.",
    framework: "MITRE ATT&CK T1566 · OWASP Top 10 Hum.",
    examples: ["Urgent invoice with fake link", "Payment request via messaging app", "MFA fatigue (push bombing)"],
  },
  {
    title: "Credential Stuffing",
    body: "Passwords leaked from other breaches are tested against corporate accounts. Unlike brute force, it uses real user/password pairs. Defense: MFA, unique passwords, rate limiting, and monitoring.",
    framework: "MITRE T1110.004 · OWASP A07:2021",
    examples: ["Distributed failures from many IPs", "Spikes outside business hours", "Isolated success among failures"],
  },
  {
    title: "SQL Injection",
    body: "Unvalidated input alters database queries, allowing unauthorized reading, modification, or deletion of data. Defense: parameterized queries, validation, security testing, and WAF.",
    framework: "MITRE T1190 · OWASP A03:2021 · CWE-89",
    examples: ["' OR 1=1 -- ", "UNION SELECT in search field", "DB errors leaking in JSON"],
  },
  {
    title: "Ransomware",
    body: "Malware encrypts data and extorts the organization, usually arriving via phishing or exposed services. Defense: EDR, least privilege, segmentation, patching, and tested immutable backups.",
    framework: "MITRE T1486 · NIST IR 8374",
    examples: ["LockBit, BlackCat/ALPHV, Conti", "Double extortion (encryption + leak)"],
  },
  {
    title: "Service Exposure",
    body: "SSH, databases, RDP, or admin panels left open on the internet quickly become targets. Defense: VPN, allowlisting, firewalling, continuous inventory, and ASM (Attack Surface Management).",
    framework: "MITRE T1133 · CIS Control 12",
    examples: ["Public SSH 22 in production", "RDP exposed without NLA", "Unauthenticated /admin panel"],
  },
];

export const DEFENSES_EN: KnowledgeItem[] = [
  {
    title: "Asset Inventory and Attack Surface",
    body: "You can only protect what you know exists. List assets, owners, ports, sensitive data, dependencies, and external exposure. Keep it live, not static.",
    framework: "NIST CSF ID.AM · CIS Controls 1 & 2",
    examples: ["CMDB with criticality", "Continuous EASM", "Per-application SBOM"],
  },
  {
    title: "Hardening",
    body: "Remove insecure defaults, close unused ports, patch systems, enforce security headers, protect secrets, and automate secure configuration (IaC).",
    framework: "CIS Benchmarks · NIST CSF PR.IP",
    examples: ["CSP/HSTS/X-Content-Type headers", "Passwordless SSH (keys only)", "HashiCorp Vault for secrets"],
  },
  {
    title: "Detection and Response (SOC)",
    body: "Collect logs, build actionable alerts, investigate evidence, contain impact, eradicate root causes, and document lessons learned. Key metrics: MTTD and MTTR.",
    framework: "NIST CSF DE/RS · NIST SP 800-61",
    examples: ["SIEM with MITRE rules", "Phishing playbook", "Blameless post-mortem"],
  },
  {
    title: "Resilient Backups (3-2-1-1-0)",
    body: "3 copies, 2 media types, 1 offsite, 1 immutable/offline, 0 errors on tested restore. A backup that cannot be restored is equivalent to no backup.",
    framework: "NIST CSF PR.IP-4 / RC.RP",
    examples: ["S3 Object Lock", "Quarterly restore drill", "Vault access separated from general admin"],
  },
];

export const INTRO_SLIDES_EN: Omit<IntroSlide, "icon">[] = [
  {
    eyebrow: "Overview",
    title: "What this lab is",
    body: "This module teaches cybersecurity as a complete cycle aligned with NIST CSF, OWASP, and MITRE ATT&CK: you understand the attack, inspect evidence, make defensive decisions, and measure whether risk decreased.",
    items: [
      { label: "Everything is simulated", text: "Targets, logs, alerts, and attacks are fictional. No command touches real systems." },
      { label: "Real frameworks", text: "Every step is mapped to MITRE ATT&CK, OWASP Top 10, and NIST CSF functions." },
      { label: "Goal", text: "Leave knowing how to connect attack technique, evidence, impact, and defensive control." },
    ],
  },
  {
    eyebrow: "Modes",
    title: "How to choose the right mode",
    body: "The lab offers three ways to study. You can switch between them at any time without losing your progress in the current level.",
    items: [
      { label: "Guided mode", text: "Shows one mission at a time, with its concept, recommended command, and on-demand panels." },
      { label: "SOC mode", text: "Shows terminal, map, alerts, knowledge base, and controls all at once (Blue Team view)." },
      { label: "Attack mode", text: "Educational AttackBox to understand the offensive chain (Red Team) without real payloads." },
    ],
  },
  {
    eyebrow: "Terminal",
    title: "Real tool output formats",
    body: "The terminal returns outputs in the real format of nmap, curl, whatweb, syslog, and psql — pre-recorded and educational. This trains your evidence-reading skills just like in a real SOC or pentest.",
    command: "help",
    items: [
      { label: "Prompts", text: "analyst@soc indicates defensive investigation; student@attackbox indicates offensive simulation." },
      { label: "Decoder", text: "Every technical output includes a [ decoder ] block explaining what each line means." },
      { label: "History", text: "Use the up/down arrow keys to recall previously entered commands." },
    ],
  },
  {
    eyebrow: "Metrics",
    title: "How to read the top bar",
    body: "The metrics summarize the state of the lab and help you track whether security posture is improving — this is how progress is reported to leadership.",
    items: [
      { label: "Risk", text: "Score from 0 to 100 calculated from exposure, open weaknesses, and weak controls." },
      { label: "Alerts", text: "Shows how many alerts have been contained out of the total (tracks conceptual MTTR)." },
      { label: "Strong controls", text: "Counts how many controls have been hardened across assets (NIST CSF Protect)." },
      { label: "Level or Attack", text: "In normal modes shows the level; in attack mode shows Cyber Kill Chain steps completed." },
    ],
  },
  {
    eyebrow: "Panels",
    title: "What each panel represents",
    body: "The panels turn the terminal into a visual investigation. They show where assets live, which alerts are active, and which defenses are still weak.",
    items: [
      { label: "Environment", text: "Map of assets, network zones, and risk signals in the scenario." },
      { label: "Alerts", text: "Queue of suspicious events to investigate, contain, or close (L1→L3 SOC workflow)." },
      { label: "Assets & Controls", text: "List of systems, open weaknesses, and control status (gap analysis)." },
      { label: "Knowledge Base", text: "Quick summary of principles, attacks, and defenses with framework references." },
    ],
  },
  {
    eyebrow: "Study flow",
    title: "How to progress without getting lost",
    body: "Follow the current mission first. Whenever you want to explore, use the Knowledge Base and Attack Mode to see the other side of the same problem.",
    command: "inventario",
    items: [
      { label: "1. Read the mission", text: "It shows the main command and the security rationale for that step." },
      { label: "2. Run in the terminal", text: "The simulator responds with facsimile evidence, risk data, or remediation." },
      { label: "3. Answer the quiz", text: "In Attack Mode, each step ends with a comprehension check." },
      { label: "4. Connect attack and defense", text: "Compare the MITRE technique with the NIST CSF control that breaks it." },
    ],
  },
];

export const ATTACK_STEPS_EN: AttackStep[] = [
  {
    id: "attack_scope",
    title: "Scope and Rules of Engagement",
    phase: "Preparation",
    command: "ambiente ataque",
    objective: "Define what CAN and CANNOT be done. Pentesting without a formal scope is a crime, not an exercise.",
    safety: "Nothing here sends real traffic, cracks passwords, delivers malware, or displays reusable payloads.",
    defense: "Every offensive exercise ends tied to defensive evidence and controls (PTES, OSSTMM).",
    mitre: { tactic: "TA0042 Resource Development", technique: "Engagement Scoping (PTES Pre-engagement)" },
    nistCsf: ["Identify"],
    realTools: ["Rules of Engagement (ROE)", "PTES Pre-engagement", "NDA"],
    quiz: {
      question: "Which of these is ALWAYS out of scope in an educational security lab?",
      options: [
        { text: "Mapping ports on authorized fictional assets" },
        { text: "Capturing HTTP headers from the simulated target" },
        { text: "Testing real employee credentials or production systems", correct: true },
        { text: "Documenting findings in a report format" },
      ],
      explanation:
        "Testing real credentials without formal authorization violates the law (e.g., CFAA in the US / Art. 154-A CP in Brazil) and engagement ethics. Even in a contracted pentest, a signed ROE is required first.",
    },
  },
  {
    id: "attack_recon_portal-web",
    title: "Active Reconnaissance (port scan)",
    phase: "Recon",
    command: "recon portal-web",
    objective: "Map services, versions, and open ports. This is what an attacker sees before making any attempt.",
    safety: "Output is pre-calculated and limited to the game's fictional assets.",
    defense: "Inventory (ID.AM), firewalling (PR.AC), and continuous ASM shrink what attackers can see.",
    mitre: { tactic: "TA0043 Reconnaissance", technique: "T1595.001 Active Scanning: Scanning IP Blocks" },
    nistCsf: ["Identify", "Protect"],
    realTools: ["nmap", "masscan", "rustscan", "Shodan", "Censys"],
    quiz: {
      question: "nmap returned 22/tcp open ssh OpenSSH 8.2 in the DMZ. What is the FIRST defensive action?",
      options: [
        { text: "Upgrade OpenSSH to the latest version" },
        { text: "Block public SSH; expose it only via VPN or an admin allowlist", correct: true },
        { text: "Add more sysadmin users for rotation" },
        { text: "Enable password authentication in addition to keys" },
      ],
      explanation:
        "Patching matters, but reducing attack surface comes first. Administrative SSH must NOT be exposed to the internet (NIST CSF PR.AC-5 — protecting network integrity).",
    },
  },
  {
    id: "attack_fingerprint_portal-web",
    title: "Application Fingerprinting (headers & tech)",
    phase: "Enumeration",
    command: "fingerprint portal-web",
    objective: "Identify technology, frameworks, and insecure configurations before hunting for specific flaws.",
    safety: "The lab shows educational signals without real exploitation instructions.",
    defense: "Security headers (CSP, HSTS, X-Frame-Options), hiding Server headers, validation, logs, and patching reduce abuse potential.",
    mitre: { tactic: "TA0043 Reconnaissance", technique: "T1592.002 Gather Victim Host Information: Software" },
    owasp: "A05:2021 Security Misconfiguration",
    nistCsf: ["Protect"],
    realTools: ["whatweb", "curl -I", "wappalyzer", "httpx", "nikto"],
    quiz: {
      question: "A SESSIONID cookie without the HttpOnly flag means that...",
      options: [
        { text: "The cookie is lighter for the server to parse" },
        { text: "Browser JavaScript can read it, enabling session theft via XSS", correct: true },
        { text: "The cookie is automatically encrypted" },
        { text: "Only HTTPS connections accept the cookie" },
      ],
      explanation:
        "Without HttpOnly, JS code (including injected XSS) can read document.cookie and exfiltrate the session. Defense: Set-Cookie SESSIONID=...; HttpOnly; Secure; SameSite=Strict.",
    },
  },
  {
    id: "attack_sqli_portal-web",
    title: "Simulated SQL Injection Exploitation",
    phase: "Exploitation",
    command: "simular-sqli portal-web",
    objective: "See the conceptual impact of an input validation flaw without any real payload, bypass, or data extraction.",
    safety: "The test only marks fictional evidence and does not teach a reusable attack chain.",
    defense: "Prepared statements are the primary defense. WAF, validation, and regression tests add extra layers.",
    mitre: { tactic: "TA0001 Initial Access", technique: "T1190 Exploit Public-Facing Application" },
    owasp: "A03:2021 Injection (CWE-89)",
    nistCsf: ["Protect", "Detect"],
    realTools: ["sqlmap (authorized)", "Burp Suite", "OWASP ZAP"],
    quiz: {
      question: "What is the PRIMARY defense against SQL Injection?",
      options: [
        { text: "A WAF with a generic signature" },
        { text: "Hashing user passwords with bcrypt" },
        { text: "Prepared statements / parameterized queries with binding", correct: true },
        { text: "Rate limiting on the login endpoint" },
      ],
      explanation:
        "Prepared statements separate code from data in the query — user input is never interpreted as SQL. A WAF helps as an extra layer but can be bypassed; bcrypt and rate limiting solve different problems.",
    },
  },
  {
    id: "attack_creds_idp",
    title: "Credential Stuffing Against the IdP",
    phase: "Credential Access",
    command: "cred-test idp",
    objective: "Understand why MFA, rate limiting, and behavioral detection protect privileged accounts.",
    safety: "There are no password lists, brute-force attempts, login automation, or external targets.",
    defense: "Phishing-resistant MFA (FIDO2/WebAuthn), progressive lockout, SIEM alerts, and session reviews.",
    mitre: { tactic: "TA0006 Credential Access", technique: "T1110.004 Brute Force: Credential Stuffing" },
    owasp: "A07:2021 Identification & Authentication Failures",
    nistCsf: ["Protect", "Detect"],
    realTools: ["SIEM (Splunk, Elastic)", "Have I Been Pwned API", "FIDO2 keys"],
    quiz: {
      question: "47 distinct IPs attempting admin@corp in 60s. Which MITRE technique best describes this?",
      options: [
        { text: "T1110.001 Password Guessing (one password at a time)" },
        { text: "T1110.003 Password Spraying (one password across many accounts)" },
        { text: "T1110.004 Credential Stuffing (user/pass pairs from leaks)", correct: true },
        { text: "T1078 Valid Accounts (already holds valid credential)" },
      ],
      explanation:
        "Stuffing uses credential combos from prior breaches, spreading across many IPs (residential proxies, botnets) to evade per-IP rate limits. Defense: MFA + behavioral anomaly detection.",
    },
  },
  {
    id: "attack_pivot_db",
    title: "Lateral Movement Toward the Database",
    phase: "Lateral Movement",
    command: "pivot-sim db-core",
    objective: "Show how weak segmentation brings an attacker closer to the critical database.",
    safety: "The pivot is narrative-only and opens no shell, tunnel, session, or real command.",
    defense: "Segmentation (restrictive pg_hba.conf, security groups), source ACLs, least privilege, and auditing.",
    mitre: { tactic: "TA0008 Lateral Movement", technique: "T1021 Remote Services" },
    nistCsf: ["Protect"],
    realTools: ["psql", "BloodHound (AD)", "CrackMapExec", "Chisel/SSF (tunneling)"],
    quiz: {
      question: "Why does a pg_hba.conf restricted to 10.10.10.20 break the chain at this step?",
      options: [
        { text: "Because it encrypts the TLS connection" },
        { text: "Because the database only accepts authorized sources, blocking lateral movement", correct: true },
        { text: "Because it disables the 'app_readonly' user" },
        { text: "Because it speeds up SQL queries" },
      ],
      explanation:
        "pg_hba.conf is PostgreSQL's host-based access control. Restricting source IPs kills the pivot path even if the attacker already holds credentials — Zero Trust applied across network + identity layers.",
    },
  },
  {
    id: "attack_impact_db",
    title: "Impact and Regulatory Obligations",
    phase: "Impact",
    command: "impacto-sim db-core",
    objective: "Classify affected data and translate technical impact into remediation priority and legal notification.",
    safety: "The exercise displays no real data and no exfiltration technique.",
    defense: "Encryption at rest, separate audit storage, tested backups, and a response plan with notification procedures.",
    mitre: { tactic: "TA0010 Exfiltration", technique: "T1041 Exfiltration Over C2 Channel (not executed)" },
    nistCsf: ["Respond", "Recover"],
    realTools: ["LGPD (BR)", "GDPR (EU)", "Separate vault for audit_log"],
    quiz: {
      question: "A database with customers + invoices is breached. What obligation applies under data protection laws (e.g., GDPR/LGPD)?",
      options: [
        { text: "Delete logs to protect data subjects' privacy" },
        { text: "Notify the supervisory authority and affected users (e.g., GDPR 72h / LGPD art. 48)", correct: true },
        { text: "Switch hosting providers before communicating" },
        { text: "No obligation if the attack came from outside" },
      ],
      explanation:
        "Both GDPR (Art. 33, within 72h) and LGPD (Art. 48, reasonable timeframe) require notifying the authority and affected individuals when a breach poses risk. Deleting logs destroys evidence and worsens liability.",
    },
  },
  {
    id: "attack_report",
    title: "Offensive Report and Cyber Kill Chain",
    phase: "Closure",
    command: "relatorio ataque",
    objective: "Close the chain with root cause, evidence, impact, risk, and recommendations aligned with NIST CSF.",
    safety: "The report describes the attack path in educational language without abusable payloads or procedures.",
    defense: "Remediation prioritizes controls that break the chain as early as possible (shift-left).",
    mitre: { tactic: "Cyber Kill Chain (Lockheed Martin)", technique: "End-to-end reporting" },
    nistCsf: ["Respond", "Recover"],
    realTools: ["Dradis", "PlexTrac", "SANS / NIST SP 800-61 templates"],
    quiz: {
      question: "Which NIST CSF function covers 'lessons learned and post-incident improvements'?",
      options: [
        { text: "Identify (asset and risk management)" },
        { text: "Protect (preventive controls)" },
        { text: "Respond — Improvements category (RS.IM)", correct: true },
        { text: "Recover (restoring capabilities)" },
      ],
      explanation:
        "RS.IM (Response Improvements) specifies that response activities are improved with lessons learned. Recover also has RC.IM, focused specifically on improving the recovery plan.",
    },
  },
];

export const MISSION_CONCEPTS_EN: Record<string, MissionConcept> = {
  principles: {
    title: "Think Like a Defender",
    label: "Foundation",
    body: "Before reaching for a tool, define what needs protecting and which security principle justifies each control.",
    checks: ["Identify sensitive data (CIA)", "Minimize permissions (PoLP)", "Layer controls (Defense in Depth)"],
    nistCsf: "Identify",
    reference: "NIST SP 800-12 · ISO 27001 A.5",
  },
  inventory: {
    title: "Defensive Inventory (ID.AM)",
    label: "Surface",
    body: "An inventory is not a decorative list: it tracks owner, criticality, zone, and exposure for every asset. NIST CSF ID.AM-1/2 requires hardware and software inventories.",
    checks: ["Who owns it?", "What is its criticality?", "Is it exposed to the internet?"],
    nistCsf: "Identify",
    reference: "NIST CSF ID.AM-1 · CIS Controls 1 & 2",
  },
  scan: {
    title: "Attack Surface",
    label: "Reconnaissance",
    body: "Mapping ports with nmap reveals services that must be closed, filtered, or monitored. It mirrors the first thing an attacker does.",
    checks: ["Does an open port have a business justification?", "Is admin access restricted to VPN?", "Does the service need patching?"],
    nistCsf: "Identify",
    reference: "MITRE T1595 · nmap.org",
  },
  risk: {
    title: "Risk-Based Prioritization",
    label: "Decision",
    body: "Risk = impact × likelihood. It combines asset criticality, exposure, exploitable flaws, and the strength of existing controls.",
    checks: ["Business impact (CIA)", "Exploitation likelihood (CVSS, KEV)", "Compensating controls"],
    nistCsf: "Identify",
    reference: "NIST SP 800-30 · FAIR · CVSS v3.1",
  },
  attacks: {
    title: "Understanding Attacks Safely",
    label: "Threat",
    body: "The goal is to recognize patterns (TTPs) and tie each one to a concrete defense. MITRE ATT&CK is the standard catalog.",
    checks: ["What is the target?", "What evidence appears?", "Which control reduces damage?"],
    nistCsf: "Detect",
    reference: "MITRE ATT&CK · OWASP Top 10",
  },
  sqli: {
    title: "SQL Injection (OWASP A03:2021)",
    label: "Application",
    body: "The flaw arises when user input shapes a query. The primary defense is parameterized queries — separating code from data.",
    checks: ["Never display real payloads", "Log errors without leaking sensitive data", "Fix root cause (prepared statements)"],
    nistCsf: "Protect",
    reference: "OWASP A03:2021 · CWE-89",
  },
  logs: {
    title: "Logs Become Evidence (DE.AE)",
    label: "Investigation",
    body: "Good logs separate suspicion from confirmed incident. They should capture: timestamp, actor, action, resource, and outcome.",
    checks: ["Authentication events", "Application errors", "Administrative actions"],
    nistCsf: "Detect",
    reference: "NIST CSF DE.AE-3 · SP 800-92",
  },
  patch: {
    title: "Fix the Root Cause",
    label: "Remediation",
    body: "Blocking a single indicator helps short-term, but real protection comes from removing the underlying vulnerability.",
    checks: ["Prepared statements", "Server-side validation", "Automated regression tests"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.IP-12 · OWASP ASVS V5",
  },
  mfa: {
    title: "Strong Identity (MFA)",
    label: "Access",
    body: "Passwords leak. Phishing-resistant MFA (FIDO2/WebAuthn), rate limiting, and session reviews curb the impact of compromised credentials.",
    checks: ["FIDO2 MFA for admins", "Progressive lockout", "Impossible-travel / anomaly alerts"],
    nistCsf: "Protect",
    reference: "NIST SP 800-63B · CISA MFA guidance",
  },
  phishing: {
    title: "Phishing (MITRE T1566)",
    label: "People",
    body: "Social engineering exploits urgency, authority, and trust. Defense combines verification, filtering, MFA, and training.",
    checks: ["Sender and domain", "Attachments and links", "Out-of-pattern requests"],
    nistCsf: "Detect",
    reference: "MITRE T1566 · NIST SP 800-177",
  },
  edr: {
    title: "Endpoint Investigation (EDR)",
    label: "Endpoint",
    body: "EDR exposes processes, network connections, and persistence. Use it to confirm impact before eradication.",
    checks: ["Suspicious processes (LOLBins)", "Execution origin (parent process)", "External connections (IoC)"],
    nistCsf: "Detect",
    reference: "MITRE T1055 / T1547 · CrowdStrike/Defender/SentinelOne",
  },
  isolate: {
    title: "Containment (RS.MI)",
    label: "Response",
    body: "Isolation limits lateral movement (blast radius) while preserving forensic evidence.",
    checks: ["Restrict communication (network containment)", "Preserve artifacts (memory, disk image)", "Notify affected team"],
    nistCsf: "Respond",
    reference: "NIST CSF RS.MI · SP 800-61r2",
  },
  block: {
    title: "Confirmed Indicators (IoC)",
    label: "Blocking",
    body: "Once an indicator is confirmed, push blocks to the right controls and share threat intelligence (MISP, STIX/TAXII).",
    checks: ["DNS filtering / RPZ", "Email gateway (allow/deny list)", "Custom EDR indicator"],
    nistCsf: "Respond",
    reference: "MISP · STIX 2.1 · CISA AIS",
  },
  firewall: {
    title: "Administrative Access",
    label: "Perimeter",
    body: "SSH, RDP, and admin panels belong behind a VPN, allowlist, and strong authentication (bastion / jump host).",
    checks: ["Close direct internet exposure", "Require strong keys + MFA", "Review firewall rules periodically"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.AC-5 · CIS Control 12",
  },
  dbacl: {
    title: "Data Segmentation",
    label: "Database",
    body: "Critical databases must only accept connections from required sources and least-privilege accounts (RBAC).",
    checks: ["Source ACLs (pg_hba / security group)", "Minimal account permissions (RBAC)", "Auditing enabled"],
    nistCsf: "Protect",
    reference: "NIST CSF PR.AC-5 · PostgreSQL pg_hba.conf",
  },
  backup: {
    title: "Restorable Backups (3-2-1-1-0)",
    label: "Resilience",
    body: "Backups only count when restoration has been tested and vault access is protected (ideally immutable).",
    checks: ["Periodic restore drills", "Immutability (Object Lock)", "Access separated from general admin"],
    nistCsf: "Recover",
    reference: "NIST CSF PR.IP-4 / RC.RP · Veeam 3-2-1-1-0",
  },
  incident: {
    title: "Incident Report (NIST SP 800-61)",
    label: "Improvement",
    body: "Closure documents root cause, impact, containment, eradication, and improvements — using a blameless post-mortem.",
    checks: ["Root cause", "Impact and timeline", "Preventive actions (RS.IM)"],
    nistCsf: "Respond",
    reference: "NIST SP 800-61r2 · SANS IR Handbook",
  },
  score: {
    title: "Continuous Security",
    label: "Posture",
    body: "The score is not the finish line; it shows whether top lab risks were reduced. Real-world metrics: MTTD, MTTR, % strong controls.",
    checks: ["Risk below threshold", "Alerts contained (MTTR)", "Strong controls (% coverage)"],
    nistCsf: "Identify",
    reference: "NIST CSF · CIS CSAT",
  },
};

export const ATTACK_TERMINAL_OUTPUT_EN: Record<string, string[]> = {
  attack_scope: [
    "$ cat ./engagement/rules-of-engagement.md",
    "",
    "# Rules of Engagement — Cyber Lab Pythoneer v3",
    "Client:         Fictional company 'Corp Lab'",
    "Window:         2026-05-10 09:00 → 2026-05-12 18:00 UTC",
    "Scope IN:       172.16.50.0/24, assets: portal-web, idp, db-core, ws-17, backup-vault",
    "Scope OUT:      public internet, real accounts, supply chain, DoS, real brute-force",
    "Contact:        soc@corplab.test (mandatory ack before any test)",
    "Notification:   real incident → stop immediately and call the SOC",
    "",
    "AttackBox  online  →  172.16.50.10  (isolated network)",
    "Operator:  student@attackbox  (temporary access, expires in 48h)",
    "",
    "[ decoder ]",
    "ROE defines the technical-legal contract between pentester and client (PTES Pre-engagement).",
    "Without a signed ROE, any test is unauthorized → CFAA (US) / Art. 154-A CP (BR).",
    "Equivalent defense: supplier and contract management (NIST CSF ID.SC-3).",
  ],

  "attack_recon_portal-web": [
    "$ nmap -Pn -sV --top-ports 1000 -oN recon-portalweb.txt 10.10.10.20",
    "Starting Nmap 7.94 ( https://nmap.org ) at 2026-05-11 13:02 UTC",
    "Nmap scan report for portal-web.lab.local (10.10.10.20)",
    "Host is up (0.0034s latency).",
    "Not shown: 997 closed tcp ports (reset)",
    "",
    "PORT     STATE  SERVICE   VERSION",
    "22/tcp   open   ssh       OpenSSH 8.2p1 Ubuntu (protocol 2.0)",
    "80/tcp   open   http      nginx 1.18.0  (302 → /login)",
    "443/tcp  open   ssl/http  nginx 1.18.0  (Subject: CN=portal.corplab.test)",
    "",
    "Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel",
    "Nmap done: 1 IP address (1 host up) scanned in 6.21 seconds",
    "",
    "[ decoder ]",
    "22/tcp open → Public SSH is high risk; it should sit behind a VPN/allowlist (CSF PR.AC-5).",
    "80→302→/login reveals authentication endpoint; natural target for SQLi/Stuffing.",
    "nginx 1.18.0 → check CVE-2021-23017 (DNS resolver, high). OS-level patch needed.",
    "Internal cert (.test) → fine for lab; in production enforce CT logs and domain validation.",
  ],

  "attack_fingerprint_portal-web": [
    "$ whatweb -a 3 https://10.10.10.20/",
    "https://10.10.10.20/ [200 OK]",
    "  HTTPServer[nginx/1.18.0]",
    "  X-Powered-By[Express]",
    "  Cookies[SESSIONID]",
    "  Title[Corporate Portal — Login]",
    "  HTML5",
    "  Bootstrap[4.5.0]",
    "  JQuery[3.4.1]",
    "  Login-Form[username, password]",
    "",
    "$ curl -sI https://10.10.10.20/",
    "HTTP/1.1 200 OK",
    "Server: nginx/1.18.0",
    "X-Powered-By: Express",
    "Set-Cookie: SESSIONID=eyJhbGc...; Path=/",
    "Content-Type: text/html; charset=utf-8",
    "  (missing) Content-Security-Policy",
    "  (missing) Strict-Transport-Security",
    "  (missing) X-Content-Type-Options",
    "  (missing) HttpOnly / Secure / SameSite on cookie",
    "",
    "[ decoder ]",
    "Cookie without HttpOnly → stealable via XSS (OWASP A03+A07).",
    "No CSP → reflected XSS is easier to exploit (A05:2021 Security Misconfiguration).",
    "No HSTS → vulnerable to SSL stripping on hostile networks.",
    "X-Powered-By: Express + jQuery 3.4.1 → leaks tech stack and known CVEs.",
    "Defense: helmet.js (Node) / nginx add_header + cookie audit.",
  ],

  "attack_sqli_portal-web": [
    "$ curl -s -X POST https://10.10.10.20/login \\",
    "       -H 'Content-Type: application/x-www-form-urlencoded' \\",
    "       -d 'user=admin&pass=test'",
    '{"ok":false,"error":"Authentication failed"}',
    "",
    "$ # educational test input (NOT a reusable payload)",
    "$ curl -s -X POST https://10.10.10.20/login -d \"user=admin&pass=<SQLI-TEST>\"",
    '{"ok":false,',
    ' "error":"Internal Server Error",',
    ' "trace":"PostgresError: syntax error at or near \\"...\\" at character 38",',
    ' "request_id":"d2a4-7f1c-9b22"}',
    "",
    "$ # comparison: same route after patch (prepared)",
    "$ curl -s -X POST https://10.10.10.20/login -d \"user=admin&pass=<SQLI-TEST>\"",
    '{"ok":false,"error":"Authentication failed"}',
    "",
    "[ decoder ]",
    "Database error leaks in JSON → confirms direct string concatenation (CWE-89, OWASP A03:2021).",
    "request_id repeats in SOC logs → correlates attacker and defender evidence.",
    "After patching (prepared statements), the same input yields a generic auth error.",
    "Primary defense: parameter binding. Secondary: WAF + SIEM alert on 5xx spikes.",
  ],

  attack_creds_idp: [
    "$ tail -f /var/log/idp/auth.log | grep -E 'Failed|MFA'",
    "2026-05-11T03:22:14Z [WARN] auth: Failed login user=admin@corp src=198.51.100.14 ua=python-requests/2.31",
    "2026-05-11T03:22:31Z [WARN] auth: Failed login user=admin@corp src=198.51.100.31 ua=python-requests/2.31",
    "2026-05-11T03:22:48Z [WARN] auth: Failed login user=admin@corp src=203.0.113.88  ua=okhttp/4.10",
    "2026-05-11T03:23:02Z [WARN] auth: Failed login user=svc-bkp@corp src=198.51.100.14 ua=python-requests/2.31",
    "2026-05-11T03:23:19Z [WARN] auth: Failed login user=ceo@corp    src=203.0.113.42  ua=okhttp/4.10",
    "... (truncated: 312 failures across 47 distinct IPs in the last 90s)",
    "",
    "$ # SIEM query (fictional Splunk SPL)",
    "$ idp_auth status=failed | stats dc(src_ip) as ips count by user | where count>5",
    "user                  ips   count",
    "admin@corp            47    312",
    "svc-bkp@corp           9     22",
    "ceo@corp              31     71",
    "mfa_required=false in 100% of events.",
    "",
    "[ decoder ]",
    "Spread across 47 IPs → credential stuffing (T1110.004), not simple brute force.",
    "Mixed User-Agents (requests + okhttp) → botnet / residential proxies.",
    "MFA=false on all events → one leaked password is enough. Defense #1: mandatory FIDO2 MFA for admins.",
    "Detection: NIST CSF DE.CM-1 — monitor behavior, not just failures per IP.",
  ],

  attack_pivot_db: [
    "$ # from the compromised Portal Web, attempt to reach the database (narrative scenario)",
    "$ psql -h 10.10.10.40 -U app_readonly -d corp",
    "psql: error: connection to server at \"10.10.10.40\", port 5432 failed:",
    "FATAL:  no pg_hba.conf entry for host \"10.10.20.17\", user \"app_readonly\",",
    "        database \"corp\", no encryption",
    "",
    "$ # the same origin from the authorized host (10.10.10.20) would be accepted",
    "$ grep -E 'connection|denied' /var/log/postgresql/postgresql-2026-05-11.log",
    "2026-05-11T12:01:03 LOG: connection authorized: user=app db=corp host=10.10.10.20",
    "2026-05-11T12:01:47 LOG: connection authorized: user=app db=corp host=10.10.10.20",
    "2026-05-11T12:02:11 FATAL: no pg_hba entry — host=10.10.20.17 user=app_readonly",
    "2026-05-11T12:02:13 FATAL: no pg_hba entry — host=10.10.20.17 user=app_readonly",
    "",
    "$ cat /etc/postgresql/15/main/pg_hba.conf | grep -v '^#'",
    "host    corp    app           10.10.10.20/32    scram-sha-256",
    "host    corp    app_readonly  10.10.10.20/32    scram-sha-256",
    "host    all     all           0.0.0.0/0         reject",
    "",
    "[ decoder ]",
    "Restrictive pg_hba.conf + trailing 'reject' = PR.AC-5 control (segmentation) working.",
    "Without it, T1021 Remote Services would enable immediate lateral movement.",
    "FATAL logs = detection signal; feed this pattern into SIEM (DE.CM-1).",
    "Lesson: defense in depth — a stolen credential is not enough if the network refuses it.",
  ],

  attack_impact_db: [
    "$ # educational classification — NO REAL DATA is shown",
    "$ psql -h 10.10.10.40 -U app -d corp -c \"\\dt+\"",
    "                              List of relations",
    " Schema |    Name      | Type  |  Owner   | Rows (est.) | Size",
    "--------+--------------+-------+----------+-------------+-------",
    " public | customers    | table | app      |     124,500 |  82 MB",
    " public | invoices     | table | app      |     982,103 | 410 MB",
    " public | sessions     | table | app      |      23,481 |   8 MB",
    " public | audit_log    | table | postgres |   4,201,888 |  1.2 GB",
    "",
    "$ # regulatory impact calculation",
    "Data class:              PII + financial (GDPR Art. 4 / LGPD Art. 5 I/II)",
    "Estimated data subjects: 124.5k",
    "Estimated CIA:           C=HIGH  I=MEDIUM  A=HIGH",
    "Notification:            Supervisory authority + users (GDPR Art. 33 72h / LGPD Art. 48)",
    "audit_log on same DB:    attacker could wipe trails (DE.AE-2 compromised)",
    "",
    "[ decoder ]",
    "Technical impact becomes legal/regulatory impact whenever PII is involved.",
    "Keeping audit_log in the same DB as data is an anti-pattern: isolate into a WORM vault.",
    "Defense: encryption at rest (TDE), immutable backups, IR plan coordinated with Legal.",
  ],

  attack_report: [
    "=== Educational Offensive Report — Cyber Lab v3 ===",
    "Engagement:      Cyber Lab Pythoneer v3",
    "Window:          2026-05-10 → 2026-05-12",
    "Operator:        student@attackbox",
    "Severity:        HIGH  →  reduced to LOW after remediations",
    "",
    "[CYBER KILL CHAIN — Lockheed Martin]",
    "  1. Reconnaissance   → portal-web exposed; public SSH 22; nginx 1.18 fingerprinted",
    "  2. Weaponization    → conceptual SQLi on /login (no reusable payload)",
    "  3. Delivery         → crafted input via web form",
    "  4. Exploitation     → root cause: missing prepared statements (CWE-89)",
    "  5. Installation     → NOT executed (educational scope)",
    "  6. C2               → NOT executed (educational scope)",
    "  7. Actions/Impact   → conceptual access to PII database (GDPR/LGPD)",
    "",
    "[MITRE ATT&CK]",
    "  T1595.001  Active Scanning",
    "  T1592.002  Gather Victim Host Information: Software",
    "  T1190      Exploit Public-Facing Application",
    "  T1110.004  Credential Stuffing",
    "  T1021      Remote Services (lateral attempt)",
    "  T1041      Exfiltration Over C2 (not executed)",
    "",
    "[CONTROLS THAT BREAK THE CHAIN — NIST CSF]",
    "  [Identify]  Inventory + CIA classification (ID.AM, ID.RA)",
    "  [Protect]   Prepared statements, FIDO2 MFA, pg_hba.conf, admin VPN (PR.AC, PR.IP)",
    "  [Detect]    SIEM + stuffing alert + anomalous 5xx on Portal Web (DE.CM, DE.AE)",
    "  [Respond]   SQLi and Credential Stuffing playbooks (RS.RP, RS.MI)",
    "  [Recover]   Tested immutable backups, separate vault (RC.RP, RC.IM)",
    "",
    "[PRIORITIZED RECOMMENDATIONS]",
    "  P0  patch sqli              (root cause of critical exposure)",
    "  P0  mfa admin               (stops T1110.004 immediately)",
    "  P1  firewall ssh private    (shrinks administrative surface)",
    "  P1  hardening db            (cuts off lateral movement)",
    "  P2  backup validar          (ransomware resilience)",
    "",
    "Next cycle: re-validate in 30 days and measure SOC MTTD/MTTR.",
  ],
};

export interface AssetTranslationEn {
  name: string;
  zone: string;
  owner: string;
  serviceNotes: string[];
  weaknesses: Record<string, { title: string; impact: string; defense: string }>;
  evidence: string[];
}

export const ASSETS_EN: Record<string, AssetTranslationEn> = {
  "edge-fw": {
    name: "Edge Firewall",
    zone: "Perimeter",
    owner: "Infra",
    serviceNotes: ["Corporate remote access", "Restricted administration"],
    weaknesses: {
      "flat-network": {
        title: "Insufficient segmentation",
        impact: "A compromised host could attempt lateral movement with fewer barriers.",
        defense: "Separate zones, enforce internal firewall rules, and review allowed flows.",
      },
    },
    evidence: ["Permissive internal flows between workstations and servers."],
  },
  "portal-web": {
    name: "Portal Web",
    zone: "DMZ",
    owner: "Applications",
    serviceNotes: ["Redirects to HTTPS", "Public portal", "Should be restricted to VPN"],
    weaknesses: {
      sqli: {
        title: "Login input without parameterized query",
        impact: "May allow unauthorized data reading if user input is treated as SQL code.",
        defense: "Use prepared statements, validate inputs, and cover login with security tests.",
      },
      "ssh-public": {
        title: "SSH exposed to the internet",
        impact: "Increases brute-force attempts and credential exploitation risk.",
        defense: "Restrict via VPN or allowlist, disable passwords, and require strong keys.",
      },
    },
    evidence: ["Logs show database errors after abnormal inputs on the login form."],
  },
  idp: {
    name: "Identity Provider",
    zone: "Core",
    owner: "Security",
    serviceNotes: ["SSO Login", "Corporate directory"],
    weaknesses: {
      "no-mfa-admin": {
        title: "Missing MFA for administrators",
        impact: "Leaked credentials can become privileged access.",
        defense: "Require phishing-resistant MFA and review privileged accounts.",
      },
      "weak-rate-limit": {
        title: "Partial rate limiting on login",
        impact: "Facilitates automated attempts using reused passwords.",
        defense: "Apply adaptive rate limiting, progressive lockout, and anomaly alerts.",
      },
    },
    evidence: ["Spikes of failed logins on admin accounts outside business hours."],
  },
  "db-core": {
    name: "Database",
    zone: "Data",
    owner: "Data",
    serviceNotes: ["Access should only come from the application"],
    weaknesses: {
      "db-acl": {
        title: "Permissive database ACL",
        impact: "More servers can attempt direct connections to the database.",
        defense: "Allow only required sources and audit service accounts.",
      },
    },
    evidence: ["Denied connections from user subnets appear in the logs."],
  },
  "ws-17": {
    name: "Finance Workstation",
    zone: "Users",
    owner: "Finance",
    serviceNotes: ["User asset monitored by EDR"],
    weaknesses: {
      phishing: {
        title: "User received phishing with malicious attachment",
        impact: "Can lead to session hijacking, malware, or ransomware.",
        defense: "Analyze indicators, isolate endpoint, block domain, and reinforce training.",
      },
    },
    evidence: ["External email impersonated a vendor and urged opening an attachment."],
  },
  "backup-vault": {
    name: "Backup Vault",
    zone: "Recovery",
    owner: "Infra",
    serviceNotes: ["Backup repositories"],
    weaknesses: {
      "untested-backup": {
        title: "Untested backup restoration",
        impact: "In a ransomware incident, a backup that cannot restore equals no backup.",
        defense: "Test restoration regularly, enforce immutability, and restrict operators.",
      },
    },
    evidence: ["No recent formal restore test has been recorded."],
  },
};

export const ALERTS_EN: Record<string, string> = {
  "web-sqli": "Database errors after abnormal login input",
  "idp-stuffing": "Distributed login failures on admin accounts",
  "mail-phish": "Suspicious email delivered to Finance",
};

export const LOG_LINES_EN: Record<string, string[]> = {
  "portal-web": [
    "2026-05-11T13:14Z auth/login status=500 reason=db_error source=203.0.113.77",
    "2026-05-11T13:15Z waf/anomaly category=input-tampering endpoint=/login action=alert",
    "2026-05-11T13:16Z app/security recommendation=parameterized-query",
  ],
  idp: [
    "2026-05-11T03:22Z login failed user=admin source=198.51.100.14 count=47",
    "2026-05-11T03:23Z login failed user=admin source=198.51.100.31 count=39",
    "2026-05-11T03:25Z policy warning=mfa_not_required group=admins",
  ],
  "ws-17": [
    "2026-05-11T09:41Z mail delivered subject='Urgent invoice' sender=payroll@evil-login.example",
    "2026-05-11T09:44Z endpoint process=invoice_viewer.tmp parent=mail_client action=blocked",
    "2026-05-11T09:45Z network dns_query=evil-login.example verdict=malicious",
  ],
  "db-core": [
    "2026-05-11T12:01Z postgres connection_denied source=10.10.20.17 user=app_readonly",
    "2026-05-11T12:02Z audit recommendation=restrict_network_acl",
  ],
  "backup-vault": [
    "2026-05-10T22:00Z backup completed dataset=finance status=ok",
    "2026-05-11T08:00Z restore_test status=missing evidence=no_recent_restore",
  ],
  "edge-fw": [
    "2026-05-11T00:00Z rule review status=stale any-to-core permitted=true",
    "2026-05-11T00:05Z vpn auth warning=mfa_partial",
  ],
};

export interface LevelTranslationEn {
  title: string;
  focus: string;
  briefing: string;
  missions: Record<string, { title: string; principle: string; defense: string }>;
}

export const LEVELS_EN: Record<number, LevelTranslationEn> = {
  1: {
    title: "Fundamentals and Surface",
    focus: "Know before protecting",
    briefing:
      "Start as a defensive analyst: review principles, inventory assets, and discover which services widen the attack surface.",
    missions: {
      principles: {
        title: "Review essential security principles",
        principle: "CIA, least privilege, defense in depth, and zero trust.",
        defense: "Use these principles to justify every control you apply.",
      },
      inventory: {
        title: "Build an initial inventory of known assets",
        principle: "Consistent defense is impossible without knowing what needs protection.",
        defense: "Classify criticality, owner, zone, and exposure for each asset.",
      },
      scan: {
        title: "Map open ports on Portal Web",
        principle: "Attack surface is everything that can receive external interaction.",
        defense: "Close or restrict ports that do not need to be exposed.",
      },
      risk: {
        title: "Register Portal Web risk",
        principle: "Risk combines impact, likelihood, exposure, and existing controls.",
        defense: "Prioritize critical flaws exposed to the internet.",
      },
    },
  },
  2: {
    title: "Web Attacks and Identity",
    focus: "Understand to block",
    briefing:
      "Investigate common attacks against apps and accounts. The goal is not to break in: it is to recognize signals, fix root causes, and reduce impact.",
    missions: {
      attacks: {
        title: "Study the main attacks in the environment",
        principle: "Defense improves when you understand attack techniques, goals, and signals.",
        defense: "Map each attack to a control: MFA, validation, segmentation, logs, or backups.",
      },
      sqli: {
        title: "Detect a simulated SQL Injection attempt",
        principle: "User input must never become trusted commands.",
        defense: "Use parameterized queries and log anomalies without exposing sensitive data.",
      },
      logs: {
        title: "Review Portal Web logs",
        principle: "Logs turn suspicion into evidence.",
        defense: "Collect authentication events, application errors, and administrative changes.",
      },
      patch: {
        title: "Apply a defensive fix against injection",
        principle: "Fixing the root cause matters more than blocking a single indicator.",
        defense: "Prepared statements, validation, automated tests, and WAF as an extra layer.",
      },
      mfa: {
        title: "Protect administrators against credential stuffing",
        principle: "Credentials can leak; strong identity limits the damage.",
        defense: "Phishing-resistant MFA, rate limiting, alerts, and session reviews.",
      },
    },
  },
  3: {
    title: "Phishing, Malware, and Containment",
    focus: "Detect fast, contain better",
    briefing:
      "Handle a phishing alert in Finance. Analyze indicators, investigate the endpoint, and contain it before it turns into ransomware.",
    missions: {
      phishing: {
        title: "Analyze suspicious email received by Finance",
        principle: "Social engineering exploits urgency, authority, and fear.",
        defense: "Verify sender, domain, links, attachments, and context before trusting.",
      },
      edr: {
        title: "Investigate the affected endpoint",
        principle: "EDR helps inspect processes, persistence, and suspicious connections.",
        defense: "Look for anomalous execution, external connections, and startup changes.",
      },
      isolate: {
        title: "Contain the workstation before lateral movement",
        principle: "Containment reduces the blast radius.",
        defense: "Isolate the host, preserve evidence, and stay coordinated with the affected team.",
      },
      block: {
        title: "Block malicious domain and strengthen email security",
        principle: "Confirmed indicators must become blocks and detections.",
        defense: "Update email gateway, DNS filtering, EDR, and targeted training.",
      },
    },
  },
  4: {
    title: "Hardening and Response",
    focus: "Close the defensive loop",
    briefing:
      "Apply defense in depth: restrict remote administration, validate backups, and formalize the incident response.",
    missions: {
      firewall: {
        title: "Restrict exposed remote administration",
        principle: "Administrative services must not stay open to arbitrary sources.",
        defense: "Use VPN, allowlists, strong keys, and regularly reviewed rules.",
      },
      dbacl: {
        title: "Tighten database ACLs for least privilege",
        principle: "Segmentation limits lateral movement.",
        defense: "Allow only required sources and audit service accounts.",
      },
      backup: {
        title: "Validate backup and restoration",
        principle: "Availability depends on tested restoration, not backup promises.",
        defense: "Test restore drills, enforce immutability, encryption, and separated access.",
      },
      incident: {
        title: "Close the incident response report",
        principle: "Mature response documents cause, impact, containment, eradication, and improvements.",
        defense: "Record evidence, actions taken, and preventive controls.",
      },
      score: {
        title: "Reduce operational risk to an acceptable level",
        principle: "Security is risk-driven continuous improvement.",
        defense: "Risk below 35 indicates that the main exposures in the lab have been addressed.",
      },
    },
  },
};
