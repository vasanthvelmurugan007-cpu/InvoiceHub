# 🚀 InvoiceHub - Advanced Billing & SaaS Solution

**InvoiceHub** is a robust, monolithic billing and invoicing application designed for small businesses and freelancers. Built with a modern **React (Vite)** frontend and a **Node.js/Express** backend, it offers a seamless experience for managing invoices, inventory, vendors, and financial reports.

This project is production-ready and supports both **web deployment** (SaaS mode) and **desktop usage** (via packaged batches).

## ✨ Key Features

### 💼 Business Operations
*   **Smart Dashboard**: Real-time analytics with charts (Recharts) for sales, expenses, and revenue tracking.
*   **Invoicing & Estimates**: Create, manage, and track professional invoices and estimates.
*   **Order Management**: Full support for **Purchase Orders (PO)** and **Delivery Challans**.
*   **Expense Tracking**: Monitor business expenses and categorize spending.

### 📦 Inventory & CRM
*   **Product Management**: Track stock levels, pricing, and product details.
*   **Client & Vendor Management**: Dedicated portals for managing customer and vendor relationships.
*   **Data Export**: Export reports and lists to Excel (XLSX) for offline analysis.

### 🔐 Security & Access
*   **Authentication**: Secure JWT-based authentication with Bcrypt hashing.
*   **Role-Based Access**: Separate dashboards for Admins and regular Users.
*   **2FA Support**: Integrated Two-Factor Authentication using Speakeasy & QR codes.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React 19 (Vite)
*   **Routing**: React Router DOM v7
*   **Styling**: Lucide React Icons, Vanilla CSS
*   **Utilities**: Recharts (Analytics), React Hot Toast (Notifications)

### Backend
*   **Runtime**: Node.js & Express
*   **Database**: SQLite3 (Lightweight & Portable)
*   **Security**: JSON Web Tokens (JWT), Bcryptjs, UUID
*   **Tools**: Nodemon (Dev), Dotenv

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/invoicehub.git
    cd invoicehub
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Configuration**
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=5000
    JWT_SECRET=your_super_secret_key_here
    NODE_ENV=development
    ```

4.  **Run Locally**
    *   **Backend**: `cd server && npm start` (Runs on port 5000)
    *   **Frontend**: `cd client && npm run dev` (Runs on Vite port)

## 📦 Deployment

The application includes a `DEPLOYMENT_GUIDE.md` for detailed instructions on hosting as a SaaS or packaging as a desktop application.

*   **Production Build**: The client builds into `client/dist`, which is served statically by the Node.js backend.
*   **Desktop Mode**: Includes batch scripts (`Launch_App.bat`) for offline execution.

---

### 📝 License

This project is licensed under the MIT License.
