import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { NotionalRentInstance, NotionalRentAttributes } from '../Model/Interface/Index';
import { NotionalRentFilters } from '../Common/Filters.e';

export class NotionalRentBo extends BaseBo<NotionalRentInstance, NotionalRentAttributes> implements IOptionProvider {
    public async AddNotionalRent(req: BaseRequest): Promise<number> {
        // this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateNotionalRent(req: BaseRequest): Promise<boolean> {
        // this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageNotionalRents(req: BaseRequest): Promise<boolean> {
        let list: NotionalRentAttributes[] = req.Data || [];
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


    public async GetNotionalRentById(req: BaseRequest): Promise<NotionalRentAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetNotionalRents(apiReq?: ApiRequest<NotionalRentFilters>): Promise<ApiResponse<NotionalRentAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('AssetType'));
        // include.push(this.GetReference('AssetCatogory'));
        // include.push(this.GetReference('ModelId'));
        // include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case NotionalRentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case NotionalRentFilters.CostDetailId:
                        where['CostDetailId'] = param.Value;
                        break;
				    case NotionalRentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteNotionalRent(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<NotionalRentFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetNotionalRents(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<NotionalRentInstance, NotionalRentAttributes> {
        return this.Models.NotionalRent;
    }
}
