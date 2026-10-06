import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { IndicationInstance, IndicationAttributes } from '../Model/Interface/Index';
import { IndicationFilters } from '../Common/Filters.e';

export class IndicationBo extends BaseBo<IndicationInstance, IndicationAttributes> implements IOptionProvider {
    public async AddIndication(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIndication(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIndicationById(req: BaseRequest): Promise<IndicationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetIndications(apiReq?: ApiRequest<IndicationFilters>): Promise<ApiResponse<IndicationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('IndicationType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IndicationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IndicationFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case IndicationFilters.Indications:
                        (where as any)[Op.or] = [{ Indications: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case IndicationFilters.IndicationTypeId:
                        where['OccupationTypeId'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteIndication(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IndicationInstance, IndicationAttributes> {
        return this.Models.Indication;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<IndicationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Indications', 'Text'], 'Indications', 'Code'];
        let val = await this.GetIndications(apiReq);
        return { [key]: val.Data };
    }
}
