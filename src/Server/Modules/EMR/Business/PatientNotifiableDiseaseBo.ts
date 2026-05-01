import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientNotifiableDiseaseInstance, PatientNotifiableDiseaseAttributes } from '../Model/Interface/Index';
import { PatientNotifiableDiseaseFilters } from '../Common/Filters.e';

export class PatientNotifiableDiseaseBo extends BaseBo<PatientNotifiableDiseaseInstance, PatientNotifiableDiseaseAttributes>  {
    public async AddPatientNotifiableDisease(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientNotifiableDisease(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientNotifiableDiseaseById(req: BaseRequest): Promise<PatientNotifiableDiseaseAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientNotifiableDiseases(req: BaseRequest): Promise<boolean> {
        let details: PatientNotifiableDiseaseAttributes[] = req.Data || [];
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
    public async GetPatientNotifiableDiseases(apiReq?: ApiRequest<PatientNotifiableDiseaseFilters>):
        Promise<ApiResponse<PatientNotifiableDiseaseAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encWhere: WhereOptions<any> = {};
        let isReqEnc: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('NotifiableDiseaseType'));
        include.push(this.GetReference('NotifiableDisease'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientNotifiableDiseaseFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.Name:
                        where['NotifiableDiseaseName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientNotifiableDiseaseFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.NotifiableDiseaseType:
                        where['NotifiableDiseaseTypeId'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.NotifiableDisease:
                        where['NotifiableDiseaseId'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.PerformedDate:
                        where['PerformedDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientNotifiableDiseaseFilters.From:
                        where['PerformedDate'] = where['PerformedDate'] || {};
                        (where['PerformedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.To:
                        where['PerformedDate'] = where['PerformedDate'] || {};
                        (where['PerformedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientNotifiableDiseaseFilters.EncounterTypeId:
                        encWhere['EncounterTypeId'] = param.Value;
                        isReqEnc = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter, attributes: ['Id', 'VisitIdentifier', 'DoctorId', 'DoctorName',
                'EncounterTypeId', 'DepartmentId'],
            where: encWhere,
            required: isReqEnc,
            include: [
                this.GetReference('EncounterType'),
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                        'PhotoPath', 'SignPath'], required: false,
                    include: [this.GetReference('Title')]
                },
                { model: this.Models.Department, attributes: ['DepartmentName'], required: false }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientNotifiableDisease(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientNotifiableDiseaseInstance, PatientNotifiableDiseaseAttributes> {
        return this.Models.PatientNotifiableDisease;
    }
}
