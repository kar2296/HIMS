import * as SStatic  from 'sequelize';
import {BaseBo} from '../../Base/Index';
import {WhereOptions} from '../../../Core/Index';
import {Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GuarantorGSTInstance, GuarantorGSTAttributes} from '../Model/Interface/Index';
import { GuarantorGSTFilters } from '../Common/Filters.e';

export class GuarantorGSTBo extends BaseBo<GuarantorGSTInstance, GuarantorGSTAttributes> {
    public async AddGuarantorGST(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGuarantorGST(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGuarantorGSTById(req: BaseRequest): Promise<GuarantorGSTAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorGSTs(apiReq?: ApiRequest<GuarantorGSTFilters>): Promise<Array<GuarantorGSTAttributes>> {
        let where: WhereOptions<any>= {};
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case GuarantorGSTFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case GuarantorGSTFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case GuarantorGSTFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeleteGuarantorGST(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorGSTInstance, GuarantorGSTAttributes> {
        return this.Models.GuarantorGST;
    }
}
