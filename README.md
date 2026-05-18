# GlobalTrade Intelligence

GlobalTrade Intelligence is a full-stack global trade and commodity market intelligence platform. It uses public and free-tier data sources to monitor commodity prices, macroeconomic indicators, shipping route risks, geopolitical news, and AI-assisted market signals.

The current demo is organized as a multi-page web application with top navigation rather than a left sidebar. It is designed for analysts, operations teams, procurement teams, and business users who need one shared view of changing market and trade conditions.

## Project Goals

- Track key commodities such as Brent crude, natural gas, wheat, aluminum, and Baltic Dry Index.
- Monitor strategic shipping routes including Suez Canal, Panama Canal, Strait of Hormuz, Malacca Strait, Taiwan Strait, and Bosphorus Strait.
- Generate market signals using technical indicators and commodity-specific risk context.
- Display geopolitical and trade-related news in one operational dashboard.
- Support future AI features such as daily market briefs, route risk explanations, and scenario analysis.

## Application Pages

- Dashboard: executive overview of commodity prices, market signals, shipping risk, rankings, and news.
- Commodities: live commodity cards, price history charts, signal details, and a monitor table.
- Shipping Risk: map-based route risk monitoring with chokepoint watchlists and planning notes.
- Macro: macro and trade pressure indicators for energy, freight, food inputs, and policy expansion.
- News: categorized geopolitical and trade news with sentiment summaries.
- AI Brief: structured decision brief generated from the current market, route, and news context.
- Scenario: scenario planning for trade disruptions, energy price shocks, and export restrictions.
- Data Center: shared table view for prices, signals, shipping routes, news, and beneficiary rankings, with CSV export.

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

AISStream is not included in the current build. It can be added later if real-time vessel tracking becomes necessary.

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

Optional backend settings:

```env
PORT=3001
NODE_ENV=development
```

## Current Status

- Multi-page frontend shell is implemented.
- Existing public/free API integrations are wired through the backend.
- Frontend and backend TypeScript builds pass locally.
- The data is intended for demo, portfolio, and research workflows, not production trading.

## Disclaimer

This project is for educational, portfolio, and non-commercial research purposes. It is not financial advice.
