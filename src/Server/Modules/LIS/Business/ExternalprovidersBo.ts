import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ExternalprovidersInstance, ExternalprovidersAttributes } from '../Model/Interface/Index';
import { ExternalprovidersFilters } from '../Common/Filters.e';

export class ExternalprovidersBo extends BaseBo<ExternalprovidersInstance, ExternalprovidersAttributes> {
    public async AddExternalproviders(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateExternalproviders(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetExternalprovidersById(req: BaseRequest): Promise<ExternalprovidersAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetExternalproviders(apiReq?: ApiRequest<ExternalprovidersFilters>):
        Promise<ApiResponse<ExternalprovidersAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ExternalprovidersFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ExternalprovidersFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case ExternalprovidersFilters.status:
                    where['ActiveStatusId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteExternalproviders(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ExternalprovidersInstance, ExternalprovidersAttributes> {
        return this.Models.Externalproviders;
    }
}
