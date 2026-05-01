import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { SpecialityInstance, SpecialityAttributes } from '../Model/Interface/Index';
import { SpecialityFilters } from '../Common/Filters.e';

export class SpecialityBo extends BaseBo<SpecialityInstance, SpecialityAttributes> implements IOptionProvider {
    public async AddSpeciality(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSpeciality(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSpecialityById(req: BaseRequest): Promise<SpecialityAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetSpecialitys(apiReq?: ApiRequest<SpecialityFilters>): Promise<ApiResponse<SpecialityAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], as: 'ParentSpeciality', required: false });
        include.push(this.GetReference('SpecialityType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SpecialityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SpecialityFilters.Name:
                        where['SpecialityName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case SpecialityFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case SpecialityFilters.SpecialityTypeId:
                        where['SpecialityTypeId'] = param.Value;
                        break;
                    case SpecialityFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSpeciality(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<SpecialityInstance, SpecialityAttributes> {
        return this.Models.Speciality;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SpecialityFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['SpecialityName', 'Text'], 'SpecialityCode'];
        let val = await this.GetSpecialitys(apiReq);
        return { [key]: val.Data };
    }
}
