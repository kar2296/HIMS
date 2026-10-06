import {BaseService, BoFactory} from '../../Base/Index';
import { OpticalGrnDetailBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { OpticalGrnDetailAttributes} from '../Model/Interface/Index';
import { OpticalGrnDetailFilters } from '../Common/Filters.e';

export class OpticalGrnDetailService extends BaseService {
    private OpticalGrnDetailBo: OpticalGrnDetailBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalGrnDetailBo = BoFactory.GetBo(OpticalGrnDetailBo, this.Request);
    }

    public async AddOpticalGrnDetail(req: BaseRequest): Promise<number> {
        return await this.OpticalGrnDetailBo.AddOpticalGrnDetail(req);
    }

    public async UpdateOpticalGrnDetail(req: BaseRequest): Promise<boolean> {
        return await this.OpticalGrnDetailBo.UpdateOpticalGrnDetail(req);
    }

    public async GetOpticalGrnDetailById(req: BaseRequest): Promise<OpticalGrnDetailAttributes> {
        return await this.OpticalGrnDetailBo.GetOpticalGrnDetailById(req);
    }

    public async GetOpticalGrnDetails(apiReq?: ApiRequest<OpticalGrnDetailFilters>): Promise<ApiResponse<OpticalGrnDetailAttributes[]>> {
        return await this.OpticalGrnDetailBo.GetOpticalGrnDetails(apiReq);
    }

    public async DeleteOpticalGrnDetail(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalGrnDetailBo.DeleteOpticalGrnDetail(req);
    }
}
