import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterIPPackageDetailInstance, EncounterIPPackageDetailAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageDetailFilters } from '../Common/Filters.e';
import * as bo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class EncounterIPPackageDetailBo extends BaseBo<EncounterIPPackageDetailInstance, EncounterIPPackageDetailAttributes> {
    public async AddEncounterIPPackageDetail(req: BaseRequest): Promise<number> {
        console.log('****req.Data*******', req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterIPPackageDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterIPPackageDetailById(req: BaseRequest): Promise<EncounterIPPackageDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageEncounterIPPackageDetails(EncounterIPPackageId: number,
        details: EncounterIPPackageDetailAttributes[]): Promise<boolean> {
        let inclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceInclusionBo, this.Request);
        let exclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceExclusionBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let detail: any = Detail;
                detail.Id = detail.Id || 0;
                detail.EncounterIPPackageId = EncounterIPPackageId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let detailData = await this.Save(detail);
                    let EncounterIPPackageServiceInclusions: any = detail['EncounterIPPackageServiceInclusions'];
                    let EncounterIPPackageServiceExclusions: any = detail['EncounterIPPackageServiceExclusions'];
                    await inclusionBo.ManageEncounterIPPackageServiceInclusions(EncounterIPPackageId,
                        detailData.dataValues.Id, EncounterIPPackageServiceInclusions);
                    await exclusionBo.ManageEncounterIPPackageServiceExclusions(EncounterIPPackageId,
                        detailData.dataValues.Id, EncounterIPPackageServiceExclusions);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetEncounterIPPackageDetails(apiReq?: ApiRequest<EncounterIPPackageDetailFilters>):
        Promise<ApiResponse<EncounterIPPackageDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.EncounterIPPackageServiceInclusion, required: false });
        include.push({ model: this.Models.EncounterIPPackageServiceExclusion, required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterIPPackageDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageDetailFilters.EncounterIPPackageId:
                    where['EncounterIPPackageId'] = param.Value;
                    break;
                case EncounterIPPackageDetailFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetMinEncounterIPPackageDetails(apiReq?: ApiRequest<EncounterIPPackageDetailFilters>):
        Promise<ApiResponse<EncounterIPPackageDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({ model: this.Models.EncounterIPPackageServiceInclusion, attributes: ['Id'], required: false });
        // include.push({ model: this.Models.EncounterIPPackageServiceExclusion, attributes: ['Id'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case EncounterIPPackageDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageDetailFilters.EncounterIPPackageId:
                    where['EncounterIPPackageId'] = param.Value;
                    break;
                case EncounterIPPackageDetailFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        apiReq.Attributes = ['Id', 'EncounterIPPackageId',
            'ServiceCategoryId'];
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeleteEncounterIPPackageDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EncounterIPPackageDetailInstance, EncounterIPPackageDetailAttributes> {
        return this.Models.EncounterIPPackageDetail;
    }

}
