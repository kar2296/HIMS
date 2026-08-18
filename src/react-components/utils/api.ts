export const apiFetch = async (action: string | { action: string, data: any }, payload?: any) => {
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

  const token = localStorage.getItem('token');
  const apiRoot = (window as any).appPath?.apiroot || '/api/';
  const url = `${apiRoot}${urlAction}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `bearer ${token}` } : {})
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Legacy AngularJS intercepted errors with Error.Message
    if (data && data.Error && data.Error.Message) {
      console.error('API Error:', data.Error.Message);
      // Optional: Add global toast or alert logic here
      // throw new Error(data.Error.Message);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
