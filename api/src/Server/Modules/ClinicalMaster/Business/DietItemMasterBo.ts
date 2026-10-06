import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { DietItemMasterInstance, DietItemMasterAttributes } from '../Model/Interface/Index';
import { DietItemMasterFilters } from '../Common/Filters.e';

export class DietItemMasterBo extends BaseBo<DietItemMasterInstance, DietItemMasterAttributes> implements IOptionProvider {
    public async AddDietItemMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDietItemMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDietItemMasterById(req: BaseRequest): Promise<DietItemMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDietItemMasters(apiReq?: ApiRequest<DietItemMasterFilters>): Promise<ApiResponse<DietItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('DietFrequency'));
        include.push(this.GetReference('DietCategory'));
        include.push(this.GetReference('DietItemType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DietItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DietItemMasterFilters.DietItemTypeId:
                        where['DietItemTypeId'] = param.Value;
                        break;
                    case DietItemMasterFilters.DietCategoryId:
                        where['DietCategoryId'] = param.Value;
                        break;
                    case DietItemMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DietItemMasterFilters.DietItemCode:
                        (where as any)['$or'] = [{ 'DietName': { '$like': (param.Value || '') + '%' } },
                        { 'DietItemCode': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case DietItemMasterFilters.IncludeServiceDetails:
                        let info = param.Value;
                        include.push({
                            model: this.Models.ServiceItem,
                            attributes: ['Id', 'Name', 'ItemCode'],
                            required: false,
                            where: { 'MasterTypeId': 3 }, //DietItemMaster
                            include: [{
                                model: this.Models.ServiceItemTariffDetail,
                                attributes: ['Rate', 'DoctorShare'],
                                required: false,
                                where: { 'ServiceRateCategoryId': info.ServiceRateCategoryId }
                            }]
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteDietItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<DietItemMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DietName', 'Text'], 'DietName', 'Description'];
        let val = await this.GetDietItemMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<DietItemMasterInstance, DietItemMasterAttributes> {
        return this.Models.DietItemMaster;
    }
}
