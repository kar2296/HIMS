import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientChiefComplaintInstance, PatientChiefComplaintAttributes } from '../Model/Interface/Index';
import { PatientChiefComplaintFilters } from '../Common/Filters.e';

export class PatientChiefComplaintBo extends BaseBo<PatientChiefComplaintInstance, PatientChiefComplaintAttributes>  {
    public async AddPatientChiefComplaint(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientChiefComplaint(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientChiefComplaintById(req: BaseRequest): Promise<PatientChiefComplaintAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientChiefComplaints(req: BaseRequest): Promise<boolean> {
        let details: PatientChiefComplaintAttributes[] = req.Data || [];
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

    public async GetPatientChiefComplaints(apiReq?: ApiRequest<PatientChiefComplaintFilters>):
        Promise<ApiResponse<PatientChiefComplaintAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('PatientChiefComplaintStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientChiefComplaintFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientChiefComplaintFilters.Name:
                        where['ChiefComplaint'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientChiefComplaintFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientChiefComplaintFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientChiefComplaintFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientChiefComplaint(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientChiefComplaintInstance, PatientChiefComplaintAttributes> {
        return this.Models.PatientChiefComplaint;
    }

}
