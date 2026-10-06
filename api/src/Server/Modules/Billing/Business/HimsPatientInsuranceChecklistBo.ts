import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientInsuranceChecklistFilters } from '../Common/Filters.e';
import { PatientInsuranceChecklistInstance, PatientInsuranceChecklistAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';

export class PatientInsuranceChecklistBo extends BaseBo<PatientInsuranceChecklistInstance, PatientInsuranceChecklistAttributes>  {
    public async AddPatientInsuranceChecklist(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientInsuranceChecklist(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientInsuranceChecklist(req: BaseRequest)
        : Promise<boolean> {
        let details = req.Data.Details || [];
        await Promise.all(details.map((DetailItem: PatientInsuranceChecklistAttributes): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        let billsbo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        if (req.Data.ChecklistStatusId === 2) {
            let billdata: any = {
                Data: {
                    Header: {
                        Id: req.Data.BillId,
                        ChecklistStatusId: req.Data.ChecklistStatusId
                    },
                    paymentDetail: [],
                    Details: []
                }
            };
            await billsbo.UpdatePatientBills(billdata);
        }
        return true;
    }

    public async GetPatientInsuranceChecklistById(req: BaseRequest): Promise<PatientInsuranceChecklistAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientInsuranceChecklists(apiReq?: ApiRequest<PatientInsuranceChecklistFilters>):
        Promise<ApiResponse<PatientInsuranceChecklistAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.GuarantorChecklist, attributes: ['Title', 'SubTitle'], required: false });
        include.push(this.GetReference('ChecklistStatus'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientInsuranceChecklistFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientInsuranceChecklistFilters.patientBillId:
                    where['patientBillId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientInsuranceChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientInsuranceChecklistInstance, PatientInsuranceChecklistAttributes> {
        return this.Models.PatientInsuranceChecklist;
    }

}
