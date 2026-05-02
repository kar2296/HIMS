import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientGeneralHistoryInstance, PatientGeneralHistoryAttributes } from '../Model/Interface/Index';
import { PatientGeneralHistoryFilters } from '../Common/Filters.e';

export class PatientGeneralHistoryBo extends
    BaseBo<PatientGeneralHistoryInstance, PatientGeneralHistoryAttributes>  {
    public async AddPatientGeneralHistory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientGeneralHistory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientGeneralHistoryById(req: BaseRequest): Promise<PatientGeneralHistoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePatientGeneralHistorys(req: BaseRequest): Promise<boolean> {
        let details: PatientGeneralHistoryAttributes[] = req.Data || [];
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

    public async GetPatientGeneralHistorys(apiReq?: ApiRequest<PatientGeneralHistoryFilters>):
        Promise<ApiResponse<PatientGeneralHistoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientGeneralHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientGeneralHistoryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientGeneralHistoryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientGeneralHistoryFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientGeneralHistoryFilters.GeneralHistory:
                        where['GeneralHistory'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientGeneralHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientGeneralHistoryInstance, PatientGeneralHistoryAttributes> {
        return this.Models.PatientGeneralHistory;
    }
}
