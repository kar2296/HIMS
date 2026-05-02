import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientDischargeMedicationInstance, PatientDischargeMedicationAttributes } from '../Model/Interface/Index';
import { PatientDischargeMedicationFilters } from '../Common/Filters.e';

export class PatientDischargeMedicationBo extends BaseBo<PatientDischargeMedicationInstance,
    PatientDischargeMedicationAttributes> implements IOptionProvider {
    public async AddPatientDischargeMedication(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDischargeMedication(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManagePatientDischargeMedication(req: BaseRequest): Promise<boolean> {
        let details: PatientDischargeMedicationAttributes[] = req.Data || [];
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
    public async GetPatientDischargeMedicationById(req: BaseRequest): Promise<PatientDischargeMedicationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetPatientDischargeMedications(apiReq?: ApiRequest<PatientDischargeMedicationFilters>):
        Promise<ApiResponse<PatientDischargeMedicationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDischargeMedicationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDischargeMedicationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDischargeMedicationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDischargeMedicationFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientDischargeMedicationFilters.IsSelectedDrug:
                        where['IsSelectedDrug'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDischargeMedication(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientDischargeMedicationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientDischargeMedications(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientDischargeMedicationInstance, PatientDischargeMedicationAttributes> {
        return this.Models.PatientDischargeMedication;
    }
}
