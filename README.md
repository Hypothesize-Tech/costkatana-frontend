# Cost Katana Frontend

A modern React-based dashboard for tracking, analyzing, and optimizing AI API costs across multiple providers.

## Table of Contents

- [Cost Katana Frontend](#cost-katana-frontend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core Capabilities](#core-capabilities)
      - [Dashboard](#dashboard)
      - [Usage Tracking](#usage-tracking)
      - [Analytics](#analytics)
      - [Optimizations](#optimizations)
      - [User Management](#user-management)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
    - [Development](#development)
    - [Code Quality](#code-quality)
    - [Testing](#testing)
  - [Project Structure](#project-structure)
  - [Development Guide](#development-guide)
    - [State Management](#state-management)
    - [API Integration](#api-integration)
    - [Styling](#styling)
    - [Performance Optimizations](#performance-optimizations)
  - [Testing](#testing-1)
  - [Building \& Deployment](#building--deployment)
    - [Production Build](#production-build)
    - [Docker Deployment](#docker-deployment)
    - [Platform Deployment](#platform-deployment)
  - [Browser Support](#browser-support)
  - [Contributing](#contributing)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
      - [API Connection Failed](#api-connection-failed)
      - [Build Errors](#build-errors)
      - [Style Issues](#style-issues)
  - [Support](#support)
  - [License](#license)

## Features

- 🎨 **Modern UI/UX**: Built with React 18, TypeScript, and Tailwind CSS
- 📊 **Real-time Analytics**: Interactive charts and visualizations with Chart.js
- 🌓 **Dark Mode**: Full dark mode support with system preference detection
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens
- 🚀 **Optimized Performance**: Code splitting, lazy loading, and caching
- 🎯 **Type Safety**: Full TypeScript support with strict typing
- 🧪 **Testing Ready**: Jest and React Testing Library setup

### Core Capabilities

#### Dashboard

- Real-time cost overview with service breakdown charts
- Recent activity feed and AI-powered insights

#### Usage Tracking

- Detailed usage history with advanced filtering and search
- Export functionality (CSV/JSON) and token/cost analysis

#### Analytics

- Time-series visualizations and service/model comparisons
- Cost predictions and trend analysis

#### Optimizations

- AI-powered prompt optimization with cost saving suggestions
- Optimization history and bulk optimization support

#### User Management

- API key management and notification preferences
- Subscription management and alert configuration

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI + Heroicons
- **HTTP Client**: Axios
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ and npm
- Backend API running (default: `http://localhost:3000`)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/costkatana-frontend.git
cd costkatana-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=Cost Katana
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
```

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Code Quality

```bash
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors
npm run format      # Format code with Prettier
npm run type-check  # Run TypeScript compiler
```

### Testing

```bash
npm run test        # Run tests
npm run test:ui     # Run tests with UI
npm run test:coverage # Generate coverage report
```

## Project Structure

```text
src/
├── components/        # Reusable components
│   ├── auth/         # Authentication components
│   ├── common/       # Common/shared components
│   ├── dashboard/    # Dashboard components
│   ├── usage/        # Usage tracking components
│   ├── analytics/    # Analytics components
│   └── optimization/  # Optimization components
├── contexts/         # React contexts (Auth, Theme, Notifications)
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── styles/           # Global styles
```

## Development Guide

### State Management

**React Query** - Server state management:

- Automatic caching and background refetching
- Optimistic updates and pagination support

**Zustand** - Client state:

- UI preferences, temporary form data, filter states

**Context API** - Global app state:

- Authentication, theme (dark/light mode), notifications

### API Integration

All API calls are centralized in the `services/` directory:

```typescript
import { usageService } from '@/services/usage.service';

// Track usage
const usage = await usageService.trackUsage(data);

// Get usage with filters
const result = await usageService.getUsage(filters, pagination);
```

### Styling

The app uses Tailwind CSS with custom design tokens:

- **Colors**: Primary (#3B82F6), Success (#10B981), Warning (#F59E0B), Danger (#EF4444)
- **Spacing**: Base unit 4px (0.25rem), common values: 4, 8, 12, 16, 20, 24, 32, 48
- **Typography**: Inter font family, sizes: xs, sm, base, lg, xl, 2xl, 3xl

### Performance Optimizations

1. **Code Splitting**: Routes are lazy loaded
2. **Image Optimization**: WebP format with fallbacks
3. **Bundle Optimization**: Vendor chunks for better caching
4. **React Query**: Smart caching and refetching
5. **Memoization**: Heavy computations are memoized

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building & Deployment

### Production Build

```bash
# Build the app
npm run build

# Preview the build
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Platform Deployment

**Vercel/Netlify:**

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with default settings

**Traditional Hosting:**

1. Build the app: `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure your server to serve the SPA correctly

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

#### API Connection Failed

- Check if backend is running
- Verify `VITE_API_URL` in `.env`

#### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

#### Style Issues

- Ensure Tailwind CSS is properly configured
- Check for CSS purging in production builds

## Support

For support, email <support@costkatana.com> or create an issue in the repository.

## License

MIT License - see LICENSE file for details
