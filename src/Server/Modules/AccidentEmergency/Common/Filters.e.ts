export const AERegistrationFilters = {
    Id: 0,
    Patient: 1,
    AdmissionStatus: 2,
    ERType: 3,
    ERDate: 4
} as const;
export type AERegistrationFilters = (typeof AERegistrationFilters)[keyof typeof AERegistrationFilters];
export const AETriageFilters = {
    Id: 0
} as const;
export type AETriageFilters = (typeof AETriageFilters)[keyof typeof AETriageFilters];
