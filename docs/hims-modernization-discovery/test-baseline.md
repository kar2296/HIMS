# HIMS Modernization — Test and Build Baseline

**Discovery Date:** 2026-09-05
**Status:** READ-ONLY — Discovery artifact

## 1. Frontend Build Baseline

### Commands
| Command | Script | Note |
|---------|--------|------|
| Dev server | `npm run dev` | `NODE_OPTIONS='--max-old-space-size=768' vite` |
| Build | `npm run build` | `npm run build-api && tsc -b && vite build` |
| Lint | `npm run lint` | `eslint .` |
| Type check | `tsc -b tsconfig.app.json --noEmit` | Not a named script — run manually |
| Start API | `npm run start-api` | `cd api && node --max-old-space-size=512 dist/dev/index.js` |

### TypeScript Baseline
- **Pre-existing errors: 32** (established 2026-08-21, documented in `migration_fixes_log.md`)
- TypeScript version: ~6.0.2 (root `package.json`)
- API TypeScript version: 4.9 (deliberately separate — do not merge)
- Key confirmed pre-existing issue: **Duplicate keys in `PrivilegeHelper.ts`** (7 duplicate privilege definitions — see Blockers doc)

### ESLint
- Config: `eslint.config.js` (flat config format, ESLint 10.x)
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`
- Status: Not run during this discovery — run `npm run lint` to check

## 2. Backend Build Baseline

### Commands
| Command | Script | Note |
|---------|--------|------|
| Build | `npm run build.dev` (in `api/`) | Gulp-based TypeScript compile |
| Test | `npm test` (in `api/`) | `gulp build.test && jasmine-node --forceexit ./dist` |
| Lint | `gulp-tslint` via Gulp | `tslint.json` config |
| E2E | `npm run e2e` | Protractor (legacy) |

### Backend TypeScript Baseline
- TypeScript version: 4.9
- Known errors: Not audited in this discovery run (requires full Gulp build)
- Build output: `dist/dev/` directory

## 3. Existing Test Coverage

### Frontend (React)
- **Automated test files found: 0**
- No Vitest, Jest, or other test runner configured
- No test coverage reports
- Manual testing only (via browser)

### Backend (API)
- **Test spec files found: 0** in `api/src/`
- Jasmine-node configured but no spec files located
- Protractor E2E configured but no spec files located
- `karma.conf.js` present (frontend unit test runner — legacy)

### Conclusion
**There is effectively zero automated test coverage for either the React frontend or the Express backend.**

## 4. CI/CD Baseline

| CI/CD Item | Status |
|-----------|--------|
| SonarQube scan (GitHub Actions) | Active — `.github/workflows/sonarqube.yml` |
| TypeScript build CI | NOT configured |
| Unit test CI | NOT configured |
| E2E test CI | NOT configured |
| Deployment pipeline | PM2 (`api/process.yml`) — manual |
| Travis CI (API) | Config present, not active for main repo |
| Appveyor | Config present in API — legacy |

## 5. Known Build Blockers

| Blocker | Severity | Status |
|---------|----------|--------|
| 32 pre-existing TypeScript errors | HIGH | Pre-existing; baseline; do not exceed |
| Duplicate keys in PrivilegeHelper.ts | HIGH | Pre-existing; fix in Wave 1 |
| No test runner installed | HIGH | Must add Vitest before Wave 1 exit |
| No build CI step | MEDIUM | Must add before Wave 2 |
| Express 5.0.0-alpha.6 | MEDIUM | Stability concern; note for future upgrade |
| Sequelize v4 (EOL) | MEDIUM | No security patches; plan upgrade |

## 6. Recommended Baseline Targets

| Target | Current | Goal |
|--------|---------|------|
| TypeScript errors | 32 | 0 (by Wave 3) |
| Duplicate TS keys | 7 | 0 (Wave 1) |
| Automated test files | 0 | ≥1 per migrated component |
| CI steps | SonarQube only | + TS build + unit test (Wave 1) |
| Test coverage | 0% | ≥80% per new React component (Wave 2+) |

