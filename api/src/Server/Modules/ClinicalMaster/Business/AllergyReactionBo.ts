import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AllergyReactionInstance, AllergyReactionAttributes } from '../Model/Interface/Index';
import { AllergyReactionFilters } from '../Common/Filters.e';

export class AllergyReactionBo extends BaseBo<AllergyReactionInstance, AllergyReactionAttributes> {
    public async AddAllergyReaction(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAllergyReaction(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAllergyReactionById(req: BaseRequest): Promise<AllergyReactionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAllergyReactions(apiReq?: ApiRequest<AllergyReactionFilters>): Promise<ApiResponse<AllergyReactionAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AllergyReactionType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AllergyReactionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AllergyReactionFilters.Name:
                        (where as any)['$or'] = [{ 'AllergyReactionName': { '$like': (param.Value || '') + '%' } },
                        { 'DisplayId': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case AllergyReactionFilters.AllergyReactionType:
                        where['AllergyReactionTypeId'] = param.Value;
                        break;
                    case AllergyReactionFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAllergyReaction(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AllergyReactionInstance, AllergyReactionAttributes> {
        return this.Models.AllergyReaction;
    }
}
