import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { AssetInstance, AssetAttributes } from '../Model/Interface/Index';
import { AssetFilters } from '../Common/Filters.e';
// import * as generalBo from '../../GeneralMaster/Business/Index';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';
// import * as bo from '../../Accounts/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';

export class AssetBo extends BaseBo<AssetInstance, AssetAttributes> implements IOptionProvider {
    public async AddAsset(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        // let assetBO = BoFactory.GetBo(generalBo.AssetBo, this.Request);
        // let assetInfo = await assetBO.GetAssetById({ Id: req.Data.AssetId });
        // req.Data.LocationId = assetInfo.LocationId;
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAsset(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetAssetProfilePic(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.PhotoPath);
        return new Buffer(result).toString('base64');
    }
    public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        let count = 0;
        switch (key) {
            case 'resultreview':
                count = await this.Items.count({
                    where: {
                        'Status': { '$in': [1] },  //COMPLETED
                    }
                });
                break;
            default:
                count = 0;
                break;
        }
        return { count: count };
    }

    public async GetAssetById(req: BaseRequest): Promise<AssetAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssets(apiReq?: ApiRequest<AssetFilters>): Promise<ApiResponse<AssetAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('AssetType'));
        include.push(this.GetReference('AssetCategory'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.VendorMaster, attributes: ['VendorName'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetFilters.AssetTypeId:
                        where['AssetTypeId'] = param.Value;
                        break;
                    case AssetFilters.AssetCategoryId:
                        where['AssetCategoryId'] = param.Value;
                        break;
                    case AssetFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case AssetFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AssetFilters.ModelNum:
                        where['ModelNum'] = param.Value;
                        break;
                    case AssetFilters.ModelName:
                        where['ModelName'] = param.Value;
                        break;
                    case AssetFilters.Description:
                        where['Description'] = param.Value;
                        break;
                    case AssetFilters.Manufacturer:
                        where['Manufacturer'] = param.Value;
                        break;
                    case AssetFilters.Serial:
                        where['Serial'] = param.Value;
                        break;
                    case AssetFilters.PONum:
                        where['PONum'] = param.Value;
                        break;
                    case AssetFilters.GRNNum:
                        where['GRNNum'] = param.Value;
                        break;
                    case AssetFilters.PurchaseValue:
                        where['PurchaseValue'] = param.Value;
                        break;
                    case AssetFilters.CurrentValue:
                        where['CurrentValue'] = param.Value;
                        break;
                    case AssetFilters.AssetName:
                        (where as any)['$or'] = [{ 'AssetName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Description': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Serial': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case AssetFilters.IsLabInterface:
                        where['IsLabInterface'] = param.Value;
                        break;
                    case AssetFilters.FacilityId:
                        where['FacilityId'] = param.Value;
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

    public async DeleteAsset(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AssetName', 'Text'], 'AssetName'];
        let val = await this.GetAssets(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AssetInstance, AssetAttributes> {
        return this.Models.Asset;
    }
    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        let AssetCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let AssetTransferCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let TicketCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let AssetAuditCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        return {
            'AssetCount': AssetCount,
            'AssetTransferCount': AssetTransferCount,
            'TicketCount': TicketCount,
            'AssetAuditCount': AssetAuditCount
        };
    }

    public async PrintAssetDetailReport(apiReq?: ApiRequest<AssetFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let data = await this.GetAssets(apiReq);
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
        let key = 'assetdetailreport';
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
    public async PrintAssetsummarybyDepartmentReport(apiReq?: ApiRequest<AssetFilters>): Promise<FileInfo> {
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let data = await this.GetAssets(apiReq);
        let AssetData: any = data.Data[0];
        let AssetsummarybyDep: any = [];
        let assetInfo: any;
        let TotCount: number = 0;

        let GroupedBatchData = _.groupBy(data.Data, 'DepartmentId');
        for (let jdx in GroupedBatchData) {
            let batchdata = GroupedBatchData[jdx];
            let Department: any;
            let AssetName: any;
            let Count = 0;
            for (let cdx in batchdata) {
                assetInfo = batchdata[cdx];
                Count = 1;
                Department = assetInfo.Department.DepartmentName;
                AssetName = assetInfo.AssetName;
                // }
                // if ($scope.AssetsummarybyDep.length > 0) {
                //     $scope.AssetsummarybyDep.forEach(function (item) {
                //         if (Department == item.Department) {
                //             item.Count = DirectCount;
                //             item.OnlineCount = OnlineCount;
                //             valappend = 1;
                //         }
                //     });
                // }
                // if (valappend == 0) {
                AssetsummarybyDep.push({
                    'Department': Department,
                    'AssetName': AssetName,
                    'Count': Count,
                });
            }
        }

        for (let jdx in AssetsummarybyDep) {
            let netcal = AssetsummarybyDep[jdx];
            TotCount = TotCount + (netcal.Count || 0);

        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(AssetData.FacilityId);
        let info = {
            AssetsummarybyDep: AssetsummarybyDep,
            Preferences: printPreferencesData,
            AssetType: AssetType,
            AssetCategory: AssetCategory,
            Department: Department,
            ActiveStatus: ActiveStatus,
            TotCount: TotCount

        };
        let pdfOption: any = null;
        let key = 'assetsummarybydepartmentreport';
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
