import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, } from '../../../Common/Index';
import { GatePassInstance, GatePassAttributes } from '../Model/Interface/Index';
import { GatePassFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class GatePassBo extends BaseBo<GatePassInstance, GatePassAttributes> {
    public async AddGatePass(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        if (result) {
            let gatepassid = result.dataValues.Id;
            let gatepassidentifier: any = null;
            if (req.Data.GatePassStatusId === 2) {
                gatepassidentifier = this.getSequenceIdentifier(SequenceKeys.GatePassId);
            }
            if (gatepassidentifier) {
                try {
                    this.deferSequenceKey(gatepassid, 'GatePassNo', gatepassidentifier);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
            return gatepassid;
        }
        return 0;
    }


    public async UpdateGatePass(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (result) {
            let gatepassid = req.Data.Id;
            let gatepassidentifier: any = null;
            if (!req.Data.GatePassNo && req.Data.GatePassStatusId === 2) {
                gatepassidentifier = this.getSequenceIdentifier(SequenceKeys.GatePassId);
            }
            if (gatepassidentifier) {
                try {
                    this.deferSequenceKey(gatepassid, 'GatePassNo', gatepassidentifier);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }
        }
        return result;
    }


    public async GetGatePassById(req: BaseRequest): Promise<GatePassAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGatePasss(apiReq?: ApiRequest<GatePassFilters>): Promise<ApiResponse<GatePassAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let assetWhere: WhereOptions<any> = {};
        let isReqAssetSearch: boolean = false;
        include.push(this.GetReference('GatePassType'));
        include.push(this.GetReference('DispatchedType'));
        include.push(this.GetReference('GatePassStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DisposedUser', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({ model: this.Models.Asset, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.Department, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GatePassFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GatePassFilters.GatePassTypeId:
                        where['GatePassTypeId'] = param.Value;
                        break;
                    case GatePassFilters.AssetId:
                        (where as any)['$or'] = [{ 'AssetName': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case GatePassFilters.GatePassStatusId:
                        where['GatePassStatusId'] = param.Value;
                        break;
                    case GatePassFilters.GatePassNo:
                        (where as any)['$or'] = [{ 'GatePassNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case GatePassFilters.GatePassDate:
                        where['GatePassDate'] = { '$between': param.Value };
                        break;
                    case GatePassFilters.From:
                        where['GatePassDate'] = where['GatePassDate'] || {};
                        (where['GatePassDate'] as any)['$gte'] = param.Value;
                        break;
                    case GatePassFilters.To:
                        where['GatePassDate'] = where['GatePassDate'] || {};
                        (where['GatePassDate'] as any)['$lte'] = param.Value;
                        break;
                    case GatePassFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case GatePassFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case GatePassFilters.AssetTypeId:
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

    public async DeleteGatePass(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintGatePass(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        let data = await this.GetGatePasss(apiReq);
        let GatePassList = data.Data;
        let GatePassData = data.Data[0];
        // let AssetData = GatePassData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GatePassData.FacilityId);
        let info = {
            GatePassList: GatePassList,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'gatepass';
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

    public async PrintGatePass1(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        let data = await this.GetGatePasss(apiReq);
        let GatePassList = data.Data;
        let GatePassData = data.Data[0];
        // let AssetData = GatePassData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GatePassData.FacilityId);
        let info = {
            GatePassList: GatePassList,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'gatepassprint';
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

    public async PrintAssetGatepassReport(apiReq?: ApiRequest<GatePassFilters>): Promise<any> {
        let data = await this.GetGatePasss(apiReq);
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let AssetType = apiReq.Data.AssetType;
        let GatePassType = apiReq.Data.GatePassType;
        let GatePassList = data.Data;
        let GatePassData = data.Data[0];
        // let AssetData = GatePassData.Asset;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GatePassData.FacilityId);
        let info = {
            GatePassList: GatePassList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            AssetType: AssetType,
            GatePassType: GatePassType
        };
        let pdfOption: any = null;
        let key = 'assetgatepassreport';
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
    public GetModel(): SStatic.Model<GatePassInstance, GatePassAttributes> {
        return this.Models.GatePass;
    }

}
