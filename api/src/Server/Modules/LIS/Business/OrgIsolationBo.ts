import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { OrgIsolationInstance, OrgIsolationAttributes } from '../Model/Interface/Index';
import { OrgIsolationFilters } from '../Common/Filters.e';

export class OrgIsolationBo extends BaseBo<OrgIsolationInstance, OrgIsolationAttributes> implements IOptionProvider {
    public async AddOrgIsolation(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrgIsolation(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetOrgIsolationById(req: BaseRequest): Promise<OrgIsolationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetOrgIsolations(apiReq?: ApiRequest<OrgIsolationFilters>): Promise<ApiResponse<OrgIsolationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OrgIsolationFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OrgIsolationFilters.Code:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case OrgIsolationFilters.MnemonicName:
                        (where as any)[Op.or] = [{ Mnemonic: { [Op.like]: (param.Value || '') + '%' } },
                        { OrgIsolationName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case OrgIsolationFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });

    }

    public async DeleteOrgIsolation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrgIsolationInstance, OrgIsolationAttributes> {
        return this.Models.OrgIsolation;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<OrgIsolationFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['OrgIsolationName', 'Text'], 'Code'];
        let val = await this.GetOrgIsolations(apiReq);
        return { [key]: val.Data };
    }
}
