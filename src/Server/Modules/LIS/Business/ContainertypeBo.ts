import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions} from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ContainertypeInstance, ContainertypeAttributes } from '../Model/Interface/Index';
import { ContainertypeFilters } from '../Common/Filters.e';

export class ContainertypeBo extends BaseBo<ContainertypeInstance, ContainertypeAttributes> implements IOptionProvider {
    public async AddContainertype(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateContainertype(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetContainertypeById(req: BaseRequest): Promise<ContainertypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetContainertypes(apiReq?: ApiRequest<ContainertypeFilters>): Promise<ApiResponse<ContainertypeAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('CONTAINTYP'));
        include.push(this.GetReference('HEIGHTUNITS'));
        include.push(this.GetReference('DIAMETERUNITS'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ContainertypeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ContainertypeFilters.Name:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } },
                        { Mnemonics: { [Op.like]: (param.Value || '') + '%' } },
                        { Name: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case ContainertypeFilters.type:
                        where['CONTAINTYPId'] = param.Value;
                        break;
                    case ContainertypeFilters.color:
                        where['COLORId'] = param.Value;
                        break;
                    case ContainertypeFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });

    }

    public async DeleteContainertype(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ContainertypeInstance, ContainertypeAttributes> {
        return this.Models.Containertype;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ContainertypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Code'];
        let val = await this.GetContainertypes(apiReq);
        return { [key]: val.Data };
    }
}
