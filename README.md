# ♻️ MOLE - Circular Economy Marketplace (MOLE)

> **An AI-powered B2B marketplace engineered to intelligently match industrial waste streams with verified buyers, promoting a sustainable circular economy.**

![Netlify Status](https://api.netlify.com/api/v1/badges/699ab16666e3975890bb8ae7/deploy-status)
*(Note for the repo owner: You can replace the badge URL with your official Netlify badge!)*

---

## 📖 Overview

**MOLE** (formerly MOLE / CirculaNet) is a modern, enterprise-grade SaaS platform built to solve the industrial waste problem. Instead of letting valuable byproducts and industrial scrap go to landfills, MOLE bridges the gap between waste generators and recyclers.

Our intelligent **matching engine** automatically ranks and connects sellers with buyers based on physical location proximity, material compatibility, and chemical composition—turning waste into revenue.

## ✨ Key Features

- 🤖 **AI-Powered Material Matching:** Intelligently pairs industrial waste generators with buyers based on exact material needs, quantities, and quality constraints.
- 📍 **Proximity-Based Sorting:** Automatically detecting and sorting matches by physical distance to minimize logistics costs and carbon footprints (e.g., `45 km away`).
- ⚡ **Real-Time B2B Messaging:** Integrated chat and negotiation tools to quickly finalize "Offers" and material exchange pathways.
- 📊 **Smart Dashboard & Reporting:** Tracks CO2 saved, cost reductions, and operational metrics with a clean, industrial SaaS aesthetic.
- 🔍 **Google-Style Pagination:** Seamlessly browse through hundreds of matching waste streams with intuitive UI pagination.
- 🌎 **Eco-Tech Aesthetics:** A premium, fully responsive design utilizing minimalist whitespaces, "glassmorphism" layers, and vibrant emerald accents.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend / Database:** Supabase (PostgreSQL, Realtime subscriptions, Row Level Security)
- **Deployment:** Netlify
- **Routing:** React Router v6

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have Node.js and `npm` installed on your machine.
You will also need a free [Supabase](https://supabase.com/) account for the database.

### 1. Clone the repository
```bash
git clone https://github.com/YAD09/MOLE.git
cd MOLE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-jwt-anon-key
```

### 4. Run the development server
```bash
npm run dev
```

The app will instantly launch at `http://localhost:5173`.

---

## 🌐 Deployment

This application is configured for seamless deployment on **Netlify**.

The root directory contains a `netlify.toml` file to automatically handle SPA client-side routing and environment variables injection for the Vite build engine. 

To deploy manually using the Netlify CLI:
```bash
npm install netlify-cli -g
netlify deploy --prod --build
```
*(Live URL: https://molehack2hustl.netlify.app/)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/YAD09/MOLE/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
