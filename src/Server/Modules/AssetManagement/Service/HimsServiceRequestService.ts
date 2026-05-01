import { BaseService, BoFactory } from '../../Base/Index';
import { ServiceRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ServiceRequestAttributes } from '../Model/Interface/Index';
import { ServiceRequestFilters } from '../Common/Filters.e';

export class ServiceRequestService extends BaseService {
    private ServiceRequestBo: ServiceRequestBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceRequestBo = BoFactory.GetBo(ServiceRequestBo, this.Request);
    }

    public async AddServiceRequest(req: BaseRequest): Promise<number> {
        return await this.ServiceRequestBo.AddServiceRequest(req);
    }

    public async UpdateServiceRequest(req: BaseRequest): Promise<boolean> {
        return await this.ServiceRequestBo.UpdateServiceRequest(req);
    }
    public async GetEndUserSignPic(req: BaseRequest): Promise<ServiceRequestAttributes> {
        return await this.ServiceRequestBo.GetEndUserSignPic(req);
    }
    public async GetServiceRequestById(req: BaseRequest): Promise<ServiceRequestAttributes> {
        return await this.ServiceRequestBo.GetServiceRequestById(req);
    }

    public async GetServiceRequests(apiReq?: ApiRequest<ServiceRequestFilters>): Promise<ApiResponse<ServiceRequestAttributes[]>> {
        return await this.ServiceRequestBo.GetServiceRequests(apiReq);
    }

    public async DeleteServiceRequest(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceRequestBo.DeleteServiceRequest(req);
    }
    public async PrintServiceRequest(req: BaseRequest): Promise<FileInfo> {
        return await this.ServiceRequestBo.PrintServiceRequest(req);
    }
}
