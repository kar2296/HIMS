import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CarePathClinicalOrderInstance, CarePathClinicalOrderAttributes } from '../Model/Interface/Index';
import { CarePathClinicalOrderFilters } from '../Common/Filters.e';

export class CarePathClinicalOrderBo extends BaseBo<CarePathClinicalOrderInstance,
    CarePathClinicalOrderAttributes> implements IOptionProvider {
    public async AddCarePathClinicalOrder(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCarePathClinicalOrder(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCarePathClinicalOrderById(req: BaseRequest): Promise<CarePathClinicalOrderAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCarePathClinicalOrders(apiReq?: ApiRequest<CarePathClinicalOrderFilters>):
        Promise<ApiResponse<CarePathClinicalOrderAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Testmaster, attributes: ['Name'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TESTMASTERTYP'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CarePathClinicalOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CarePathClinicalOrderFilters.CarePathId:
                        where['CarePathId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCarePathClinicalOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CarePathClinicalOrderFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetCarePathClinicalOrders(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CarePathClinicalOrderInstance, CarePathClinicalOrderAttributes> {
        return this.Models.CarePathClinicalOrder;
    }
}
