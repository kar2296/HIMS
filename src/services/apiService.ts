// React API Service Layer for Backend Endpoints

export const API_BASE_URL = '/api';

export interface ApiRequestOptions {
  action: string;
  data?: any;
  type?: 'get' | 'post' | 'put' | 'delete';
}

export async function callBackendApi<T = any>(options: ApiRequestOptions): Promise<T> {
  const { action, data, type = 'post' } = options;
  const url = `${API_BASE_URL}/${action.startsWith('/') ? action.slice(1) : action}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Include auth token if available in storage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: type.toUpperCase(),
    headers,
  };

  if (type.toLowerCase() !== 'get' && data !== undefined) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error(`Backend API call error for action [${action}]:`, error);
    throw error;
  }
}

// Dedicated API Methods for Patient Registration
export const patientApi = {
  getPatientById: (patientId: number) =>
    callBackendApi({ action: 'registration/patient/GetPatientById', data: { Id: patientId } }),

  addPatient: (patientData: any) =>
    callBackendApi({ action: 'registration/patient/AddPatient', data: { Data: patientData } }),

  updatePatient: (patientData: any) =>
    callBackendApi({ action: 'registration/patient/UpdatePatient', data: { Data: patientData } }),

  searchPatients: (query: string) =>
    callBackendApi({ action: 'registration/patient/SearchPatients', data: { Query: query } }),
};

// Dedicated API Methods for OP & IP Billing
export const billingApi = {
  saveBill: (billData: any) =>
    callBackendApi({ action: 'billing/opbilling/SaveBill', data: billData }),

  getBillDetails: (billId: number) =>
    callBackendApi({ action: 'billing/opbilling/GetBillDetails', data: { BillId: billId } }),

  getPreviousBills: (patientId: number) =>
    callBackendApi({ action: 'billing/opbilling/GetPreviousBills', data: { PatientId: patientId } }),
};

// Dedicated API Methods for Master & Lookup Data
export const masterApi = {
  getLookupData: (lookupType: string) =>
    callBackendApi({ action: 'common/master/GetLookupData', data: { Type: lookupType } }),

  getDoctors: () =>
    callBackendApi({ action: 'common/master/GetDoctors', type: 'get' }),
};

// Expose globally for hybrid React/Angular usages
if (typeof window !== 'undefined') {
  (window as any).ReactApiService = {
    callBackendApi,
    patientApi,
    billingApi,
    masterApi,
  };
}
