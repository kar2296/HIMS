import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDiagnosisInstance, PatientDiagnosisAttributes } from '../Model/Interface/Index';
import { PatientDiagnosisFilters } from '../Common/Filters.e';

export class PatientDiagnosisBo extends BaseBo<PatientDiagnosisInstance, PatientDiagnosisAttributes>  {
    public async AddPatientDiagnosis(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDiagnosis(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDiagnosisById(req: BaseRequest): Promise<PatientDiagnosisAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientDiagnosiss(req: BaseRequest): Promise<boolean> {
        let details: PatientDiagnosisAttributes[] = req.Data || [];
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
    public async GetPatientDiagnosiss(apiReq?: ApiRequest<PatientDiagnosisFilters>): Promise<ApiResponse<PatientDiagnosisAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ConditionType'));
        include.push(this.GetReference('ConditionStatus'));
        include.push({ model: this.Models.Diagnosis, attributes: ['Code', 'DiagnosisName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDiagnosisFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDiagnosisFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientDiagnosisFilters.DOA:
                    //     where['DOA'] = param.Value;
                    //     break;
                    // case PatientDiagnosisFilters.DOD:
                    //     where['DOD'] = param.Value;
                    //     break;
                    case PatientDiagnosisFilters.ConditionTypeId:
                        where['ConditionTypeId'] = param.Value;
                        break;
                    case PatientDiagnosisFilters.DiagnosisName:
                        where['DiagnosisName'] = param.Value;
                        break;
                    case PatientDiagnosisFilters.ConditionStatusId:
                        where['ConditionStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDiagnosis(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientDiagnosisInstance, PatientDiagnosisAttributes> {
        return this.Models.PatientDiagnosis;
    }
}
