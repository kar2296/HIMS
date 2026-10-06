import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { IPPackageServiceInclusionInstance, IPPackageServiceInclusionAttributes } from '../Model/Interface/Index';
import { IPPackageServiceInclusionFilters } from '../Common/Filters.e';

export class IPPackageServiceInclusionBo extends BaseBo<IPPackageServiceInclusionInstance,
    IPPackageServiceInclusionAttributes> implements IOptionProvider {
    public async AddIPPackageServiceInclusion(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIPPackageServiceInclusion(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPPackageServiceInclusionById(req: BaseRequest): Promise<IPPackageServiceInclusionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageIPPackageServiceInclusions(IPPackageId: number, IPPackageDetailId: number,
        details: IPPackageServiceInclusionAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.IPPackageDetailId = IPPackageDetailId;
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

    public async GetIPPackageServiceInclusions(apiReq?: ApiRequest<IPPackageServiceInclusionFilters>):
        Promise<ApiResponse<IPPackageServiceInclusionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPPackageServiceInclusionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IPPackageServiceInclusionFilters.IPPackageId:
                        where['IPPackageId'] = param.Value;
                        break;
                    case IPPackageServiceInclusionFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteIPPackageServiceInclusion(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<IPPackageServiceInclusionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetIPPackageServiceInclusions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<IPPackageServiceInclusionInstance, IPPackageServiceInclusionAttributes> {
        return this.Models.IPPackageServiceInclusion;
    }
}
