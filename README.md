# 🤖 Discord Bot JS - SAMP

## 🚀 Cara Penggunaan (How to Use)

Ikuti langkah-langkah di bawah ini untuk memasang dan menjalankan bot di komputer lokal atau server Anda.

### 1. Clone Repositori
Langkah pertama, unduh project ini ke komputer atau server Anda:
```bash
git clone https://github.com/Neks4n/BOT-JS-For-SAMP.git
cd BOT-JS-For-SAMP
```

### 2. Instalasi Dependensi
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org) di komputer Anda. Jalankan perintah ini di terminal untuk mengunduh semua library yang dibutuhkan bot:
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (.env)
Bot ini memerlukan file konfigurasi rahasia bernama `.env` untuk menyimpan token penting dan akses database.

1. Buat file baru bernama `.env` di folder utama project.
2. Salin baris kode di bawah ini, lalu isi nilainya sesuai data Anda:

```env
TOKEN_BOT= BOT TOKEN
OWNER_ID= ID DICORD OWNER

#DATABASE
mysqlhost= database host/endpoin
mysqluser= database username
mysqlpass= database password
mysqldatabase= database name

#CLIENT
CLIENT_ID= #ID BOT
GUILD_ID= #ID SERVER

#ROLE ID
ROLE_REGISTER_ID= #IDROLE UNTUK USER YANG SUDAH TERVERIFIKASI
ROLE_REFUND_ID= #IDROLE UNTUK USER YANG SUDAH TERVERIFIKASI
```

> ⚠️ **Catatan Penting:** 
> * Ganti teks contoh di atas dengan data asli dari Discord Developer Portal dan database MySQL Anda.
> * Pastikan nama file adalah `.env` (bukan `env.txt` atau `.env.js`).

### 4. Menjalankan Bot
Setelah semua konfigurasi selesai dan database siap, nyalakan bot Anda dengan perintah:
```bash
npm start
```
*(Atau gunakan perintah `node index.js`).*

### 5. Menggunakan Bot
Setelah bot berhasil menyala silahkan gunakan perintah di bawah ini di channel yang akan di gunakan sebagai panel ucp server anda
```bash
n!initucp
```

---

Proyek ini bersifat open-source. Silakan modifikasi sesuai dengan kebutuhan server Anda!
