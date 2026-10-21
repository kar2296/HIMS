// React API Service Layer for Backend Endpoints
import { sessionHelper } from './sessionHelper';

export const API_BASE_URL = '/api';

export interface ApiRequestOptions {
  action: string;
  data?: any;
  type?: 'get' | 'post' | 'put' | 'delete';
}

export async function callBackendApi<T = any>(
  optionsOrAction: ApiRequestOptions | string,
  arg2?: any,
  arg3?: any
): Promise<T> {
  let action: string;
  let data: any;
  let type: 'get' | 'post' | 'put' | 'delete' = 'post';

  if (typeof optionsOrAction === 'string') {
    action = optionsOrAction;
    if (typeof arg2 === 'string' && ['get', 'post', 'put', 'delete'].includes(arg2.toLowerCase())) {
      type = arg2.toLowerCase() as any;
      data = arg3;
    } else {
      data = arg2;
      if (typeof arg3 === 'string' && ['get', 'post', 'put', 'delete'].includes(arg3.toLowerCase())) {
        type = arg3.toLowerCase() as any;
      }
    }
  } else {
    action = optionsOrAction?.action || '';
    data = optionsOrAction?.data;
    type = optionsOrAction?.type || 'post';
  }

  const cleanAction = action.startsWith('/') ? action.slice(1) : action;
  const url = `${API_BASE_URL}/${cleanAction}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Include auth token from session (same key as AngularJS ngSessionHelper)
  const token = sessionHelper.getAuthToken() || localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: type.toUpperCase(),
    headers,
    credentials: 'include',
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

// Dedicated API Methods for Doctor Dashboard
export const doctorDashboardApi = {
  /**
   * Fetches all 4 count keys in one POST, same as AngularJS $scope.getddCount().
   * Returns: { mycheckedin, myinpatient, appointment, otschedule }
   */
  getDashboardCounts: (doctorId: number, facilityId: number, fromDate: string, toDate: string) =>
    callBackendApi({
      action: 'Visit/DoctorDashboard/GetDashboardOptions',
      data: {
        Data: {
          Keys: [
            { Key: 'appointment' },
            { Key: 'mycheckedin' },
            { Key: 'myinpatient' },
            { Key: 'otschedule' },
          ],
        },
        Attributes: {
          FacilityId: facilityId,
          DoctorId: doctorId,
          FromDate: fromDate,
          ToDate: toDate,
        },
      },
    }),
};

// Expose globally for hybrid React/Angular usages
if (typeof window !== 'undefined') {
  (window as any).ReactApiService = {
    callBackendApi,
    patientApi,
    billingApi,
    masterApi,
    doctorDashboardApi,
  };
}
