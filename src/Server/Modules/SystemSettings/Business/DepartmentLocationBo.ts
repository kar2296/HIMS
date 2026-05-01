import * as SStatic  from 'sequelize';
import {BaseBo, IOptionProvider} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest, ISearchEnums} from '../../../Common/Index';
import { DepartmentLocationInstance, DepartmentLocationAttributes} from '../Model/Interface/Index';

export class DepartmentLocationBo extends BaseBo<DepartmentLocationInstance, DepartmentLocationAttributes> implements IOptionProvider {
    public async AddDepartmentLocation(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDepartmentLocation(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDepartmentLocationById(req: BaseRequest): Promise<DepartmentLocationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDepartmentLocations(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<DepartmentLocationAttributes>> {
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

    public async DeleteDepartmentLocation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DepartmentLocationInstance, DepartmentLocationAttributes> {
        return this.Models.DepartmentLocation;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DepartmentCode', 'Text'], 'DepartmentCode', 'DepartmentName'];
        let val = await this.GetDepartmentLocations(apiReq);
        return { [key]: val };
    }
}
