import {BaseService, BoFactory} from '../../Base/Index';
import { ScreenBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { ScreenAttributes} from '../Model/Interface/Index';
import { ScreenFilters } from '../Common/Filters.e';

export class ScreenService extends BaseService {
    private ScreenBo: ScreenBo;
    constructor(req?: Request) {
        super(req);
        this.ScreenBo = BoFactory.GetBo(ScreenBo, this.Request);
    }

    public async AddScreen(req: BaseRequest): Promise<number> {
        return await this.ScreenBo.AddScreen(req);
    }

    public async UpdateScreen(req: BaseRequest): Promise<boolean> {
        return await this.ScreenBo.UpdateScreen(req);
    }

    public async GetScreenById(req: BaseRequest): Promise<ScreenAttributes> {
        return await this.ScreenBo.GetScreenById(req);
    }

    public async GetScreens(apiReq?: ApiRequest<ScreenFilters>): Promise<ApiResponse<ScreenAttributes[]>> {
        return await this.ScreenBo.GetScreens(apiReq);
    }

    public async DeleteScreen(req: BaseRequest): Promise<Boolean> {
        return await this.ScreenBo.DeleteScreen(req);
    }
}
