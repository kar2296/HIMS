import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientImmunizationInstance, PatientImmunizationAttributes } from '../Model/Interface/Index';
import { PatientImmunizationFilters } from '../Common/Filters.e';

export class PatientImmunizationBo extends BaseBo<PatientImmunizationInstance, PatientImmunizationAttributes>  {
    public async AddPatientImmunization(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientImmunization(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientImmunizationById(req: BaseRequest): Promise<PatientImmunizationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientImmunizations(req : BaseRequest): Promise<boolean> {
        let details : PatientImmunizationAttributes[]  = req.Data || [];
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

    public async GetPatientImmunizations(apiReq?: ApiRequest<PatientImmunizationFilters>):
        Promise<ApiResponse<PatientImmunizationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ImmunizationType'));
		 include.push(this.GetReference('Route'));
        include.push(this.GetReference('ImmunizationStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientImmunizationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientImmunizationFilters.Name:
                        where['ImmunizationName'] = param.Value;
                        break;
                    case PatientImmunizationFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientImmunizationFilters.ImmunizationType:
                        where['ImmunizationTypeId'] = param.Value;
                        break;
                    case PatientImmunizationFilters.ImmunizationStatus:
                        where['ImmunizationStatusId'] = param.Value;
                        break;
                    case PatientImmunizationFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientImmunizationFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientImmunization(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientImmunizationInstance, PatientImmunizationAttributes> {
        return this.Models.PatientImmunization;
    }
}
