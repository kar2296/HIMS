import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterIPPackageBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { EncounterIPPackageAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageFilters } from '../Common/Filters.e';

export class EncounterIPPackageService extends BaseService {
    private EncounterIPPackageBo: EncounterIPPackageBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterIPPackageBo = BoFactory.GetBo(EncounterIPPackageBo, this.Request);
    }

    public async AddEncounterIPPackage(req: BaseRequest): Promise<number> {
        return await this.EncounterIPPackageBo.AddEncounterIPPackage(req);
    }

    public async UpdateEncounterIPPackage(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageBo.UpdateEncounterIPPackage(req);
    }

    public async UpdateEncounterIPPackageInfo(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageBo.UpdateEncounterIPPackageInfo(req);
    }

    public async GetEncounterIPPackageById(req: BaseRequest): Promise<EncounterIPPackageAttributes> {
        return await this.EncounterIPPackageBo.GetEncounterIPPackageById(req);
    }

    public async ManagePackageBillDetails(req: BaseRequest): Promise<EncounterIPPackageAttributes> {
        return await this.EncounterIPPackageBo.ManagePackageBillDetails(req);
    }

    public async ManagePackageBillInfo(req: BaseRequest): Promise<boolean> {
        return await this.EncounterIPPackageBo.ManagePackageBillInfo(req);
    }

    public async GetEncounterIPPackages(apiReq?: ApiRequest<EncounterIPPackageFilters>):
        Promise<ApiResponse<EncounterIPPackageAttributes[]>> {
        return await this.EncounterIPPackageBo.GetEncounterIPPackages(apiReq);
    }

    public async DeleteEncounterIPPackage(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterIPPackageBo.DeleteEncounterIPPackage(req);
    }

    public async PrintIPPatientPackageDetails(req: BaseRequest): Promise<any> {
        return await this.EncounterIPPackageBo.PrintIPPatientPackageDetails(req);
    }

    public async PrintIPPatientInclusionPackageDetails(req: BaseRequest): Promise<any> {
        return await this.EncounterIPPackageBo.PrintIPPatientInclusionPackageDetails(req);
    }
}
