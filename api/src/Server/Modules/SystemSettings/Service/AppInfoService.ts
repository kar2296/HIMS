import {BaseService, BoFactory } from '../../Base/Index';
import { AppInfoBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AppInfoAttributes } from '../Model/Interface/Index';
import { AppInfoFilters } from '../Common/Filters.e';

export class AppInfoService extends BaseService {
    private AppInfoBo: AppInfoBo;
    constructor(req?: Request) {
        super(req);
        this.AppInfoBo = BoFactory.GetBo(AppInfoBo, this.Request);
    }

    public async AddAppInfo(req: BaseRequest): Promise<number> {
        return await this.AppInfoBo.AddAppInfo(req);
    }

    public async UpdateAppInfo(req: BaseRequest): Promise<boolean> {
        return await this.AppInfoBo.UpdateAppInfo(req);
    }

    public async GetAppInfoById(req: BaseRequest): Promise<AppInfoAttributes> {
        return await this.AppInfoBo.GetAppInfoById(req);
    }

    public async GetAppInfos(apiReq?: ApiRequest<AppInfoFilters>): Promise<ApiResponse<AppInfoAttributes[]>> {
        return await this.AppInfoBo.GetAppInfos(apiReq);
    }

    public async DeleteAppInfo(req: BaseRequest): Promise<Boolean> {
        return await this.AppInfoBo.DeleteAppInfo(req);
    }
}
