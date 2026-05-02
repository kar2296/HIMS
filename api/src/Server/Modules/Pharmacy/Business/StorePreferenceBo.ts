import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StorePreferenceInstance, StorePreferenceAttributes } from '../Model/Interface/Index';
import { StorePreferenceFilters } from '../Common/Filters.e';
import * as invBo from '../../Pharmacy/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as moment from 'moment';

export class StorePreferenceBo extends BaseBo<StorePreferenceInstance, StorePreferenceAttributes>  {
    public async AddStorePreference(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStorePreference(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async CreateStorePreferences(req: BaseRequest, facilityId: number): Promise<boolean> {
        let storePreferenceMasterBo = BoFactory.GetBo(invBo.StorePreferenceMasterBo, this.Request);
        let prefMasters = await storePreferenceMasterBo.GetAllPreferences(req);

        await Promise.all(prefMasters.map((DetailItem): Promise<void> => {
            return (async (prefMaster): Promise<void> => {
                let detail: any = {
                    Id: 0,
                    FacilityId: facilityId,
                    Category: prefMaster.Category,
                    Section: prefMaster.Section,
                    PreferenceDisplay: prefMaster.PreferenceDisplay,
                    PreferenceKey: prefMaster.PreferenceKey,
                    PreferenceValue: prefMaster.PreferenceDefaultValue,
                    PreferenceType: prefMaster.PreferenceType,
                    Row: prefMaster.Row,
                    Col: prefMaster.Col
                };
                await this.Save(detail);
            })(DetailItem);
        }));
        return true;
    }

    public async ManageStorePreferences(req: BaseRequest): Promise<boolean> {
        let details: StorePreferenceAttributes[] = req.Data || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                await this.Update(detail);
            })(DetailItem);
        }));
        return true;
    }

    public async GetStorePreferenceById(req: BaseRequest): Promise<StorePreferenceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStorePreferenceWithLogo(FacilityId: number, StoreMasterId: number): Promise<any> {
        let printPreferencesData: any;
        printPreferencesData = await this.GetPrintPreferences('print', null, FacilityId, StoreMasterId);
        let StoreMasterBO = BoFactory.GetBo(invBo.StoreMasterBo, this.Request);
        let storeData = await StoreMasterBO.GetStoreMasterById({ Id: StoreMasterId });
        printPreferencesData.StoreLogo = '';
        if (storeData && storeData.LogoPath) {
            let imgReq = {
                Id: StoreMasterId,
                FacilityId: FacilityId,
                StoreMasterId: StoreMasterId,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Data: { 'LogoPath': storeData.LogoPath }
            };
            let facilityImgData = await StoreMasterBO.GetStoreMasterLogo(imgReq);
            if (facilityImgData && facilityImgData.Logo) {
                printPreferencesData.StoreLogo = facilityImgData.Logo;
            }
        }
        return printPreferencesData;
    }

    public async GetStorePreferenceWithLogoForDM(FacilityId: number, StoreMasterId: number): Promise<any> {
        let printPreferencesData: any;
        printPreferencesData = await this.GetPrintPreferences('dmprint', null, FacilityId, StoreMasterId);
        let StoreMasterBO = BoFactory.GetBo(invBo.StoreMasterBo, this.Request);
        let storeData = await StoreMasterBO.GetStoreMasterById({ Id: StoreMasterId });
        printPreferencesData.StoreLogo = '';
        if (storeData && storeData.LogoPath) {
            let imgReq = {
                Id: StoreMasterId,
                StoreMasterId: StoreMasterId,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Data: { 'LogoPath': storeData.LogoPath }
            };
            let facilityImgData = await StoreMasterBO.GetStoreMasterLogo(imgReq);
            if (facilityImgData && facilityImgData.Logo) {
                printPreferencesData.StoreLogo = facilityImgData.Logo;
            }
        }
        return printPreferencesData;
    }
    public async GetPrintPreferences(category: any, prefKeys: any, facilityid: number, storeid: number): Promise<any> {
        let prefReq = {
            Id: 0,
            PageContext: { PageSize: 500, PageNumber: 1 },
            Params: [{ Key: StorePreferenceFilters.PreferenceKeys, Value: prefKeys },
            { Key: StorePreferenceFilters.Category, Value: category },
            { Key: StorePreferenceFilters.FacilityId, Value: facilityid },
            { Key: StorePreferenceFilters.StoreMasterId, Value: storeid }
            ]
        };
        var result = await this.GetStorePreferences(prefReq);
        let response: any = {};
        for (var idx in result.Data) {
            var item = result.Data[idx];
            response[item.PreferenceKey] = item.PreferenceValue;
        }
        return response;
    }

    public async GetStorePreferences(apiReq?: ApiRequest<StorePreferenceFilters>)
        : Promise<ApiResponse<StorePreferenceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StorePreferenceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StorePreferenceFilters.Category:
                        where['Category'] = param.Value;
                        break;
                    case StorePreferenceFilters.PreferenceKey:
                        where['PreferenceKey'] = param.Value;
                        break;
                    case StorePreferenceFilters.PreferenceKeys:
                        if (param.Value && param.Value.length > 0) {
                            where['PreferenceKey'] = { '$in': param.Value };
                        }
                        break;
                    case StorePreferenceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StorePreferenceFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async OPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        let result = true;
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId, req.Data.storeid);
        if (billingpreference.opbillcanceldays) {
            let cancelday = parseInt(billingpreference.opbillcanceldays);
            if (req.Data) {
                if (cancelday > 0 && req.Data.billdate) {
                    let currentdate = new Date();
                    let billdate = new Date(req.Data.billdate);
                    let currentdateformat = moment(currentdate).format('YYYYMMDDHHmmss');
                    billdate.setDate(billdate.getDate() + (cancelday - 1));
                    let billdateformat = moment(billdate).format('YYYYMMDD235959');
                    if (parseFloat(billdateformat) < parseFloat(currentdateformat)) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }

    public async IPCanCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        let result = true;
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId, req.Data.storeid);
        if (billingpreference.ipbillcanceldays) {
            let cancelday = parseInt(billingpreference.ipbillcanceldays);
            if (req.Data) {
                if (cancelday > 0 && req.Data.billdate) {
                    let currentdate = new Date();
                    let billdate = new Date(req.Data.billdate);
                    let currentdateformat = moment(currentdate).format('YYYYMMDDHHmmss');
                    billdate.setDate(billdate.getDate() + (cancelday - 1));
                    let billdateformat = moment(billdate).format('YYYYMMDD235959');
                    if (parseFloat(billdateformat) < parseFloat(currentdateformat)) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }


    public async ReceiptCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        let result = true;
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId, req.Data.storeid);
        if (billingpreference.receiptcanceldays) {
            let cancelday = parseInt(billingpreference.receiptcanceldays);
            if (req.Data) {
                if (cancelday > 0 && req.Data.receiptdate) {
                    let currentdate = new Date();
                    let receiptdate = new Date(req.Data.receiptdate);
                    let currentdateformat = moment(currentdate).format('YYYYMMDDHHmmss');
                    receiptdate.setDate(receiptdate.getDate() + (cancelday - 1));
                    let receiptdateformat = moment(receiptdate).format('YYYYMMDD235959');
                    if (parseFloat(receiptdateformat) < parseFloat(currentdateformat)) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }

    public async RefundCancelFromBillSettings(req: BaseRequest): Promise<boolean> {
        let result = true;
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId, req.Data.storeid);
        if (billingpreference.refundcanceldays) {
            let cancelday = parseInt(billingpreference.refundcanceldays);
            if (req.Data) {
                if (cancelday > 0 && req.Data.refunddate) {
                    let currentdate = new Date();
                    let refunddate = new Date(req.Data.refunddate);
                    let currentdateformat = moment(currentdate).format('YYYYMMDDHHmmss');
                    refunddate.setDate(refunddate.getDate() + (cancelday - 1));
                    let refunddateformat = moment(refunddate).format('YYYYMMDD235959');
                    if (parseFloat(refunddateformat) < parseFloat(currentdateformat)) {
                        result = false;
                    }
                }
            }
        }
        return result;
    }

    public async DeleteStorePreference(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<StorePreferenceInstance, StorePreferenceAttributes> {
        return this.Models.StorePreference;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<StorePreferenceFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'FacilityId', 'Category', ['PreferenceDisplay', 'Text'], 'PreferenceDisplay',
            'PreferenceKey', 'PreferenceValue'];
        let val = await this.GetStorePreferences(apiReq);
        return { [key]: val.Data };
    }

}
