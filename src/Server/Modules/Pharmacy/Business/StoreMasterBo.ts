import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { StoreMasterInstance, StoreMasterAttributes } from '../Model/Interface/Index';
import { StoreMasterFilters, ItemStoreFilters } from '../Common/Filters.e';
import * as bo from '../../Pharmacy/Business/Index';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as appMgrBO from '../../SystemSettings/Business/Index';

export class StoreMasterBo extends BaseBo<StoreMasterInstance, StoreMasterAttributes> {
    public async AddStoreMaster(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStoreMaster(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        if (req.Data.IsActivechanged) {
            let ItemMapBo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
            let MappedItemApiReq = {
                Id: 0,
                PageContext: { PageSize: 10000, PageNumber: 1 },
                Params: [{ Key: ItemStoreFilters.StoreMasterId, Value: req.Data.Id }]
            };
            let MappedItems = null;
            if (req.Data.IsActive === false || req.Data.IsActive === 0) {
                MappedItems = await ItemMapBo.GetItemStoreMaps(MappedItemApiReq);
                if (MappedItems.Data.length > 0) {
                    await ItemMapBo.ManageStoreItemMaps(req.Data, MappedItems.Data);
                }
            } else if (req.Data.IsActive === true) {
                MappedItems = await ItemMapBo.GetItemStoreMaps(MappedItemApiReq);
                if (MappedItems.Data.length > 0) {
                    await ItemMapBo.ManageStoreItemMaps(req.Data, MappedItems.Data);
                }
            }
        }
        return result;
    }
    public async GetStoreMasterLogo(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.LogoPath);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }

    public async GetStoreMasterById(req: BaseRequest): Promise<StoreMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStoreMasters(apiReq?: ApiRequest<StoreMasterFilters>): Promise<ApiResponse<StoreMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('StoreType'));
        include.push(this.GetReference('PrinterOption'));
        include.push(this.GetReference('StorePolicy'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('StoreSubType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StoreMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StoreMasterFilters.Name:
                        (where as any) [Op.or] = [{ StoreName: { [Op.like]: (param.Value || '') + '%' } },
                        { StoreCode: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case StoreMasterFilters.StoreTypeId:
                        where['StoreTypeId'] = param.Value;
                        break;
                    case StoreMasterFilters.StoreSubTypeId:
                        where['StoreSubTypeId'] = param.Value;
                        break;
                    case StoreMasterFilters.StorePolicy:
                        where['StorePolicyId'] = param.Value;
                        break;
                    case StoreMasterFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case StoreMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StoreMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case StoreMasterFilters.IsOpticalStore:
                        where['IsOpticalStore'] = param.Value;
                        break;
                    case StoreMasterFilters.IsDefaultWardindentStore:
                        where['IsDefaultWardindentStore'] = param.Value;
                        break;
                    case StoreMasterFilters.IsIndentStore:
                        where['IsIndentStore'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStoreMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StoreMasterInstance, StoreMasterAttributes> {
        return this.Models.StoreMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StoreMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'StoreMasterId', ['StoreName', 'Text'], 'StoreName',
            'StoreCode', 'StoreTypeId', 'StoreSubTypeId', 'ExpiryWarningDays', 'ExpiryPriorStopDays',
            'IsManualBatchSelection', 'SequenceOptionId', 'IsDefaultPrescriptionStore', 'Email', 'Password',
            'CanSeeToStoreQty', 'CanAllowOpenGRN', 'IsGstEditablePo', 'CanAllowOpenPO', 'IsDefaultWardindentStore', 'AddressLine1',
            'AddressLine2'];
        let val = await this.GetStoreMasters(apiReq);
        return { [key]: val.Data };
    }
    public async PrintStoreMasterReport(apiReq?: ApiRequest<StoreMasterFilters>): Promise<any> {
        let data = await this.GetStoreMasters(apiReq);
        let StoreMasters = data.Data;
        let StoreType = apiReq.Data.StoreType;
        let StoreSubType = apiReq.Data.StoreSubType;
        let Department = apiReq.Data.Department;
        let FacilityName = apiReq.Data.FacilityName;
        let storename = apiReq.Data.storename;
        let StoreMastersData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StoreMastersData.FacilityId);
        let info = {
            StoreMasters: StoreMasters,
            Preferences: printPreferencesData,
            StoreType: StoreType,
            StoreSubType: StoreSubType,
            Department: Department,
            FacilityName: FacilityName,
            storename: storename
        };
        let pdfOption: any = null;
        let key = 'storemasterreport';
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
