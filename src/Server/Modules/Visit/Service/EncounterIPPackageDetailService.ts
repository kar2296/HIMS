import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterIPPackageDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterIPPackageDetailAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageDetailFilters } from '../Common/Filters.e';

export class EncounterIPPackageDetailService extends BaseService {
    private EncounterIPPackageDetailBo: EncounterIPPackageDetailBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterIPPackageDetailBo = BoFactory.GetBo(EncounterIPPackageDetailBo, this.Request);
    }

    public async AddEncounterIPPackageDetail(req: BaseRequest): Promise<number> {
        return await this.EncounterIPPackageDetailBo.AddEncounterIPPackageDetail(req);
    }

    public async UpdateEncounterIPPackageDetail(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageDetailBo.UpdateEncounterIPPackageDetail(req);
    }

    public async GetEncounterIPPackageDetailById(req: BaseRequest): Promise<EncounterIPPackageDetailAttributes> {
        return await this.EncounterIPPackageDetailBo.GetEncounterIPPackageDetailById(req);
    }

    public async GetEncounterIPPackageDetails(apiReq?: ApiRequest<EncounterIPPackageDetailFilters>):
        Promise<ApiResponse<EncounterIPPackageDetailAttributes[]>> {
        return await this.EncounterIPPackageDetailBo.GetEncounterIPPackageDetails(apiReq);
    }

    public async GetMinEncounterIPPackageDetails(apiReq?: ApiRequest<EncounterIPPackageDetailFilters>):
        Promise<ApiResponse<EncounterIPPackageDetailAttributes[]>> {
        return await this.EncounterIPPackageDetailBo.GetMinEncounterIPPackageDetails(apiReq);
    }

    public async DeleteEncounterIPPackageDetail(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterIPPackageDetailBo.DeleteEncounterIPPackageDetail(req);
    }
}
