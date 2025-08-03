// File: Main.gs

/**
 * Dipicu saat formulir disubmit atau secara manual.
 * Ini adalah fungsi utama yang mengatur alur program.
 * @param {Object} e Event object (jika dipicu oleh form submit)
 */
function onFormSubmit(e) {
  const config = getConfig();

  try {
    // 1. Ambil data dari baris terakhir di spreadsheet "Pesanan".
    const orderData = getLatestOrderData();
    
    // 2. Lakukan validasi dasar pada data yang diterima.
    const { NOMOR_PESANAN, EMAIL_PEMBELI, NAMA_TOKO, SKU_DIBELI } = config.COL_INDEX.PESANAN;
    
    if (!orderData[NOMOR_PESANAN] || !orderData[EMAIL_PEMBELI] || !orderData[NAMA_TOKO] || !orderData[SKU_DIBELI]) {
      throw new Error("Data pesanan di spreadsheet tidak lengkap.");
    }
    
    const nomorPesanan = orderData[NOMOR_PESANAN];
    const namaPembeli = orderData[config.COL_INDEX.PESANAN.NAMA_PEMBELI];
    const namaToko = orderData[NAMA_TOKO];
    const emailPembeli = orderData[EMAIL_PEMBELI];
    const skuDibeli = orderData[SKU_DIBELI];
    
    const produkDibeliList = skuDibeli.split(',').map(sku => sku.trim());

    // 3. Ambil detail produk dari sheet "Daftar Produk"
    const produkDetailList = getProductsBySKU(produkDibeliList);

    if (!produkDetailList || produkDetailList.length === 0) {
      throw new Error(`Tidak ada produk ditemukan untuk SKU: ${produkDibeliList.join(', ')}`);
    }

    // 4. Berikan akses Google Drive kepada pembeli untuk setiap produk.
    const driveAccessResult = grantAccessToProducts(emailPembeli, produkDetailList);

    // 5. Buat dan kirim email ke pembeli.
    const emailSent = sendOrderConfirmationEmail({
      nomorPesanan: nomorPesanan,
      namaToko: namaToko,
      emailPembeli: emailPembeli,
      namaPembeli: namaPembeli,
      driveAccessResult: driveAccessResult,
    });

    // 6. Update status di spreadsheet dan arsipkan.
    if (emailSent) {
      updateOrderStatus('Terkirim');
      archiveAndRemoveRow();
    } else {
      throw new Error("Email gagal dikirim.");
    }

  } catch (e) {
    Logger.log(`[ERROR] Terjadi kesalahan dalam alur program: ${e.message}`);
    updateOrderStatus(`Gagal: ${e.message}`);
  }
}
