import { BaseService, BoFactory } from '../../Base/Index';
import { GeneralDisplayBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GeneralDisplayAttributes } from '../Model/Interface/Index';
import { GeneraldisplayFilters } from '../Common/Filters.e';

export class GeneralDisplayService extends BaseService {
    private GeneralDisplayBo: GeneralDisplayBo;
    constructor(req?: Request) {
        super(req);
        this.GeneralDisplayBo = BoFactory.GetBo(GeneralDisplayBo, this.Request);
    }

    public async AddGeneralDisplay(req: BaseRequest): Promise<number> {
        return await this.GeneralDisplayBo.AddGeneralDisplay(req);
    }

    public async UpdateGeneralDisplay(req: BaseRequest): Promise<boolean> {
        return await this.GeneralDisplayBo.UpdateGeneralDisplay(req);
    }

    public async GetGeneralDisplayById(req: BaseRequest): Promise<GeneralDisplayAttributes> {
        return await this.GeneralDisplayBo.GetGeneralDisplayById(req);
    }
    public async GetListofContents(apiReq?: ApiRequest<GeneraldisplayFilters>): Promise<number[]> {
        return await this.GeneralDisplayBo.GetListofContents(apiReq);
    }

    public async GetGeneralDisplays(apiReq?: ApiRequest<GeneraldisplayFilters>):
        Promise<ApiResponse<GeneralDisplayAttributes[]>> {
        return await this.GeneralDisplayBo.GetGeneralDisplays(apiReq);
    }

    public async DeleteGeneralDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.GeneralDisplayBo.DeleteGeneralDisplay(req);
    }
}
