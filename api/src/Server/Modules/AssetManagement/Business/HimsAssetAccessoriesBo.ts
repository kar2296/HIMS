import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssetAccessoriesInstance, AssetAccessoriesAttributes } from '../Model/Interface/Index';
import { AssetAccessoriesFilters } from '../Common/Filters.e';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
// import * as bo from '../../Accounts/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';

export class AssetAccessoriesBo extends BaseBo<AssetAccessoriesInstance, AssetAccessoriesAttributes> implements IOptionProvider {
    public async AddAssetAccessories(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetAccessories(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageAssetAccessoriess(req: BaseRequest): Promise<boolean> {
        let list: AssetAccessoriesAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }


    public async GetAssetAccessoriesById(req: BaseRequest): Promise<AssetAccessoriesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetAccessoriess(apiReq?: ApiRequest<AssetAccessoriesFilters>): Promise<ApiResponse<AssetAccessoriesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let assetWhere: WhereOptions<any> = {};
        let isReqAssetSearch: boolean = false;
        // include.push(this.GetReference('AssetType'));
        // include.push(this.GetReference(''));
        // include.push(this.GetReference('ModelId'));
        // include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetAccessoriesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetAccessoriesFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AssetAccessoriesFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AssetAccessoriesFilters.AssetCategoryId:
                        assetWhere['AssetCategoryId'] = param.Value;
                        isReqAssetSearch = true;
                        break;
                    case AssetAccessoriesFilters.AssetTypeId:
                        assetWhere['AssetTypeId'] = param.Value;
                        isReqAssetSearch = true;
                        break;
                    case AssetAccessoriesFilters.FromWarrantyto:
                        where['WarrentyTo'] = where['WarrentyTo'] || {};
                        (where['WarrentyTo'] as any)['$gte'] = param.Value;
                        break;
                    case AssetAccessoriesFilters.ToWarrantyto:
                        where['WarrentyTo'] = where['WarrentyTo'] || {};
                        (where['WarrentyTo'] as any)['$lte'] = param.Value;
                        break;
                    case AssetAccessoriesFilters.InstalledDepartmentId:
                        assetWhere['InstalledDepartmentId'] = param.Value;
                        isReqAssetSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Asset,
            required: isReqAssetSearch,
            where: assetWhere,
            include: [this.GetReference('AssetType'), this.GetReference('AssetCategory')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetAccessories(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetAccessoriesFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetAccessoriess(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AssetAccessoriesInstance, AssetAccessoriesAttributes> {
        return this.Models.AssetAccessories;
    }
    public async PrintAssetAccessoriesReport(apiReq?: ApiRequest<AssetAccessoriesFilters>): Promise<FileInfo> {
        let AssetAccessories: any = [];
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let AssetName = apiReq.Data.AssetName;
        let data = await this.GetAssetAccessoriess(apiReq);
        AssetAccessories = data.Data;
        let AssetAccessoriesData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetAccessoriesData.FacilityId);
        let info = {
            AssetAccessories: AssetAccessories,
            Preferences: printPreferencesData,
            AssetType: AssetType,
            FromDate: FromDate,
            ToDate: ToDate,
            AssetCategory: AssetCategory,
            Department: Department,
            ActiveStatus: ActiveStatus,
            AssetName: AssetName

        };
        let pdfOption: any = null;
        let key = 'assetaccessoriesreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/hrm/accounts')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
