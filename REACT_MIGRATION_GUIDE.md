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
