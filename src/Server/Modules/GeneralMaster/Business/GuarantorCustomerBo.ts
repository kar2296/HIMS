import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GuarantorCustomerInstance, GuarantorCustomerAttributes } from '../Model/Interface/Index';
import { GuarantorCustomerFilters } from '../Common/Filters.e';

export class GuarantorCustomerBo extends BaseBo<GuarantorCustomerInstance, GuarantorCustomerAttributes> {
    public async AddGuarantorCustomer(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGuarantorCustomer(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGuarantorCustomerById(req: BaseRequest): Promise<GuarantorCustomerAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorCustomers(apiReq?: ApiRequest<GuarantorCustomerFilters>): Promise<ApiResponse<GuarantorCustomerAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CustomerType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GuarantorCustomerFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GuarantorCustomerFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case GuarantorCustomerFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GuarantorCustomerFilters.CustomerTypeId:
                        where['CustomerTypeId'] = param.Value;
                        break;
                    case GuarantorCustomerFilters.CustomerName:
                        (where as any)[Op.or] = [{ CustomerCode: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { CustomerName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteGuarantorCustomer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorCustomerInstance, GuarantorCustomerAttributes> {
        return this.Models.GuarantorCustomer;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GuarantorCustomerFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'GuarantorId', 'CustomerTypeId',
            'CustomerCode', ['CustomerName', 'Text'], 'CustomerName', 'PolicyNo', 'PolicyName', 'CreditLimit',
            'ApprovalLimit', 'ActiveStatusId', 'ActiveFrom', 'ActiveTo', 'IsActive', 'Status'];
        let val = await this.GetGuarantorCustomers(apiReq);
        return { [key]: val.Data };
    }
}
