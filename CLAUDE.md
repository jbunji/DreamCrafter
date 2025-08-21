# DreamCrafter Development Guide

## Project Overview
DreamCrafter is an AI-powered match-3 casual game built as a monorepo with TypeScript, featuring dynamic puzzle generation that adapts to player skill level.

## Repository Information
- **GitHub Repository**: https://github.com/jbunji/DreamCrafter
- **Monorepo Manager**: pnpm with workspaces
- **Package Manager**: pnpm (for performance and disk space efficiency)

## Port Configuration
To avoid conflicts with other projects:
- **Web Client (Development)**: 5174
- **Web Client (Preview)**: 4174
- **API Server**: 3001
- **WebSocket Server**: 3002
- **Storybook**: 6006
- **iOS Simulator**: Default ports

## Monorepo Structure
```
dreamcrafter/
├── packages/
│   ├── game-engine/        # Core Phaser.js game logic
│   ├── ai-service/         # Brain.js AI puzzle generation
│   ├── shared-types/       # TypeScript interfaces and types
│   ├── web-client/         # React web application
│   ├── mobile-app/         # Capacitor mobile wrapper
│   └── server/            # Optional backend services
├── apps/
│   ├── web/               # Production web build
│   └── mobile/            # iOS/Android builds
└── tools/
    ├── eslint-config/     # Shared ESLint configuration
    └── tsconfig/          # Shared TypeScript configuration
```

## Development Commands

### Installation
```bash
pnpm install
```

### Development
```bash
# Start all services
pnpm dev

# Start specific package
pnpm --filter game-engine dev
pnpm --filter web-client dev

# Run tests
pnpm test

# Lint and type check
pnpm lint
pnpm typecheck
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web-client build
```

### Mobile Development
```bash
# iOS development
pnpm --filter mobile-app ios:dev

# Android development
pnpm --filter mobile-app android:dev
```

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit return types for functions
- Interface over type when possible

### Testing
- Unit tests with Vitest
- E2E tests with Playwright
- Minimum 80% code coverage
- Test game mechanics thoroughly

### Performance
- Target 60 FPS on all devices
- Maximum 3MB initial bundle size
- Lazy load non-critical assets
- Implement virtual scrolling for leaderboards

### UI/UX Design Principles
- Material Design 3 guidelines
- WCAG AA accessibility compliance
- Mobile-first responsive design
- Smooth animations (spring physics)
- Haptic feedback on mobile
- Dark mode support

## AI Implementation Notes
- Brain.js models stored in IndexedDB
- Retrain models every 100 games
- A/B test difficulty algorithms
- Track player satisfaction metrics

## Security Considerations
- No API keys in client code
- Server-side receipt validation
- Rate limiting on all endpoints
- Sanitize user-generated content

## Deployment
- Vercel for web hosting
- GitHub Actions for CI/CD
- Sentry for error tracking
- CloudFlare for CDN

## Analytics Events to Track
- level_start
- level_complete
- level_fail
- power_up_used
- ad_watched
- purchase_made
- puzzle_shared
- app_open
- session_end

## Known Issues
- None yet

## Performance Benchmarks
- Load time: < 2s
- Time to interactive: < 3s
- Memory usage: < 100MB
- Battery drain: < 5% per hour