import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider} from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DivisionInstance, DivisionAttributes } from '../Model/Interface/Index';
import { DivisionFilters } from '../Common/Filters.e';

export class DivisionBo extends BaseBo<DivisionInstance, DivisionAttributes> implements IOptionProvider {
    public async AddDivision(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDivision(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDivisionById(req: BaseRequest): Promise<DivisionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDivisions(apiReq?: ApiRequest<DivisionFilters>): Promise<ApiResponse<DivisionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DivisionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DivisionFilters.Name:
                        where['DivisionName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case DivisionFilters.DivisionCode:
                        where['DivisionCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case DivisionFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where,
            include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteDivision(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DivisionInstance, DivisionAttributes> {
        return this.Models.Division;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DivisionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DivisionName', 'Text'], 'DivisionCode', 'DivisionName'];
        let val = await this.GetDivisions(apiReq);
        return { [key]: val.Data };
    }
}
