import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ImpressionMasterInstance, ImpressionMasterAttributes } from '../Model/Interface/Index';
import { ImpressionMasterFilters } from '../Common/Filters.e';

export class ImpressionMasterBo extends BaseBo<ImpressionMasterInstance, ImpressionMasterAttributes> implements IOptionProvider {
    public async AddImpressionMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateImpressionMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetImpressionMasterById(req: BaseRequest): Promise<ImpressionMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetImpressionMasters(apiReq?: ApiRequest<ImpressionMasterFilters>):
        Promise<ApiResponse<ImpressionMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('ImpressionType'));
        include.push({ model: this.Models.Department, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ImpressionMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ImpressionMasterFilters.Name:
                        (where as any)['$or'] = [
                            { 'Name': { '$like': (param.Value || '') + '%' } },
                            { 'Code': { '$like': (param.Value || '') + '%' } }
                        ];
                        break;
                    case ImpressionMasterFilters.ImpressionTypeId:
                        where['ImpressionTypeId'] = param.Value;
                        break;
                    case ImpressionMasterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case ImpressionMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteImpressionMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<ImpressionMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name'];
        let val = await this.GetImpressionMasters(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<ImpressionMasterInstance, ImpressionMasterAttributes> {
        return this.Models.ImpressionMaster;
    }
}
