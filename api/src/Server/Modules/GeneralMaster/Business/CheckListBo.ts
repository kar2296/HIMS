import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CheckListInstance, CheckListAttributes } from '../Model/Interface/Index';
import { CheckListFilters } from '../Common/Filters.e';

export class CheckListBo extends BaseBo<CheckListInstance, CheckListAttributes> implements IOptionProvider {
    public async AddCheckList(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCheckList(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCheckListById(req: BaseRequest): Promise<CheckListAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCheckLists(apiReq?: ApiRequest<CheckListFilters>): Promise<ApiResponse<CheckListAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('CheckListCategory'));
        include.push(this.GetReference('CheckListType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CheckListFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CheckListFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case CheckListFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CheckListFilters.CheckListTypeId:
                        where['CheckListTypeId'] = param.Value;
                        break;
                    case CheckListFilters.CheckListCategoryId:
                        where['CheckListCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCheckList(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CheckListInstance, CheckListAttributes> {
        return this.Models.CheckList;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CheckListFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CheckLists', 'Text'], 'CheckLists', 'CheckListCategoryId', 'Description'];
        let val = await this.GetCheckLists(apiReq);
        return { [key]: val.Data };
    }
}
