# S4E.io Kayıt Modülü - Test Otomasyonu & Hata Denetimi 🛡️

Bu proje, **S4E.io** platformunun kayıt (Sign Up) modülü için hazırlanan; uçtan uca (E2E) fonksiyonel testleri, mantıksal hata keşiflerini ve kritik güvenlik denetimlerini içeren kapsamlı bir otomasyon çalışmasıdır.

## 🚀 Kullanılan Teknolojiler (Tech Stack)
* **Dil:** JavaScript
* **Framework:** Playwright (E2E Automation) 
* **IDE:** Visual Studio Code
* **Testi Yapan:** Öner Efe Güngör

## 📂 Proje Yapısı
```text
s4e-reg-module-automated-test/
├── .github/workflows/     # CI/CD süreçleri için GitHub Actions'ta deployement
├── assets/                # Hataların ekran görüntüleri (Bug Screenshots)
├── reports/               # Detaylı PDF Test Raporu
├── tests/                 # Playwright register test senaryosu (register.spec.js)
├── README.md              # Proje dökümantasyonu
├── package.json.lock      # Versiyon Kilidi(Çakışmaları önlemek için)
├── package.json           # Proje bağımlılıkları
└── playwright.config.js   # Playwright için global ayarlar
```

## 🛠️ Hızlı Başlangıç (Walkthrough)

Projeyi yerel ortamınızda test etmek için aşağıdaki adımları izleyebilirsiniz:

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/zer0dayf/s4e-reg-module-automated-test.git && cd s4e-reg-module-automated-test
2. **Gerekli Bağımlılıkları Yükleyin:**
   ```bash
   npm install
3. **Testleri Koşturun:**
   ```bash
   npx playwright test
   ```
   **Alternatif** olarak Playwright'ı  daha **temiz** bir görünüm için ve case'leri **tek tek** gözlemlemek için *"UI"* modunda da çalıştırabilirsiniz:
   
   ```bash
   npx playwright test --ui
   ```
5. **Raporu İnceleyin:**
   ```bash
   npx playwright show-report
   ```

## 📋 Test Senaryoları Özet Matrisi
Sistemin kararlılığını ölçmek için **10 farklı** senaryo koşturulmuştur:
| ID | Senaryo | Tür | Statü |
| :--- | :--- | :--- | :--- |
| **TC01** | Happy Path - Form Hazırlığı | Functional |**PASS**  |
| **TC02** | Şifre Görünürlüğü Kontrolü | Functional |**PASS** |
| **TC03** | E-posta Formatı Doğrulaması | Negative | **PASS**  |
| **TC04** | Zorunlu Alan Kontrolleri | Negative | **PASS**  |
| **TC05** | Şifre Alanlarının Senkronizasyonu | Edge Case (Logical) | **FAIL**  |
| **TC06** | Şifre Alanı Hatası Temizleme | Edge Case (State) | **FAIL**  |
| **TC07** | Şifreye Boşluk Karakteri Girdisi | Edge Case (Data) |**FAIL**|
| **TC08** | XSS Tabanlı Input Güvenliği | Edge Case (Security) |**FAIL**|
| **TC09** | Varsayılan Şifre Maskeleme | Functional |**PASS**|
| **TC10** | Sözleşme ve Gizlilik Onay Kutusu | Negative |**PASS**|

---


## 🔍 Kritik Bulgular ve Geliştirme Önerileri

### 1. Şifre Senkronizasyonu (TC05 & TC06)
* **Bulgu:** Sistem şifre eşleşmesini sadece **"Confirm Password"** üzerinden **tek yönlü** kontrol etmektedir.Bu durum, kullanıcı deneyimini (UX) **olumsuz** etkileyen yanıltıcı uyarılara yol açmaktadır.
* **Öneri:** **Real-time** çalışan çift yönlü bir senkronizasyon fonksiyonu geliştirilmelidir.

### 2. XSS Güvenlik Denetimi (TC08)
* **Bulgu:** E-posta alanına girilen **zararlı kodlar** frontend tarafında **sanitize edilmemekte** ve doğrudan işlenmektedir.
* **Öneri:** **Zero-Trust** prensibi uyarınca, veriler backend tarafına aktarılmadan **önce frontend katmanında** temizlenmelidir.

### 3. Veri Hijyeni (TC07)
* **Bulgu:** Şifre alanındaki baştaki **boşluklar (leading spaces)** otomatik olarak temizlenmemektedir.
* **Öneri:** Kullanıcı farkındalığını artırmak için boşluk kullanımı durumunda *kritik olmayan* bir uyarı mesajı eklenebilir.

---
