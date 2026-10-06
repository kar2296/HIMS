import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientFollowupInstance, PatientFollowupAttributes } from '../Model/Interface/Index';
import { PatientFollowupFilters } from '../Common/Filters.e';

export class PatientFollowupBo extends BaseBo<PatientFollowupInstance, PatientFollowupAttributes> {
    public async AddPatientFollowup(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientFollowup(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientFollowups(req: BaseRequest): Promise<boolean> {
        let list: PatientFollowupAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPatientFollowupById(req: BaseRequest): Promise<PatientFollowupAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Encounter,
            attributes: ['EncounterId', 'PatientId', 'DoctorId', 'AppointmentId', 'EncounterTypeId', 'VisitIdentifier',
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId',
                'IsBillLock'],
            required: false,
            include: [{ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false },
            {
                model: this.Models.UserTeam, required: false,
                include: [this.GetReference('Team')]
            }],
        });
        include.push(this.GetReference('Team'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetPatientFollowups(apiReq?:
        ApiRequest<PatientFollowupFilters>): Promise<ApiResponse<PatientFollowupAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('FollowupType'));
        include.push(this.GetReference('FollowupStatus'));
        include.push(this.GetReference('Team'));
        include.push({ model: this.Models.Department, required: false });
        include.push({
            model: this.Models.Encounter,
            attributes: ['EncounterId', 'PatientId', 'DoctorId', 'AppointmentId', 'EncounterTypeId', 'VisitIdentifier',
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId',
                'IsBillLock'],
            required: false,
            include: [{ model: this.Models.Procedure, attributes: ['ProcedureName'], required: false },
            {
                model: this.Models.UserTeam, required: false,
                include: [this.GetReference('Team')]
            }],


        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientFollowupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientFollowupFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientFollowupFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientFollowupFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case PatientFollowupFilters.UnitId:
                        where['UnitId'] = param.Value;
                        break;
                    case PatientFollowupFilters.MobileNo:
                        (patientWhere as any)['$or'] = [{ 'Mobile': { '$like': (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientFollowupFilters.AdmitDate:
                        where['AdmitDate'] = param.Value;
                        break;
                    case PatientFollowupFilters.FollowupTypeId:
                        where['FollowupTypeId'] = param.Value;
                        break;
                    case PatientFollowupFilters.FollowupStatusId:
                        where['FollowupStatusId'] = param.Value;
                        break;
                    case PatientFollowupFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'DOB', 'Age', 'GenderId',
                'AddressLine1', 'Area', 'City', 'State', 'Pincode', 'Country', 'Mobile'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientFollowupInstance, PatientFollowupAttributes> {
        return this.Models.PatientFollowup;
    }

}
