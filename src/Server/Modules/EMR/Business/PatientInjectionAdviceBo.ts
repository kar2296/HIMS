import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientInjectionAdviceInstance, PatientInjectionAdviceAttributes } from '../Model/Interface/Index';
import { PatientInjectionAdviceFilters } from '../Common/Filters.e';

export class PatientInjectionAdviceBo extends
    BaseBo<PatientInjectionAdviceInstance, PatientInjectionAdviceAttributes>  {
    public async AddPatientInjectionAdvice(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientInjectionAdvice(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientInjectionAdviceById(req: BaseRequest): Promise<PatientInjectionAdviceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetExaminationGroupId(req: BaseRequest): Promise<number> {
        let ExaminationId_ = 1;
        let ExaminationIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('InjectionGroupingId')), 'InjectionGroupingId'],
            ]
        });
        if (ExaminationIdVal) {
            let ExaminationIdAttr: any = this.GetAttribute(ExaminationIdVal);
            ExaminationId_ = ExaminationIdAttr['InjectionGroupingId'];
            if (!ExaminationId_) {
                ExaminationId_ = 1;
            } else { ExaminationId_++; }
        }
        return ExaminationId_;
    }
    public async ManagePatientInjectionAdvices(req: BaseRequest): Promise<boolean> {
        let ExaminationId_ = await this.GetExaminationGroupId(req);
        let details: PatientInjectionAdviceAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (!detail.InjectionGroupingId) detail.InjectionGroupingId = ExaminationId_;
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

    public async GetPatientInjectionAdvices(apiReq?: ApiRequest<PatientInjectionAdviceFilters>):
        Promise<ApiResponse<PatientInjectionAdviceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.SystemMaster, attributes: ['SystemName'], required: false,
        });
        include.push(this.GetReference('EyeSide'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientInjectionAdviceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientInjectionAdviceFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientInjectionAdviceFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientInjectionAdviceFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientInjectionAdviceFilters.InjectionGroupingId:
                        where['InjectionGroupingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientInjectionAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientInjectionAdviceInstance, PatientInjectionAdviceAttributes> {
        return this.Models.PatientInjectionAdvice;
    }
}
