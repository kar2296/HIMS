import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    EncounterIPPackageServiceNonMedicalInstance,
    EncounterIPPackageServiceNonMedicalAttributes
} from '../Model/Interface/Index';
import { EncounterIPPackageServiceNonMedicalFilters } from '../Common/Filters.e';

export class EncounterIPPackageServiceNonMedicalBo extends BaseBo<EncounterIPPackageServiceNonMedicalInstance,
    EncounterIPPackageServiceNonMedicalAttributes> implements IOptionProvider {
    public async AddEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<boolean> {
        // console.log('*****req*****', req);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterIPPackageServiceNonMedicalById(req: BaseRequest): Promise<EncounterIPPackageServiceNonMedicalAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async ManageEncounterIPPackageServiceNonMedicals(EncounterIPPackageId: number, EncounterIPPackageDetailId: number,
        details: EncounterIPPackageServiceNonMedicalAttributes[]): Promise<boolean> {
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
    public async GetEncounterIPPackageServiceNonMedicals(apiReq?: ApiRequest<EncounterIPPackageServiceNonMedicalFilters>):
        Promise<ApiResponse<EncounterIPPackageServiceNonMedicalAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let BillDetailWhere: WhereOptions<any> = {};
        let IsDetailWhere: boolean = false;
        apiReq.Params.forEach((param) => {
            // if (this.IsValidParam(param)) {
            switch (param.Key) {
                case EncounterIPPackageServiceNonMedicalFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.EncounterIPPackageDetailId:
                    where['EncounterIPPackageDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.PatientBillDetailId:
                    where['PatientBillDetailId'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.ServiceItemId:
                    where['ServiceItemId'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.ActiveStatusId:
                    where['ActiveStatusId'] = param.Value;
                    break;
                case EncounterIPPackageServiceNonMedicalFilters.BillStatusId:
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

    public async DeleteEncounterIPPackageServiceNonMedical(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EncounterIPPackageServiceNonMedicalFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetEncounterIPPackageServiceNonMedicals(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EncounterIPPackageServiceNonMedicalInstance, EncounterIPPackageServiceNonMedicalAttributes> {
        return this.Models.EncounterIPPackageServiceNonMedical;
    }
}
