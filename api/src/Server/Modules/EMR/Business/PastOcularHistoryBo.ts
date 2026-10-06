import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PastOcularHistoryInstance, PastOcularHistoryAttributes } from '../Model/Interface/Index';
import { PastOcularHistoryFilters } from '../Common/Filters.e';

export class PastOcularHistoryBo extends
    BaseBo<PastOcularHistoryInstance, PastOcularHistoryAttributes>  {
    public async AddPastOcularHistory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePastOcularHistory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPastOcularHistoryById(req: BaseRequest): Promise<PastOcularHistoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManagePastOcularHistorys(req: BaseRequest): Promise<boolean> {
        let details: PastOcularHistoryAttributes[] = req.Data || [];
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

    public async GetPastOcularHistorys(apiReq?: ApiRequest<PastOcularHistoryFilters>):
        Promise<ApiResponse<PastOcularHistoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PastOcularHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PastOcularHistoryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PastOcularHistoryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PastOcularHistoryFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePastOcularHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PastOcularHistoryInstance, PastOcularHistoryAttributes> {
        return this.Models.PastOcularHistory;
    }
}
