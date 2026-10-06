import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest, ISearchEnums} from '../../../Common/Index';
import { InvestigationSettingsInstance, InvestigationSettingsAttributes} from '../Model/Interface/Index';

export class InvestigationSettingsBo extends BaseBo<InvestigationSettingsInstance, InvestigationSettingsAttributes> {
    public async AddInvestigationSettings(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateInvestigationSettings(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetInvestigationSettingsById(req: BaseRequest): Promise<InvestigationSettingsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetInvestigationSettings(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<InvestigationSettingsAttributes>> {
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

    public async DeleteInvestigationSettings(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<InvestigationSettingsInstance, InvestigationSettingsAttributes> {
        return this.Models.InvestigationSettings;
    }
}
