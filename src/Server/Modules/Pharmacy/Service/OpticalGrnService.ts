import { BaseService, BoFactory } from '../../Base/Index';
import { OpticalGrnBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { OpticalGrnAttributes } from '../Model/Interface/Index';
import { OpticalGrnFilters } from '../Common/Filters.e';

export class OpticalGrnService extends BaseService {
    private OpticalGrnBo: OpticalGrnBo;
    constructor(req?: Request) {
        super(req);
        this.OpticalGrnBo = BoFactory.GetBo(OpticalGrnBo, this.Request);
    }

    public async AddOpticalGrn(req: BaseRequest): Promise<number> {
        return await this.OpticalGrnBo.AddOpticalGrn(req);
    }

    public async UpdateOpticalGrn(req: BaseRequest): Promise<boolean> {
        return await this.OpticalGrnBo.UpdateOpticalGrn(req);
    }

    public async GetOpticalGrnById(req: BaseRequest): Promise<OpticalGrnAttributes> {
        return await this.OpticalGrnBo.GetOpticalGrnById(req);
    }

    public async GetOpticalGrns(apiReq?: ApiRequest<OpticalGrnFilters>): Promise<ApiResponse<OpticalGrnAttributes[]>> {
        return await this.OpticalGrnBo.GetOpticalGrns(apiReq);
    }

    public async DeleteOpticalGrn(req: BaseRequest): Promise<Boolean> {
        return await this.OpticalGrnBo.DeleteOpticalGrn(req);
    }
    public async Print1Grn(req: BaseRequest): Promise<FileInfo> {
        return await this.OpticalGrnBo.Print1Grn(req);
    }
}
