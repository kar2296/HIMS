import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { EncounterMLCOfficerInstance, EncounterMLCOfficerAttributes } from '../Model/Interface/Index';
import { EncounterMLCOfficerFilters } from '../Common/Filters.e';

export class EncounterMLCOfficerBo extends BaseBo<EncounterMLCOfficerInstance, EncounterMLCOfficerAttributes> {
    public async AddEncounterMLCOfficer(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterMLCOfficer(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageEncounterMLCOfficers(EncounterMLCId: number, details: EncounterMLCOfficerAttributes[]):
        Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.EncounterMLCId = EncounterMLCId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0 && detail.Status !== 2) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetEncounterMLCOfficerById(req: BaseRequest): Promise<EncounterMLCOfficerAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEncounterMLCOfficers(apiReq?: ApiRequest<EncounterMLCOfficerFilters>):
        Promise<ApiResponse<EncounterMLCOfficerAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterMLCOfficerFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterMLCOfficerFilters.EncounterMlcId:
                        where['EncounterMlcId'] = param.Value;
                        break;
                    case EncounterMLCOfficerFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEncounterMLCOfficer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EncounterMLCOfficerInstance, EncounterMLCOfficerAttributes> {
        return this.Models.EncounterMLCOfficer;
    }
}
