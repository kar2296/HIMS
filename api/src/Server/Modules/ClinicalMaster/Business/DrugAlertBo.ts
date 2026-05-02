import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DrugAlertInstance, DrugAlertAttributes } from '../Model/Interface/Index';
import { DrugAlertFilters } from '../Common/Filters.e';

export class DrugAlertBo extends BaseBo<DrugAlertInstance, DrugAlertAttributes> {
    public async AddDrugAlert(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDrugAlert(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDrugAlertById(req: BaseRequest): Promise<DrugAlertAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDrugAlerts(apiReq?: ApiRequest<DrugAlertFilters>): Promise<Array<DrugAlertAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DrugAlertType'));
        include.push(this.GetReference('DrugAgeGroup'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DrugAlertFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DrugAlertFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case DrugAlertFilters.DrugId:
                        where['DrugId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({
            where: where,
            include: include,
            attributes: apiReq.Attributes,
            limit: pg.Limit, offset: pg.Offset
        });
        return this.GetAttributes(result);
    }

    public async DeleteDrugAlert(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DrugAlertInstance, DrugAlertAttributes> {
        return this.Models.DrugAlert;
    }
}
