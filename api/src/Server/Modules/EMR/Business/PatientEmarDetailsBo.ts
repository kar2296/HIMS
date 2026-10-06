import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientEmarDetailsInstance, PatientEmarDetailsAttributes } from '../Model/Interface/Index';
import { PatientEmarDetailsFilters } from '../Common/Filters.e';

export class PatientEmarDetailsBo extends BaseBo<PatientEmarDetailsInstance, PatientEmarDetailsAttributes>  {
    public async AddPatientEmarDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientEmarDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
     public async ManagePatientEmarDetails(patientemarId: number, details: PatientEmarDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PatienteMARId = patientemarId;
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

    public async GetPatientEmarDetailsById(req: BaseRequest): Promise<PatientEmarDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientEmarDetailss(apiReq?: ApiRequest<PatientEmarDetailsFilters>):
        Promise<ApiResponse<PatientEmarDetailsAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //     as: 'CreatedUser',
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
        //     as: 'UpdatedUser',
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.Prescription,
        //     attributes: ['PrescriptionDate', 'DoctorId', 'DepartmentId', 'PrescriptionPriorityId', 'PharmacyId'], required: false
        // });
        // include.push({ model: this.Models.GenericMaster, attributes: ['GenericName'], required: false });
        // include.push({ model: this.Models.DrugMaster, attributes: ['DrugName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientEmarDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientEmarDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientEmarDetailsInstance, PatientEmarDetailsAttributes> {
        return this.Models.PatientEmarDetails;
    }

}
