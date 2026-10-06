import {BaseService, BoFactory } from '../../Base/Index';
import { ControlBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ControlAttributes } from '../Model/Interface/Index';
import { ControlFilters } from '../Common/Filters.e';

export class ControlService extends BaseService {
    private ControlBo: ControlBo;
    constructor(req?: Request) {
        super(req);
        this.ControlBo = BoFactory.GetBo(ControlBo, this.Request);
    }

    public async AddControl(req: BaseRequest): Promise<number> {
        return await this.ControlBo.AddControl(req);
    }

    public async UpdateControl(req: BaseRequest): Promise<boolean> {
        return await this.ControlBo.UpdateControl(req);
    }

    public async GetControlById(req: BaseRequest): Promise<ControlAttributes> {
        return await this.ControlBo.GetControlById(req);
    }

    public async GetControls(apiReq?: ApiRequest<ControlFilters>): Promise<ApiResponse<ControlAttributes[]>> {
        return await this.ControlBo.GetControls(apiReq);
    }

    public async DeleteControl(req: BaseRequest): Promise<Boolean> {
        return await this.ControlBo.DeleteControl(req);
    }
}
