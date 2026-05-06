export interface IBaseDto { }
export const ISearchEnums = {
    Id: 0,
    Name: 1
} as const;
export type ISearchEnums = (typeof ISearchEnums)[keyof typeof ISearchEnums];
