import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAdviceMedicationInstance, PatientAdviceMedicationAttributes } from '../Model/Interface/Index';
import { PatientAdviceMedicationFilters } from '../Common/Filters.e';

export class PatientAdviceMedicationBo extends BaseBo<PatientAdviceMedicationInstance, PatientAdviceMedicationAttributes>  {
    public async AddPatientAdviceMedication(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientAdviceMedication(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientAdviceMedicationById(req: BaseRequest): Promise<PatientAdviceMedicationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async ManagePatientAdviceMedications(req: BaseRequest): Promise<boolean> {
        let details: PatientAdviceMedicationAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPatientAdviceMedications(apiReq?: ApiRequest<PatientAdviceMedicationFilters>):
        Promise<ApiResponse<PatientAdviceMedicationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DurationPeriod'));
        include.push(this.GetReference('DrugInstruction'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAdviceMedicationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAdviceMedicationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAdviceMedicationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientAdviceMedicationFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientAdviceMedication(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<PatientAdviceMedicationInstance, PatientAdviceMedicationAttributes> {
        return this.Models.PatientAdviceMedication;
    }
}
