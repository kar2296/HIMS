import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DrugFrequencyInstance, DrugFrequencyAttributes } from '../Model/Interface/Index';
import { DrugFrequencyFilters } from '../Common/Filters.e';

export class DrugFrequencyBo extends BaseBo<DrugFrequencyInstance, DrugFrequencyAttributes>  {
    public async AddDrugFrequency(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDrugFrequency(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDrugFrequencyById(req: BaseRequest): Promise<DrugFrequencyAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDrugFrequencys(apiReq?: ApiRequest<DrugFrequencyFilters>): Promise<ApiResponse<DrugFrequencyAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('DrugFrequencyType'));
        include.push(this.GetReference('DrugFrequencySIGCode'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DrugFrequencyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DrugFrequencyFilters.Name:
                        (where as any) ['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case DrugFrequencyFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case DrugFrequencyFilters.DrugFrequencyType:
                        where['DrugFrequencyTypeId'] = param.Value;
                        break;
                    case DrugFrequencyFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDrugFrequency(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DrugFrequencyFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Code', 'Description', 'NoOfTimes'];
        let val = await this.GetDrugFrequencys(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<DrugFrequencyInstance, DrugFrequencyAttributes> {
        return this.Models.DrugFrequency;
    }

}
