import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { CustomerMasterInstance, CustomerMasterAttributes } from '../Model/Interface/Index';
import { CustomerMasterFilters } from '../Common/Filters.e';
import { CustomerContactAttributes } from '../Model/Interface/Index';
import { CustomerContactFilters } from '../Common/Filters.e';

import * as bo from '../../Pharmacy/Business/Index';

export class CustomerMasterBo extends BaseBo<CustomerMasterInstance, CustomerMasterAttributes> {
    protected CustomerConBO: bo.CustomerContactBo;

    public constructor(req?: Request) {
        super(req);
        this.CustomerConBO = BoFactory.GetBo(bo.CustomerContactBo, req); //TODO
    }

    public async AddCustomerMaster(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'CustomerCode': req.Data['CustomerCode']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCustomerMaster(req: BaseRequest): Promise<boolean> {
        let duplicate = await this.FindAll({
            where: {
                'CustomerCode': req.Data['CustomerCode'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCustomerMasterById(req: BaseRequest): Promise<CustomerMasterAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.CustomerContact, as: 'CustomerContact', required: false });
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCustomerMasters(apiReq?: ApiRequest<CustomerMasterFilters>): Promise<ApiResponse<CustomerMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.CustomerContact, as: 'CustomerContact', required: false });
        include.push(this.GetReference('PaymentTerms'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DistributionType'));
        include.push(this.GetReference('BusinessDomain'));
        include.push(this.GetReference('CustomerType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CustomerMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CustomerMasterFilters.Name:
                        (where as any)[Op.or] = [{ CustomerName: { [Op.like]: (param.Value || '') + '%' } },
                        { CustomerCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case CustomerMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CustomerMasterFilters.DistributionTypeId:
                        where['DistributionTypeId'] = param.Value;
                        break;
                    case CustomerMasterFilters.BusinessDomainId:
                        where['BusinessDomainId'] = param.Value;
                        break;
                    case CustomerMasterFilters.PhoneNumber:
                        where['PhoneNumber'] = param.Value;
                        break;
                    case CustomerMasterFilters.EmailAddress:
                        where['EmailAddress'] = param.Value;
                        break;
                    case CustomerMasterFilters.City:
                        where['City'] = param.Value;
                        break;
                    case CustomerMasterFilters.LeadTime:
                        where['LeadTime'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteCustomerMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CustomerMasterInstance, CustomerMasterAttributes> {
        return this.Models.CustomerMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CustomerMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'CustomerMasterId', ['CustomerName', 'Text'], 'CustomerName', 'CustomerCode'];
        let val = await this.GetCustomerMasters(apiReq);
        return { [key]: val.Data };
    }

    public async AddCustomerContact(req: BaseRequest): Promise<number> {
        return this.CustomerConBO.AddCustomerContact(req);
    }
    public async UpdateCustomerContact(req: BaseRequest): Promise<boolean> {
        return this.CustomerConBO.UpdateCustomerContact(req);
    }
    public async GetCustomerContactById(req: BaseRequest): Promise<CustomerContactAttributes> {
        return this.CustomerConBO.GetCustomerContactById(req);
    }
    public async GetCustomerContacts(apiReq?: ApiRequest<CustomerContactFilters>): Promise<ApiResponse<CustomerContactAttributes[]>> {
        return this.CustomerConBO.GetCustomerContacts(apiReq);
    }
    public async DeleteCustomerContact(req: BaseRequest): Promise<Boolean> {
        return this.CustomerConBO.DeleteCustomerContact(req);
    }
}
