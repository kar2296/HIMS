import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UserTaxDetailInstance, UserTaxDetailAttributes} from '../Model/Interface/Index';
import { UserTaxDetailFilters } from '../Common/Filters.e';

export class UserTaxDetailBo extends BaseBo<UserTaxDetailInstance, UserTaxDetailAttributes> {
    public async AddUserTaxDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserTaxDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetUserTaxDetailById(req: BaseRequest): Promise<UserTaxDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUserTaxDetails(apiReq?: ApiRequest<UserTaxDetailFilters>): Promise<Array<UserTaxDetailAttributes>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case UserTaxDetailFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case UserTaxDetailFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case UserTaxDetailFilters.UserId:
                    where['UserId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeleteUserTaxDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserTaxDetailInstance, UserTaxDetailAttributes> {
        return this.Models.UserTaxDetail;
    }
}
