import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AERegistrationInstance, AERegistrationAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as encounterBo from '../../Visit/Business/Index';
import { AERegistrationFilters } from '../Common/Filters.e';

export class AERegistrationBo extends BaseBo<AERegistrationInstance, AERegistrationAttributes>  {
    public async AddAERegistration(req: BaseRequest): Promise<number> {
        var data = req.Data;
        let Encounter: any = {
            Data: {
                Id:0,
                PatientId: data.PatientId,
                WardId:data.WardId,
                RoomId:data.RoomId,
                BedId:data.BedId,
                PatientMrn: data.PatientMrn,
                DoctorId: data.DoctorId,
                DoctorName: data.DoctorName,
                DepartmentId: data.DepartmentId,
                GuarantorId: data.GuarantorId,
                GuarantorTypeId: data.GuarantorTypeId,
                FacilityId: data.FacilityId,
                DiagnosisId: data.DiagnosisId,
                EncounterTypeId: 3,
                AdmissionDate:data.EmergencyDate,
                AdmissionStatusId: data.AdmissionStatusId
            }
        };
        let EncounterBo = BoFactory.GetBo(encounterBo.EncounterBo, this.Request);
        req.Data.EncounterId = await EncounterBo.ManageAdmissionEncounter(Encounter);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAERegistration(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAERegistrationById(req: BaseRequest): Promise<AERegistrationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async GetAERegistrations(apiReq?: ApiRequest<AERegistrationFilters>): Promise<ApiResponse<AERegistrationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let patientWhere: WhereOptions<any>= {};
        let encounterWhere: WhereOptions<any>= {};
        let isReqPatientSearch, isReqEncounterSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.PatientGuarantor, attributes: ['GuarantorName'], required: false
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ERType'));
        include.push(this.GetReference('ModeOfTransport'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AERegistrationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AERegistrationFilters.Patient:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$like': (param.Value || '') } }];
                        isReqPatientSearch = true;
                        break;
                    case AERegistrationFilters.AdmissionStatus:
                        encounterWhere['AdmissionStatusId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case AERegistrationFilters.ERType:
                        where['ERTypeId'] = param.Value;
                        break;
                    case AERegistrationFilters.ERDate:
                        where['EmergencyDate'] = { '$between': param.Value || '' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter,
            required: isReqEncounterSearch,
            where: encounterWhere,
            include: [this.GetReference('AdmissionStatus')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        /*let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, include: include,
            attributes: apiReq.Attributes, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);*/
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAERegistration(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AERegistrationInstance, AERegistrationAttributes> {
        return this.Models.AERegistration;
    }
}
