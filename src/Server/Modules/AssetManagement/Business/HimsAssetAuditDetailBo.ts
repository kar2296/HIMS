import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssetAuditDetailInstance, AssetAuditDetailAttributes } from '../Model/Interface/Index';
import { AssetAuditDetailFilters } from '../Common/Filters.e';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
import * as assetBo from './Index';
import * as userbo from '../../SystemSettings/Business/Index';


export class AssetAuditDetailBo extends BaseBo<AssetAuditDetailInstance, AssetAuditDetailAttributes> implements IOptionProvider {
    public async AddAssetAuditDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetAuditDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageDetails(auditId: number, details: AssetAuditDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.AssetAuditId = auditId;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetAssetAuditDetailById(req: BaseRequest): Promise<AssetAuditDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetAuditDetails(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<ApiResponse<AssetAuditDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let AssetAuditWhere: WhereOptions<any> = {};
        let isReqassetaudit: any = false;
        let AssetWhere: WhereOptions<any> = {};
        let isReqasset: any = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.LocationMaster, attributes: ['LocationName'], required: false });
        include.push(this.GetReference('LOCATION'));
        include.push(this.GetReference('AuditStatus'));
        // include.push({
        //     model: this.Models.AssetAudit,
        //     include: [
        //         {
        //             model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuditName', required: false,
        //             include: [this.GetReference('Title')]
        //         }
        //     ]
        // });
        // include.push({
        //     model: this.Models.Asset, attributes:
        //         ['AssetCode', 'AssetName', 'Description', 'ShortCode', 'Serial'], required: false,
        //     include: [this.GetReference('AssetCategory')]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetAuditDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.AssetAuditId:
                        where['AssetAuditId'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.StartDate:
                        where['StartDate'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.From:
                        where['StartDate'] = where['StartDate'] || {};
                        (where['StartDate'] as any)['$gte'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.To:
                        where['StartDate'] = where['StartDate'] || {};
                        (where['StartDate'] as any)['$lte'] = param.Value;
                        break;
                    case AssetAuditDetailFilters.AuditNameId:
                        AssetAuditWhere['AuditNameId'] = param.Value;
                        isReqassetaudit = true;
                        break;
                    case AssetAuditDetailFilters.FacilityId:
                        AssetAuditWhere['FacilityId'] = param.Value;
                        isReqassetaudit = true;
                        break;
                    case AssetAuditDetailFilters.AssetCategoryId:
                        AssetWhere['AssetCategoryId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetAuditDetailFilters.AssetTypeId:
                        AssetWhere['AssetTypeId'] = param.Value;
                        isReqasset = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Asset, required: isReqasset,
            where: AssetWhere,
            include: [this.GetReference('AssetCategory')]
        });
        include.push({
            model: this.Models.AssetAudit,
            attributes: ['Id', 'AuditNameId', 'StartDate', 'AuditStatusId', 'FacilityId'],
            required: isReqassetaudit,
            where: AssetAuditWhere,
            include: [
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuditName', required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAssetAuditDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintAssetAudit(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        let data = await this.GetAssetAuditDetails(apiReq);
        let AssetAuditList = data.Data;
        let AssetAuditDetailData = data.Data[0];
        let assetAuditBO = BoFactory.GetBo(assetBo.AssetAuditBo, this.Request);
        let assetAuditData = await assetAuditBO.GetAssetAuditById({ Id: AssetAuditDetailData.AssetAuditId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(assetAuditData.FacilityId);
        let info = {
            AssetAuditList: AssetAuditList,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'assetaudit';
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
    public async GetOptions(key: string, apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetAuditDetails(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<AssetAuditDetailInstance, AssetAuditDetailAttributes> {
        return this.Models.AssetAuditDetail;
    }
    public async  PrintAssetAuditReport(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        let data = await this.GetAssetAuditDetails(apiReq);
        let AssetAuditList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        // let AssetAuditListData = data.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let storePreferenceBO = BoFactory.GetBo(assetBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        // let printStoreData =
        //     await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, AssetAuditListData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let info = {
            AssetAuditList: AssetAuditList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            AssetType: AssetType,
            AssetCategory: AssetCategory
        };
        let pdfOption: any = null;
        let key = 'assetauditreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async  PrintAssetReconcileReport(apiReq?: ApiRequest<AssetAuditDetailFilters>): Promise<any> {
        let data = await this.GetAssetAuditDetails(apiReq);
        let AssetReconcile = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        // let AssetReconcileData = data.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let storePreferenceBO = BoFactory.GetBo(assetBo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        // let printStoreData =
        //     await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, AssetReconcileData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let info = {
            AssetReconcile: AssetReconcile,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            AssetType: AssetType,
            AssetCategory: AssetCategory
        };
        let pdfOption: any = null;
        let key = 'assetreconcilereport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
