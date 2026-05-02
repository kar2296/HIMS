import { PageContext } from './Contexts';
//import {IBaseDto} from './Misc';

export interface IResponse { }

export interface Error {
    Code?: string;
    Message?: string;
    Stack?: string;
}

export interface ApiResponse<T> extends IResponse {
    PageContext?: PageContext;
    Error?: Error;
    Data?: T;
}

