// File: Secrets.gs.example

/**
 * Fungsi ini berfungsi sebagai template untuk menyimpan data rahasia proyek.
**/

function setSecrets() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    // --- Alamat Email Pengirim ---
    'EMAIL_TOKO_A': 'nama1@domain.com',
    'EMAIL_TOKO_B': 'nama2@domain.com',
  });
  Logger.log('Data rahasia berhasil disimpan!');
}