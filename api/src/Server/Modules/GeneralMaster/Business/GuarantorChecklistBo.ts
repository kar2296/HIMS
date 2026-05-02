import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GuarantorChecklistInstance, GuarantorChecklistAttributes } from '../Model/Interface/Index';
import { GuarantorChecklistFilters } from '../Common/Filters.e';

export class GuarantorChecklistBo extends BaseBo<GuarantorChecklistInstance, GuarantorChecklistAttributes>  {
    public async AddGuarantorChecklist(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGuarantorChecklist(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageGuarantorChecklist(req: BaseRequest): Promise<boolean> {
        let list: GuarantorChecklistAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetGuarantorChecklistById(req: BaseRequest): Promise<GuarantorChecklistAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorChecklists(apiReq?: ApiRequest<GuarantorChecklistFilters>):
        Promise<ApiResponse<GuarantorChecklistAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case GuarantorChecklistFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case GuarantorChecklistFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantorChecklist(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorChecklistInstance, GuarantorChecklistAttributes> {
        return this.Models.GuarantorChecklist;
    }

}
