import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions, IncludeOptions} from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse} from '../../../Common/Index';
import { ReferenceValueGroupInstance, ReferenceValueGroupAttributes} from '../Model/Interface/Index';
import { ReferenceValueGroupFilters } from '../Common/Filters.e';

export class ReferenceValueGroupBo extends BaseBo<ReferenceValueGroupInstance, ReferenceValueGroupAttributes> implements IOptionProvider {
    public async AddReferenceValueGroup(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReferenceValueGroup(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetReferenceValueGroupById(req: BaseRequest): Promise<ReferenceValueGroupAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetReferenceValueGroups(apiReq?: ApiRequest<ReferenceValueGroupFilters>)
        : Promise<ApiResponse<ReferenceValueGroupAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case ReferenceValueGroupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ReferenceValueGroupFilters.Name:
                        where['GroupName'] = { '$like': (param.Value || '') + '%'};
                        break;
                    case ReferenceValueGroupFilters.GroupCode:
                        where['GroupCode'] = { '$like': (param.Value || '') + '%'};
                        break;
                    case ReferenceValueGroupFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ReferenceValueGroupFilters.ModuleId:
                        where['ScreenId'] = param.Value;
                        break;
                    case ReferenceValueGroupFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteReferenceValueGroup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ReferenceValueGroupInstance, ReferenceValueGroupAttributes> {
        return this.Models.ReferenceValueGroup;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ReferenceValueGroupFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GroupName', 'Text'], 'GroupCode', 'Description'];
        let val = await this.GetReferenceValueGroups(apiReq);
        return { [key]: val };
    }
}
