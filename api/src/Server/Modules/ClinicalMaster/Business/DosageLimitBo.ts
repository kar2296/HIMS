import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { DosageLimitInstance, DosageLimitAttributes } from '../Model/Interface/Index';
import { DosageLimitFilters } from '../Common/Filters.e';

export class DosageLimitBo extends BaseBo<DosageLimitInstance, DosageLimitAttributes> {
    public async AddDosageLimit(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDosageLimit(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetDosageLimitById(req: BaseRequest): Promise<DosageLimitAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDosageLimits(apiReq?: ApiRequest<DosageLimitFilters>): Promise<Array<DosageLimitAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('DrugAgeGroup'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DosageLimitFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DosageLimitFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case DosageLimitFilters.DrugId:
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

    public async DeleteDosageLimit(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<DosageLimitInstance, DosageLimitAttributes> {
        return this.Models.DosageLimit;
    }
}
