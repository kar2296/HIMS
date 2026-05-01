import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StoreUserMapInstance, StoreUserMapAttributes } from '../Model/Interface/Index';
import { StoreUserMapFilters } from '../Common/Filters.e';

export class StoreUserMapBo extends BaseBo<StoreUserMapInstance, StoreUserMapAttributes> {
    public async AddStoreUserMap(req: BaseRequest): Promise<number> {
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

        if (req.Data.IsDefault) {
            let userstoreReq = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: StoreUserMapFilters.UserId, Value: req.Data.UserId },
                    { Key: StoreUserMapFilters.IsDefault, Value: true }
                ]
            };
            let UserStoreData = await this.GetStoreUserMaps(userstoreReq);
            for (var gi = 0; gi < UserStoreData.Data.length; gi++) {
                await this.ManageUserStore(req.Data, UserStoreData.Data[gi]);
            }
        }

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStoreUserMap(req: BaseRequest): Promise<boolean> {
        let userduplicate = await this.FindAll({
            where: {
                'Id': { '$ne': req.Data['Id'] },
                'UserId': req.Data['UserId'],
                'UserTypeId': req.Data['UserTypeId'],
                'StoreMasterId': req.Data['StoreMasterId']
            }
        });
        console.log('*************userduplicate*******************', userduplicate);
        if (userduplicate && userduplicate.length > 0) {
            throw { code: 'THIS_USER_ALREADY_MAPPED' };
        }
        if (req.Data.IsDefault) {
            let userstoreReq = {
                Id: 0,
                PageContext: { PageSize: 100, PageNumber: 1 },
                Params: [
                    { Key: StoreUserMapFilters.UserId, Value: req.Data.UserId },
                    { Key: StoreUserMapFilters.IsDefault, Value: true }
                ]
            };
            let UserStoreData = await this.GetStoreUserMaps(userstoreReq);
            for (var gi = 0; gi < UserStoreData.Data.length; gi++) {
                await this.ManageUserStore(req.Data, UserStoreData.Data[gi]);
            }
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageUserStore(request: any, userstoreInfo: any): Promise<void> {
        let storeusermap = await this.GetStoreUserMapById({ Id: userstoreInfo.Id });
        storeusermap.IsDefault = false;
        await this.Update(storeusermap);
    }

    public async GetStoreUserMapById(req: BaseRequest): Promise<StoreUserMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStoreUserMaps(apiReq?: ApiRequest<StoreUserMapFilters>): Promise<ApiResponse<StoreUserMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storeWhere: WhereOptions<any> = {};
        let isReqstoreSearch: boolean = false;
        include.push({ model: this.Models.User, attributes: ['Id', 'FirstName', 'LastName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['Id', 'GstNumber', 'FacilityName', 'OrganizationId'], required: false });
        // include.push({ model: this.Models.StoreMaster, required: false });
        include.push(this.GetReference('UserType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UserName', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StoreUserMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StoreUserMapFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case StoreUserMapFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StoreUserMapFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StoreUserMapFilters.UserTypeId:
                        where['UserTypeId'] = param.Value;
                        break;
                    case StoreUserMapFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case StoreUserMapFilters.IsDefault:
                        where['IsDefault'] = param.Value;
                        break;
                    case StoreUserMapFilters.IsOpticalStore:
                        (storeWhere as any ) [Op.or] = [{ IsOpticalStore: param.Value }];
                        isReqstoreSearch = true;
                        break;
                    case StoreUserMapFilters.StoreTypeId:
                        storeWhere['StoreTypeId'] = param.Value;
                        isReqstoreSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StoreMaster,
            attributes: ['Id', 'StoreCode', 'StoreName', 'CanAllowOpenGRN', 'CanAllowOpenPO', 'IsGstEditablePo',
                'StoreTypeId', 'Email', 'Password', 'StoreSubTypeId', 'SequenceOptionId', 'IsPOMandatory',
                'ExpiryWarningDays', 'ExpiryPriorStopDays',
            'IsSeqbasedStore'],
            required: isReqstoreSearch,
            where: storeWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStoreUserMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StoreUserMapInstance, StoreUserMapAttributes> {
        return this.Models.StoreUserMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StoreUserMapFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [['StoreMasterId', 'Id'], 'StoreMasterId', 'StoreCode',
        ['StoreName', 'Text'], 'StoreName', 'IsDefault'];
        let val = await this.GetStoreUserMaps(apiReq);
        return { [key]: val.Data };
    }
}
