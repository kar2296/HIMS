import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LocationMasterInstance, LocationMasterAttributes } from '../Model/Interface/Index';
import { LocationMasterFilters } from '../Common/Filters.e';

export class LocationMasterBo extends BaseBo<LocationMasterInstance, LocationMasterAttributes> implements IOptionProvider {
    public async AddLocationMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLocationMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLocationMasterById(req: BaseRequest): Promise<LocationMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLocationMasters(apiReq?: ApiRequest<LocationMasterFilters>): Promise<ApiResponse<LocationMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LocationMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LocationMasterFilters.LocationName:
                        (where as any)[Op.or] = [{ LocationName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case LocationMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case LocationMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLocationMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LocationMasterInstance, LocationMasterAttributes> {
        return this.Models.LocationMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<LocationMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['LocationName', 'Text']];
        let val = await this.GetLocationMasters(apiReq);
        return { [key]: val.Data };
    }
}
