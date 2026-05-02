import {PageContext, UserContext} from './Contexts';

export enum SearchType {
    Contains = 1,
    StartsWith = 2
}

export enum OrderBy {
    ASC = 1,
    DESC = 2
}

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
