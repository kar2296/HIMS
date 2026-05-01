import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientLaserAdviceInstance, PatientLaserAdviceAttributes } from '../Model/Interface/Index';
import { PatientLaserAdviceFilters } from '../Common/Filters.e';

export class PatientLaserAdviceBo extends
    BaseBo<PatientLaserAdviceInstance, PatientLaserAdviceAttributes>  {
    public async AddPatientLaserAdvice(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientLaserAdvice(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientLaserAdviceById(req: BaseRequest): Promise<PatientLaserAdviceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetExaminationGroupId(req: BaseRequest): Promise<number> {
        let ExaminationId_ = 1;
        let ExaminationIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('LaserGroupingId')), 'LaserGroupingId'],
            ]
        });
        if (ExaminationIdVal) {
            let ExaminationIdAttr: any = this.GetAttribute(ExaminationIdVal);
            ExaminationId_ = ExaminationIdAttr['LaserGroupingId'];
            if (!ExaminationId_) {
                ExaminationId_ = 1;
            } else { ExaminationId_++; }
        }
        return ExaminationId_;
    }
    public async ManagePatientLaserAdvices(req: BaseRequest): Promise<boolean> {
        let ExaminationId_ = await this.GetExaminationGroupId(req);
        let details: PatientLaserAdviceAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (!detail.LaserGroupingId) detail.LaserGroupingId = ExaminationId_;
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

    public async GetPatientLaserAdvices(apiReq?: ApiRequest<PatientLaserAdviceFilters>):
        Promise<ApiResponse<PatientLaserAdviceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.SystemMaster, attributes: ['SystemName'], required: false,
        });
        include.push(this.GetReference('EyeSide'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientLaserAdviceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientLaserAdviceFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientLaserAdviceFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientLaserAdviceFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientLaserAdviceFilters.LaserGroupingId:
                        where['LaserGroupingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientLaserAdvice(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientLaserAdviceInstance, PatientLaserAdviceAttributes> {
        return this.Models.PatientLaserAdvice;
    }
}
