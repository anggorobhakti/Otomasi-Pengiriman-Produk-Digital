// File: Utilities.gs

/**
 * Mengambil properti dari PropertiesService.
 * Ini adalah fungsi pembantu untuk mempermudah pengambilan data rahasia.
 * @param {string} key - Kunci properti yang akan diambil.
 * @returns {string} Nilai properti.
 */
function getSecret(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * Fungsi untuk membuat menu kustom di Google Sheets.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Otomasi Produk')
      .addItem('Otorisasi Shopee', 'generateShopeeAuthUrl')
      .addItem('Jalankan Otomasi Terakhir', 'onFormSubmit')
      .addToUi();
}

/**
 * Fungsi untuk membuat trigger onFormSubmit otomatis.
 */
function setupFormTrigger() {
  const config = getConfig();
  const ssId = config.PESANAN_SS_ID;

  if (!ssId) {
    Logger.log("ERROR: ID Spreadsheet tidak ditemukan di Config.gs.");
    return;
  }
  
  const ss = SpreadsheetApp.openById(ssId);
  
  ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
  
  Logger.log('Trigger onFormSubmit berhasil dibuat.');
}

/**
 * Membersihkan string email dengan mengubahnya ke huruf kecil dan menghapus spasi.
 * @param {string} email - String email yang akan dibersihkan.
 * @returns {string} String email yang sudah bersih.
 */
function cleanEmailString(email) {
  if (email) {
    return email.toString().trim().toLowerCase();
  }
  return '';
}

/**
 * Fungsi pembantu yang dipanggil oleh tombol.
 * Ia akan memicu fungsi utama onFormSubmit.
 */
function onButtonClickTrigger() {
  onFormSubmit();
}

/**
 * Fungsi untuk menghapus semua trigger.
 */
function deleteTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  Logger.log('Semua trigger berhasil dihapus.');
}

/**
 * Membaca konten file HTML sebagai string.
 * @param {string} fileName - Nama file HTML.
 * @returns {string} Konten file HTML sebagai string.
 */
function getHtmlTemplateAsString(fileName) {
  try {
    const template = HtmlService.createTemplateFromFile(fileName);
    return template.getRawContent();
  } catch (e) {
    Logger.log(`ERROR: Gagal membaca file template HTML "${fileName}". Pastikan file ada dan namanya benar.`);
    throw new Error(`Template HTML tidak ditemukan: ${fileName}`);
  }
}
