# SOCGuard AI

**LLM tabanlı SOC (Security Operations Center) iş akışlarını dolaylı prompt injection saldırılarına karşı korumak için deterministik‑öncelikli araştırma platformu.**

SOCGuard AI, SIEM tarzı loglar içinde saklanan dolaylı prompt injection risklerini **LLM analizinden önce** tespit etmeyi hedefler. Sistem, **deterministik tespit**, **açıklanabilirlik**, **akademik değerlendirme metrikleri**, **kontrollü kural zekâsı**, **adversarial lab**, **insan onaylı yönetişim** ve **denetlenebilirlik** odaklı bir araştırma altyapısı sunar.

> [!NOTE]
> Doküman örnekleri ve veri seti kayıtları **sanitize** edilmiştir; operasyonel zararlı içerik bulunmaz. `[REDACTED]` gibi yer tutucular kullanılır.

---

## 1) Proje Amacı ve Kapsam

### Amaç
- SIEM loglarında gizlenen dolaylı prompt injection girişimlerini **deterministik kurallarla** yakalamak.
- LLM tabanlı SOC asistanlarının **manipülasyona** açık yüzeylerini korumak.
- Araştırma amaçlı, ölçülebilir ve denetlenebilir bir **pipeline** sunmak.

### Bu Proje **Ne Değildir**
- **Chatbot değildir.** Etkileşimli sohbet değil, veri işleme pipeline’ıdır.
- **Tam bir SIEM/EDR değildir.** Splunk/ELK/CrowdStrike gibi platformların yerine geçmez.
- **LLM karar motoru değildir.** Nihai güvenlik kararı **daima deterministiktir**.

---

## 2) Mimari Özet (Deterministik Otorite)

SOCGuard AI’nin temel prensibi **Deterministic Authority** yaklaşımıdır. LLM çıktıları **asla** son kararı vermez; kararlar sabit kurallarla verilir.

### Veri Akışı
1. **Raw Log Input**
2. **Preprocessing** (normalizasyon + çoklu decoding)
3. **Detection** (deterministik imza/kural eşleşmesi)
4. **Risk Scoring** (0‑100 risk skoru)
5. **Policy Engine** (BLOCK / HUMAN_REVIEW / ESCALATE / SAFE)
6. **Explainability** (kanıt + gerekçe)
7. **Çıktı** (`AnalysisResult`)

---

## 3) Çekirdek Modüller

> Modüllerin çoğu `src/modules/socguard/` altında konumlanır.

- **dataset**: Sentetik SIEM log setini yükler/sağlar.
- **preprocessing**: NFKC normalizasyonu, zero‑width temizliği, URL/HTML/Base64 çoklu çözümleme.
- **detection**: Regex/heuristik/keyword tabanlı deterministik tespit motoru.
- **scoring**: Bulgu ağırlıklarıyla 0‑100 risk skoru hesaplar.
- **policy**: Skor ve kritik bulgulara göre nihai aksiyon belirler.
- **explainability**: Kanıt ve karar gerekçesi üretir.
- **adversarial-lab**: Red/Blue/Judge araştırma kayıtları ve yönetişim.
- **agent-adapters**: V4 agent pipeline için arayüz/adapter katmanı.
- **rule-vault**: İnsan onaylı aday kayıtlarının saklandığı araştırma deposu.
- **rule-pack**: Versiyonlu kural paketleri ve test case’ler.
- **review-queue**: İnsan inceleme ve onay kuyruğu.
- **source-intelligence / threat-intel**: Kaynak istihbarat ve tehdit girdileri.
- **regression-runner**: Offline regresyon değerlendirme akışı.

---

## 4) V4 Agent Pipeline (Mock Varsayılan)

V4 mimarisi, LLM tabanlı ajanlarla entegre olmaya hazır bir yapı kurar; **varsayılan olarak MOCK** çalışır.

**Ajan Rollerinin Özeti**
- **Red Team Agent**: Sanitize edilmiş saldırı adayları üretir (çok dilli destek).
- **Blue Team Agent**: Deterministik savunma kuralları önerir.
- **Judge Agent**: Danışman niteliğinde değerlendirme yapar.
- **Curator Agent**: Çıktıları Rule Vault formatında paketler.

**Güvenlik Kuralları**
- Otomatik onay **yok**.
- İnsan incelemesi **zorunlu**.
- Üretim kural seti **değiştirilemez**.
- API anahtarları **sadece sunucu tarafı** ortam değişkenlerinde tutulur.

---

## 5) Veri Seti (Araştırma Amaçlı)

- **30 örnek**: 15 benign, 15 injected.
- **Kaynak çeşitliliği**: Web sunucuları, cloud audit, syslog, uygulama logları.
- **Zorluk seviyeleri**: EASY / MEDIUM / HARD.
- **Türkçe varyantlar** ve obfuscation örnekleri içerir.

**Kayıt alanları**
- `id`, `source`, `raw`, `difficulty`, `attackVector`

---

## 6) Arayüz Sayfaları (Next.js 14)

- `/` **Command Center**
- `/analyzer` **Log Analyzer**
- `/evaluation` **Benchmark Evaluation**
- `/v2` **Rule Intelligence**
- `/adversarial-lab` **Research Sandbox**
- `/agent-lab` **Agent Runner**
- `/rule-vault` **Candidate Registry**
- `/review-queue` **Promotion Queue**
- `/rule-packs` **Rule Bundles**
- `/audit` **Audit Trail**

**API**
- `/api/agent-lab/run-cycle`
- `/api/agent-lab/status`

---

## 7) Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (Next.js 14 uyumlu sürüm)

### Kurulum
```bash
npm install
```

### Geliştirme
```bash
npm run dev
```

### Üretim Build
```bash
npm run build
npm start
```

---

## 8) Komutlar

```bash
npm run dev    # geliştirme sunucusu
npm run build  # production build
npm start      # production server
npm run lint   # eslint (Next.js)
```

---

## 9) Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın. Varsayılan yapı **LLM ajanlarını kapalı** tutar.

Örnek alanlar:
- `ENABLE_LLM_AGENTS=false`
- `ALLOW_AUTO_APPROVAL=false`
- `REQUIRE_HUMAN_REVIEW=true`
- `LLM_PROVIDER`, `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY`

> API anahtarlarını **asla** frontend’e koymayın. Sadece sunucu tarafında kullanılmalıdır.

---

## 10) Dizin Yapısı (Özet)

```
SOCGuard-AI/
├─ docs/                 # Mimari ve araştırma dokümantasyonu
├─ src/
│  ├─ app/               # Next.js App Router sayfaları
│  ├─ components/        # UI bileşenleri
│  └─ modules/socguard/  # Tespit, scoring, policy, lab, vault, vb.
├─ test_goruntuleri/     # Görseller
├─ package.json
└─ README.md
```

---

## 11) Yönetişim ve Güvenlik İlkeleri

- **İnsan onayı zorunlu**: Ajanlar tek başına kural onaylayamaz.
- **Üretime otomatik mutasyon yok**: Rule Vault sadece araştırma deposudur.
- **Deterministik karar**: Nihai karar LLM’e devredilmez.
- **Sanitize edilmiş içerik**: Zararlı içerikler kayıt altına alınmaz.

---

## 12) Sınırlamalar

- **Üretime hazır değildir** (araştırma PoC).
- **Deterministik imzalar** yaratıcı/parafraz saldırıları kaçırabilir.
- **Stateless** çalışır (loglar tekil analiz edilir).
- **İngilizce ağırlıklı optimizasyon** (çok dilli destek gelişmektedir).

---

## 13) Ek Dokümantasyon

`docs/` klasöründe ayrıntılı teknik belgeler bulunur:
- Architecture, Preprocessing, Detection Engine
- Risk Scoring, Policy Engine, Explainability
- Adversarial Lab, Red/Blue/Judge Workflow
- Rule Vault & Rule Pack Format
- V4 Agent Pipeline

---

## 14) Lisans

Araştırma amaçlı kullanım için. (C) 2024 SOCGuard AI Team.
