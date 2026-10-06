import { BaseService, BoFactory } from '../../Base/Index';
import { ServiceBillEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ServiceBillEntryAttributes } from '../Model/Interface/Index';
import { ServiceBillEntryFilters } from '../Common/Filters.e';

export class ServiceBillEntryService extends BaseService {
    private ServiceBillEntryBo: ServiceBillEntryBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceBillEntryBo = BoFactory.GetBo(ServiceBillEntryBo, this.Request);
    }

    public async AddServiceBillEntry(req: BaseRequest): Promise<number> {
        return await this.ServiceBillEntryBo.AddServiceBillEntry(req);
    }

    public async UpdateServiceBillEntry(req: BaseRequest): Promise<boolean> {
        return await this.ServiceBillEntryBo.UpdateServiceBillEntry(req);
    }

    public async GetServiceBillEntryById(req: BaseRequest): Promise<ServiceBillEntryAttributes> {
        return await this.ServiceBillEntryBo.GetServiceBillEntryById(req);
    }

    public async GetServiceBillEntrys(apiReq?: ApiRequest<ServiceBillEntryFilters>): Promise<ApiResponse<ServiceBillEntryAttributes[]>> {
        return await this.ServiceBillEntryBo.GetServiceBillEntrys(apiReq);
    }

    public async DeleteServiceBillEntry(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceBillEntryBo.DeleteServiceBillEntry(req);
    }

    public async PrintWagesServices(req: BaseRequest): Promise<FileInfo> {
        return await this.ServiceBillEntryBo.PrintWagesServices(req);
    }
}
