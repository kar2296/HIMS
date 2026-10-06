import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TreatementModalityInstance, TreatementModalityAttributes } from '../Model/Interface/Index';
import { TreatementModalityFilters } from '../Common/Filters.e';

export class TreatementModalityBo extends BaseBo<TreatementModalityInstance, TreatementModalityAttributes>  {
    public async AddTreatementModality(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTreatementModality(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageTreatementModality(req: BaseRequest): Promise<boolean> {
        let list: TreatementModalityAttributes[] = req.Data || [];
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


    public async GetTreatementModalityById(req: BaseRequest): Promise<TreatementModalityAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetTreatementModalitys(apiReq?: ApiRequest<TreatementModalityFilters>):
        Promise<ApiResponse<TreatementModalityAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TreatementModalityFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TreatementModalityFilters.ModalityName:
                        where['ModalityName'] = param.Value;
                        break;
                    case TreatementModalityFilters.ModalityCode:
                        where['ModalityCode'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTreatementModality(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TreatementModalityInstance, TreatementModalityAttributes> {
        return this.Models.TreatementModality;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<TreatementModalityFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id',['ModalityName', 'Text'], 'ModalityName'];
        let val = await this.GetTreatementModalitys(apiReq);
        return { [key]: val.Data };
    }
}
