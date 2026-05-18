# GlobalTrade Intelligence

GlobalTrade Intelligence is a full-stack global trade and commodity market intelligence platform. It uses public and free data sources to monitor commodity prices, macroeconomic indicators, shipping route risks, geopolitical news, and AI-assisted market signals.

## Project Goals

- Track key commodities such as Brent crude, natural gas, wheat, aluminum, and Baltic Dry Index.
- Monitor strategic shipping routes including Suez Canal, Panama Canal, Strait of Hormuz, Malacca Strait, Taiwan Strait, and Bosphorus Strait.
- Generate market signals using technical indicators and commodity-specific risk context.
- Display geopolitical and trade-related news in one operational dashboard.
- Support future AI features such as daily market briefs, route risk explanations, and scenario analysis.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Charts: Recharts
- Maps: Leaflet / React Leaflet
- Deployment ready: Docker Compose

## Data Sources

The project is designed to use public or free-tier data sources:

- EIA for energy data
- FRED for macroeconomic and market time-series data
- World Bank for commodity and economic indicators
- Alpha Vantage for market data
- NewsAPI for trade and geopolitical news

API keys should be stored locally in `backend/.env` and must not be committed to GitHub.

## Local Development

Install dependencies:

```bash
npm run install:all
```

Start development servers:

```bash
npm run dev
```

Start PostgreSQL with Docker:

```bash
npm run db:start
```

Run database migrations:

```bash
npm run db:migrate
```

## Environment Variables

Create `backend/.env` from `backend/.env.example` and add your API keys:

```env
EIA_API_KEY=your_eia_api_key
FRED_API_KEY=your_fred_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
NEWS_API_KEY=your_news_api_key
```

## Disclaimer

This project is for educational, portfolio, and non-commercial research purposes. It is not financial advice.
