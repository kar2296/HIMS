import { alert } from './alert';

// Declare global types for legacy compatibility if needed
declare global {
    interface Window {
        appPath?: {
            apiroot: string;
        };
    }
}

export interface ApiOptions {
    action: string;
    type?: 'post' | 'get' | 'POST' | 'GET' | 'put' | 'PUT' | 'delete' | 'DELETE';
    data?: any;
    params?: Record<string, string>;
    onComplete?: (err: any, data: any, options: ApiOptions, status: boolean) => void;
    onError?: (errorData: any, options: ApiOptions) => void;
    [key: string]: any; // Allow arbitrary extra options like the legacy version
}

export const APIHelper = {
    getRootPath: (): string => {
        return window.appPath?.apiroot || '/api/';
    },

    toggleLoading: (show: boolean) => {
        // Safe DOM manipulation that mirrors legacy $("#divgifLoading").show()
        const loader = document.getElementById('divgifLoading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    },

    doAction: async (options: ApiOptions): Promise<any> => {
        const method = (options.type || 'GET').toUpperCase();
        
        if (method === 'POST') {
            APIHelper.toggleLoading(true);
        }

        const token = localStorage.getItem('token');
        let actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        if (options.params && Object.keys(options.params).length > 0) {
            const queryParams = new URLSearchParams(options.params as any).toString();
            actionUrl += (actionUrl.includes('?') ? '&' : '?') + queryParams;
        }

        try {
            const response = await fetch(actionUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: method !== 'GET' && method !== 'HEAD' && options.data 
                    ? JSON.stringify(options.data) 
                    : undefined
            });

            if (method === 'POST') {
                APIHelper.toggleLoading(false);
            }

            const data = await response.json();

            // Handle legacy error formats
            if (data && data.Error) {
                if (data.Error.Code) {
                    if (options.onError) {
                        options.onError(data, options);
                    } else {
                        // Translation should ideally be handled by a React context, 
                        // but we fallback to a generic error message
                        alert.showErrorMsg(`Error Code: ${data.Error.Code}`);
                    }
                    throw new Error(data.Error.Code);
                } else if (data.Error.Message) {
                    alert.showErrorMsg(data.Error.Message);
                    if (options.onError) {
                        options.onError(data, options);
                    }
                    throw new Error(data.Error.Message);
                }
            }

            if (options.onComplete) {
                options.onComplete(null, data, options, false);
            }

            return data;

        } catch (error) {
            if (method === 'POST') {
                APIHelper.toggleLoading(false);
            }
            console.error(`${method.toLowerCase()} api - error`, error);
            
            if (options.onError) {
                options.onError(error, options);
            }
            throw error;
        }
    },

    doDownload: async (options: ApiOptions): Promise<void> => {
        const token = localStorage.getItem('token');
        const actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: JSON.stringify(options.data || {})
            });

            const blob = await response.blob();
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL);

            if (options.onComplete) {
                options.onComplete(null, blob, options, false);
            }
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    },

    doDownloadJsonFile: async (options: ApiOptions): Promise<void> => {
        const token = localStorage.getItem('token');
        const actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: JSON.stringify(options.data || {})
            });

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = options.data?.Data?.fileName || 'download.txt';
            link.click();

            if (options.onComplete) {
                options.onComplete(null, buffer, options, false);
            }
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    },

    doDownloadXslFile: async (options: ApiOptions): Promise<void> => {
        const token = localStorage.getItem('token');
        const actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: JSON.stringify(options.data || {})
            });

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: 'data:application/vnd.ms-excel' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = options.data?.Data?.fileName || 'download.xls';
            link.click();

            if (options.onComplete) {
                options.onComplete(null, buffer, options, false);
            }
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    },

    doPrint: async (options: ApiOptions): Promise<void> => {
        const token = localStorage.getItem('token');
        const actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: JSON.stringify(options.data || {})
            });

            const blob = await response.blob();
            const fileURL = URL.createObjectURL(blob);
            const printWindow = window.open(fileURL);
            
            if (printWindow) {
                printWindow.print();
            }

            if (options.onComplete) {
                options.onComplete(null, blob, options, false);
            }
        } catch (error) {
            console.error('Print error:', error);
            throw error;
        }
    },

    getDownloadedURL: async (options: ApiOptions): Promise<void> => {
        const token = localStorage.getItem('token');
        const actionUrl = APIHelper.getRootPath() + options.action.replace(/^\//, '');

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `bearer ${token}` } : {})
                },
                body: JSON.stringify(options.data || {})
            });

            const blob = await response.blob();
            const fileURL = URL.createObjectURL(blob);
            
            if (!options.data) options.data = {};
            if (!options.data.Data) options.data.Data = {};
            options.data.Data.fileurl = fileURL;

            if (options.onComplete) {
                options.onComplete(null, blob, options, false);
            }
        } catch (error) {
            console.error('Get Download URL error:', error);
            throw error;
        }
    }
};
