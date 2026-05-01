import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssetInsuranceInstance, AssetInsuranceAttributes } from '../Model/Interface/Index';
import { AssetInsuranceFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';


export class AssetInsuranceBo extends BaseBo<AssetInsuranceInstance, AssetInsuranceAttributes> implements IOptionProvider {
    public async AddAssetInsurance(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetInsurance(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAssetInsuranceById(req: BaseRequest): Promise<AssetInsuranceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetInsurances(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<ApiResponse<AssetInsuranceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let assetWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqasset: any = false;
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('Insurance'));
        include.push(this.GetReference('PolicyType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetInsuranceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetInsuranceFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AssetInsuranceFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AssetInsuranceFilters.AssetTypeId:
                        assetWhere['AssetTypeId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetInsuranceFilters.DepartmentId:
                        assetWhere['DepartmentId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetInsuranceFilters.EmployeeId:
                        assetWhere['EmployeeId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetInsuranceFilters.AssetCategoryId:
                        assetWhere['AssetCategoryId'] = param.Value;
                        isReqasset = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Asset,
            required: isReqasset,
            where: assetWhere,
            include: [this.GetReference('AssetType'), this.GetReference('AssetCategory')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetInsurance(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintAssetInsurance(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<any> {
        let data = await this.GetAssetInsurances(apiReq);
        let AssetInsList = data.Data;
        let AssetInsData = data.Data[0];
        // let AssetData = AssetInsData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetInsData.ActiveStatusId);
        let info = {
            AssetInsList: AssetInsList,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'assetinsurance';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
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
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetInsurances(apiReq);
        return { [key]: val.Data };
    }
    public async PrintAssetInsuranceReport(apiReq?: ApiRequest<AssetInsuranceFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let data = await this.GetAssetInsurances(apiReq);
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
        let key = 'assetinsurancereport';
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
    public GetModel(): SStatic.Model<AssetInsuranceInstance, AssetInsuranceAttributes> {
        return this.Models.AssetInsurance;
    }
}
