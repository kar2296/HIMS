import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CardMasterInstance, CardMasterAttributes } from '../Model/Interface/Index';
import { CardMasterFilters } from '../Common/Filters.e';

export class CardMasterBo extends BaseBo<CardMasterInstance, CardMasterAttributes> implements IOptionProvider {
    public async AddCardMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCardMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCardMasterById(req: BaseRequest): Promise<CardMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCardMasters(apiReq?: ApiRequest<CardMasterFilters>): Promise<ApiResponse<CardMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('CardMasterType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CardMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CardMasterFilters.Code:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } },
                        { CardName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case CardMasterFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case CardMasterFilters.CardMasterType:
                        where['CardMasterTypeId'] = param.Value;
                        break;
                    case CardMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CardMasterFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCardMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CardMasterInstance, CardMasterAttributes> {
        return this.Models.CardMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CardMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CardName', 'Text'], 'CardName', 'Code'];
        let val = await this.GetCardMasters(apiReq);
        return { [key]: val.Data };
    }
}
