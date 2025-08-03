// File: Config.gs

/**
 * Mengembalikan objek konfigurasi global untuk proyek.
 * Ini adalah satu-satunya tempat untuk menyimpan konstanta.
 */
function getConfig() {
  return {
    // ID Spreadsheet
    PESANAN_SS_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
    ARCHIVE_SS_ID: 'your_archive_spreadsheet_id', // Contoh: '1ABCxyz...'

    // Nama Sheet (Tab)
    SHEET_NAME: {
      PESANAN: 'Pesanan',
      DAFTAR_PRODUK: 'Daftar Produk',
    },

    // Indeks Kolom Spreadsheet
    COL_INDEX: {
      PESANAN: {
        TIMESTAMP: 0,
        NOMOR_PESANAN: 1,
        NAMA_PEMBELI: 2,
        EMAIL_PEMBELI: 3,
        SKU_DIBELI: 4,
        NAMA_TOKO: 5,
        TINDAKAN: 6,
        TIMESTAMP_TINDAKAN: 7,
      },
      DAFTAR_PRODUK: {
        SKU_PRODUK: 0,
        NAMA_PRODUK: 1,
        FILE_ID: 2,
        TYPE: 3,
        CATEGORY: 4,
        // Tambahkan kolom lain di sini
      },
    },
    
    // Teks atau Pilihan Lain
    FORM_OPTIONS: {
      TOKO_NAMA_A: 'Nama Toko A',
	  TOKO_NAMA_B: 'Nama Toko B',
      // Anda bisa tambahkan indeks untuk sheet lain di sini
    },
  };
}