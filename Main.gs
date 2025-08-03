// File: Main.gs

/**
 * Dipicu saat formulir disubmit atau secara manual.
 * Ini adalah fungsi utama yang mengatur alur program.
 * @param {Object} e Event object (jika dipicu oleh form submit)
 */
function onFormSubmit(e) {
  const config = getConfig();
  let orderData;

  try {
    // 1. Ambil data dari baris terakhir di spreadsheet "Pesanan".
    if (e) {
      orderData = e.namedValues;
    } else {
      orderData = getLatestOrderData();
    }
    
    // 2. Lakukan validasi dasar pada data yang diterima.
    const { NOMOR_PESANAN, EMAIL_PEMBELI, NAMA_TOKO, SKU_DIBELI } = config.COL_INDEX.PESANAN;
    const requiredColumns = [NOMOR_PESANAN, EMAIL_PEMBELI, NAMA_TOKO, SKU_DIBELI];
    
    // Jika data dari event form (e)
    if (e) {
      const keys = Object.keys(e.namedValues);
      if (!keys.includes(config.FORM_OPTIONS.NAMA_TOKO) || !keys.includes('Email Pembeli') || !keys.includes('SKU Dibeli')) {
          throw new Error("Data formulir tidak lengkap.");
      }
    } else { // Jika data dari spreadsheet
      if (!orderData[NOMOR_PESANAN] || !orderData[EMAIL_PEMBELI] || !orderData[NAMA_TOKO] || !orderData[SKU_DIBELI]) {
        throw new Error("Data pesanan di spreadsheet tidak lengkap.");
      }
    }
    
    const nomorPesanan = orderData[NOMOR_PESANAN];
    const namaToko = orderData[NAMA_TOKO];
    const emailPembeli = orderData[EMAIL_PEMBELI];
    const skuDibeli = orderData[SKU_DIBELI];
    
    // Periksa apakah skuDibeli adalah string atau array, lalu proses
    const produkDibeliList = Array.isArray(skuDibeli)
      ? skuDibeli[0].split(',').map(sku => sku.trim())
      : skuDibeli.split(',').map(sku => sku.trim());

    // 3. (Tahap API Shopee yang akan kita tambahkan nanti)

    // 4. Ambil detail produk dari sheet "Daftar Produk"
    const produkDetailList = getProductsBySKU(produkDibeliList);

    if (!produkDetailList || produkDetailList.length === 0) {
      throw new Error(`Tidak ada produk ditemukan untuk SKU: ${produkDibeliList.join(', ')}`);
    }

    // 5. Berikan akses Google Drive kepada pembeli untuk setiap produk.
    const driveAccessResult = grantAccessToProducts(emailPembeli, produkDetailList);

    // 6. Buat dan kirim email ke pembeli.
    const emailSent = sendOrderConfirmationEmail({
      nomorPesanan: nomorPesanan,
      namaToko: namaToko,
      emailPembeli: emailPembeli,
      namaPembeli: orderData[config.COL_INDEX.PESANAN.NAMA_PEMBELI],
      driveAccessResult: driveAccessResult,
    });

    // 7. Update status di spreadsheet dan arsipkan.
    if (emailSent) {
      updateOrderStatus('Terkirim');
      archiveAndRemoveRow();
    } else {
      throw new Error("Email gagal dikirim.");
    }

  } catch (e) {
    Logger.log(`[ERROR] Terjadi kesalahan dalam alur program: ${e.message}`);
    // Jika error terjadi, update status di spreadsheet
    updateOrderStatus(`Gagal: ${e.message}`);
  }
}