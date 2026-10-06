import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions, IncludeOptions} from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse} from '../../../Common/Index';
import { AnalyterefmasterInstance, AnalyterefmasterAttributes} from '../Model/Interface/Index';
import { AnalyteRefFilters } from '../Common/Filters.e';

export class AnalyterefmasterBo extends BaseBo<AnalyterefmasterInstance, AnalyterefmasterAttributes> {
    public async AddAnalyterefmaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalyterefmaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnalyterefmasterById(req: BaseRequest): Promise<AnalyterefmasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAnalyterefmasters(apiReq?: ApiRequest<AnalyteRefFilters>): Promise<ApiResponse<AnalyterefmasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AnalyteRefType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
            switch (param.Key) {
                case AnalyteRefFilters.Id:
                    where['Id'] = param.Value;
                    break;
               case AnalyteRefFilters.Gendere:
                    where['GenderId'] = param.Value;
                    break;
                case AnalyteRefFilters.AnalyteId:
                    where['AnalyteId'] = param.Value;
                    break;
                case AnalyteRefFilters.AnalyteRefType:
                    where['AnalyteRefTypeId'] = param.Value;
                    break;
                case AnalyteRefFilters.status:
                    where['ActiveStatusId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteAnalyterefmaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AnalyterefmasterInstance, AnalyterefmasterAttributes> {
        return this.Models.Analyterefmaster;
    }

}
