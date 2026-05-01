import {BaseService, BoFactory } from '../../Base/Index';
import { DrawsiteBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { DrawsiteAttributes } from '../Model/Interface/Index';

export class DrawsiteService extends BaseService {
    private DrawsiteBo: DrawsiteBo;
    constructor(req?: Request) {
        super(req);
        this.DrawsiteBo = BoFactory.GetBo(DrawsiteBo, this.Request);
    }

    public async AddDrawsite(req: BaseRequest): Promise<number> {
        return await this.DrawsiteBo.AddDrawsite(req);
    }

    public async UpdateDrawsite(req: BaseRequest): Promise<boolean> {
        return await this.DrawsiteBo.UpdateDrawsite(req);
    }

    public async GetDrawsiteById(req: BaseRequest): Promise<DrawsiteAttributes> {
        return await this.DrawsiteBo.GetDrawsiteById(req);
    }

    public async GetDrawsites(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<DrawsiteAttributes[]>> {
        return await this.DrawsiteBo.GetDrawsites(apiReq);
    }

    public async DeleteDrawsite(req: BaseRequest): Promise<Boolean> {
        return await this.DrawsiteBo.DeleteDrawsite(req);
    }
}
