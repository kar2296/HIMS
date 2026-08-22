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

export const apiFetch = async (action: string | { action: string, data: any }, payload?: any): Promise<any> => {
  let urlAction: string;
  let requestData: any;

  // Support both overloaded signatures:
  // 1. apiFetch('Action/Path', { ...payload })
  // 2. apiFetch({ action: 'Action/Path', data: { ...payload } })
  if (typeof action === 'string') {
    urlAction = action;
    requestData = payload || {};
  } else {
    urlAction = action.action;
    requestData = action.data || {};
  }

  return new Promise((resolve, reject) => {
    try {
      const utl = getUtl();
      utl.Http.doAction({
        action: urlAction,
        data: requestData,
        type: 'post',
        onComplete: (_err: any, data: any) => {
          resolve(data);
        },
        onError: (data: any) => {
          // Mirrors ngAPIHelper's own Error.Message toast (the branch it always shows
          // regardless of a caller-supplied onError) so this stays visible to the user
          // exactly like every other real screen's failed call, not just logged.
          if (data && data.Error && data.Error.Message) {
            try { utl.Alert.showErrorMsg(data.Error.Message); } catch (e) { /* noop */ }
          }
          console.error('API Error:', data);
          reject(data);
        }
      });
    } catch (e) {
      // Angular injector unavailable (e.g. component rendered outside the bootstrapped
      // app) -- fail loudly rather than silently falling back to a separate HTTP path.
      console.error('apiFetch: could not reach the Angular utl service', e);
      reject(e);
    }
  });
};
