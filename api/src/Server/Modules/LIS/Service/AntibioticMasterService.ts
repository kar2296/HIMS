import { BaseService, BoFactory } from '../../Base/Index';
import { AntibioticMasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AntibioticMasterAttributes, AntibioticOrganismMapAttributes } from '../Model/Interface/Index';
import { AntibioticMasterFilters, AntibioticOrganismFilters } from '../Common/Filters.e';

export class AntibioticMasterService extends BaseService {
    private AntibioticMasterBo: AntibioticMasterBo;
    constructor(req?: Request) {
        super(req);
        this.AntibioticMasterBo = BoFactory.GetBo(AntibioticMasterBo, this.Request);
    }

    public async AddAntibioticMaster(req: BaseRequest): Promise<number> {
        return await this.AntibioticMasterBo.AddAntibioticMaster(req);
    }

    public async UpdateAntibioticMaster(req: BaseRequest): Promise<boolean> {
        return await this.AntibioticMasterBo.UpdateAntibioticMaster(req);
    }

    public async GetAntibioticMasterById(req: BaseRequest): Promise<AntibioticMasterAttributes> {
        return await this.AntibioticMasterBo.GetAntibioticMasterById(req);
    }

    public async GetAntibioticMasters(apiReq?: ApiRequest<AntibioticMasterFilters>): Promise<ApiResponse<AntibioticMasterAttributes[]>> {
        return await this.AntibioticMasterBo.GetAntibioticMasters(apiReq);
    }

    public async DeleteAntibioticMaster(req: BaseRequest): Promise<Boolean> {
        return await this.AntibioticMasterBo.DeleteAntibioticMaster(req);
    }
    //antibioticorganismmapbo
    public async AddAntibioticOrganismMap(req: BaseRequest): Promise<number> {
        return this.AntibioticMasterBo.AddAntibioticOrganismMap(req);
    }
    public async UpdateAntibioticOrganismMap(req: BaseRequest): Promise<boolean> {
        return this.AntibioticMasterBo.UpdateAntibioticOrganismMap(req);
    }
    public async GetAntibioticOrganismMapById(req: BaseRequest): Promise<AntibioticOrganismMapAttributes> {
        return this.AntibioticMasterBo.GetAntibioticOrganismMapById(req);
    }
    public async GetAntibioticOrganismMaps(apiReq?: ApiRequest<AntibioticOrganismFilters>):
        Promise<ApiResponse<AntibioticOrganismMapAttributes[]>> {
        return this.AntibioticMasterBo.GetAntibioticOrganismMaps(apiReq);
    }
    public async DeleteAntibioticOrganismMap(req: BaseRequest): Promise<Boolean> {
        return this.AntibioticMasterBo.DeleteAntibioticOrganismMap(req);
    }
}
