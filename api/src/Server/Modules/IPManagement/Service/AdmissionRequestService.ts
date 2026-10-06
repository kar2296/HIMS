import { BaseService, BoFactory } from '../../Base/Index';
import { AdmissionRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { AdmissionRequestAttributes } from '../Model/Interface/Index';
import { AdmissionRequestFilters } from '../Common/Filters.e';

export class AdmissionRequestService extends BaseService {
    private AdmissionRequestBo: AdmissionRequestBo;
    constructor(req?: Request) {
        super(req);
        this.AdmissionRequestBo = BoFactory.GetBo(AdmissionRequestBo, this.Request);
    }

    public async AddAdmissionRequest(req: BaseRequest): Promise<number> {
        return await this.AdmissionRequestBo.AddAdmissionRequest(req);
    }

    public async UpdateAdmissionRequest(req: BaseRequest): Promise<boolean> {
        return await this.AdmissionRequestBo.UpdateAdmissionRequest(req);
    }

    public async GetAdmissionRequestById(req: BaseRequest): Promise<AdmissionRequestAttributes> {
        return await this.AdmissionRequestBo.GetAdmissionRequestById(req);
    }

    public async GetAdmissionRequests(apiReq?: ApiRequest<AdmissionRequestFilters>): Promise<ApiResponse<AdmissionRequestAttributes[]>> {
        return await this.AdmissionRequestBo.GetAdmissionRequests(apiReq);
    }

    public async PrintAdmissionRequest(req: BaseRequest): Promise<FileInfo> {
        return await this.AdmissionRequestBo.PrintAdmissionRequest(req);
    }

    public async DeleteAdmissionRequest(req: BaseRequest): Promise<Boolean> {
        return await this.AdmissionRequestBo.DeleteAdmissionRequest(req);
    }
}
