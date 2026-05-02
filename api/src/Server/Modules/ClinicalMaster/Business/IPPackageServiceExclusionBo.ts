import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { IPPackageServiceExclusionInstance, IPPackageServiceExclusionAttributes } from '../Model/Interface/Index';
import { IPPackageServiceExclusionFilters } from '../Common/Filters.e';

export class IPPackageServiceExclusionBo extends BaseBo<IPPackageServiceExclusionInstance,
    IPPackageServiceExclusionAttributes> implements IOptionProvider {
    public async AddIPPackageServiceExclusion(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIPPackageServiceExclusion(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPPackageServiceExclusionById(req: BaseRequest): Promise<IPPackageServiceExclusionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async ManageIPPackageServiceExclusions(IPPackageId: number, IPPackageDetailId: number,
        details: IPPackageServiceExclusionAttributes[]): Promise<boolean> {
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
    public async GetIPPackageServiceExclusions(apiReq?: ApiRequest<IPPackageServiceExclusionFilters>):
        Promise<ApiResponse<IPPackageServiceExclusionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPPackageServiceExclusionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IPPackageServiceExclusionFilters.IPPackageId:
                        where['IPPackageId'] = param.Value;
                        break;
                    case IPPackageServiceExclusionFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteIPPackageServiceExclusion(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<IPPackageServiceExclusionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetIPPackageServiceExclusions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<IPPackageServiceExclusionInstance, IPPackageServiceExclusionAttributes> {
        return this.Models.IPPackageServiceExclusion;
    }
}
