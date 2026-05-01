import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { WardInsuranceTariffInstance, WardInsuranceTariffAttributes } from '../Model/Interface/Index';
import { WardInsuranceTariffFilters } from '../Common/Filters.e';

export class WardInsuranceTariffBo extends BaseBo<WardInsuranceTariffInstance, WardInsuranceTariffAttributes> {
    public async AddWardInsuranceTariff(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardInsuranceTariff(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageWardInsuranceTariff(req: BaseRequest): Promise<boolean> {
        let list: WardInsuranceTariffAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetWardInsuranceTariffById(req: BaseRequest): Promise<WardInsuranceTariffAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWardInsuranceTariffs(apiReq?: ApiRequest<WardInsuranceTariffFilters>):
        Promise<ApiResponse<WardInsuranceTariffAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('ActiveStatus'));
        // include.push({ model: this.Models.ServiceItem, attributes: ['Name', 'ItemCode'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardInsuranceTariffFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardInsuranceTariffFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case WardInsuranceTariffFilters.InsuranceId:
                        where['InsuranceId'] = param.Value;
                        break;
                    case WardInsuranceTariffFilters.RateTypeId:
                        where['RateTypeId'] = param.Value;
                        break;
                    case WardInsuranceTariffFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardInsuranceTariffFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    case WardInsuranceTariffFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWardInsuranceTariff(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WardInsuranceTariffInstance, WardInsuranceTariffAttributes> {
        return this.Models.WardInsuranceTariff;
    }
}
