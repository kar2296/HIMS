# AngularJS to React Migration Guide

This guide documents the established pattern for migrating legacy AngularJS components, controllers, and templates to modern React functional components within the HIMS application.

## 1. Architectural Overview
The migration utilizes a **Bridge Pattern** via a custom AngularJS directive (`<react-component>`). This allows React components to be mounted directly inside the existing AngularJS routing tree without needing to rewrite the `ui-router` or full application lifecycle.

### The "Hollow Controller" Pattern
To migrate an AngularJS page (like a Dashboard):
1. The complex AngularJS controller is "hollowed out". We remove all API calls, `$watch` bindings, DOM manipulation, and data transformation logic.
2. The controller is repurposed as a **Dependency Injector and Proxy**, taking AngularJS services (like `$state`, `utl.Privilege`, `utl.Http`) and mapping them into a clean JSON object (`$scope.reactProps`).
3. The legacy HTML template is deleted and replaced with a single `<react-component>` directive.
4. A new React component is built to consume `reactProps`, manage its own state via `useState`, and perform concurrent API fetches using `useEffect`.

---

## 2. Step-by-Step Migration Process

### Step 1: Create the React Component
Create a new file in `src/react-components/` (e.g., `MyDashboardComponent.tsx`).

The component should define an interface for the props it expects to receive from AngularJS.

```tsx
import React, { useEffect, useState } from 'react';

// 1. Define the props interface expected from AngularJS
interface MyDashboardProps {
    apiFetch: (options: any) => Promise<any>;
    navigateTo: (state: string, params?: any) => void;
    reactProps: {
        privileges: Record<string, boolean>;
        context: {
            FacilityId: number;
            DoctorId: number;
        };
    };
}

export const MyDashboardComponent: React.FC<MyDashboardProps> = ({ apiFetch, navigateTo, reactProps }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // 2. Perform API fetching concurrently
        const fetchData = async () => {
            const response = await apiFetch({
                action: 'Example/API/Action',
                data: { Attributes: reactProps.context },
                type: 'post'
            });
            setData(response);
        };
        fetchData();
    }, [apiFetch, reactProps.context]);

    // 3. Render conditionally based on privileges
    return (
        <div className="dashboard-container">
            {reactProps.privileges.canViewSales && (
                <div className="card" onClick={() => navigateTo('app.sales')}>
                    Sales Card
                </div>
            )}
        </div>
    );
};
```

### Step 2: Register the Component Globally
The AngularJS bridge needs to know the component exists. You must register it in `src/main.tsx`.

```tsx
// Inside src/main.tsx
import { MyDashboardComponent } from './react-components/MyDashboardComponent';

(window as any).ReactComponents = {
  ...(window as any).ReactComponents,
  // ...other components
  MyDashboardComponent
};
```

### Step 3: Hollow Out the AngularJS Controller
Open the associated `.js` controller file (e.g., `mydashboard.js`).

1. Remove all `$scope` variables related to UI state.
2. Calculate all privileges exactly *once* and store them in a `privilegeMap`. (Do not call `utl.Privilege.hasAccess()` inside the HTML template).
3. Bind the `reactProps` to `$scope`.

```javascript
// mydashboard.js
function MyDashboardController($rootScope, $scope, $state, utl) {
    // 1. Set Context
    $scope.currentcontext = {
        FacilityId: utl.Session.getCurrentFacilityId(),
        DoctorId: parseInt(utl.Session.getCurrentUserId())
    };

    // 2. Map Privileges
    var privilegeMap = {
        canViewSales: utl.Privilege.hasAccess('Dashboard', 'ViewSales')
    };

    // 3. Provide Navigation Wrapper
    $scope.handleNavigation = function(stateName, params) {
        $state.go(stateName, params);
    };

    // 4. Expose to React Bridge
    $scope.reactProps = {
        privileges: privilegeMap,
        context: $scope.currentcontext
    };
}
```

### Step 4: Mount the React Component
Replace the contents of the legacy `.html` template (e.g., `mydashboard.html`) with the bridge directive.

```html
<!-- mydashboard.html -->
<div style="width: 100%;">
    <react-component 
        name="MyDashboardComponent" 
        props="{ 
            reactProps: reactProps,
            onNavigate: handleNavigation
        }">
    </react-component>
</div>
```

---

## 3. Best Practices & Performance Wins

*   **Avoid `$digest` Loops:** By pre-calculating privileges in the controller and passing them as a map to React, we prevent AngularJS from firing `HasAccess()` multiple times per render cycle.
*   **Concurrent Data Fetching:** Legacy controllers often chained HTTP requests or relied on sequential callbacks. In React, use `Promise.all()` inside a `useEffect` hook to resolve multiple API calls concurrently, dramatically reducing load times.
*   **Clean Dependency Injection:** Let AngularJS handle the legacy `$state` routing and `utl.Session` authentication. Pass only the resulting raw data or callback references to React. React components should not be tightly coupled to AngularJS globals if possible.

---

## 4. The Approved API / HTTP Path (Mandatory)

There is exactly **one** approved path for a React component to talk to the backend:

```
React component
  -> src/react-components/utils/api.ts : apiFetch()
  -> AngularJS utl.Http.doAction()
  -> existing Express API (api/)
```

`apiFetch()` is not a new HTTP client. It reaches into the running AngularJS app
(`angular.element(document.body).injector().get('utl')`) and calls the app's real,
existing `utl.Http.doAction()` -- the same mechanism every legacy controller already
uses. This means every call made through `apiFetch()` automatically gets, for free,
with zero duplicated logic:

- the app-wide bearer/session authentication header (set globally in `app.js`)
- the `#divgifLoading` spinner
- the standard error toast (`utl.Alert.showErrorMsg`) on failure
- the exact same request/response contract the AngularJS screen it replaces already used

### This is a hard rule, not a style preference

New or migrated React components under `src/react-components/` must **not**:

- call `fetch()` directly
- introduce Axios or any other HTTP client library
- call `$http` directly
- create another API service file or module (a second `apiService.ts`-style file)
- implement separate token/session handling (e.g. reading a token out of
  `localStorage`/`sessionStorage`) -- the app's real session lives in AngularJS/`utl`,
  and a second auth scheme will silently diverge from it
- attach an API client to a `window` global (e.g. `window.ReactApiService`)

Any of the above creates a second, parallel HTTP path with its own auth and error
handling that can drift from the real one and fail silently in production. (A file
matching this exact anti-pattern -- `src/services/apiService.ts`, a standalone
`fetch()`-based client with its own `localStorage` token logic, wired to nothing --
existed in this repo and was removed for this reason; see `migration_fixes_log.md` /
project history.)

### Sequencing multiple calls

When a React component needs more than one backend call:

- Use `Promise.all([...])` **only** when the calls are genuinely independent of each
  other's results.
- Use sequential `await` (not `Promise.all`) whenever a later call depends on data
  returned by an earlier one -- do not parallelize a dependent chain just to save time.

