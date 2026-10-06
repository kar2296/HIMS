import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StoreApprovalMatrixInstance, StoreApprovalMatrixAttributes } from '../Model/Interface/Index';
import { StoreApprovalMatrixFilters } from '../Common/Filters.e';

export class StoreApprovalMatrixBo extends BaseBo<StoreApprovalMatrixInstance, StoreApprovalMatrixAttributes> {
    public async AddStoreApprovalMatrix(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStoreApprovalMatrix(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetStoreApprovalMatrixById(req: BaseRequest): Promise<StoreApprovalMatrixAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStoreApprovalMatrix(apiReq?: ApiRequest<StoreApprovalMatrixFilters>):
        Promise<ApiResponse<StoreApprovalMatrixAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        //include.push({ model: this.Models.User, attributes: ['UserName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('UserType'));
        include.push(this.GetReference('PoType'));
        include.push(this.GetReference('PoStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StoreApprovalMatrixFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StoreApprovalMatrixFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case StoreApprovalMatrixFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StoreApprovalMatrixFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StoreApprovalMatrixFilters.UserTypeId:
                        where['UserTypeId'] = param.Value;
                        break;
                    case StoreApprovalMatrixFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStoreApprovalMatrix(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StoreApprovalMatrixInstance, StoreApprovalMatrixAttributes> {
        return this.Models.StoreApprovalMatrix;
    }
}
