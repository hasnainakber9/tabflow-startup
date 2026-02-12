# ⚡ TabFlow - Intent-Based Browser Productivity

> Transform tab chaos into focused productivity with AI-powered intent tracking and smart tab management.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)](extension/)
[![Next.js API](https://img.shields.io/badge/API-Next.js-black)](api/)

## 🎯 The Problem

People open 20+ browser tabs daily, leading to:
- Context switching chaos
- Lost train of thought  
- Abandoned tasks buried in tab clutter
- Procrastination via "productive distraction"
- Mental overhead tracking what each tab was for

## 🚀 The Solution

**TabFlow** implements intent-first browsing: Before opening a new tab, users declare their intent. This creates accountability and structure around browsing behavior.

## ✨ Key Features

### Core Features
- **Intent Capture**: Lightweight modal on every new tab
- **Smart Categorization**: 6 categories (Work, Research, Shopping, Learning, Break, Personal)
- **Voice Input**: Hands-free intent creation
- **Auto Tab Grouping**: Color-coded groups by intent category
- **Real-time Statistics**: Daily completions, streak tracking, productivity score
- **AI Suggestions**: Context-aware intent recommendations

### Advanced Features (Pro)
- **Cloud Sync**: Access intents across all devices
- **Analytics Dashboard**: Deep insights into productivity patterns
- **Pattern Detection**: AI identifies distraction triggers
- **Task Integration**: Sync with Notion, Todoist, Asana
- **Team Workspaces**: Shared productivity tracking

## 📸 Screenshots

*Coming soon - Extension in action*

## 💻 Tech Stack

### Chrome Extension (Frontend)
- **Manifest V3** (latest Chrome standard)
- **Vanilla JavaScript** (lightweight & fast)
- **Chrome APIs**: Storage, Tabs, Tab Groups, Notifications, Alarms
- **Local-first**: Privacy-first with optional cloud sync

### Backend API
- **Next.js 14**: Serverless API routes
- **MongoDB**: User data and intent storage
- **JWT Authentication**: Secure user sessions
- **Vercel Deployment**: Edge network for global low-latency

## 🚀 Quick Start

### Install Extension (Development)

1. **Clone the repository**
```bash
git clone https://github.com/hasnainakber9/tabflow-startup.git
cd tabflow-startup
```

2. **Load extension in Chrome**
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode" (top-right toggle)
- Click "Load unpacked"
- Select the `extension` folder

3. **Open a new tab and see TabFlow in action!**

### Setup Backend API (Optional)

1. **Install dependencies**
```bash
cd api
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Run development server**
```bash
npm run dev
```

4. **Deploy to Vercel**
```bash
vercel deploy
```

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [API Documentation](docs/API.md)
- [Business Plan](docs/BUSINESS_PLAN.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 📈 Business Model

### Freemium Pricing

**Free Tier**
- 10 intent captures/day
- Basic tab grouping
- 7-day history
- Local storage only

**Pro ($4.99/month)**
- Unlimited intents
- AI insights & suggestions
- Cloud sync across devices
- Integration with productivity tools
- Custom categories
- Priority support

**Team ($12/user/month)**
- All Pro features
- Shared workspaces
- Team productivity dashboards
- Admin controls
- SSO integration

### Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Users | 10K | 50K | 200K |
| Conversion | 3% | 5% | 7% |
| MRR | $1.5K | $12.5K | $70K |
| ARR | $18K | $150K | $840K |

## 🛣️ Roadmap

### Phase 1 (Months 1-3): MVP Launch
- [x] Chrome extension core features
- [x] Backend API with cloud sync
- [ ] Chrome Web Store submission
- [ ] Product Hunt launch
- [ ] Initial user feedback & iteration

### Phase 2 (Months 4-6): Growth
- [ ] Firefox & Edge versions
- [ ] Mobile companion app
- [ ] AI-powered insights
- [ ] Productivity integrations (Notion, Todoist)
- [ ] Referral program

### Phase 3 (Months 7-12): Scale
- [ ] Team/Enterprise features
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Workplace productivity certification
- [ ] International expansion

## 👥 Target Market

### Primary Personas

**The Knowledge Worker**
- Age: 25-45
- Role: Software developers, designers, product managers
- Pain: Managing 30+ tabs across multiple projects
- Goal: Stay focused, complete deep work

**The Student/Researcher**  
- Age: 18-35
- Role: University students, PhD researchers
- Pain: Losing track of research sources
- Goal: Organize research efficiently

**The Entrepreneur**
- Age: 25-50  
- Role: Startup founders, freelancers
- Pain: Context switching between client work
- Goal: Maximize billable hours

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📧 Contact

- **Website**: [tabflow.app](https://tabflow.app) *(coming soon)*
- **Email**: hello@tabflow.app
- **Twitter**: [@tabflowapp](https://twitter.com/tabflowapp)
- **Discord**: [Join our community](https://discord.gg/tabflow)

## ⭐ Star History

If you find TabFlow useful, please star this repository!

---

**Built with ❤️ by [Hasnain Akber](https://github.com/hasnainakber9)**