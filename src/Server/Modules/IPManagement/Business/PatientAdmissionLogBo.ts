import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAdmissionLogInstance, PatientAdmissionLogAttributes } from '../Model/Interface/Index';
import { PatientAdmissionLogFilters } from '../Common/Filters.e';

export class PatientAdmissionLogBo extends BaseBo<PatientAdmissionLogInstance, PatientAdmissionLogAttributes> {
    public async AddPatientAdmissionLog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientAdmissionLog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientAdmissionLogById(req: BaseRequest): Promise<PatientAdmissionLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientAdmissionLogs(apiReq?: ApiRequest<PatientAdmissionLogFilters>):
        Promise<ApiResponse<PatientAdmissionLogAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AdmissionStatus'));
        include.push({
            model: this.Models.User, as: 'Created', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
		  include.push(this.GetReference('AdmittingReason'));
         include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAdmissionLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAdmissionLogFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push({
        //     model: this.Models.Patient,
        //     attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
        //     required: isReqPatientSearch,
        //     where: patientWhere,
        //     include: [this.GetReference('Title'), this.GetReference('Gender')]
        // });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeletePatientAdmissionLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAdmissionLogInstance, PatientAdmissionLogAttributes> {
        return this.Models.PatientAdmissionLog;
    }
}
