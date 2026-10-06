import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FrequencyMasterInstance, FrequencyMasterAttributes } from '../Model/Interface/Index';
import { FrequencyMasterFilters } from '../Common/Filters.e';

export class FrequencyMasterBo extends BaseBo<FrequencyMasterInstance, FrequencyMasterAttributes>  {
    public async AddFrequencyMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFrequencyMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFrequencyMasterById(req: BaseRequest): Promise<FrequencyMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFrequencyMasters(apiReq?: ApiRequest<FrequencyMasterFilters>): Promise<ApiResponse<FrequencyMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('FrequencyType'));
        include.push(this.GetReference('FrequencySIGCode'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
            switch (param.Key) {
                case FrequencyMasterFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case FrequencyMasterFilters.Name:
                    (where as any)['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                    break;
                case FrequencyMasterFilters.Facility:
                    where['FacilityId'] = param.Value;
                    break;
                case FrequencyMasterFilters.FrequencyType:
                    where['FrequencyTypeId'] = param.Value;
                    break;
                case FrequencyMasterFilters.ActiveStatus:
                    where['ActiveStatusId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFrequencyMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FrequencyMasterInstance, FrequencyMasterAttributes> {
        return this.Models.FrequencyMaster;
    }

}
