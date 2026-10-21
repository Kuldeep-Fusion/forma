# Forma — AI-Powered Landing Page Studio ⚡

> **Build high-converting, production-ready landing pages in seconds using only your words.**

Forma transforms raw product ideas and natural language prompts into stunning, fully functional, responsive landing pages. Featuring an autonomous neural architecture, visual inline editor, bespoke design systems, kinetic micro-interactions, and instant React + Tailwind source code export.

---

## 🌟 Key Features

- **Autonomous Generation Engine**: Powered by Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`), synthesizing landing page layouts, high-converting copywriting, section hierarchies, and aesthetic themes from plain English prompts.
- **Visual Inline Editor**: Direct canvas editing for headings, paragraphs, buttons, icons, and layout sections with real-time responsive preview.
- **Multimodal Visual Referencing**: Upload UI reference screenshots or branding inspiration images to guide styling, color tones, and bento layouts.
- **Bespoke Design Systems & Color Palettes**: Curated editorial palettes (Forma Warm, Forest Green, Electric Blue, Monochrome, Warm Amber) paired with Outfit & Inter typography.
- **Kinetic Micro-Interactions**: Smooth entrance reveals and physics-driven animations built on Framer Motion and GSAP.
- **Export & Production Ready**: One-click export to clean React + Tailwind CSS code bundles or downloadable ZIP archives.
- **Real-Time Telemetry & Social Proof**: Live visitor counts, active presence ticker, and community showcases.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18 Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with bespoke light-grid architectural canvas
- **AI Synthesis**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini API)
- **Motion & Dynamics**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (with local JSON fallback)
- **Media Asset Management**: [Cloudinary](https://cloudinary.com/) (with persistent local fallback)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17+ or v20+ recommended
- **npm** / **yarn** / **pnpm**
- **Google Gemini API Key**: [Get your key at Google AI Studio](https://aistudio.google.com/)
- **MongoDB** (Optional, local fallback included)
- **Cloudinary** (Optional for image hosting)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kuldeep-Fusion/forma.git
   cd forma
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys in `.env.local`:
   ```env
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash

   # Database (MongoDB Atlas or local)
   MONGODB_URI=mongodb://localhost:27017/forma

   # Cloudinary Media (Optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SESSION_SECRET=forma_super_secure_session_secret_32_chars_min
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to start building landing pages!

---

## 📁 Project Structure

```
Forma/
├── public/                 # Static assets, logos, favicons, illustrations
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── api/            # Activity, presence, generation, & project APIs
│   │   ├── editor/[id]/    # Visual interactive builder & live canvas
│   │   ├── layout.js       # Root layout with fonts & metadata
│   │   ├── globals.css     # Design tokens, dotted grid, and canvas styles
│   │   └── page.js         # Homepage with studio composer & community feed
│   ├── components/
│   │   ├── community/      # Recent creations & showcase gallery
│   │   ├── editor/         # Visual inline editor panels & controls
│   │   ├── layout/         # Header, Navigation, & Footer
│   │   ├── motion/         # Framer Motion & GSAP reveal utilities
│   │   ├── renderer/       # Dynamic page & section renderer engine
│   │   └── studio/         # Hero prompt composer, config drawer, starter pills
│   ├── lib/                # Database clients, Gemini helpers, validators
│   └── models/             # Mongoose schemas for Projects & Analytics
├── tests/                  # Automated integration tests
├── .env.example            # Environment variables template
├── package.json
└── tailwind.config.mjs
```

---

## 🧪 Testing

To run the automated suite:
```bash
npm test
```

To run lint checks:
```bash
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
