import {BaseService, BoFactory } from '../../Base/Index';
import { ResultStatusBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ResultStatusAttributes } from '../Model/Interface/Index';

export class ResultStatusService extends BaseService {
    private ResultStatusBo: ResultStatusBo;
    constructor(req?: Request) {
        super(req);
        this.ResultStatusBo = BoFactory.GetBo(ResultStatusBo, this.Request);
    }

    public async AddResultStatus(req: BaseRequest): Promise<number> {
        return await this.ResultStatusBo.AddResultStatus(req);
    }

    public async UpdateResultStatus(req: BaseRequest): Promise<boolean> {
        return await this.ResultStatusBo.UpdateResultStatus(req);
    }

    public async GetResultStatusById(req: BaseRequest): Promise<ResultStatusAttributes> {
        return await this.ResultStatusBo.GetResultStatusById(req);
    }

    public async GetResultStatuss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<ResultStatusAttributes[]>> {
        return await this.ResultStatusBo.GetResultStatuss(apiReq);
    }

    public async DeleteResultStatus(req: BaseRequest): Promise<Boolean> {
        return await this.ResultStatusBo.DeleteResultStatus(req);
    }
}
