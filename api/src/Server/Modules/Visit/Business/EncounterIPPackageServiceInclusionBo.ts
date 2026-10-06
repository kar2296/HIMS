import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { EncounterIPPackageServiceInclusionInstance, EncounterIPPackageServiceInclusionAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageServiceInclusionFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceInclusionBo extends BaseBo<EncounterIPPackageServiceInclusionInstance,
    EncounterIPPackageServiceInclusionAttributes> implements IOptionProvider {
    public async AddEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterIPPackageServiceInclusionById(req: BaseRequest): Promise<EncounterIPPackageServiceInclusionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageEncounterIPPackageServiceInclusions(EncounterIPPackageId: number, EncounterIPPackageDetailId: number,
        details: EncounterIPPackageServiceInclusionAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.EncounterIPPackageDetailId = EncounterIPPackageDetailId;
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

    public async GetEncounterIPPackageServiceInclusions(apiReq?: ApiRequest<EncounterIPPackageServiceInclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceInclusionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let BillDetailWhere: WhereOptions<any> = {};
        let IsDetailWhere: boolean = false;
        apiReq.Params.forEach((param) => {
            // if (this.IsValidParam(param)) {
            switch (param.Key) {
                case EncounterIPPackageServiceInclusionFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId:
                    where['EncounterIPPackageDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.PatientBillDetailId:
                    where['PatientBillDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ActiveStatusId:
                    where['ActiveStatusId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.BillStatusId:
                    BillDetailWhere['PatientBillStatusId'] = param.Value;
                    IsDetailWhere = true;
                    break;
                default:
                    throw 'Not Implemented';
            }
            // }
        });
        include.push({
            model: this.Models.PatientBillDetails,
            where: BillDetailWhere,
            required: IsDetailWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetMinEncounterIPPackageServiceInclusions(apiReq?: ApiRequest<EncounterIPPackageServiceInclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceInclusionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // let BillDetailWhere: WhereOptions<any> = {};
        // let IsDetailWhere: boolean = false;
        apiReq.Params.forEach((param) => {
            // if (this.IsValidParam(param)) {
            switch (param.Key) {
                case EncounterIPPackageServiceInclusionFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId:
                    where['EncounterIPPackageDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.PatientBillDetailId:
                    where['PatientBillDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case EncounterIPPackageServiceInclusionFilters.ActiveStatusId:
                    where['ActiveStatusId'] = param.Value;
                    break;
                // case EncounterIPPackageServiceInclusionFilters.BillStatusId:
                //     BillDetailWhere['PatientBillStatusId'] = param.Value;
                //     IsDetailWhere = true;
                //     break;
                default:
                    throw 'Not Implemented';
            }
            // }
        });
        // include.push({
        //     model: this.Models.PatientBillDetails,
        //     where: BillDetailWhere,
        //     required: IsDetailWhere
        // });
        apiReq.Attributes = ['Id'];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeleteEncounterIPPackageServiceInclusion(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EncounterIPPackageServiceInclusionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetEncounterIPPackageServiceInclusions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EncounterIPPackageServiceInclusionInstance, EncounterIPPackageServiceInclusionAttributes> {
        return this.Models.EncounterIPPackageServiceInclusion;
    }
}
