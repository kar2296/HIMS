import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AssetWarrantyInstance, AssetWarrantyAttributes } from '../Model/Interface/Index';
import { AssetWarrantyFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';
export class AssetWarrantyBo extends BaseBo<AssetWarrantyInstance, AssetWarrantyAttributes> implements IOptionProvider {
    public async AddAssetWarranty(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAssetWarranty(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAssetWarrantyById(req: BaseRequest): Promise<AssetWarrantyAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssetWarranties(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<ApiResponse<AssetWarrantyAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let assetWhere: WhereOptions<any> = {};
        let isReqasset: any = false;
        include.push(this.GetReference('WarrantyType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetWarrantyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetWarrantyFilters.WarrantyTypeId:
                        where['WarrantyTypeId'] = param.Value;
                        break;
                    case AssetWarrantyFilters.FromDate:
                        where['FromDate'] = param.Value;
                        break;
                    case AssetWarrantyFilters.ToDate:
                        where['ToDate'] = param.Value;
                        break;
                    case AssetWarrantyFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AssetWarrantyFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AssetWarrantyFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AssetWarrantyFilters.EmployeeId:
                        assetWhere['EmployeeId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetWarrantyFilters.DepartmentId:
                        assetWhere['DepartmentId'] = param.Value;
                        isReqasset = true;
                        break;
                    case AssetWarrantyFilters.ToWarrantyDate:
                        where['ToDate'] = { '$between': param.Value };
                        break;
                    case AssetWarrantyFilters.FromWarranty:
                        where['ToDate'] = where['ToDate'] || {};
                        (where['ToDate'] as any)['$gte'] = param.Value;
                        break;
                    case AssetWarrantyFilters.ToWarranty:
                        where['ToDate'] = where['ToDate'] || {};
                        (where['ToDate'] as any)['$lte'] = param.Value;
                        break;
                    case AssetWarrantyFilters.AssetTypeId:
                        assetWhere['AssetTypeId'] = param.Value;
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

    public async DeleteAssetWarranty(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetWarranties(apiReq);
        return { [key]: val.Data };
    }

    public async PrintAssetWarranty(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<any> {
        let data = await this.GetAssetWarranties(apiReq);
        let AssetwarrantyList = data.Data;
        let AssetwarrantyData = data.Data[0];
        // let AssetData = AssetwarrantyData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetwarrantyData.FacilityId);
        let info = {
            AssetwarrantyList: AssetwarrantyList,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'assetwarranty';
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
    public async PrintAssetwarrantyexpiredReport(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let WarrantyType = apiReq.Data.WarrantyType;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let AssetType = apiReq.Data.AssetType;
        let data = await this.GetAssetWarranties(apiReq);
        Asset = data.Data;
        let AssetData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetData.FacilityId);
        let info = {
            Asset: Asset,
            Preferences: printPreferencesData,
            WarrantyType: WarrantyType,
            FromDate: FromDate,
            ToDate: ToDate,
            ActiveStatus: ActiveStatus,
            AssetType: AssetType

        };
        let pdfOption: any = null;
        let key = 'assetwarrantyexpiredreport';
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

    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        let DeptGroup: { [id: number]: any[] } = {};
        let DepartmentGroupJoin: any = {
            model: this.Models.Department,
            attributes: ['DepartmentName'],
            required: false,
        };
        let WarrantyType1Inst: any = await this.FindAll({
            // attributes: ['DepartmentId'],
            where: {
                'Status': 1,
                'FacilityId': req.Data.FacilityId,
                'WarrantyTypeId': 1,
                // 'DepartmentId': { '$eq': req.Data.DepartmentId },

            },
            include: [DepartmentGroupJoin]
        });
        if (WarrantyType1Inst) {
            let WarrantyType = _.groupBy(WarrantyType1Inst, 'DepartmentId');
            for (let i in WarrantyType) {
                let groupedWarrentyType = WarrantyType[i];
                let WarrantyTypeCount: number = 0;
                let DepartmentId: number = 0;
                let DepartmentName: string = '';
                let WarrantyTypeId: number = 0;
                // let WarrantyTypeName: string = '';
                WarrantyTypeCount = groupedWarrentyType.length;
                for (let i = 0; i < groupedWarrentyType.length; i++) {
                    let WType: any = groupedWarrentyType[i];
                    DepartmentId = WType.DepartmentId;
                    DepartmentName = WType.DepartmentName;
                    WarrantyTypeId = WType.WarrantyTypeId;
                    // WarrantyTypeName = WType.WarrantyTypeName;
                    DeptGroup[DepartmentId] = DeptGroup[DepartmentId] || [];
                }
                let info = {
                    'DepartmentId': DepartmentId,
                    'DepartmentName': DepartmentName,
                    'WarrantyTypeId': WarrantyTypeId,
                    // 'WarrantyTypeName': WarrantyTypeName,
                    'WarrantyTypeCount': WarrantyTypeCount
                };
                DeptGroup[DepartmentId].push(info);
            }
        }

        let WarrantyType2Inst = await this.FindAll({
            where: {
                'Status': 1,
                'FacilityId': req.Data.FacilityId,
                'WarrantyTypeId': 2,
                // 'DepartmentId': req.Data.DepartmentId,
            },
            include: [DepartmentGroupJoin]
        });
        let WarrantyType3Inst = await this.FindAll({
            where: {
                'Status': 1,
                'FacilityId': req.Data.FacilityId,
                'WarrantyTypeId': 3,
                // 'DepartmentId': req.Data.DepartmentId,
            },
            include: [DepartmentGroupJoin]
        });


        if (WarrantyType2Inst) {
            let WarrantyType = _.groupBy(WarrantyType2Inst, 'DepartmentId');
            for (let i in WarrantyType) {
                let groupedWarrentyType = WarrantyType[i];
                let WarrantyTypeCount: number = 0;
                let DepartmentId: number = 0;
                let DepartmentName: string = '';
                let WarrantyTypeId: number = 0;
                // let WarrantyTypeName: string = '';
                WarrantyTypeCount = groupedWarrentyType.length;
                for (let i = 0; i < groupedWarrentyType.length; i++) {
                    let WType: any = groupedWarrentyType[i];
                    DepartmentId = WType.DepartmentId;
                    DepartmentName = WType.DepartmentName;
                    WarrantyTypeId = WType.WarrantyTypeId;
                    // WarrantyTypeName = WType.WarrantyTypeName;
                    DeptGroup[DepartmentId] = DeptGroup[DepartmentId] || [];
                }
                let info = {
                    'DepartmentId': DepartmentId,
                    'DepartmentName': DepartmentName,
                    'WarrantyTypeId': WarrantyTypeId,
                    // 'WarrantyTypeName': WarrantyTypeName,
                    'WarrantyTypeCount': WarrantyTypeCount
                };
                DeptGroup[DepartmentId].push(info);
            }
        }
        if (WarrantyType3Inst) {
            let WarrantyType = _.groupBy(WarrantyType3Inst, 'DepartmentId');
            for (let i in WarrantyType) {
                let groupedWarrentyType = WarrantyType[i];
                let WarrantyTypeCount: number = 0;
                let DepartmentId: number = 0;
                let DepartmentName: string = '';
                let WarrantyTypeId: number = 0;
                // let WarrantyTypeName: string = '';
                WarrantyTypeCount = groupedWarrentyType.length;
                for (let i = 0; i < groupedWarrentyType.length; i++) {
                    let WType: any = groupedWarrentyType[i];
                    DepartmentId = WType.DepartmentId;
                    DepartmentName = WType.DepartmentName;
                    WarrantyTypeId = WType.WarrantyTypeId;
                    // WarrantyTypeName = WType.WarrantyTypeName;
                    DeptGroup[DepartmentId] = DeptGroup[DepartmentId] || [];
                }
                let info = {
                    'DepartmentId': DepartmentId,
                    'DepartmentName': DepartmentName,
                    'WarrantyTypeId': WarrantyTypeId,
                    // 'WarrantyTypeName': WarrantyTypeName,
                    'WarrantyTypeCount': WarrantyTypeCount
                };
                DeptGroup[DepartmentId].push(info);
            }
        }
        console.log(DeptGroup, '******************************************************');
        return DeptGroup;
    }

    public async PrintAssetwarrantyexpiryReport(apiReq?: ApiRequest<AssetWarrantyFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let WarrantyType = apiReq.Data.WarrantyType;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let AssetType = apiReq.Data.AssetType;
        let data = await this.GetAssetWarranties(apiReq);
        Asset = data.Data;
        let AssetData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetData.FacilityId);
        let info = {
            Asset: Asset,
            Preferences: printPreferencesData,
            WarrantyType: WarrantyType,
            FromDate: FromDate,
            ToDate: ToDate,
            ActiveStatus: ActiveStatus,
            AssetType: AssetType

        };
        let pdfOption: any = null;
        let key = 'assetwarrantyexpiryreport';
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
    public GetModel(): SStatic.Model<AssetWarrantyInstance, AssetWarrantyAttributes> {
        return this.Models.AssetWarranty;
    }
}
