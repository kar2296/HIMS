import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest, ISearchEnums} from '../../../Common/Index';
import { UserDefinedFieldInstance, UserDefinedFieldAttributes} from '../Model/Interface/Index';

export class UserDefinedFieldBo extends BaseBo<UserDefinedFieldInstance, UserDefinedFieldAttributes> {
    public async AddUserDefinedField(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUserDefinedField(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetUserDefinedFieldById(req: BaseRequest): Promise<UserDefinedFieldAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUserDefinedFields(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<UserDefinedFieldAttributes>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset, attributes: apiReq.Attributes });
        return this.GetAttributes(result);
    }

    public async DeleteUserDefinedField(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<UserDefinedFieldInstance, UserDefinedFieldAttributes> {
        return this.Models.UserDefinedField;
    }
}
