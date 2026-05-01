import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientExaminationSystemInstance, PatientExaminationSystemAttributes } from '../Model/Interface/Index';
import { PatientExaminationSystemFilters } from '../Common/Filters.e';

export class PatientExaminationSystemBo extends
    BaseBo<PatientExaminationSystemInstance, PatientExaminationSystemAttributes>  {
    public async AddPatientExaminationSystem(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientExaminationSystem(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientExaminationSystemById(req: BaseRequest): Promise<PatientExaminationSystemAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetExaminationGroupId(req: BaseRequest): Promise<number> {
        let ExaminationId_ = 1;
        let ExaminationIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('ExaminationId')), 'ExaminationId'],
            ]
        });
        if (ExaminationIdVal) {
            let ExaminationIdAttr: any = this.GetAttribute(ExaminationIdVal);
            ExaminationId_ = ExaminationIdAttr['ExaminationId'];
            if (!ExaminationId_) {
                ExaminationId_ = 1;
            } else { ExaminationId_++; }
        }
        return ExaminationId_;
    }
    public async ManagePatientExaminationSystems(req: BaseRequest): Promise<boolean> {
        let ExaminationId_ = await this.GetExaminationGroupId(req);
        let details: PatientExaminationSystemAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (!detail.ExaminationId) detail.ExaminationId = ExaminationId_;
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

    public async GetPatientExaminationSystems(apiReq?: ApiRequest<PatientExaminationSystemFilters>):
        Promise<ApiResponse<PatientExaminationSystemAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.SystemMaster, attributes: ['SystemName'], required: false,
        });
        include.push({
            model: this.Models.ClinicalFinding, attributes: ['Name'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientExaminationSystemFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientExaminationSystemFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientExaminationSystemFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientExaminationSystemFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientExaminationSystemFilters.ExaminationId:
                        where['ExaminationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientExaminationSystem(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientExaminationSystemInstance, PatientExaminationSystemAttributes> {
        return this.Models.PatientExaminationSystem;
    }
}
