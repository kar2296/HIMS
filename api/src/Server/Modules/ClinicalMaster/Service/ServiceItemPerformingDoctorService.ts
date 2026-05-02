import {BaseService, BoFactory } from '../../Base/Index';
import { ServiceItemPerformingDoctorBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ServiceItemPerformingDoctorAttributes } from '../Model/Interface/Index';
import { ServiceItemPerformingDoctorFilters } from '../Common/Filters.e';

export class ServiceItemPerformingDoctorService extends BaseService {
    private ServiceItemPerformingDoctorBo: ServiceItemPerformingDoctorBo;
    constructor(req?: Request) {
        super(req);
        this.ServiceItemPerformingDoctorBo = BoFactory.GetBo(ServiceItemPerformingDoctorBo, this.Request);
    }

    public async AddServiceItemPerformingDoctor(req: BaseRequest): Promise<number> {
        return await this.ServiceItemPerformingDoctorBo.AddServiceItemPerformingDoctor(req);
    }

    public async UpdateServiceItemPerformingDoctor(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemPerformingDoctorBo.UpdateServiceItemPerformingDoctor(req);
    }

    public async ManageServiceItemPerformingDoctor(req: BaseRequest): Promise<boolean> {
        return await this.ServiceItemPerformingDoctorBo.ManageServiceItemPerformingDoctor(req);
    }

    public async GetServiceItemPerformingDoctorById(req: BaseRequest): Promise<ServiceItemPerformingDoctorAttributes> {
        return await this.ServiceItemPerformingDoctorBo.GetServiceItemPerformingDoctorById(req);
    }

    public async GetServiceItemPerformingDoctors(apiReq?: ApiRequest<ServiceItemPerformingDoctorFilters>):
        Promise<ApiResponse<ServiceItemPerformingDoctorAttributes[]>> {
        return await this.ServiceItemPerformingDoctorBo.GetServiceItemPerformingDoctors(apiReq);
    }

    public async DeleteServiceItemPerformingDoctor(req: BaseRequest): Promise<Boolean> {
        return await this.ServiceItemPerformingDoctorBo.DeleteServiceItemPerformingDoctor(req);
    }
}
