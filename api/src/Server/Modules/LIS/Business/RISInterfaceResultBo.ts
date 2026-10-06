import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { RISInterfaceResultInstance, RISInterfaceResultAttributes } from '../Model/Interface/Index';
import { RISInterfaceResultFilters } from '../Common/Filters.e';

export class RISInterfaceResultBo extends BaseBo<RISInterfaceResultInstance, RISInterfaceResultAttributes> implements IOptionProvider {
    public async AddRISInterfaceResult(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateRISInterfaceResult(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetRISInterfaceResultById(req: BaseRequest): Promise<RISInterfaceResultAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetRISInterfaceResults(apiReq?: ApiRequest<RISInterfaceResultFilters>):
     Promise<ApiResponse<RISInterfaceResultAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case RISInterfaceResultFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case RISInterfaceResultFilters.RISId:
                        where['RISId'] = param.Value;
                        break;
                    case RISInterfaceResultFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case RISInterfaceResultFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case RISInterfaceResultFilters.AnalyteId:
                        where['AnalyteId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteRISInterfaceResult(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<RISInterfaceResultFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetRISInterfaceResults(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<RISInterfaceResultInstance, RISInterfaceResultAttributes> {
        return this.Models.RISInterfaceResult;
    }
}
