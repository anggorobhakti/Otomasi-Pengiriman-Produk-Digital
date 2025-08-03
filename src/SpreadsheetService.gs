// File: SpreadsheetService.gs

/**
 * Mendapatkan objek spreadsheet utama berdasarkan ID dari Config.gs.
 * Fungsi ini digunakan di semua operasi spreadsheet.
 */
function getSpreadsheet() {
  const config = getConfig();
  const ssId = config.PESANAN_SS_ID;
  if (!ssId) {
    throw new Error('ID Spreadsheet tidak ditemukan di Config.gs');
  }
  return SpreadsheetApp.openById(ssId);
}

/**
 * Mendapatkan data dari baris terakhir di sheet "Pesanan".
 * @returns {Array<any>} Objek yang berisi data dari baris terakhir.
 */
function getLatestOrderData() {
  const config = getConfig();
  const ss = getSpreadsheet();
  const sheetPesanan = ss.getSheetByName(config.SHEET_NAME.PESANAN);
  
  const lastRow = sheetPesanan.getLastRow();
  if (lastRow < 2) {
    throw new Error("Tidak ada data pesanan baru untuk diproses.");
  }
  
  const lastColumn = sheetPesanan.getLastColumn();
  const dataPesananRow = sheetPesanan.getRange(lastRow, 1, 1, lastColumn).getValues();
  return dataPesananRow[0];
}

/**
 * Mengambil detail produk dari sheet "Daftar Produk" berdasarkan SKU.
 * @param {Array<string>} skuList - Array berisi SKU produk yang dibeli.
 * @returns {Array<Object>} Array objek yang berisi detail produk.
 */
function getProductsBySKU(skuList) {
  const config = getConfig();
  const ss = getSpreadsheet();
  const sheetDaftarProduk = ss.getSheetByName(config.SHEET_NAME.DAFTAR_PRODUK);
  
  const dataProduk = sheetDaftarProduk.getDataRange().getValues();
  dataProduk.shift(); // Hapus header
  
  const productDetails = [];
  for (const sku of skuList) {
    const detail = dataProduk.find(row => 
      row[config.COL_INDEX.DAFTAR_PRODUK.SKU_PRODUK] &&
      row[config.COL_INDEX.DAFTAR_PRODUK.SKU_PRODUK].toString().trim().toLowerCase() === sku.toLowerCase()
    );

    if (detail) {
      productDetails.push({
        sku: detail[config.COL_INDEX.DAFTAR_PRODUK.SKU_PRODUK],
        nama: detail[config.COL_INDEX.DAFTAR_PRODUK.NAMA_PRODUK],
        fileId: detail[config.COL_INDEX.DAFTAR_PRODUK.FILE_ID],
        type: detail[config.COL_INDEX.DAFTAR_PRODUK.TYPE],
      });
    } else {
      productDetails.push({
        sku: sku,
        nama: `[Maaf, terjadi kesalahan saat memproses produk Anda. Mohon hubungi kami melalui Chat Toko Shopee.]`,
        fileId: null,
        type: null,
      });
      Logger.log(`SKU "${sku}" tidak ditemukan di sheet Daftar Produk.`);
    }
  }
  return productDetails;
}

/**
 * Memperbarui kolom status dan timestamp pada baris terakhir di sheet "Pesanan".
 * @param {string} status - Status yang akan diisikan.
 */
function updateOrderStatus(status) {
  const config = getConfig();
  const ss = getSpreadsheet();
  const sheetPesanan = ss.getSheetByName(config.SHEET_NAME.PESANAN);
  const lastRow = sheetPesanan.getLastRow();
  
  sheetPesanan.getRange(lastRow, config.COL_INDEX.PESANAN.TINDAKAN + 1).setValue(status);
  sheetPesanan.getRange(lastRow, config.COL_INDEX.PESANAN.TIMESTAMP_TINDAKAN + 1).setValue(new Date());
}

/**
 * Mengarsipkan baris terakhir ke spreadsheet arsip dan menghapusnya dari spreadsheet utama.
 */
function archiveAndRemoveRow() {
  const config = getConfig();
  const ss = getSpreadsheet();
  const sheetPesanan = ss.getSheetByName(config.SHEET_NAME.PESANAN);
  
  const lastRow = sheetPesanan.getLastRow();
  const lastColumn = sheetPesanan.getLastColumn();
  
  // Ambil baris terakhir
  const rowToArchive = sheetPesanan.getRange(lastRow, 1, 1, lastColumn).getValues();
  
  try {
    const archiveSs = SpreadsheetApp.openById(config.ARCHIVE_SS_ID);
    let archiveSheet = archiveSs.getSheetByName(config.SHEET_NAME.PESANAN);
    
    // Jika sheet arsip belum ada, buat baru dan salin header
    if (!archiveSheet) {
      archiveSheet = archiveSs.insertSheet(config.SHEET_NAME.PESANAN);
      const headers = sheetPesanan.getRange(1, 1, 1, lastColumn).getValues()[0];
      archiveSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // Arsipkan baris
    archiveSheet.appendRow(rowToArchive[0]);
    
    // Hapus baris dari sheet utama
    sheetPesanan.deleteRow(lastRow);
    
    Logger.log(`Baris berhasil diarsipkan dan dihapus.`);
  } catch (e) {
    Logger.log(`Gagal mengarsipkan baris: ${e.message}`);
    updateOrderStatus(`Gagal Arsip: ${e.message}`);
  }
}
