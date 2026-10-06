import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IPPackageTariffDetailInstance, IPPackageTariffDetailAttributes } from '../Model/Interface/Index';
import { IPPackageTariffDetailFilters } from '../Common/Filters.e';
import * as bo from '../../ClinicalMaster/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class IPPackageTariffDetailBo extends BaseBo<IPPackageTariffDetailInstance, IPPackageTariffDetailAttributes>  {
    public async AddIPPackageTariffDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateIPPackageTariffDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPPackageTariffDetailById(req: BaseRequest): Promise<IPPackageTariffDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageIPPackageTariffDetails(IPPackageId: number,
        details: IPPackageTariffDetailAttributes[]): Promise<boolean> {
        let inclusionBo = BoFactory.GetBo(bo.IPPackageDetailBo, this.Request);
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
                    let IPPackageDetails: any = detail['IPPackageDetails'];
                    await inclusionBo.ManageIPTariffPackageDetails(IPPackageId,
                        detailData.dataValues.Id, IPPackageDetails);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    let IPPackageDetails: any = detail['IPPackageDetails'];
                    await inclusionBo.ManageIPTariffPackageDetails(IPPackageId,
                        detail.Id, IPPackageDetails);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetIPPackageTariffDetails(apiReq?: ApiRequest<IPPackageTariffDetailFilters>):
        Promise<ApiResponse<IPPackageTariffDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.IPPackageServiceInclusion, required: false });
        // include.push({ model: this.Models.IPPackageServiceExclusion, required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case IPPackageTariffDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case IPPackageTariffDetailFilters.IPPackageId:
                    where['IPPackageId'] = param.Value;
                    break;
                case IPPackageTariffDetailFilters.GuarantorTypeId:
                    where['GuarantorTypeId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteIPPackageTariffDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IPPackageTariffDetailInstance, IPPackageTariffDetailAttributes> {
        return this.Models.IPPackageTariffDetail;
    }

}
