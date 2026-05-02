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
