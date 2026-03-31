# 📦 StockSense Pro — Inventory Management Dashboard

A production-ready inventory management dashboard built with **Next.js 14 (App Router)**, **Vercel Blob**, **Tailwind CSS**, and **xlsx**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📁 File Manager | Drag-and-drop upload for `.xlsx`, `.xls`, `.csv` · Vercel Blob storage · Delete files |
| 🔍 Live Search | Searches across **all columns** and **all sheets** in real time |
| 🗂️ Multi-Sheet | Parses every sheet in an Excel file and merges into one unified table |
| 📊 Sorting | Click any column header to sort asc/desc |
| 🏷️ Category Filter | Dropdown auto-detected from your data |
| 📤 CSV Export | Exports the **current filtered view** as a CSV |
| 📱 Mobile Cards | Vertical card layout on mobile, data table on desktop |
| ₹ Indian Formatting | All prices use ₹ + `en-IN` locale (e.g. ₹1,00,000) |
| 🔐 Access Control | Password overlay checks `DASHBOARD_PASSWORD` env variable |
| ⚙️ Settings Page | Customize name, logo, accent color, and locale |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/inventory-dashboard.git
cd inventory-dashboard
npm install
```

### 2. Set up Vercel Blob

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Add Blob storage: Go to **Vercel Dashboard → Storage → Create → Blob**
4. Pull env vars: `vercel env pull .env.local`

Or manually create `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
DASHBOARD_PASSWORD=your-secret-password
```

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 4. Deploy

```bash
vercel deploy --prod
```

Then in **Vercel Dashboard → Project → Settings → Environment Variables**, add:
- `BLOB_READ_WRITE_TOKEN` — from your Blob store
- `DASHBOARD_PASSWORD` — your chosen access password

---

## 📁 Project Structure

```
inventory-dashboard/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # POST  — upload file to Vercel Blob
│   │   ├── delete/route.ts      # DELETE — remove file from Vercel Blob
│   │   ├── files/route.ts       # GET   — list all uploaded files
│   │   ├── parse/route.ts       # GET   — parse Excel/CSV from Blob URL
│   │   └── auth/route.ts        # POST  — verify access key
│   ├── settings/page.tsx        # Settings UI page
│   ├── layout.tsx               # Root layout (sidebar + header)
│   ├── page.tsx                 # Main dashboard page
│   └── globals.css              # Global styles + CSS variables
├── components/
│   ├── AccessKeyOverlay.tsx     # Password protection overlay
│   ├── FileUploader.tsx         # Drag-and-drop uploader + file list
│   ├── InventoryDashboard.tsx   # Main dashboard: search/filter/table/cards
│   └── Sidebar.tsx              # Sidebar navigation + header
├── lib/
│   ├── ExcelParser.ts           # Multi-sheet Excel/CSV parser + CSV export
│   └── types.ts                 # Shared TypeScript types
├── config/
│   └── config.js                # Dashboard customization config
├── .env.example                 # Environment variable template
├── vercel.json                  # Vercel deployment settings
└── next.config.js               # Next.js configuration
```

---

## 📊 Excel File Format

Your Excel file can have **any column names**. The dashboard auto-detects:

| Auto-detected as | Column keywords |
|---|---|
| 💰 Price (₹ format) | `price`, `cost`, `amount`, `value`, `rate`, `mrp`, `sp`, `cp` |
| 📦 Stock (bar graph) | `stock`, `qty`, `quantity`, `units`, `count`, `inventory` |
| 🏷️ Category (filter) | `category`, `cat`, `type`, `group`, `department` |
| 🔤 Name (card title) | `name`, `item`, `product`, `description`, `title` |

**Multi-sheet support**: All sheets are merged. Each row gets a hidden `_sheet` field tagging its source sheet.

---

## ⚙️ Customization

Edit `config/config.js`:

```js
const dashboardConfig = {
  userName: 'Your Name',
  companyName: 'Your Company',
  primaryColor: '#fb6f18',   // Any hex color
  locale: 'en-IN',           // en-IN or en-US
  defaultPageSize: 25,
  priceColumnKeywords: ['price', 'cost', 'mrp', ...],
};
```

---

## 🔐 Security Notes

- The `DASHBOARD_PASSWORD` env var is checked server-side in `/api/auth` — never exposed to the client.
- Blob URL validation in `/api/delete` prevents deletion of non-Blob URLs.
- File type and size validation on upload (50 MB limit, `.xlsx/.xls/.csv` only).

---

## 📦 Dependencies

```
next                 14.x   — Framework
@vercel/blob         0.24   — File storage
xlsx                 0.18   — Excel/CSV parsing
lucide-react         0.447  — Icons
tailwindcss          3.x    — Styling
typescript           5.x    — Type safety
```

---

## 📄 License

MIT — feel free to use and modify.
