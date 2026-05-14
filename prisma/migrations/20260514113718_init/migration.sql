-- CreateTable
CREATE TABLE "RuleVaultEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "sanitizedLog" TEXT NOT NULL,
    "proposedCategory" TEXT NOT NULL,
    "suggestedPattern" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "falsePositiveRisks" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provenance" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewerNotes" TEXT
);

-- CreateTable
CREATE TABLE "AgentLabSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cyclesRun" INTEGER NOT NULL,
    "totalCandidates" INTEGER NOT NULL,
    "detectedCount" INTEGER NOT NULL,
    "missedCount" INTEGER NOT NULL,
    "warnings" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AgentLabCycleRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "redTeamCandidateId" TEXT NOT NULL,
    "attackType" TEXT NOT NULL,
    "sanitizedPrompt" TEXT NOT NULL,
    "wasDetected" BOOLEAN NOT NULL,
    "wasMissed" BOOLEAN NOT NULL,
    "policyDecision" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "matchedCategories" TEXT NOT NULL,
    "blueTeamProposal" TEXT NOT NULL,
    "judgeRecommendation" TEXT NOT NULL,
    "curatedRuleVaultId" TEXT,
    "recommendedNextStep" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentLabCycleRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentLabSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditTrailEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT NOT NULL
);
