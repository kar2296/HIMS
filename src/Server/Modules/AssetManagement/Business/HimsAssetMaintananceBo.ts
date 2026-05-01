import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AssetMaintananceInstance, AssetMaintananceAttributes } from '../Model/Interface/Index';
import { AssetMaintananceFilters } from '../Common/Filters.e';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
// import * as bo from '../../Accounts/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';

export class AssetMaintananceBo extends BaseBo<AssetMaintananceInstance, AssetMaintananceAttributes> implements IOptionProvider {
    public async AddAssetMaintanance(req: BaseRequest): Promise<number> {
        // this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetMaintanance(req: BaseRequest): Promise<boolean> {
        // this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageAssetMaintanances(req: BaseRequest): Promise<boolean> {
        let list: AssetMaintananceAttributes[] = req.Data || [];
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


    public async GetAssetMaintananceById(req: BaseRequest): Promise<AssetMaintananceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetMaintanances(apiReq?: ApiRequest<AssetMaintananceFilters>): Promise<ApiResponse<AssetMaintananceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Asset, required: false,
            include: [this.GetReference('AssetType'), this.GetReference('AssetCategory'),
            { model: this.Models.Department, attributes: ['DepartmentName'], required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetMaintananceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetMaintananceFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AssetMaintananceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AssetMaintananceFilters.MaintananceDate:
                        where['MaintananceDate'] = param.Value;
                        break;
                    case AssetMaintananceFilters.From:
                        where['MaintananceDate'] = where['MaintananceDate'] || {};
                        (where['MaintananceDate'] as any)['$gte'] = param.Value;
                        break;
                    case AssetMaintananceFilters.To:
                        where['MaintananceDate'] = where['MaintananceDate'] || {};
                        (where['MaintananceDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetMaintanance(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetMaintananceFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetMaintanances(apiReq);
        return { [key]: val.Data };
    }
    public async PrintAssetmaintenanceReport(apiReq?: ApiRequest<AssetMaintananceFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let data = await this.GetAssetMaintanances(apiReq);
        Asset = data.Data;
        let AssetData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetData.FacilityId);
        let info = {
            Asset: Asset,
            Preferences: printPreferencesData,
            AssetType: AssetType,
            AssetCategory: AssetCategory,
            Department: Department,
            ActiveStatus: ActiveStatus,

        };
        let pdfOption: any = null;
        let key = 'assetmaintenancereport';
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
    public GetModel(): SStatic.Model<AssetMaintananceInstance, AssetMaintananceAttributes> {
        return this.Models.AssetMaintanance;
    }
}
