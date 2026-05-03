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
### 8. WorkOrder Number Missing in UI Grid Fix
* **Date:** May 2, 2026, 11:30 AM (IST)
* **Files Modified:** 
  - `public/views/emr/ordermanagement/orderprocess/allorderprocess-list.js`
  - `public/views/emr/ordermanagement/orderprocess/myorderprocess-list.js`
  - `public/views/emr/ordermanagement/resultapproval/allresultapproval-list.js`
  - `public/views/emr/ordermanagement/resultapproval/resultapproved-amendment.js`
  - `public/views/emr/ordermanagement/externalresultentry/externalresultentry.js`
  - `public/views/emr/ordermanagement/otherhospitalorders/otherhsptlorderprocess-list.js`
* **Change:** Fixed malformed HTML within the `ui-grid` `cellTemplate` for the `WorkOrderdid` column. Changed `style='color: #4407ff;class='col-sm-2'` to `style='color: #4407ff;' class='col-sm-2'`. Also added `|| entity.WorkOrderId` as a fallback.
### 9. LIS Sample Identifier Generation Fix
* **Date:** May 2, 2026, 11:50 AM (IST)
* **File Modified:** `api/src/Server/Modules/LIS/Business/WorkOrderSampleDetailBo.ts`
* **Change:** Added a dummy/real `Id` property to the update payloads inside `UpdateSampleTypeInfo` and `UpdatePatientWorkOrderInfo` (`siInfo`, `SampleidCodition`, `Sampledata`). 
### 10. `ngPrivilegeHelper` TypeError Fix
* **Date:** May 2, 2026, 12:10 PM (IST)
* **File Modified:** `public/vendor/common/ngPrivilegeHelper.js`
* **Change:** Refactored the `hasAccess` function to use `typeof func === 'function'` instead of executing `func()` directly and handling `TypeError` via `catch`. Also modified the failure branch to return a `false` boolean instead of returning an empty function.
* **Reason:** When checking for an unmapped privilege key (like `CanOP_TheramlPrint`), the system threw a `TypeError` because `func` was undefined. The catch block then erroneously returned `function () { return false; }` which evaluating contexts interpreted as `true` (since a function object is truthy), and it also caused `TypeError: func is not a function` in the browser console.

### 11. OP Billing Save Buttons React Bridge Fix
* **Date:** May 3, 2026, 11:15 AM (IST)
* **File Modified:** `public/views/billing/opbilling/opbilling-list.js`
* **Change:** Resolved an infinite `$digest` loop that was crashing the page by converting the dynamic `reactPropsSaveBarContainer` object getters (using `Object.defineProperty`) to a static object. Implemented an explicit `refreshReactProps()` method and tied it to an efficient `$watchGroup` that explicitly monitors primitive scope variable changes.
* **Reason:** The legacy AngularJS controller was re-evaluating the object reference on every digest cycle, causing the React bridge deep-watcher to constantly re-render and trigger an endless digest loop.

### 12. OP Billing `IsFromIPBill` String Coercion Fix
* **Date:** May 3, 2026, 11:20 AM (IST)
* **File Modified:** `public/views/billing/opbilling/opbilling-list.js`
* **Change:** Enforced strict numeric coercion on the `isFromIPBill` property using `Number($scope.item.IsFromIPBill) || 0` before passing it down the React Bridge.
* **Reason:** The backend API sporadically returns `"0"` (a string) instead of `0` (a number). In Javascript, the string `"0"` is truthy, so the legacy ternary `($scope.item.IsFromIPBill ? 1 : 0)` evaluated to `1`. The React component strictly checked `reactProps.isFromIPBill === 0`, which failed (`1 === 0`), inadvertently hiding the Save buttons from the UI.

### 13. `printcontrol` AngularJS Component to React Migration
* **Date:** May 3, 2026, 11:30 AM (IST)
* **Files Modified:** 
  - `src/react-components/PrintControl.tsx` (New File)
  - `src/main.tsx`
  - `public/vendor/components/printcontrol.html`
  - `public/vendor/components/printcontrol.js`
* **Change:** Migrated the core `printcontrol` directive to a modern `PrintControl.tsx` React component. Replaced the clunky AngularJS `$uibModal` with a fast React state modal. The legacy AngularJS `.component` definition was kept but "hollowed out" to act purely as an invisible bridge (rendering `<react-component name="PrintControl">`) that proxies data to React.
* **Reason:** This progressive-enhancement strategy allowed the Print UI to be completely modernized across 44 legacy files instantly, without requiring any modifications to the legacy HTML templates that depend on the `<printcontrol>` tag.

### 14. Started Backend API Service
* **Date:** May 3, 2026, 12:00 PM (IST)
* **Action:** Booted the backend API server (`gulp serve.dev`) running on port `2012`.
* **Reason:** The React frontend was receiving `ECONNREFUSED` errors because the backend API wasn't running, causing all dependent dynamic data (including button visibility settings) to fail to load.

### 15. OP Billing React Bridge Privilege Scope Fix
* **Date:** May 3, 2026, 12:15 PM (IST)
* **File Modified:** `public/views/billing/opbilling/opbilling-list.js`
* **Change:** Replaced the incorrect `utl.Privilege.hasAccess(...)` implementation inside `refreshReactProps` with the correct `$scope.HasAccess(...)` method.
* **Reason:** The `utl.Privilege.hasAccess` method only accepts a single string parameter (e.g., `'OPBilling'`), while the older system uses a two-parameter tuple (e.g., `'OPBilling', 'OPBilling_Save_Button'`). Because the second parameter was ignored, the system looked for the root key `OPBilling` in the privilege map (which does not exist), and erroneously returned `false`. This effectively hid all Save buttons for logged-in users like `sdh`. Using `$scope.HasAccess` correctly evaluates the dual-parameter privilege, restoring the buttons.
