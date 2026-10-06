import {BaseService, BoFactory} from '../../Base/Index';
import { SurgeryRoomMasterBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { SurgeryRoomMasterAttributes} from '../Model/Interface/Index';
import { SurgeryRoomFilters } from '../Common/Filters.e';

export class SurgeryRoomMasterService extends BaseService {
    private SurgeryRoomMasterBo: SurgeryRoomMasterBo;
    constructor(req?: Request) {
        super(req);
        this.SurgeryRoomMasterBo = BoFactory.GetBo(SurgeryRoomMasterBo, this.Request);
    }

    public async AddSurgeryRoomMaster(req: BaseRequest): Promise<number> {
        return await this.SurgeryRoomMasterBo.AddSurgeryRoomMaster(req);
    }

    public async UpdateSurgeryRoomMaster(req: BaseRequest): Promise<boolean> {
        return await this.SurgeryRoomMasterBo.UpdateSurgeryRoomMaster(req);
    }

    public async GetSurgeryRoomMasterById(req: BaseRequest): Promise<SurgeryRoomMasterAttributes> {
        return await this.SurgeryRoomMasterBo.GetSurgeryRoomMasterById(req);
    }

    public async GetSurgeryRoomMasters(apiReq?: ApiRequest<SurgeryRoomFilters>): Promise<ApiResponse<SurgeryRoomMasterAttributes[]>> {
        return await this.SurgeryRoomMasterBo.GetSurgeryRoomMasters(apiReq);
    }

    public async DeleteSurgeryRoomMaster(req: BaseRequest): Promise<Boolean> {
        return await this.SurgeryRoomMasterBo.DeleteSurgeryRoomMaster(req);
    }
}
