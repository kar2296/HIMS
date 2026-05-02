# Migration and Fixes Changelog

**Date and Time:** May 2, 2026, 09:00 AM (IST)

## Purpose
To resolve backend API connectivity issues during the Vite migration (specifically the `400 Bad Request` errors on unauthenticated API calls) and to fix frontend console warnings caused by duplicate script executions (`WARNING: Tried to load angular more than once.` and `Highcharts error #16`).

## Changes Implemented

### 1. Backend Authentication Routing Fixes
* **File Modified:** `api/src/Server/Router.ts`
  * **Change:** Removed the `local` Passport strategy from the global `passport.authenticate` middleware. 
  * **Reason:** Unauthenticated API requests were falling back to the `local` strategy (intended only for the `/login` route). Because the requests lacked `username`/`password` body fields, the `local` strategy defaulted to returning a `400 Bad Request`, rather than allowing a proper `401 Unauthorized` check.

* **File Modified:** `api/src/Server/Core/Middleware/Auth.ts`
  * **Change:** Updated the `AuthMiddleware` logic to explicitly return an HTTP `401 Unauthorized` JSON response (`{ Error: { Code: '401', Message: 'Authentication failed.' } }`) when `req.isAuthenticated()` is false.
  * **Reason:** Previously, it passed an Error object to `next()`, which was caught by the global error handler (`Bootstrap.ts`) and returned as a `404 Not Found` response. Now, unauthenticated requests correctly receive a `401` status.

### 2. Frontend Duplicate Scripts (Angular & Highcharts) Fixes
* **File Modified:** `vite.config.ts`
  * **Change:** Added a custom Vite plugin named `disable-html-fallback` to intercept requests for `.html` files. 
  * **Reason:** AngularJS loads templates (`views/something.html`) dynamically. If a template was missing or path was incorrect, Vite's SPA fallback feature was serving the `index.html` file instead. Since `index.html` contains the `<script>` tags for AngularJS (`base.js`) and Highcharts, jQuery would re-evaluate these scripts globally when injecting the response, causing the duplicate load warnings and Highcharts Error #16. The new plugin forces Vite to return a missing file response rather than the `index.html` fallback for `.html` templates.

Consolidating Package Management
You requested to manage the project using a single package.json file at the root.

There are two very different ways to achieve this. Because the API (backend) and the React app (frontend) use very different versions of core tools (like TypeScript and Node types), combining them incorrectly will break the application.

Please review the two options below and let me know which one you prefer.

Option 1: NPM Workspaces (Highly Recommended)
NPM (which you have version 10+) supports "Workspaces". This allows us to keep the api/package.json file but tell the root package.json to manage it automatically.

How it works:

We add "workspaces": ["api"] to your root /Users/sharmila/Rajesh/my-app/package.json.
When you run npm install in the root folder, it automatically installs all dependencies for both the frontend and the backend.
You never have to run npm install inside the api folder again.
Pros:

Extremely safe. Prevents version conflicts (like the backend needing TypeScript 4.9 and the frontend needing TypeScript 6.0).
Standard practice for modern "monorepo" applications.
Option 2: Full Physical Merge (High Risk)
This involves literally copying all 100+ dependencies and scripts from api/package.json into the root package.json and deleting the api/package.json file.

How it works:

We move all "dependencies" and "devDependencies" to the root file.
We rewrite all the Gulp scripts so they know to look inside the api/ folder for their configuration.
Pros:

Truly results in only one package.json file existing in the repository.
WARNING

Version Conflicts: The API uses @types/node v8, while the root uses v24. The API uses typescript v4.9, while the root uses v6. Merging them will force one version to be used, which is highly likely to break the older API's compilation step.

User Review Required
IMPORTANT

Which option would you prefer?

Reply "Option 1" if you want to use NPM Workspaces (Recommended - keeps files separate but allows managing everything from the root folder).
Reply "Option 2" if you want a complete physical merge (High risk of breaking the build due to version conflicts).

### 3. NPM Workspaces Configuration
* **Date:** May 2, 2026, 09:30 AM (IST)
* **Files Modified:** `package.json`, `api/package.json`
  * **Change:** Configured the root project as an NPM workspace managing the `api` directory (`"workspaces": ["api"]`).
  * **Change:** Updated root `build-api` script to `"cd api && npm run build"` and added `"build": "npm run build.dev"` to the `api/package.json`.
  * **Reason:** This allows dependency management at the project root using a single `npm install`, avoiding the risk of version conflicts (e.g., Typescript 4 vs 6) that would occur if all dependencies were merged into a single file. This ensures both frontend and backend are installed and linked correctly. It also fixes the `MODULE_NOT_FOUND` error on `npm start` by ensuring the backend builds before starting.

### 4. API Port Conflict Resolution
* **Date:** May 2, 2026, 09:40 AM (IST)
* **Action:** Terminated a detached Node process (PID 49871) that was occupying port `2012`.
* **Reason:** The backend API failed to start with an `EADDRINUSE` error because an orphaned background process was holding port `2012`. This caused Vite's proxy to fail with a `502 Bad Gateway` error when attempting to route `/api` requests. Because the API request failed, Vite served the SPA fallback (`index.html`), which led to `Uncaught SyntaxError: Unexpected token '<'` and duplicate script load warnings when the browser attempted to evaluate the HTML response as JavaScript. Freeing the port allows the API to start properly alongside the frontend development server.

### 5. Frontend Asset Path Rewrite Fix
* **Date:** May 2, 2026, 09:50 AM (IST)
* **File Modified:** `vite.config.ts`
* **Change:** Added a URL rewrite rule to the custom Vite middleware that strips `/app/` from incoming requests (`req.url = req.url.replace(/^\/app/, '');`).
* **Reason:** The legacy AngularJS application hardcodes template paths to `/app/views/...` (e.g., `ng-include="'app/views/partials/sidebar.html'"`). However, these files physically reside in `/public/views/...`, which Vite serves at the root (`/views/...`). By transparently rewriting `/app/` to `/`, Vite can correctly locate and serve the HTML partials from the `public` directory, resolving the `404 Not Found` errors and the resulting syntax errors.
### 6. FocusIf Directive Safety Check
* **Date:** May 2, 2026, 10:00 AM (IST)
* **File Modified:** `public/vendor/focusif/focusIf.js`
* **Change:** Added a safety check (`if (dom.children && dom.children[2] ...)`) before attempting to call `.focus()` on a nested child element of `<autosearch>` components.
### 7. Session Persistence on Page Refresh Fix
* **Date:** May 2, 2026, 10:25 AM (IST)
* **File Modified:** `public/js/app.js`
* **Change:** Injected `$http` into the `appRun` block and added logic to read the JWT token from `$window.localStorage.getItem('token')` and restore it to `$http.defaults.headers.post.Authorization` and `$http.defaults.headers.common.Authorization` when the application boots up.
* **Reason:** When the user successfully logged in, the `access-login.controller.js` set the token into memory for the duration of the page lifecycle. However, upon pressing F5 (Refresh), the Javascript environment was re-initialized and the `$http` authorization header was wiped. This caused any subsequent background API requests (which require the `bearer` token via `passport.authenticate`) to fail with a `401 Unauthorized` error, forcibly logging the user out. Now, the token is properly restored from local storage on every page reload, persisting the user's session.
