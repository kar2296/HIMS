import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ModifiedPatientBillCategoryDetailsFilters } from '../Common/Filters.e';
import { ModifiedPatientBillCategoryDetailsInstance, ModifiedPatientBillCategoryDetailsAttributes } from '../Model/Interface/Index';

export class ModifiedPatientBillCategoryDetailsBo extends BaseBo<ModifiedPatientBillCategoryDetailsInstance,
    ModifiedPatientBillCategoryDetailsAttributes>  {
    public async AddModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageModifiedPatientBillCategoryDetails(ModifiedPatientBillId: number, ModifiedPatientBillCategoryId: number,
        details: ModifiedPatientBillCategoryDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ModifiedPatientBillCategoryId = ModifiedPatientBillCategoryId;
                detail.ModifiedPatientBillId = ModifiedPatientBillId;
                detail.ModifiedBillDateTime = new Date();
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

    public async GetModifiedPatientBillCategoryDetailsById(req: BaseRequest): Promise<ModifiedPatientBillCategoryDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetModifiedPatientBillCategoryDetails(apiReq?: ApiRequest<ModifiedPatientBillCategoryDetailsFilters>):
        Promise<ApiResponse<ModifiedPatientBillCategoryDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case ModifiedPatientBillCategoryDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.ModifiedPatientBillCategoryId:
                        where['ModifiedPatientBillCategoryId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.ModifiedPatientBillId:
                        where['ModifiedPatientBillId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ModifiedPatientBillCategoryDetailsFilters.IsSupplementary:
                        where['IsSupplementary'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteModifiedPatientBillCategoryDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ModifiedPatientBillCategoryDetailsInstance, ModifiedPatientBillCategoryDetailsAttributes> {
        return this.Models.ModifiedPatientBillCategoryDetails;
    }
}
