import {BaseService, BoFactory} from '../../Base/Index';
import { OccupationBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { OccupationAttributes} from '../Model/Interface/Index';
import { OccupationFilters } from '../Common/Filters.e';

export class OccupationService extends BaseService {
    private OccupationBo:OccupationBo;
    constructor(req?: Request) {
        super(req);
        this.OccupationBo = BoFactory.GetBo(OccupationBo, this.Request);
    }

    public async AddOccupation(req: BaseRequest): Promise<number> {
        return await this.OccupationBo.AddOccupation(req);
    }

    public async UpdateOccupation(req: BaseRequest): Promise<boolean> {
        return await this.OccupationBo.UpdateOccupation(req);
    }

    public async GetOccupationById(req: BaseRequest): Promise<OccupationAttributes> {
        return await this.OccupationBo.GetOccupationById(req);
    }

    public async GetOccupations(apiReq?: ApiRequest<OccupationFilters>): Promise<ApiResponse<OccupationAttributes[]>> {
        return await this.OccupationBo.GetOccupations(apiReq);
    }

    public async DeleteOccupation(req: BaseRequest): Promise<Boolean> {
        return await this.OccupationBo.DeleteOccupation(req);
    }
}
