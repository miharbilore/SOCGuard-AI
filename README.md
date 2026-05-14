# SOCGuard AI

**LLM tabanlı SOC iş akışlarını, SIEM loglarına gömülü dolaylı prompt injection saldırılarına karşı koruyan deterministik araştırma platformu.**

SOCGuard AI; ham logları normalleştirir, deterministik kurallar ile risk bulguları üretir, skorlama ve politika motoru ile karar verir, bulguları açıklanabilir şekilde sunar. Üzerine araştırma amaçlı bir **Adversarial Lab**, **Rule Vault**, **Review Queue** ve **Audit Trail** katmanları ekleyerek red/blue/judge/curator akışlarını simüle eder.

## Amaç ve Kapsam

- **Amaç:** LLM destekli SOC asistanlarını, loglar içine gizlenmiş dolaylı prompt injection girişimlerinden korumak.
- **Kapsam:** Deterministik tespit, risk skoru, politika kararı, açıklanabilirlik ve yönetişim.
- **Kapsam Dışı:** Chatbot, tam SIEM/EDR platformu veya LLM tabanlı nihai karar motoru.

## Mimari Akış (Deterministik Hat)

1. **Raw Log Input** → 2. **Preprocessing** (decode/normalize) → 3. **Detection** (regex/heuristic) →  
4. **Scoring** (0-100) → 5. **Policy** (BLOCK / HUMAN_REVIEW / ESCALATE / SAFE) →  
6. **Explainability** → 7. **UI/API çıktısı**

## Öne Çıkan Modüller

- **dataset**: SIEM benzeri örnek veri seti.
- **preprocessing**: Çoklu decode + normalizasyon.
- **detection**: Deterministik imza setleri.
- **scoring**: Bulguları ağırlıklandırıp skora çevirir.
- **policy**: Skoru karar aksiyonuna map eder.
- **explainability**: Neden/kanıt çıktıları üretir.
- **agent-adapters**: Mock/LLM tabanlı agent adaptörleri.
- **rule-vault / review-queue**: İnsan onaylı yönetişim katmanı.
- **audit**: İzlenebilirlik ve denetim kayıtları.

## UI Sayfaları (Next.js)

- **Command Center**: genel metrikler ve navigasyon.
- **Log Analyzer**: tekil log tespiti.
- **Evaluation**: benchmark metrikleri.
- **Adversarial Lab**: red/blue/judge akışı.
- **Agent Lab**: kontrollü agent koşuları (mock veya API).
- **Rule Vault**: aday imza kayıtları ve inceleme.
- **Review Queue**: insan onayı süreci.
- **Audit Trail**: tüm aksiyonların iz kaydı.

## Kurulum

### 1) Bağımlılıklar
```bash
npm install
```

### 2) Ortam Değişkenleri
```bash
cp .env.example .env.local
```

`.env.local` içine **veritabanı** ve opsiyonel **LLM** ayarlarını ekleyin:

```env
# SQLite (örnek)
DATABASE_URL="file:./dev.db"

# LLM (opsiyonel, API-backed mod için)
ENABLE_LLM_AGENTS=true
LLM_PROVIDER=GROQ
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.3-70b-versatile
LLM_API_KEY=<server-side-api-key>
```

### 3) Prisma Migrasyon
```bash
npx prisma migrate dev --name init
```

### 4) Dev Server
```bash
npm run dev
```

## LLM Modları (Mock vs API)

- **Varsayılan:** MOCK (API çağrısı yok).
- **API-backed:** `ENABLE_LLM_AGENTS=true` + `LLM_API_KEY` gerekir.
- **Agent Lab**: “Run Single Cycle” API destekliyken gerçek LLM çağrısı yapar; “Run Session (Mock)” deterministik kalır.

## Kalıcılık (DB)

Prisma + SQLite ile **Agent Lab oturumları**, **Rule Vault** ve **Audit Trail** kalıcıdır.  
`DATABASE_URL` tanımlı değilse bu API uçları hata verebilir.

## Komutlar

```bash
npm run lint
npm run build
npm test
```

## Dokümantasyon

Detaylı tasarım ve araştırma notları için `docs/` klasörüne bakın:
- `ARCHITECTURE.md`, `DETECTION_ENGINE.md`, `POLICY_ENGINE.md`
- `V4_AGENT_PIPELINE.md`, `RULE_VAULT.md`, `HUMAN_REVIEW_WORKFLOW.md`

## Güvenlik ve Yönetişim İlkeleri

- **Otomatik onay yok**: Üretim kuralları insan onayı gerektirir.
- **LLM çıktıları güvensiz veri** olarak kabul edilir.
- **API anahtarları yalnızca server-side** tutulur.
