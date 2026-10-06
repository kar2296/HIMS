import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ProcedureServicesInstance, ProcedureServicesAttributes } from '../Model/Interface/Index';
// import { BoFactory } from '../../Base/Business/Index';
import { ProcedureServicesFilters } from '../Common/Filters.e';

export class ProcedureServicesBo extends BaseBo<ProcedureServicesInstance, ProcedureServicesAttributes>  {
    public async AddProcedureServices(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProcedureServices(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageProcedureServices(req: BaseRequest): Promise<boolean> {
        var details = req.Data.Details || [];
        await Promise.all(details.map((DetailItem: any): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ProcedureId = req.Data.ProcedureId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetProcedureServicesById(req: BaseRequest): Promise<ProcedureServicesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }


    public async GetProcedureServices(apiReq?: ApiRequest<ProcedureServicesFilters>): Promise<ApiResponse<ProcedureServicesAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];

        include.push({
            model: this.Models.ServiceItem, attributes: ['Name', 'ItemCode', 'MasterItemId', 'CategoryId', 'MasterTypeId',
                'IsOTHourlyCharge'
            ],
            include: [
                {
                    model: this.Models.ServiceItemTariffDetail, required: false,
                }
            ],
            required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureServicesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureServicesFilters.ProcedureId:
                        where['ProcedureId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteProcedureServices(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ProcedureServicesInstance, ProcedureServicesAttributes> {
        return this.Models.ProcedureServices;
    }
}
