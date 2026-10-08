# PatimiKoru

Moenia ve GeoKeşif gibi `dist` klasöründen sunulan web sitesi. Mevcut tasarım, günlük görevler, topluluk akışı, dostlar, Pati mağazası, hafıza oyunu ve profil ekranları korunur.

## Açma

`BASLAT.cmd` dosyasına çift tıklayın. Site tarayıcıda **http://127.0.0.1:4175** adresinde açılır. Sunucuyu kapatmak için açılan pencerede Ctrl+C kullanın. Pati, Moenia ve GeoKeşif'in kullandığı 4173 portundan ayrı çalışır.

Node.js 18 veya üstü gerekir. Başlatıcı, Node.js komutu bulunmazsa bu bilgisayardaki Codex Node.js ortamını da kontrol eder. Paket kurulumu gerekmez.

## Dosyalar

```text
pati/
  dist/                  Yayına hazır site
    index.html
    style.css
    script.js
    enhancements.js
    assets/
      pati-dostlari.png
  index.html             Düzenlenebilir kaynaklar
  style.css
  script.js
  enhancements.js
  assets/
  build.cjs              Kaynaklardan dist üretir
  server.cjs             dist klasörünü sunar
  BASLAT.cmd             Siteyi açar
  DERLE.cmd              dist klasörünü yeniler
  package.json
```

Kaynakları değiştirdikten sonra `DERLE.cmd` dosyasını açın. Alternatif olarak `node build.cjs` veya `npm run build` kullanabilirsiniz. Sunucu için `node server.cjs` ya da `npm start` kullanılabilir. Başka port için PowerShell'de `$env:PORT=4180; node server.cjs` çalıştırın.

## Yayınlama

Statik site barındırma hizmetine **dist klasörünün içeriğini** yükleyin. Yayında Node.js sunucusu zorunlu değildir. Dosya yolları göreli olduğundan site bir alt klasörden de sunulabilir.

## Bağlantı ve önizleme

“Önce bir göz at” ile açılan önizleme; görev, paylaşım, sohbet, mağaza ve oyun işlemlerini bu tarayıcının yerel depolamasında tutar. Örnek içerikler gerçek kullanıcılara gönderilmez.

Mevcut Firebase bağlantısı ve hesap akışları korunmuştur. Gerçek hesaplar ve topluluk işlemleri Firebase hizmetine ve projedeki erişim kurallarına bağlıdır. Firebase, Google Fonts, Font Awesome ve avatar hizmeti internet gerektirir; site görseli dist içinde yereldir. Bu paketleme çalışmasında gerçek hesap oluşturma veya dış hizmetlere yazma yapılmaz.
