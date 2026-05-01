import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PreOperativeChecklistDetailsInstance, PreOperativeChecklistDetailsAttributes } from '../Model/Interface/Index';
import { PreOperativeChecklistDetailsFilters } from '../Common/Filters.e';

export class PreOperativeChecklistDetailsBo extends BaseBo<PreOperativeChecklistDetailsInstance, PreOperativeChecklistDetailsAttributes>  {
    public async AddPreOperativeChecklistDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePreOperativeChecklistDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePreOperativeChecklistDetails(PreOperativeChecklistId: number,
        details: PreOperativeChecklistDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PreOperativeChecklistId = PreOperativeChecklistId;
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

    public async GetPreOperativeChecklistDetailsById(req: BaseRequest): Promise<PreOperativeChecklistDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPreOperativeChecklistDetails(apiReq?: ApiRequest<PreOperativeChecklistDetailsFilters>):
        Promise<ApiResponse<PreOperativeChecklistDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.CheckList, attributes: ['CheckLists','Description'], required: false,
        });
        include.push(this.GetReference('CheckListCategory'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PreOperativeChecklistDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PreOperativeChecklistDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PreOperativeChecklistDetailsFilters.PreOperativeChecklistId:
                        where['PreOperativeChecklistId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePreOperativeChecklistDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PreOperativeChecklistDetailsInstance, PreOperativeChecklistDetailsAttributes> {
        return this.Models.PreOperativeChecklistDetails;
    }

}
