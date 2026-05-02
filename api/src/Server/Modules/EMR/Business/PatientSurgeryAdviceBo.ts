import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientSurgeryAdviceInstance, PatientSurgeryAdviceAttributes } from '../Model/Interface/Index';
import { PatientSurgeryAdviceFilters } from '../Common/Filters.e';

export class PatientSurgeryAdviceBo extends
    BaseBo<PatientSurgeryAdviceInstance, PatientSurgeryAdviceAttributes>  {
    public async AddPatientSurgeryAdvice(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientSurgeryAdvice(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientSurgeryAdviceById(req: BaseRequest): Promise<PatientSurgeryAdviceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetExaminationGroupId(req: BaseRequest): Promise<number> {
        let ExaminationId_ = 1;
        let ExaminationIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('SurgeryGroupingId')), 'SurgeryGroupingId'],
            ]
        });
        if (ExaminationIdVal) {
            let ExaminationIdAttr: any = this.GetAttribute(ExaminationIdVal);
            ExaminationId_ = ExaminationIdAttr['SurgeryGroupingId'];
            if (!ExaminationId_) {
                ExaminationId_ = 1;
            } else { ExaminationId_++; }
        }
        return ExaminationId_;
    }
    public async ManagePatientSurgeryAdvices(req: BaseRequest): Promise<boolean> {
        let ExaminationId_ = await this.GetExaminationGroupId(req);
        let details: PatientSurgeryAdviceAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (!detail.SurgeryGroupingId) detail.SurgeryGroupingId = ExaminationId_;
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

    public async GetPatientSurgeryAdvices(apiReq?: ApiRequest<PatientSurgeryAdviceFilters>):
        Promise<ApiResponse<PatientSurgeryAdviceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.SystemMaster, attributes: ['SystemName'], required: false,
        });
        include.push(this.GetReference('EyeSide'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientSurgeryAdviceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientSurgeryAdviceFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientSurgeryAdviceFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientSurgeryAdviceFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientSurgeryAdviceFilters.SurgeryGroupingId:
                        where['SurgeryGroupingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientSurgeryAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientSurgeryAdviceInstance, PatientSurgeryAdviceAttributes> {
        return this.Models.PatientSurgeryAdvice;
    }
}
