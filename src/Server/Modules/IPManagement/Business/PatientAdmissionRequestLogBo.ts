import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions} from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientAdmissionRequestLogInstance, PatientAdmissionRequestLogAttributes } from '../Model/Interface/Index';
import { PatientAdmissionRequestLogFilters } from '../Common/Filters.e';

export class PatientAdmissionRequestLogBo extends BaseBo<PatientAdmissionRequestLogInstance, PatientAdmissionRequestLogAttributes> {
    public async AddPatientAdmissionRequestLog(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientAdmissionRequestLog(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientAdmissionRequestLogById(req: BaseRequest): Promise<PatientAdmissionRequestLogAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientAdmissionRequestLogs(apiReq?: ApiRequest<PatientAdmissionRequestLogFilters>):
    Promise<ApiResponse<PatientAdmissionRequestLogAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any>= {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAdmissionRequestLogFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeletePatientAdmissionRequestLog(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAdmissionRequestLogInstance, PatientAdmissionRequestLogAttributes> {
        return this.Models.PatientAdmissionRequestLog;
    }
}
