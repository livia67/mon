# 🚀 Setup Guide - Olivia AI Assistant

## 📋 Langkah-langkah Setup

### 1. Environment Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit file .env.local** dan isi dengan credentials Anda:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-key
   GEMINI_API_KEY=your-actual-gemini-key
   TELEGRAM_BOT_TOKEN=your-actual-bot-token
   ```

### 2. Mendapatkan API Keys

#### 🔑 OpenAI API Key
1. Kunjungi: https://platform.openai.com/api-keys
2. Login atau daftar akun OpenAI
3. Klik "Create new secret key"
4. Copy key yang dimulai dengan `sk-`
5. Paste ke `OPENAI_API_KEY` di .env.local

#### 🔮 Gemini API Key (Opsional)
1. Kunjungi: https://makersuite.google.com/app/apikey
2. Login dengan Google account
3. Klik "Create API Key"
4. Copy key yang diberikan
5. Paste ke `GEMINI_API_KEY` di .env.local

#### 🤖 Telegram Bot Token
1. Buka Telegram dan cari @BotFather
2. Ketik `/newbot`
3. Ikuti instruksi untuk memberi nama bot
4. Copy token yang diberikan (format: 1234567890:ABC...)
5. Paste ke `TELEGRAM_BOT_TOKEN` di .env.local

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan Aplikasi

#### Web Application:
```bash
npm run dev
```
Akses di: http://localhost:3000

#### Telegram Bot:
```bash
npm run bot:dev
```
Bot akan aktif di Telegram

### 5. Testing

1. **Test Web App**: Buka browser dan coba chat
2. **Test Telegram Bot**: Cari bot di Telegram dan ketik `/start`

## 🔧 Konfigurasi Lanjutan

### Environment Variables Explained

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `OPENAI_API_KEY` | API key OpenAI (wajib) | - |
| `GEMINI_API_KEY` | API key Gemini (opsional) | - |
| `TELEGRAM_BOT_TOKEN` | Token bot Telegram | - |
| `DEFAULT_MODEL` | Model AI default | gpt-3.5-turbo |
| `DEFAULT_PERSONA` | Persona default | profesional |
| `MAX_TOKENS` | Maksimal token response | 2000 |
| `TEMPERATURE` | Kreativitas AI (0-1) | 0.7 |

### Production Setup

1. **Copy production config**:
   ```bash
   cp .env.production .env.local
   ```

2. **Update values** untuk production
3. **Deploy ke Vercel**:
   ```bash
   npm run deploy
   ```

## 🚨 Troubleshooting

### Common Issues

**❌ "API key not found"**
- Pastikan .env.local ada dan berisi API key yang benar
- Restart aplikasi setelah mengubah .env

**❌ "Bot not responding"**
- Cek TELEGRAM_BOT_TOKEN benar
- Pastikan bot sudah di-start dengan /start

**❌ "Quota exceeded"**
- Cek billing OpenAI account
- Gunakan model yang lebih murah (gpt-3.5-turbo)

**❌ "CORS error"**
- Update CORS_ORIGIN di .env untuk domain Anda

### Debug Mode

Enable debug untuk troubleshooting:
```env
ENABLE_DEBUG=true
LOG_LEVEL=debug
```

## 🔒 Security Best Practices

1. **Never commit .env files** to git
2. **Use different API keys** for dev/prod
3. **Set billing limits** di OpenAI dashboard
4. **Monitor API usage** regularly
5. **Rotate API keys** secara berkala

## 📞 Support

Jika mengalami masalah:
1. Cek file log untuk error details
2. Pastikan semua dependencies terinstall
3. Verify API keys valid dan memiliki quota
4. Restart aplikasi setelah config changes

---

**✅ Setup Complete!** Olivia AI Assistant siap digunakan! 🎉