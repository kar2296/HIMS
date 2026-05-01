import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IPPackageDetailInstance, IPPackageDetailAttributes } from '../Model/Interface/Index';
import { IPPackageDetailFilters } from '../Common/Filters.e';
import * as bo from '../../ClinicalMaster/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class IPPackageDetailBo extends BaseBo<IPPackageDetailInstance, IPPackageDetailAttributes>  {
    public async AddIPPackageDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIPPackageDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPPackageDetailById(req: BaseRequest): Promise<IPPackageDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageIPPackageDetails(IPPackageId: number, details: IPPackageDetailAttributes[]): Promise<boolean> {
        let inclusionBo = BoFactory.GetBo(bo.IPPackageServiceInclusionBo, this.Request);
        let exclusionBo = BoFactory.GetBo(bo.IPPackageServiceExclusionBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.IPPackageId = IPPackageId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let detailData = await this.Save(detail);
                    let IPPackageServiceInclusions: any = detail['IPPackageServiceInclusions'];
                    let IPPackageServiceExclusions: any = detail['IPPackageServiceExclusions'];
                    await inclusionBo.ManageIPPackageServiceInclusions(IPPackageId, detailData.dataValues.Id, IPPackageServiceInclusions);
                    await exclusionBo.ManageIPPackageServiceExclusions(IPPackageId, detailData.dataValues.Id, IPPackageServiceExclusions);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageIPTariffPackageDetails(IPPackageId: number, IPTariffDetailId: number,
        details: IPPackageDetailAttributes[]): Promise<boolean> {
        let inclusionBo = BoFactory.GetBo(bo.IPPackageServiceInclusionBo, this.Request);
        let exclusionBo = BoFactory.GetBo(bo.IPPackageServiceExclusionBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.IPPackageId = IPPackageId;
                detail.IPPackageTariffDetailId = IPTariffDetailId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let detailData = await this.Save(detail);
                    let IPPackageServiceInclusions: any = detail['IPPackageServiceInclusions'];
                    let IPPackageServiceExclusions: any = detail['IPPackageServiceExclusions'];
                    await inclusionBo.ManageIPPackageServiceInclusions(IPPackageId, detailData.dataValues.Id, IPPackageServiceInclusions);
                    await exclusionBo.ManageIPPackageServiceExclusions(IPPackageId, detailData.dataValues.Id, IPPackageServiceExclusions);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetIPPackageDetails(apiReq?: ApiRequest<IPPackageDetailFilters>):
        Promise<ApiResponse<IPPackageDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.IPPackageServiceInclusion, required: false });
        include.push({ model: this.Models.IPPackageServiceExclusion, required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case IPPackageDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case IPPackageDetailFilters.IPPackageId:
                    where['IPPackageId'] = param.Value;
                    break;
                case IPPackageDetailFilters.IPPackageTariffDetailId:
                    where['IPPackageTariffDetailId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteIPPackageDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IPPackageDetailInstance, IPPackageDetailAttributes> {
        return this.Models.IPPackageDetail;
    }

}
