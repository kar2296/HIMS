import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ChiefComplaintInstance, ChiefComplaintAttributes } from '../Model/Interface/Index';
import { ChiefComplaintFilters } from '../Common/Filters.e';

export class ChiefComplaintBo extends BaseBo<ChiefComplaintInstance, ChiefComplaintAttributes> {
    public async AddChiefComplaint(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateChiefComplaint(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetChiefComplaintById(req: BaseRequest): Promise<ChiefComplaintAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetChiefComplaints(apiReq?: ApiRequest<ChiefComplaintFilters>): Promise<ApiResponse<ChiefComplaintAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ChiefComplaintCategory'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ChiefComplaintFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ChiefComplaintFilters.Name:
                        where['ChiefComplaint'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case ChiefComplaintFilters.ChiefComplaintCategory:
                        where['ChiefComplaintCategoryId'] = param.Value;
                        break;
                    case ChiefComplaintFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ChiefComplaintFilters.NameExact:
                        where['ChiefComplaint'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteChiefComplaint(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ChiefComplaintFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ChiefComplaint', 'Text'], 'ChiefComplaint', 'Description'];
        let val = await this.GetChiefComplaints(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ChiefComplaintInstance, ChiefComplaintAttributes> {
        return this.Models.ChiefComplaint;
    }
}
