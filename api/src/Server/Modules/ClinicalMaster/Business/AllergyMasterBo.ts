import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AllergyMasterInstance, AllergyMasterAttributes } from '../Model/Interface/Index';
import { AllergyFilters } from '../Common/Filters.e';

export class AllergyMasterBo extends BaseBo<AllergyMasterInstance, AllergyMasterAttributes> implements IOptionProvider {
    public async AddAllergyMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAllergyMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAllergyMasterById(req: BaseRequest): Promise<AllergyMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAllergyMasters(apiReq?: ApiRequest<AllergyFilters>): Promise<ApiResponse<AllergyMasterAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AllergyType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AllergyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AllergyFilters.Name:
                        (where as any)['$or'] = [{ 'AllergyName': { '$like': (param.Value || '') + '%' } },
                        { 'DisplayId': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case AllergyFilters.AllergyType:
                        where['AllergyTypeId'] = param.Value;
                        break;
                    case AllergyFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAllergyMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AllergyFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAllergyMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AllergyMasterInstance, AllergyMasterAttributes> {
        return this.Models.AllergyMaster;
    }
}
