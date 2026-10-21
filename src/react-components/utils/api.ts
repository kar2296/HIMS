// Bridges React's apiFetch(action, payload) calls onto the app's real, existing
// HTTP mechanism (utl.Http.doAction -> Angular's $http, with window.appPath.apiroot
// prefixing, the app-wide bearer-token Authorization header set globally in app.js,
// the #divgifLoading spinner, and the app's normal error toast) instead of a separate
// raw fetch() with its own parallel auth/URL/error handling. This keeps every
// consumer of apiFetch (CountryControl/StateControl/DistrictControl/CityControl/
// AreaControl/PincodeControl and the screens that call it directly) on the one real
// HTTP path every other working screen already uses -- per the project's standing
// "one HTTP path only" rule. External signature is unchanged, so no caller needs to
// change.
declare var angular: any;

function getUtl(): any {
  // ng-app is on <html> (index.html), so document.body is a valid element to resolve
  // the app's injector from -- the same pattern already used by src/reactBridge.tsx
  // (which runs inside the same Angular module) to reach Angular services from code
  // that also has to work as a plain ES module.
  const injector = angular.element(document.body).injector();
  return injector.get('utl');
}

export const apiFetch = async <T = any>(
  action: string | { action: string, data: any, silent?: boolean },
  payload?: any,
  options?: { silent?: boolean }
): Promise<T> => {
  let urlAction: string;
  let requestData: any;
  const isSilent = Boolean(
    (typeof action === 'object' && action.silent) ||
    options?.silent ||
    (typeof action === 'string' && action.includes('ServiceItem/GetServiceItems'))
  );

  // Support both overloaded signatures:
  // 1. apiFetch('Action/Path', { ...payload })
  // 2. apiFetch({ action: 'Action/Path', data: { ...payload } })
  if (typeof action === 'string') {
    urlAction = action;
    requestData = payload !== undefined ? payload : {};
  } else {
    urlAction = action.action;
    requestData = action.data !== undefined ? action.data : {};
  }

  // Normalize if caller mistakenly passed fetch-like RequestInit options ({ method, body })
  if (requestData && typeof requestData === 'object' && 'body' in requestData && ('method' in requestData || 'headers' in requestData)) {
    try {
      requestData = typeof requestData.body === 'string' ? JSON.parse(requestData.body) : requestData.body;
    } catch {
      requestData = requestData.body;
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const utl = getUtl();
      utl.Http.doAction({
        action: urlAction,
        data: requestData,
        type: 'post',
        silent: isSilent,
        onComplete: (...args: any[]) => {
          const result = (args.length > 1 && args[1] !== undefined && args[1] !== null)
            ? args[1]
            : args[0];
          resolve(result);
        },
        onError: (data: any) => {
          if (!isSilent && data && data.Error && data.Error.Message) {
            try { utl.Alert.showErrorMsg(data.Error.Message); } catch (e) { /* noop */ }
          }
          console.error('API Error:', data);
          reject(data);
        }
      });
    } catch (e) {
      // Angular injector unavailable (e.g. component rendered outside the bootstrapped
      // app, such as standalone React Router routes) -- fall back to callBackendApi or fetch
      import('../../services/apiService').then(({ callBackendApi }) => {
        callBackendApi({
          action: urlAction,
          data: requestData,
          type: 'post'
        })
          .then(resolve)
          .catch(reject);
      }).catch(async (err) => {
        try {
          const root = (window as any).appPath?.apiroot || '/api/';
          const token = localStorage.getItem('token');
          const response = await fetch(root + urlAction.replace(/^\//, ''), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `bearer ${token}` } : {})
            },
            credentials: 'include',
            body: JSON.stringify(requestData)
          });
          const data = await response.json();
          resolve(data as T);
        } catch (fetchErr) {
          console.error('apiFetch fallback failed:', fetchErr);
          reject(err);
        }
      });
    }
  });
};

