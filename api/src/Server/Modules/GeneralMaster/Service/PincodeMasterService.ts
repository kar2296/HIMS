import {BaseService, BoFactory} from '../../Base/Index';
import { PincodeMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { PincodeMasterAttributes} from '../Model/Interface/Index';
import { PincodeMasterFilters } from '../Common/Filters.e';

export class PincodeMasterService extends BaseService {
    private PincodeMasterBo: PincodeMasterBo;
    constructor(req?: Request) {
        super(req);
        this.PincodeMasterBo = BoFactory.GetBo(PincodeMasterBo, this.Request);
    }

    public async AddPincodeMaster(req: BaseRequest): Promise<number> {
        return await this.PincodeMasterBo.AddPincodeMaster(req);
    }

    public async UpdatePincodeMaster(req: BaseRequest): Promise<boolean> {
        return await this.PincodeMasterBo.UpdatePincodeMaster(req);
    }

    public async GetPincodeMasterById(req: BaseRequest): Promise<PincodeMasterAttributes> {
        return await this.PincodeMasterBo.GetPincodeMasterById(req);
    }

    public async GetPincodeMasters(apiReq?: ApiRequest<PincodeMasterFilters>): Promise<ApiResponse<PincodeMasterAttributes[]>> {
        return await this.PincodeMasterBo.GetPincodeMasters(apiReq);
    }

    public async DeletePincodeMaster(req: BaseRequest): Promise<Boolean> {
        return await this.PincodeMasterBo.DeletePincodeMaster(req);
    }
}
