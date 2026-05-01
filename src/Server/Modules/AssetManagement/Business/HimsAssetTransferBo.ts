import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AssetTransferInstance, AssetTransferAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { AssetTransferFilters } from '../Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class AssetTransferBo extends BaseBo<AssetTransferInstance, AssetTransferAttributes> implements IOptionProvider {
    public async AddAssetTransfer(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        if (result) {
            let assettransferid = result.dataValues.Id;
            let assettransferidentifier: any = null;
            if (req.Data.AssetTransferStatusId >= 2) {
                assettransferidentifier = this.getSequenceIdentifier(SequenceKeys.AssetTransferId);
            }
            if (assettransferidentifier) {
                try {
                    this.deferSequenceKey(assettransferid, 'AssetTransferNo', assettransferidentifier);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
            return assettransferid;
        }
        return result.dataValues.Id;
    }

    public async UpdateAssetTransfer(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (result) {
            let assettransferid = req.Data.Id;
            let assettransferidentifier: any = null;
            if (!req.Data.AssetTransferNo && req.Data.AssetTransferStatusId >= 2) {
                assettransferidentifier = this.getSequenceIdentifier(SequenceKeys.AssetTransferId);
            }
            if (assettransferidentifier) {
                try {
                    this.deferSequenceKey(assettransferid, 'AssetTransferNo', assettransferidentifier);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
        }
        return result;
    }
    public async GetAssetTransferById(req: BaseRequest): Promise<AssetTransferAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetAssetTransfers(apiReq?: ApiRequest<AssetTransferFilters>): Promise<ApiResponse<AssetTransferAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let assetWhere: WhereOptions<any> = {};
        let isReqAssetSearch: boolean = false;
        include.push({ model: this.Models.Department, as: 'FromDepartment', required: false });
        include.push({ model: this.Models.Department, as: 'ToDepartment', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('AssetTransferStatus'));
        // include.push(this.GetReference('AssetType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AssetTransferFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AssetTransferFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case AssetTransferFilters.ToDepartment:
                        where['ToDepartmentId'] = param.Value;
                        break;
                    case AssetTransferFilters.AssetName:
                        where['$or'] = { 'AssetName': { '$like': '%' + (param.Value || '') + '%' } };
                        break;
                    case AssetTransferFilters.AssetId:
                        where['AssetId'] = { '$between': param.Value || '' };
                        break;
                    case AssetTransferFilters.FromFacilityId:
                        where['FromFacilityId'] = param.Value;
                        break;
                    case AssetTransferFilters.AssetTransferStatusId:
                        where['AssetTransferStatusId'] = param.Value;
                        break;
                    case AssetTransferFilters.AssetCategoryId:
                        assetWhere['AssetCategoryId'] = param.Value;
                        isReqAssetSearch = true;
                        break;
                    case AssetTransferFilters.AssetTypeId:
                        assetWhere['AssetTypeId'] = param.Value;
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


    public async DeleteAssetTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AssetTransferFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetAssetTransfers(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<AssetTransferInstance, AssetTransferAttributes> {
        return this.Models.AssetTransfer;
    }
    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        /* Without Orders group by Subdeptarment */
        let AssetTransferCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });

        return {
            'AssetTransferCount': AssetTransferCount
        };

    }
    public async PrintAssetTransferReport(apiReq?: ApiRequest<AssetTransferFilters>): Promise<FileInfo> {
        let Asset: any = [];
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let Department = apiReq.Data.Department;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let FacilityId = apiReq.Data.FacilityId;
        let AssetType = apiReq.Data.AssetType;
        let data = await this.GetAssetTransfers(apiReq);
        Asset = data.Data;
        // let AssetData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            Asset: Asset,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            Department: Department,
            ActiveStatus: ActiveStatus,
            AssetType: AssetType

        };
        let pdfOption: any = null;
        let key = 'assettransferdetailreport';
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
    public async PrintAssetMovementReport(apiReq?: ApiRequest<AssetTransferFilters>): Promise<FileInfo> {
        let AssetMovement: any = [];
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let DepartmentName = apiReq.Data.DepartmentName;
        let AssetType = apiReq.Data.AssetType;
        let AssetCategory = apiReq.Data.AssetCategory;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let FacilityId = apiReq.Data.FacilityId;
        let AssetName = apiReq.Data.AssetName;
        let data = await this.GetAssetTransfers(apiReq);
        AssetMovement = data.Data;
        // let AssetMovementData: any = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            AssetMovement: AssetMovement,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DepartmentName: DepartmentName,
            AssetCategory: AssetCategory,
            AssetType: AssetType,
            ActiveStatus: ActiveStatus,
            AssetName: AssetName

        };
        let pdfOption: any = null;
        let key = 'assetmovementreport';
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
