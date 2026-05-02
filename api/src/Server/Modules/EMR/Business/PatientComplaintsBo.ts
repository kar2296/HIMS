import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientComplaintsInstance, PatientComplaintsAttributes } from '../Model/Interface/Index';
import { PatientComplaintsFilters } from '../Common/Filters.e';

export class PatientComplaintsBo extends
    BaseBo<PatientComplaintsInstance, PatientComplaintsAttributes>  {
    public async AddPatientComplaints(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientComplaints(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientComplaintsById(req: BaseRequest): Promise<PatientComplaintsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientComplaintss(req: BaseRequest): Promise<boolean> {
        let details: PatientComplaintsAttributes[] = req.Data || [];
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

    public async GetPatientComplaintss(apiReq?: ApiRequest<PatientComplaintsFilters>):
        Promise<ApiResponse<PatientComplaintsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.ChiefComplaint, attributes: ['ChiefComplaint'], required: false,
        });
        include.push({
            model: (<any>this.Models)['ReferenceValue'],
            attributes: ['Description'],
            as: 'LDurationPeriod',
            required: false,
            where: { 'GroupCode': 'DurationPeriod' }
        });
        include.push({
            model: (<any>this.Models)['ReferenceValue'],
            attributes: ['Description'],
            as: 'RDurationPeriod',
            required: false,
            where: { 'GroupCode': 'DurationPeriod' }
        });
        // include.push(this.GetReference('DurationPeriod'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientComplaintsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientComplaintsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientComplaintsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientComplaintsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientComplaints(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientComplaintsInstance, PatientComplaintsAttributes> {
        return this.Models.PatientComplaints;
    }
}
