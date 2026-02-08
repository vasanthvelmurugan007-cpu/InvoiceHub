# 🚀 Deployment Guide - InvoiceHub SaaS

Your application is now ready for production! It is built as a **Monolithic Node.js Application**: the backend serves the frontend.

## 1. Prerequisites
- A server (VPS like AWS EC2, DigitalOcean Droplet, or Linode) or a PaaS (Render, Railway, Heroku).
- Node.js (v18+) installed.

## 2. Environment Setup
Create a `.env` file in the `server/` directory with the following keys. **CHANGE THESE VALUES FOR PRODUCTION!**

```env
PORT=5000
JWT_SECRET=complex_random_string_here_at_least_32_chars
NODE_ENV=production
```

## 3. Directory Structure
Ensure your server looks like this:
```
/app
  /client
    /dist       <-- (The built React files I just created)
  /server
    index.js
    package.json
    ...
```

## 4. How to Run (Production)
1. Navigate to the server directory:
   ```bash
   cd server
   npm install --production
   ```
2. Start the application:
   ```bash
   npm start
   ```
   
Your app will be live on `http://YOUR_SERVER_IP:5000`.

## 5. Process Management (Keep it running)
Use `pm2` to keep the app running forever:
```bash
npm install -g pm2
pm2 start index.js --name "invoice-hub"
```

## 6. Desktop Mode (Optional)
If you want to sell this as offline software:
1. Simply package this entire folder.
2. Create a batch file `Launch.bat`:
   ```bat
   @echo off
   start http://localhost:5000
   cd server
   node index.js
   ```
