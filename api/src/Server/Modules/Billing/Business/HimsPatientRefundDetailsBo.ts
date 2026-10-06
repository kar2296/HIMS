import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { PatientRefundDetailsInstance, PatientRefundDetailsAttributes } from '../Model/Interface/Index';
//import { PatientPaymentDetailsFilters } from '../Common/Filters.e';

export class PatientRefundDetailsBo extends BaseBo<PatientRefundDetailsInstance, PatientRefundDetailsAttributes>  {
    public async AddPatientRefundDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientRefundDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientRefundDetails(PatientRefundId: number, details: PatientRefundDetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientRefundId = PatientRefundId;
                detail.RefundDetailsDateTime = new Date();
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }

    public async GetPatientRefundDetailsById(req: BaseRequest): Promise<PatientRefundDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientRefundDetails(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientRefundDetailsAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientRefundDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientRefundDetailsInstance, PatientRefundDetailsAttributes> {
        return this.Models.PatientRefundDetails;
    }

}
