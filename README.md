# RxPharmacy Management System

RxPharmacy is a modern, responsive Web Application designed for managing pharmacy inventories, supplier/customer databases, and POS (Point-of-Sale) sales checkouts. 

---

## 🌟 Key Features

### 1. Dashboard & Analytical Trends
- **Live Stats Summary**: Track overall revenue, transaction counts, supplier directory listings, and total customer counts.
- **Inventory Alerts**: Automatic warning notifications for out-of-stock items and products nearing low-stock levels (quantity < 10).
- **Responsive Charts**: Custom SVG-based sales trend column chart. Switch between **Daily** (past 30 days), **Weekly** (past 12 weeks), or **Monthly** (past 12 months) views with interactive tooltips.

### 2. POS Sales Register
- **Atomic Checkout Transactions**: Inventory levels are decremented dynamically during checkouts inside a TypeORM database transaction. If any medicine is out of stock or missing, the transaction automatically rolls back.
- **Inline Customer Creation**: If a customer is new, clerks can register them inline directly inside the checkout register panel. The system will save the customer profile first, retrieve the ID, and log the sale in a single click.
- **Infinite Scroll Selectors**: Dropdown selections for choosing existing customers and medicines load items in batches of 20, appending more options as you scroll to the bottom.

### 3. Medicines Inventory Catalog
- Paginated search matching medicine name, generic drug description, or manufacturer.
- Advanced filtering by **Drug Type** (Tablet, Capsule, Syrup, Drop, etc.) and **Suppliers**.
- Low-stock visual highlights and expiration indicator badges.

### 4. Suppliers & Customers Directories
- CRUD directories mapping emails, phone lines, and physical addresses.
- Search-on-scroll helper lists for checkout selectors.

### 5. Multi-Device Responsive UI
- **Fixed Sidebar**: Locks in place with the administrator profile card and logout triggers always visible in the bottom viewport corners.
- **Table-Only Scrollbars**: Fixed page headers and pagination footers, ensuring only the table content scrolls vertically.
- **Mobile Drawer**: Collapses into a slide-out overlay backdrop drawer on screens $\le 768\text{px}$, toggled by a top hamburger header. Modals automatically resize and enable internal scrolling on short screens.

---

## 🛠️ Technology Stack

- **Backend API**: [NestJS](https://nestjs.com/) (Node.js), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/) database.
- **Frontend App**: [React.js](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/), [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (no Tailwind required).
- **Security & Docs**: JWT Bearer Tokens, password hash validation, and [Swagger UI](https://swagger.io/) docs.

---

## ⚙️ Quick Project Setup

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **PostgreSQL** instance running locally or hosted.

### 1. Database Configuration
Create a `.env` file in the **root project folder** (next to `package.json`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=pharmacy_management_db
JWT_SECRET=your_jwt_signing_key_secret
```

Create the database in PostgreSQL:
```sql
CREATE DATABASE pharmacy_management_db;
```

---

### 2. Starting the Backend API Server

Navigate to the project root directory and install dependencies:
```bash
# Install backend packages
npm install

# Start the NestJS API server in dev watch mode
npm run start:dev
```
- The backend API server will run at: `http://localhost:3000`
- Interactive API Swagger documentation will be available at: `http://localhost:3000/api`

---

### 3. Starting the Frontend UI Web App

Navigate to the `frontend/` directory, configure environment hosts, and install dependencies:

```bash
# Move to frontend directory
cd frontend

# Install frontend packages
npm install

# Start the Vite local development server
npm run dev
```
- The frontend app will start on: `http://localhost:5173`
- Default login credentials for development (if seeded):
  - **Email**: `admin@pharmacy.com`
  - **Password**: `admin123`

---

## 🚀 Build for Production

To build the client assets and compile backend distributions:

```bash
# Compile NestJS server files (from root directory)
npm run build

# Compile React client files (from frontend directory)
cd frontend
npm run build
```
