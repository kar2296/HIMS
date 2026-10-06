import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ReferenceValueInstance, ReferenceValueAttributes } from '../Model/Interface/Index';
import { ReferenceValueFilters } from '../Common/Filters.e';

export class ReferenceValueBo extends BaseBo<ReferenceValueInstance, ReferenceValueAttributes> implements IOptionProvider {
    public async AddReferenceValue(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReferenceValue(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetReferenceValueById(req: BaseRequest): Promise<ReferenceValueAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetReferenceValues(apiReq?: ApiRequest<ReferenceValueFilters>): Promise<ApiResponse<ReferenceValueAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Language'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ReferenceValueFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ReferenceValueFilters.Name:
                    where['AlternateName'] = param.Value;
                    break;
                case ReferenceValueFilters.Code:
                    where['ReferenceValueCode'] = { '$like': '%' + (param.Value || '') + '%' };
                    break;
                case ReferenceValueFilters.Description:
                    where['Description'] = { '$like': '%' + (param.Value || '') + '%' };
                    break;
                case ReferenceValueFilters.ReferenceGroupId:
                    where['ReferenceValueGroupId'] = param.Value;
                    break;
                case ReferenceValueFilters.Description:
                    where['Description'] = param.Value;
                    break;
                case ReferenceValueFilters.ReferenceGroupCode:
                    where['GroupCode'] = param.Value;
                    break;
                case ReferenceValueFilters.TransactionTypeId:
                    where['TransactionTypeId'] = param.Value;
                    break;
                case ReferenceValueFilters.ReferenceValueCodeId:
                    where['ReferenceValueCodeId'] = param.Value;
                    break;
                case ReferenceValueFilters.ObjectTypeId:
                    where['ObjectTypeId'] = param.Value;
                    break;
                case ReferenceValueFilters.ActiveStatus:
                    where['ActiveStatusId'] = param.Value;
                    break;
                case ReferenceValueFilters.MultiId:
                    if (param.Value) {
                        let paramArr: Array<number> = [];
                        if (param.Value.toString().indexOf(',') > -1) {
                            paramArr = param.Value.toString().split(',');
                        } else {
                            paramArr = [param.Value];
                        }
                        where['ReferenceValueCodeId'] = { '$in': paramArr };
                    }
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where, include: include,
            attributes: apiReq.Attributes
        });
    }

    public async DeleteReferenceValue(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ReferenceValueInstance, ReferenceValueAttributes> {
        return this.Models.ReferenceValue;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<ReferenceValueFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [['ReferenceValueCodeId', 'Id'],
        ['Description', 'Text'], ['ReferenceValueCode', 'Code'], 'IsDefault', 'ObjectTypeId', 'ColorCode'];
        apiReq.Params = (apiReq.Params && apiReq.Params.length > 0)
            ? apiReq.Params
            : [{ Key: ReferenceValueFilters.ReferenceGroupCode, Value: key }];
        apiReq.PageContext = apiReq.PageContext || { PageSize: 500, PageNumber: 1 };
        let val = await this.GetReferenceValues(apiReq);
        return { [key]: val.Data };
    }
}
