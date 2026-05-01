import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { B2BCustomerMasterInstance, B2BCustomerMasterAttributes } from '../Model/Interface/Index';
import { B2BCustomerMasterFilters } from '../Common/Filters.e';

export class B2BCustomerMasterBo extends BaseBo<B2BCustomerMasterInstance, B2BCustomerMasterAttributes> implements IOptionProvider {
    public async AddB2BCustomerMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateB2BCustomerMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetB2BCustomerMasterById(req: BaseRequest): Promise<B2BCustomerMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetB2BCustomerMasterss(apiReq?:
        ApiRequest<B2BCustomerMasterFilters>): Promise<ApiResponse<B2BCustomerMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case B2BCustomerMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case B2BCustomerMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case B2BCustomerMasterFilters.TESTMASTERTYPId:
                        where['TESTMASTERTYPId'] = param.Value;
                        break;
                    case B2BCustomerMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case B2BCustomerMasterFilters.B2BCustomerName:
                        (where as any)[Op.or] = [{ B2BCustomerName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteB2BCustomerMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<B2BCustomerMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['B2BCustomerName', 'Text'], 'B2BCustomerName', 'Description'];
        let val = await this.GetB2BCustomerMasterss(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<B2BCustomerMasterInstance, B2BCustomerMasterAttributes> {
        return this.Models.B2BCustomerMaster;
    }
}
