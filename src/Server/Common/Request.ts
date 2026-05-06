import type {PageContext, UserContext} from './Contexts';

export const SearchType = {
    Contains: 1,
    StartsWith: 2
} as const;
export type SearchType = (typeof SearchType)[keyof typeof SearchType];

export const OrderBy = {
    ASC: 1,
    DESC: 2
} as const;
export type OrderBy = (typeof OrderBy)[keyof typeof OrderBy];

export interface Param<Tk> {
    Key: Tk;
    Value: any;
    SearchType?: SearchType;
    OrderBy?: OrderBy;
}

export interface IRequest { }

export interface BaseRequest extends IRequest {
    Id: number;
    UserContext?: UserContext;
    Data?: any;
    Attributes?: Array<string | Array<string>> | Object;
    query?: any;
    response_token?: any;
}

export interface ApiRequest<Tk> extends BaseRequest {
    PageContext: PageContext;
    Params: Param<Tk>[];
}


export interface OptionRequest extends IRequest {
    Key: string;
    Request: ApiRequest<any>;
    Default: Boolean | {};
}
