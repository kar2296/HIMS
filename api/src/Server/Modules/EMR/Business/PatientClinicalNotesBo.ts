import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientClinicalNotesInstance, PatientClinicalNotesAttributes } from '../Model/Interface/Index';
import { PatientClinicalNotesFilters } from '../Common/Filters.e';

export class PatientClinicalNotesBo extends BaseBo<PatientClinicalNotesInstance, PatientClinicalNotesAttributes>  {
    public async AddPatientClinicalNotes(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientClinicalNotes(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientClinicalNotesById(req: BaseRequest): Promise<PatientClinicalNotesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientClinicalNotess(apiReq?: ApiRequest<PatientClinicalNotesFilters>):
        Promise<ApiResponse<PatientClinicalNotesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('IllnessType'));
        include.push(this.GetReference('IllnessDurationType'));
        include.push(this.GetReference('PatientClinicalNotesType'));
        include.push({
            model: this.Models.Encounter, attributes: ['DoctorName', 'VisitTypeId'], required: false,
            include: [this.GetReference('VisitType')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientClinicalNotesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.PatientClinicalNotesTypeId:
                        where['PatientClinicalNotesTypeId'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case PatientClinicalNotesFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientClinicalNotesFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientClinicalNotes(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientClinicalNotesInstance, PatientClinicalNotesAttributes> {
        return this.Models.PatientClinicalNotes;
    }
}
