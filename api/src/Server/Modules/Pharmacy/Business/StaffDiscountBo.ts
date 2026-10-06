import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StaffDiscountInstance, StaffDiscountAttributes } from '../Model/Interface/Index';
import { StaffDiscountFilters } from '../Common/Filters.e';

export class StaffDiscountBo extends BaseBo<StaffDiscountInstance, StaffDiscountAttributes> {
    public async AddStaffDiscount(req: BaseRequest): Promise<number> {
        let userduplicate = await this.FindAll({
            where: {
                'UserId': req.Data['UserId'],
                'UserTypeId': req.Data['UserTypeId'],
                'StoreMasterId': req.Data['StoreMasterId']
            }
        });
        if (userduplicate && userduplicate.length > 0) {
            throw { code: 'THIS_USER_ALREADY_MAPPED' };
        }

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStaffDiscount(req: BaseRequest): Promise<boolean> {
        let userduplicate = await this.FindAll({
            where: {
                'Id': { '$ne': req.Data['Id'] },
                'UserId': req.Data['UserId'],
                'UserTypeId': req.Data['UserTypeId'],
                'StoreMasterId': req.Data['StoreMasterId']
            }
        });
        if (userduplicate && userduplicate.length > 0) {
            throw { code: 'THIS_USER_ALREADY_MAPPED' };
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStaffDiscountById(req: BaseRequest): Promise<StaffDiscountAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStaffDiscounts(apiReq?: ApiRequest<StaffDiscountFilters>): Promise<ApiResponse<StaffDiscountAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push(this.GetReference('UserType'));
        include.push(this.GetReference('StoreType'));
        include.push(this.GetReference('StaffDiscountType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UserName', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StaffDiscountFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StaffDiscountFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StaffDiscountFilters.StoreTypeId:
                        where['StoreTypeId'] = param.Value;
                        break;
                    case StaffDiscountFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StaffDiscountFilters.UserTypeId:
                        where['UserTypeId'] = param.Value;
                        break;
                    case StaffDiscountFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case StaffDiscountFilters.StaffDiscountTypeId:
                        where['StaffDiscountTypeId'] = param.Value;
                        break;
                    case StaffDiscountFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStaffDiscount(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StaffDiscountInstance, StaffDiscountAttributes> {
        return this.Models.StaffDiscount;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StaffDiscountFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [['StoreMasterId', 'Id'], 'StoreMasterId'];
        let val = await this.GetStaffDiscounts(apiReq);
        return { [key]: val.Data };
    }
}
