// File: EmailService.gs

/**
 * Mengirim email konfirmasi pesanan kepada pembeli.
 * @param {Object} data - Objek berisi semua data untuk email.
 * @returns {boolean} True jika email berhasil dikirim, False jika gagal.
 */
function sendOrderConfirmationEmail(data) {
  const config = getConfig();
  const scriptProperties = PropertiesService.getScriptProperties();

  // Ambil email pengirim dari Secrets dan bersihkan
  const emailTokoA = scriptProperties.getProperty('EMAIL_TOKO_A');
  const emailTokoB = scriptProperties.getProperty('EMAIL_TOKO_B');

  // Tentukan email pengirim dan link toko berdasarkan nama toko
  let emailPengirim;
  let linkTokoShopee;
  if (data.namaToko.toLowerCase().includes(config.FORM_OPTIONS.TOKO_NAMA_B.toLowerCase())) {
    emailPengirim = emailTokoB;
    linkTokoShopee = 'https://shopee.co.id/namatokob';
  } else { // Default ke Toko A
    emailPengirim = emailTokoA;
    linkTokoShopee = 'https://shopee.co.id/namatokoa';
  }

  // Buat HTML untuk daftar produk
  const daftarProdukDanLinkHtml = createProductListHtml(data.driveAccessResult);
  
  // Ambil template HTML dari file sebagai string biasa
  let finalHtmlBody = getHtmlTemplateAsString('EmailTemplate');

  // Ganti placeholder dengan metode replace()
  finalHtmlBody = finalHtmlBody
    .replace(/{{nama_pembeli}}/g, data.namaPembeli)
    .replace(/{{nomor_pesanan}}/g, data.nomorPesanan)
    .replace(/{{nama_toko}}/g, data.namaToko)
    .replace(/{{link_toko_shopee}}/g, linkTokoShopee)
    .replace(/{{daftar_produk_dan_link}}/g, daftarProdukDanLinkHtml)
    .replace(/{{ACCENT_COLOR_1}}/g, '#007bff')
    .replace(/{{ACCENT_COLOR_2}}/g, '#28a745')
    .replace(/{{BG_SECONDARY}}/g, '#f7f7f7');

  // Kirim email
  try {
    GmailApp.sendEmail(
      data.emailPembeli,
      `[${data.namaToko}] Pesanan #${data.nomorPesanan} Anda Telah Diproses`,
      '',
      {
        htmlBody: finalHtmlBody,
        name: data.namaToko,
        from: emailPengirim
      }
    );
    Logger.log(`Email berhasil dikirim ke ${data.emailPembeli} dari ${emailPengirim}.`);
    return true;
  } catch (e) {
    Logger.log(`Gagal mengirim email ke ${data.emailPembeli}: ${e.message}`);
    return false;
  }
}

/**
 * Fungsi pembantu untuk membuat daftar produk dalam format HTML.
 * @param {Array<Object>} driveAccessResult - Hasil dari pemberian akses Google Drive.
 * @returns {string} String HTML dari daftar produk.
 */
function createProductListHtml(driveAccessResult) {
  let html = '';

  driveAccessResult.forEach(produk => {
    // === SKENARIO 1: Produk tidak ditemukan di database ===
    // Nama produk adalah pesan error.
    if (produk.nama && produk.nama.includes('[Maaf, terjadi kesalahan saat memproses produk Anda')) {
      html += `
      <tr>
        <td style="padding-bottom: 5px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right: 5px;">
                <span style="color: #FF0000; font-weight: bold; font-size: 16px; line-height: 1.2;">&#9679;</span>
              </td>
              <td valign="top" style="font-size: 16px; line-height: 1.2; color: #333333;">
                ${produk.nama}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    }
    // === SKENARIO 2: Produk ditemukan, tapi link gagal ===
    // Nama produk valid, tapi link tidak bisa diakses.
    else if (produk.link && produk.link.includes('[Link unduhan tidak tersedia')) {
      html += `
      <tr>
        <td style="padding-bottom: 5px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right: 5px;">
                <span style="color: #FF0000; font-weight: bold; font-size: 16px; line-height: 1.2;">&#9679;</span>
              </td>
              <td valign="top" style="font-size: 16px; line-height: 1.2; color: #333333;">
                ${produk.nama}
              </td>
            </tr>
            <tr>
              <td valign="top" style="padding-right: 5px;"></td>
              <td valign="top" style="font-size: 16px; line-height: 1.2; color: #333333;">
                [Link unduhan tidak tersedia. Mohon hubungi kami.]
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    }
    // === SKENARIO 3: Produk dan Link Berhasil ===
    else {
      html += `
      <tr>
        <td style="padding-bottom: 5px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td valign="top" style="padding-right: 5px;">
                <span style="color: #007bff; font-weight: bold; font-size: 16px; line-height: 1.2;">&#9679;</span>
              </td>
              <td valign="top" style="font-size: 16px; line-height: 1.2; color: #333333;">
                ${produk.nama}
              </td>
            </tr>
            <tr>
              <td valign="top" style="padding-right: 5px;"></td>
              <td valign="top" style="font-size: 16px; line-height: 1.2; color: #333333;">
                Unduh via: <a href="${produk.link}" style="color: #007bff; text-decoration: none;"><strong>Google Drive</strong></a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    }
  });

  return html;
}
