import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { PromotionalSchemeInstance, PromotionalSchemeAttributes } from '../Model/Interface/Index';
import { PromotionalSchemeFilters } from '../Common/Filters.e';

export class PromotionalSchemeBo extends BaseBo<PromotionalSchemeInstance,
    PromotionalSchemeAttributes> {
    public async AddPromotionalScheme(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        if (result) {
            let PromotionalSchemeDetailBO = BoFactory.GetBo(bo.PromotionalSchemeDetailBo, this.Request);
            let PromotionalSchemeId = result.dataValues.Id;
            await PromotionalSchemeDetailBO.ManagePromotionalSchemeDetail(PromotionalSchemeId, req.Data.Details);

            return PromotionalSchemeId;
        }
        return 0;
    }

    public async UpdatePromotionalScheme(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        if (result) {
            let PromotionalSchemeDetailBO = BoFactory.GetBo(bo.PromotionalSchemeDetailBo, this.Request);
            let PromotionalSchemeId = req.Data.Header.Id;
            await PromotionalSchemeDetailBO.ManagePromotionalSchemeDetail(PromotionalSchemeId, req.Data.Details);

            return PromotionalSchemeId;
        }
        return result;
    }

    public async GetPromotionalSchemeById(req: BaseRequest): Promise<PromotionalSchemeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPromotionalSchemes(apiReq?: ApiRequest<PromotionalSchemeFilters>):
        Promise<ApiResponse<PromotionalSchemeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PromotionSchemeType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DiscountMode'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PromotionalSchemeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.PromotionSchemeTypeId:
                        where['PromotionSchemeTypeId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.From:
                        where['ActiveFrom'] = where['ActiveFrom'] || {};
                        (where['ActiveFrom'] as any)['$gte'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.To:
                        where['ActiveTo'] = where['ActiveTo'] || {};
                        (where['ActiveTo'] as any)['$gte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Guarantor,
            required: true
        });
        include.push({ model: this.Models.PromotionalSchemeDetail, required: true });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPromotionalSchemesWithoutDetails(apiReq?: ApiRequest<PromotionalSchemeFilters>):
        Promise<ApiResponse<PromotionalSchemeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PromotionSchemeType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PromotionalSchemeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.PromotionSchemeTypeId:
                        where['PromotionSchemeTypeId'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.From:
                        where['ActiveFrom'] = where['ActiveFrom'] || {};
                        (where['ActiveFrom'] as any)['$gte'] = param.Value;
                        break;
                    case PromotionalSchemeFilters.To:
                        where['ActiveTo'] = where['ActiveTo'] || {};
                        (where['ActiveTo'] as any)['$gte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Guarantor,
            required: true
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePromotionalScheme(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PromotionalSchemeInstance, PromotionalSchemeAttributes> {
        return this.Models.PromotionalScheme;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PromotionalSchemeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'GuarantorId', 'PromotionSchemeId', 'PromotionSchemeCode', 'PromotionSchemeTypeId',
            ['PromotionSchemeName', 'Text'], 'PromotionSchemeName', 'ActiveStatusId', 'ActiveTo', 'DiscountModeId'];
        let val = await this.GetPromotionalSchemes(apiReq);
        return { [key]: val.Data };
    }
}
