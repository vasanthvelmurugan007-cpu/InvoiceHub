# 🚀 Deployment Guide - InvoiceHub

Your application is fully prepared for production deployment. It is built as a **Monolithic Node.js Application**: the Node.js backend serves both the API and the React frontend.

## 1. Quick Deploy (Render / Railway / Heroku)
The easiest way to deploy this app to the cloud is using platforms like Render or Railway. The root `package.json` is already configured for automatic deployments!

1. Push this entire folder to a **GitHub Repository**.
2. Go to [Render](https://render.com/) or [Railway](https://railway.app/).
3. Create a new **Web Service** and connect your GitHub repository.
4. Set the following Build and Start commands (often detected automatically):
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. **Environment Variables:** Add the following to your cloud provider's dashboard:
   - `JWT_SECRET` = (Generate a long, random string. Do not lose it!)
   - `NODE_ENV` = `production`
6. Click **Deploy**. That's it!

*(Note: On PaaS platforms with ephemeral storage like Heroku or Render Free Tier, your SQLite database may reset on restart. For serious production, use a persistent disk/volume attached to the `/database` folder).*

## 2. Manual VPS Deployment (AWS EC2, DigitalOcean, Linode)
If you are deploying to a dedicated server or VPS (Ubuntu/Linux):

1. **Install Node.js (v18+)** on your server.
2. Clone your repository or upload the files to your server (e.g., to `/var/www/invoice-hub`).
3. **Set up Environment Variables**:
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_complex_string_here
   NODE_ENV=production
   ```
4. **Install Dependencies & Build**:
   ```bash
   # From the root directory of the project
   npm install
   npm run build
   ```
5. **Start the Application using PM2**:
   PM2 keeps the app running forever and restarts it if it crashes.
   ```bash
   npm install -g pm2
   pm2 start npm --name "invoice-hub" -- start
   pm2 save
   pm2 startup
   ```
6. **Reverse Proxy (Nginx)**: 
   Set up Nginx to point port 80/443 to `localhost:5000` to serve the app on a custom domain with SSL.

## 3. Desktop App Mode (Offline Mode)
If you want to use or sell this as offline, local software:
1. Ensure the customer has Node.js installed.
2. Double-click the provided `Launch_App.bat` script.
   - It automatically starts the local server.
   - It automatically opens their default web browser to the app.

## Summary of Useful Commands (Run from Project Root)
* `npm run build` - Installs all dependencies for both client & server, and builds the React app.
* `npm start` - Starts the production Node.js server.
* `npm run install-app` - Only installs dependencies without building.
