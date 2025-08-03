# Proyek Otomasi Pengiriman Produk Digital

Proyek ini adalah solusi otomatisasi alur kerja untuk memproses pesanan produk digital dari Google Forms, memberikan akses produk via Google Drive, dan mengirim email yang berisi tautan unduhan produk kepada pelanggan secara otomatis.

### 💡 Masalah yang Diselesaikan

Memproses pesanan produk digital secara manual membutuhkan banyak langkah berulang dan rawan kesalahan. Proses seperti menginput nama produk, mencari link unduhan, dan menyalin template email sangat memakan waktu. Jika ada banyak pesanan, risiko *human error* meningkat, yang bisa menyebabkan produk salah kirim.

### 🚀 Solusi Otomatisasi

Saya membangun solusi *serverless* menggunakan Google Apps Script yang mengotomatiskan seluruh alur kerja ini:

1.  **Input Pesanan**: Data pesanan masuk melalui Google Forms yang terhubung ke Google Sheets.
2.  **Ambil Data Produk**: Skrip mengambil detail produk (nama, File ID Drive) dari Google Sheets berdasarkan SKU yang dibeli.
3.  **Berikan Akses Instan**: Akses *viewer* ke file atau folder Google Drive diberikan secara otomatis kepada email pembeli.
4.  **Kirim Email Otomatis**: Email profesional yang berisi tautan unduhan produk dikirim dari alias toko yang sesuai.
5.  **Manajemen Pesanan**: Pesanan yang berhasil diproses diarsipkan ke spreadsheet terpisah.

### ✨ Fitur Utama

* **Integrasi Penuh**: Terhubung dengan Google Forms, Sheets, Drive, dan Gmail.
* **Keamanan Data**: Menggunakan `PropertiesService` untuk menyimpan data rahasia (seperti alamat email pengirim) secara aman.
* **Template Email Profesional**: Menggunakan template HTML dengan *inline styling* untuk tampilan email yang konsisten di berbagai klien.
* **Penanganan Kesalahan**: Dirancang untuk menangani kegagalan (SKU tidak ditemukan, File ID Drive salah) tanpa menghentikan seluruh program.

### 🛠️ Teknologi yang Digunakan

* **Google Apps Script**
* **Google Sheets API**
* **Google Drive API**
* **Gmail API**

### ⚙️ Cara Menggunakan (Petunjuk)

1.  **Siapkan Spreadsheet**: Buat Google Form baru dan sambungkan dengan Google Spreadsheet baru. Ini akan menjadi basis utama proyek.
2.  **Buat File Skrip**: Buka `Ekstensi > Apps Script` dari Spreadsheet Anda. Buat file baru dan salin semua kode (`.gs` dan `.html`) ke dalamnya.
3.  **Siapkan Data Rahasia**: Buat file **`Secrets.gs`** dengan menyalin konten dari `Secrets.gs.example` dan mengganti nilai-nilai *placeholder* dengan data rahasia Anda.
4.  **Simpan Rahasia**: Jalankan fungsi `setSecrets()` satu kali untuk menyimpan data rahasia Anda.
5.  **Aktifkan Otomatisasi**: Jalankan fungsi `setupFormTrigger()` untuk mengaktifkan *trigger* yang akan memproses setiap entri formulir secara otomatis.

---
