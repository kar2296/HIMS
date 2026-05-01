import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StoreRackInstance, StoreRackAttributes } from '../Model/Interface/Index';
import { StoreRackFilters } from '../Common/Filters.e';

export class StoreRackBo extends BaseBo<StoreRackInstance, StoreRackAttributes> {
    public async AddStoreRack(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStoreRack(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStoreRackById(req: BaseRequest): Promise<StoreRackAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStoreRacks(apiReq?: ApiRequest<StoreRackFilters>): Promise<ApiResponse<StoreRackAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StoreRackFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StoreRackFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StoreRackFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StoreRackFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case StoreRackFilters.RackCode:
                        where['RackCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case StoreRackFilters.RackName:
                        where['RackName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStoreRack(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StoreRackInstance, StoreRackAttributes> {
        return this.Models.StoreRack;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StoreRackFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [['StoreRackId', 'Id'], 'StoreRackId', 'StoreMasterId', 'StoreCode',
            'StoreName', 'RackId', 'RackCode', ['RackName', 'Text'], 'RackName'];
        let val = await this.GetStoreRacks(apiReq);
        return { [key]: val.Data };
    }
}
