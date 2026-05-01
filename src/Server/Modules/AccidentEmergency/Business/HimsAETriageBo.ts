import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AETriageInstance, AETriageAttributes } from '../Model/Interface/Index';
import { AETriageFilters } from '../Common/Filters.e';

export class AETriageBo extends BaseBo<AETriageInstance, AETriageAttributes>  {
    public async AddAETriage(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAETriage(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAETriageById(req: BaseRequest): Promise<AETriageAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async GetAETriages(apiReq?: ApiRequest<AETriageFilters>): Promise<ApiResponse<AETriageAttributes[]>> {
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
                    case AETriageFilters.Id:
                        where['Id'] = param.Value;
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

    public async DeleteAETriage(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AETriageInstance, AETriageAttributes> {
        return this.Models.AETriage;
    }
}
