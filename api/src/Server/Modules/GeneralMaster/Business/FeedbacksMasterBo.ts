import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { FeedbacksMasterInstance, FeedbacksMasterAttributes } from '../Model/Interface/Index';
import { FeedbacksMasterFilters } from '../Common/Filters.e';

export class FeedbacksMasterBo extends BaseBo<FeedbacksMasterInstance, FeedbacksMasterAttributes> implements IOptionProvider {
    public async AddFeedbacksMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFeedbacksMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFeedbacksMasterById(req: BaseRequest): Promise<FeedbacksMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFeedbacksMasters(apiReq?: ApiRequest<FeedbacksMasterFilters>): Promise<ApiResponse<FeedbacksMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('FeedbackCategory'));
        include.push(this.GetReference('FeedbackType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FeedbacksMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FeedbacksMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case FeedbacksMasterFilters.FeedbackTypeId:
                        where['FeedbackTypeId'] = param.Value;
                        break;
                    case FeedbacksMasterFilters.FeedbackCategoryId:
                        where['FeedbackCategoryId'] = param.Value;
                        break;
                    case FeedbacksMasterFilters.Description:
                        where['Description'] = param.Value;
                        break;
                    case FeedbacksMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFeedbacksMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FeedbacksMasterInstance, FeedbacksMasterAttributes> {
        return this.Models.FeedbacksMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<FeedbacksMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Feedbacks', 'Text'], 'Feedbacks', 'Description', 'FeedbackCategoryId'];
        let val = await this.GetFeedbacksMasters(apiReq);
        return { [key]: val.Data };
    }
}
