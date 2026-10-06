import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { EncounterIPPackageServiceExclusionInstance, EncounterIPPackageServiceExclusionAttributes } from '../Model/Interface/Index';
import { EncounterIPPackageServiceExclusionFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceExclusionBo extends BaseBo<EncounterIPPackageServiceExclusionInstance,
    EncounterIPPackageServiceExclusionAttributes> implements IOptionProvider {
    public async AddEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<boolean> {
        // console.log('*****req*****', req);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterIPPackageServiceExclusionById(req: BaseRequest): Promise<EncounterIPPackageServiceExclusionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async ManageEncounterIPPackageServiceExclusions(EncounterIPPackageId: number, EncounterIPPackageDetailId: number,
        details: EncounterIPPackageServiceExclusionAttributes[]): Promise<boolean> {
        details = details || [];
        // console.log('*****detail*****', details);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.EncounterIPPackageDetailId = EncounterIPPackageDetailId || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    console.log('**detail**', detail);
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }
    public async GetEncounterIPPackageServiceExclusions(apiReq?: ApiRequest<EncounterIPPackageServiceExclusionFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceExclusionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let BillDetailWhere: WhereOptions<any> = {};
        let IsDetailWhere: boolean = false;
        apiReq.Params.forEach((param) => {
            // if (this.IsValidParam(param)) {
            switch (param.Key) {
                case EncounterIPPackageServiceExclusionFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.EncounterIPPackageDetailId:
                    where['EncounterIPPackageDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.PatientBillDetailId:
                    where['PatientBillDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.ActiveStatusId:
                    where['ActiveStatusId'] = param.Value;
                    break;
                case EncounterIPPackageServiceExclusionFilters.BillStatusId:
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
    public async GetMinEncounterIPPackageServiceExclusions(apiReq?: ApiRequest<EncounterIPPackageServiceExclusionFilters>):
    Promise<ApiResponse<EncounterIPPackageServiceExclusionAttributes[]>> {
    let where: WhereOptions<any> = {};
    let include: Array<IncludeOptions> = [];
    // let BillDetailWhere: WhereOptions<any> = {};
    // let IsDetailWhere: boolean = false;
    apiReq.Params.forEach((param) => {
        // if (this.IsValidParam(param)) {
        switch (param.Key) {
            case EncounterIPPackageServiceExclusionFilters.Id:
                where['Id'] = param.Value;
                break;
            case EncounterIPPackageServiceExclusionFilters.EncounterIPPackageDetailId:
                where['EncounterIPPackageDetailId'] = param.Value;
                break;
            case EncounterIPPackageServiceExclusionFilters.ServiceCategoryId:
                where['ServiceCategoryId'] = param.Value;
                break;
            case EncounterIPPackageServiceExclusionFilters.PatientBillDetailId:
                where['PatientBillDetailId'] = param.Value;
                break;
            case EncounterIPPackageServiceExclusionFilters.ServiceItemId:
                where['ServiceItemId'] = param.Value;
                break;
            case EncounterIPPackageServiceExclusionFilters.ActiveStatusId:
                where['ActiveStatusId'] = param.Value;
                break;
            // case EncounterIPPackageServiceExclusionFilters.BillStatusId:
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
    public async DeleteEncounterIPPackageServiceExclusion(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EncounterIPPackageServiceExclusionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetEncounterIPPackageServiceExclusions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EncounterIPPackageServiceExclusionInstance, EncounterIPPackageServiceExclusionAttributes> {
        return this.Models.EncounterIPPackageServiceExclusion;
    }
}
