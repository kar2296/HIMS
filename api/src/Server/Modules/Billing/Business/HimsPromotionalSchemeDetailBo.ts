import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PromotionalSchemeDetailInstance, PromotionalSchemeDetailAttributes } from '../Model/Interface/Index';
import { PromotionalSchemeDetailFilters } from '../Common/Filters.e';

export class PromotionalSchemeDetailBo extends BaseBo<PromotionalSchemeDetailInstance,
    PromotionalSchemeDetailAttributes>  {
    public async AddPromotionalSchemeDetail(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePromotionalSchemeDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePromotionalSchemeDetail(PromotionalSchemeId: number,
        details: PromotionalSchemeDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PromotionalSchemeId = PromotionalSchemeId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPromotionalSchemeDetailById(req: BaseRequest): Promise<PromotionalSchemeDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPromotionalSchemeDetails(apiReq?: ApiRequest<PromotionalSchemeDetailFilters>):
        Promise<ApiResponse<PromotionalSchemeDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DiscountMode'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PromotionalSchemeDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PromotionalSchemeDetailFilters.PromotionalSchemeId:
                    where['PromotionalSchemeId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePromotionalSchemeDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PromotionalSchemeDetailInstance, PromotionalSchemeDetailAttributes> {
        return this.Models.PromotionalSchemeDetail;
    }
}
