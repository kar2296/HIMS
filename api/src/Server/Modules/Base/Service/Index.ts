import { ApiResponse, PageContext } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export interface IBaseService { }

export class BaseService implements IBaseService {
    public Request: Request;
    public constructor(req?: Request) {
        this.Request = req;
    }
    public GetResponse<T>(data: T, pageContext?: PageContext): ApiResponse<T> {
        return {
            Data: data,
            PageContext: pageContext,
            Error: null
        };
    }
}

export class ServiceFactory {
    public static CreateService<T extends IBaseService>(type: { new (req: Request): T }, req?: Request): T {
        return new type(req);
    }
}
