import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, MapBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse, ISearchEnums } from '../../../Common/Index';
import { VendorMasterInstance, VendorMasterAttributes } from '../Model/Interface/Index';
import { VendorMasterFilters } from '../Common/Filters.e';
import { VendorErpMapAttributes, VendorFacilityMapAttributes } from '../Model/Interface/Index';
import { VendorErpFilters, VendorFacilityFilters } from '../Common/Filters.e';
import { VendorContactAttributes } from '../Model/Interface/Index';
import { VendorContactFilters } from '../Common/Filters.e';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import { readFileSync } from 'fs';
import { join } from 'path';

import * as bo from '../../Pharmacy/Business/Index';

export class VendorMasterBo extends BaseBo<VendorMasterInstance, VendorMasterAttributes> {
    protected VendorErpBO: bo.VendorErpMapBo;
    protected VendorConBO: bo.VendorContactBo;
    protected VendorFacilityBO: bo.VendorFacilityMapBo;

    public constructor(req?: Request) {
        super(req);
        this.VendorErpBO = BoFactory.GetBo(bo.VendorErpMapBo, req); //TODO
        this.VendorConBO = BoFactory.GetBo(bo.VendorContactBo, req); //TODO
    }

    public async AddVendorMaster(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.ImagePath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        if (result) {
            let MasterId = result.dataValues.Id;

            let facilityvendorBO = BoFactory.GetBo(bo.VendorFacilityMapBo, this.Request);
            await facilityvendorBO.ManageVendorFacilityMap(MasterId, req.Data);

            return MasterId;
        }

        return 0;
    }

    public async AddVendorMasterExcel(req: BaseRequest): Promise<any> {
        let details: VendorMasterAttributes[] = req.Data || [];
        const masterIds: number[] = [];

        await Promise.all(details.map(async (DetailItem: VendorMasterAttributes) => {
            try {
                let result = await this.Save(DetailItem);
                if (result) {
                    let MasterId = result.dataValues.Id;
                    masterIds.push(MasterId);
                }
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        await Promise.all(masterIds.map(async (MasterId, index) => {
            let facilityvendorBO = BoFactory.GetBo(bo.VendorFacilityMapBo, this.Request);
            let vendorFacilityMapData = {
                ...details[index],
                VendorMasterId: MasterId,
            };
            await facilityvendorBO.Save(vendorFacilityMapData);
        }));

        return true;
    }

    public async UpdateVendorMaster(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.ImagePath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let FacilityVendors = null;
        let VFBo = BoFactory.GetBo(bo.VendorFacilityMapBo, this.Request);
        let VendorFacilityApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: VendorFacilityFilters.VendorMasterId, Value: req.Data.Id }]
        };
        FacilityVendors = await VFBo.GetVendorFacilityMaps(VendorFacilityApiReq);
        if (FacilityVendors.Data.length > 0) {
            await VFBo.ManageVendorFacilityMaps(req.Data, FacilityVendors.Data);
        }

        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateVendorMasters(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAttachment(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.ImagePath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        if (req.Data.VendorTypeId && req.Data.SupplyTypeId) {
            let maxidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('VendorMasterId')), 'VendorMasterId'],
                ],
                where: {
                    Status: 1,
                    VendorTypeId: req.Data.VendorTypeId,
                    SupplyTypeId: req.Data.SupplyTypeId
                }
            });
            if (maxidInstance) {
                let patient: any = this.GetAttribute(maxidInstance);
                let lastVendorMasterId = patient['VendorMasterId'];
                if (lastVendorMasterId) MaxId = lastVendorMasterId;
            }
        }

        return ++MaxId;

    }


    public async GetVendorMasterById(req: BaseRequest): Promise<VendorMasterAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('VendorType'));
        include.push({ model: this.Models.VendorContact, as: 'VendorContact', required: false });
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVendorMasters(apiReq?: ApiRequest<VendorMasterFilters>): Promise<ApiResponse<VendorMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('VendorType'));
        include.push({ model: this.Models.GstMaster, required: false });
        include.push(this.GetReference('PaymentTerms'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('DistributionType'));
        include.push(this.GetReference('BusinessDomain'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case VendorMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case VendorMasterFilters.VendorTypeId:
                        where['VendorTypeId'] = param.Value;
                        break;
                    case VendorMasterFilters.Name:
                        // ✅ FIXED: Proper Op.or syntax
                        (where as any)[Op.or] = [
                            { VendorName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                            { VendorCode: { [Op.like]: '%' + (param.Value || '') + '%' } }
                        ];
                        break;
                    case VendorMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case VendorMasterFilters.DistributionTypeId:
                        where['DistributionTypeId'] = param.Value;
                        break;
                    case VendorMasterFilters.BusinessDomainId:
                        where['BusinessDomainId'] = param.Value;
                        break;
                    case VendorMasterFilters.PhoneNumber:
                        where['PhoneNumber'] = param.Value;
                        break;
                    case VendorMasterFilters.EmailAddress:
                        where['EmailAddress'] = param.Value;
                        break;
                    case VendorMasterFilters.City:
                        where['City'] = param.Value;
                        break;
                    case VendorMasterFilters.LeadTime:
                        where['LeadTime'] = param.Value;
                        break;
                    case VendorMasterFilters.SupplyTypeId:
                        where['SupplyTypeId'] = param.Value;
                        break;
                    case VendorMasterFilters.IsAssetVendor:
                        where['IsAssetVendor'] = param.Value;
                        break;
                    case VendorMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case VendorMasterFilters.From:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)[Op.gte] = param.Value;
                        break;
                    case VendorMasterFilters.To:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)[Op.lte] = param.Value;
                        break;
                    case VendorMasterFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteVendorMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<VendorMasterInstance, VendorMasterAttributes> {
        return this.Models.VendorMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<VendorMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'VendorMasterId', ['VendorName', 'Text'], 'VendorName', 'VendorCode'];
        let val = await this.GetVendorMasters(apiReq);
        return { [key]: val.Data };
    }

    public async AddVendorErpMap(req: BaseRequest): Promise<number> {
        return this.VendorErpBO.AddVendorErpMap(req);
    }

    public async UpdateVendorErpMap(req: BaseRequest): Promise<boolean> {
        return this.VendorErpBO.UpdateVendorErpMap(req);
    }

    public async GetVendorErpMapById(req: BaseRequest): Promise<VendorErpMapAttributes> {
        return this.VendorErpBO.GetVendorErpMapById(req);
    }

    public async GetVendorErpMaps(apiReq?: ApiRequest<VendorErpFilters>): Promise<ApiResponse<VendorErpMapAttributes[]>> {
        return this.VendorErpBO.GetVendorErpMaps(apiReq);
    }

    public async DeleteVendorErpMap(req: BaseRequest): Promise<Boolean> {
        return this.VendorErpBO.DeleteVendorErpMap(req);
    }

    public async AddVendorContact(req: BaseRequest): Promise<number> {
        return this.VendorConBO.AddVendorContact(req);
    }

    public async UpdateVendorContact(req: BaseRequest): Promise<boolean> {
        return this.VendorConBO.UpdateVendorContact(req);
    }

    public async GetVendorContactById(req: BaseRequest): Promise<VendorContactAttributes> {
        return this.VendorConBO.GetVendorContactById(req);
    }

    public async GetVendorContacts(apiReq?: ApiRequest<VendorContactFilters>): Promise<ApiResponse<VendorContactAttributes[]>> {
        return this.VendorConBO.GetVendorContacts(apiReq);
    }

    public async DeleteVendorContact(req: BaseRequest): Promise<Boolean> {
        return this.VendorConBO.DeleteVendorContact(req);
    }

    public async MapFacilities(req: BaseRequest) {
    let mapbo = new MapBo(this.Models.VendorFacilityMap, 'VendorMasterId', 'FacilityId', this.Request);
    return await mapbo.Manage(req.Data);
}
public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
    let mapbo = new MapBo(this.Models.VendorFacilityMap, 'VendorMasterId', 'FacilityId', this.Request);
    return await mapbo.GetMaps(apiReq);
}
    public async GetVendorFacilityMaps(apiReq?: ApiRequest<VendorFacilityFilters>): Promise<ApiResponse<VendorFacilityMapAttributes[]>> {
        return this.VendorFacilityBO.GetVendorFacilityMaps(apiReq);
    }
    public async PrintSupplierMasterReport(apiReq?: ApiRequest<VendorMasterFilters>): Promise<any> {
        let data = await this.GetVendorMasters(apiReq);
        let VendorMasters = data.Data;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let VendorName = apiReq.Data.VendorName;
        let VendorMasterData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VendorMasterData.FacilityId);
        let info = {
            VendorMasters: VendorMasters,
            Preferences: printPreferencesData,
            ActiveStatus: ActiveStatus,
            VendorName: VendorName
        };
        let pdfOption: any = null;
        let key = 'suppliermasterreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
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
    public async PrintManufacturerMasterReport(apiReq?: ApiRequest<VendorMasterFilters>): Promise<any> {
        let data = await this.GetVendorMasters(apiReq);
        let VendorMasters = data.Data;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let VendorName = apiReq.Data.VendorName;
        let VendorMasterData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(VendorMasterData.FacilityId);
        let info = {
            VendorMasters: VendorMasters,
            Preferences: printPreferencesData,
            ActiveStatus: ActiveStatus,
            VendorName: VendorName
        };
        let pdfOption: any = null;
        let key = 'manufacturermasterreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
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
