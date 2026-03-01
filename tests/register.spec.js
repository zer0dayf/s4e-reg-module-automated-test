import { test, expect } from '@playwright/test';


const SELECTORS = {
  email: '#auth-element-register-email',
  password: '#auth-element-register-password',
  passwordAgain: '#auth-element-register-password-again',
  termsCheck: '#register-is-term-check',
  registerBtn: '#auth-element-register-create-account-button',
  emailError: '#auth-element-register-email-helper-text',
  passError: '#auth-element-register-password-helper-text',
  passAgainError: '#auth-element-register-password-again-helper-text'
};

test.describe('S4E Registration Form - Client Side Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://app.s4e.io/sign-up');
  });

  // TC01: Happy Path
  test('TC01 - Happy Path: Button should be enabled with valid data', async ({ page }) => {
    await page.fill(SELECTORS.email, 'efe_test@onerefegungor.com');
    await page.fill(SELECTORS.password, 'Test123456!');
    await page.fill(SELECTORS.passwordAgain, 'Test123456!');
    await page.check(SELECTORS.termsCheck);
    
    // Cloudflare nedeniyle tıklamıyoruz, sadece aktif olduğunu doğruluyoruz
    await expect(page.locator(SELECTORS.registerBtn)).toBeEnabled();
  });

  // TC02: Password Visibility (Göz ikonuna basınca type'ın text olması)
  test('TC02 - Functional: Password visibility toggle', async ({ page }) => {
    await page.fill(SELECTORS.password, 'Sifre123');
    const eyeIcon = page.locator('button').filter({ has: page.locator('svg') }).first();
    await eyeIcon.click();
    const type = await page.getAttribute(SELECTORS.password, 'type');
    expect(type).toBe('text');
  });

  // TC03: Negative - Email Format
  test('TC03 - Negative: Show error for invalid email', async ({ page }) => {
    await page.fill(SELECTORS.email, 'gecersiz-email');
    await page.press(SELECTORS.email, 'Tab'); // Odağı kaydır
    
    await expect(page.locator(SELECTORS.emailError)).toBeVisible();
  });

test('TC04 - Negative: Required field warnings for all inputs', async ({ page }) => {
    // Kontrol edilecek tüm alanlar, hata ID'leri ve beklenen metinler
    const fields = [
      { 
        input: '#auth-element-register-email', 
        error: '#auth-element-register-email-helper-text', 
        text: 'Email is required' 
      },
      { 
        input: '#auth-element-register-password', 
        error: '#auth-element-register-password-helper-text', 
        text: 'Password is required' 
      },
      { 
        input: '#auth-element-register-password-again', 
        error: '#auth-element-register-password-again-helper-text', 
        text: 'Password again is required' 
      }
    ];

    for (const field of fields) {
      const input = page.locator(field.input);
      const error = page.locator(field.error);

      // 1. ADIM: Alana odaklan ve hiçbir şey yazmadan çık (Touch & Blur)
      await input.focus();
      await input.blur(); 
      
      // 2. ADIM: Hata mesajının DOM'da oluşmasını ve görünür olmasını bekle
      // MUI'nin bu div'i geç ekleme ihtimaline karşı waitFor kullanıyoruz.
      await error.waitFor({ state: 'visible', timeout: 5000 });
      
      // 3. ADIM: Hem görünürlüğü hem de içeriği doğrula
      await expect(error, `${field.input} uyarısı yanlış veya görünmüyor!`).toBeVisible();
      await expect(error).toHaveText(field.text);
    }

    // 4. ADIM: Final kontrol - Tüm alanlar hatalıyken buton pasif olmalı
    const registerBtn = page.locator('#auth-element-register-create-account-button');
    await expect(registerBtn).toBeDisabled();
    
    console.log("TC04: Tüm zorunlu alan uyarıları başarıyla doğrulandı. - register.spec.js:90");
  });

  // TC05: Edge Case - Sync Passwords Real-Time
test('TC05 - Edge Case: Sync Passwords Real-Time', async ({ page }) => {
    const passInput = page.locator(SELECTORS.password);
    const passAgainInput = page.locator(SELECTORS.passwordAgain);
    const emailInput = page.locator(SELECTORS.email);
    const errorMsg = page.locator(SELECTORS.passwordAgainError);

    const eyeButtons = page.locator('.MuiIconButton-edgeEnd');
    // Daha net gözlemlemek amacıyla şifreleri visible yaptık.
    await eyeButtons.first().click();
    await eyeButtons.nth(1).click();
    

    // 1. ADIM: Başlangıç şifrelerini gir
    await passInput.fill('Sifre123456!');
    await passAgainInput.fill('Sifre123456!');

    // 2. ADIM: İlk kutuyu değiştir
    await passInput.fill('Sifre12456a'); 
    console.log("Senkronizasyon bozuldu, görsel kontrol hazır. - register.spec.js:112");

    // 4. ADIM: Odağı değiştir (Validation tetikle)
    await emailInput.click();

    // BEKLENEN SONUÇ: Hata mesajı görünür olmalı
    await expect(errorMsg, 'BUG: Şifreler farklı olmasına rağmen uyuşmazlık uyarısı çıkmadı!').toBeVisible({
      timeout: 5000
    });
});

test('TC06 - Edge Case: Orijinal şifre düzeltildiğinde hata mesajı kaybolmalı', async ({ page }) => {
    const passInput = page.locator(SELECTORS.password);
    const passAgainInput = page.locator(SELECTORS.passwordAgain);
    const emailInput = page.locator(SELECTORS.email);
    
    const errorMsg = page.locator('.Mui-error, .MuiFormHelperText-root').first();
    
   // Daha net gözlemlemek amacıyla şifreleri visible yaptık.
    const eyeButtons = page.locator('.MuiIconButton-edgeEnd');
    await eyeButtons.first().click();
    await eyeButtons.nth(1).click();

    // 1. ADIM: Farklı şifreler gir
    await passInput.fill('Yanlis123456.');
    await passAgainInput.fill('Dogru123456.');
    
    // Odağı e-postaya çekerek doğrulamayı tetikle
    await emailInput.click();

    // 3. ADIM: HATA MESAJI KONTROLÜ
    await expect(page.getByText(/passwords.*match/i), 'Hata mesajı ekranda görünür olmalı!').toBeVisible({ timeout: 5000 });
    console.log("Adım 1: Hata mesajı görsel olarak doğrulandı. - register.spec.js:144");

    // 4. ADIM: İLK KUTUYU DÜZELTME (Focus -> Clear -> Fill)
    await passInput.focus();
    await passInput.fill(''); // Önce temizle
    await page.waitForTimeout(200); // MUI state'i yakalasın diye minik bir bekleme
    await passInput.fill('Dogru123456.'); 
    console.log("Adım 2: Orijinal şifre düzeltildi. - register.spec.js:151");

    // 5. ADIM: Tekrar odağı değiştir
    await emailInput.click();

    //  Şifreler real-time olarak sync ediliyorsa hata mesajı kaybolmalı.
    await expect(errorMsg, 'BUG: Şifreler eşitlenmesine rağmen hata mesajı kaybolmadı!').toBeHidden({ 
      timeout: 5000 
    });
});
  // TC07: Edge Case - Space Character
test('TC07 - Edge Case: Password space rejection/sanitization', async ({ page }) => {
    const passInput = page.locator(SELECTORS.password);
    const registerBtn = page.locator(SELECTORS.registerBtn);

    // SENARYO 1: Sadece boşluk girildiğinde buton pasif kalmalı
    await passInput.fill('               '); 
    await page.click(SELECTORS.email); // Odağı değiştir
    await expect(registerBtn, 'BUG: Sadece boşluk içeren şifre kabul edildi!').toBeDisabled();

    // SENARYO 2: Karakterlerin başındaki boşluklar sistem tarafından siliniyor mu?
    await passInput.fill('   Sifre123');
    const value = await page.inputValue(SELECTORS.password);
    
    // Eğer value hala '   Sifre123' ise (boşluklar duruyorsa) bu bir temizleme hatasıdır.
    expect(value, 'BUG: Baştaki boşluklar otomatik temizlenmedi!').not.toContain(' ');
});

  // TC08: Edge Case - Security (XSS Injection denemesine karşı "<script>" gibi zararlı yapılar input fieldda backende bırakılmadan önce sanitize edilmeli.
  test('TC08 - Security: XSS Sanitization in email field', async ({ page }) => {
    const xss = '<script>alert(1)</script>@gmail.com';
    await page.fill(SELECTORS.email, xss);
    
    const value = await page.inputValue(SELECTORS.email);
    // Ya girdi tamamen reddedilmeli ya da tagler temizlenmeli
    expect(value, 'ZAAFİYET İHTİMALİ: <script> gibi zararlı yapılar e-posta input alanında sanitize edilmiyor, backende bırakılıyor. ').not.toContain('<script>');
  });

  // TC09: Functional - Default Masking UX açısından önemli.
  test('TC09 - Functional: Default password masking', async ({ page }) => {
    const type = await page.getAttribute(SELECTORS.password, 'type');
    expect(type).toBe('password');
  });

  // TC10: Negative - Checkbox
  test('TC10 - Negative: Unchecked terms keeps button disabled', async ({ page }) => {
    await page.fill(SELECTORS.email, 'efe@test.com');
    await page.fill(SELECTORS.password, 'Sifre12345!');
    await page.fill(SELECTORS.passwordAgain, 'Sifre12345!');
    
    await page.uncheck(SELECTORS.termsCheck);
    
    await expect(page.locator(SELECTORS.registerBtn)).toBeDisabled();
  });

});