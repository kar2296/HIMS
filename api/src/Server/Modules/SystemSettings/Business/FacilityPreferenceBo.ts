import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { FacilityPreferenceInstance, FacilityPreferenceAttributes } from '../Model/Interface/Index';
import { FacilityPreferenceFilters } from '../Common/Filters.e';
import * as appMgBo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as moment from 'moment';

export class FacilityPreferenceBo extends BaseBo<FacilityPreferenceInstance, FacilityPreferenceAttributes>  {
    public async AddFacilityPreference(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFacilityPreference(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async CreateFacilityPreferences(req: BaseRequest, facilityId: number): Promise<boolean> {
        let facilityPreferenceMasterBo = BoFactory.GetBo(appMgBo.FacilityPreferenceMasterBo, this.Request);
        let prefMasters = await facilityPreferenceMasterBo.GetAllPreferences(req);

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

    public async ManageFacilityPreferences(req: BaseRequest): Promise<boolean> {
        let details: FacilityPreferenceAttributes[] = req.Data || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                await this.Update(detail);
            })(DetailItem);
        }));
        return true;
    }

    public async ManageNewFacilityPreference(req: BaseRequest): Promise<boolean> {
        let list: FacilityPreferenceAttributes[] = req.Data || [];
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

    public async GetFacilityPreferenceById(req: BaseRequest): Promise<FacilityPreferenceAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFacilityPreferenceWithLogo(FacilityId: number): Promise<any> {
        let printPreferencesData: any;

        printPreferencesData = await this.GetPrintPreferences('print', null, FacilityId);
        let facilityBO = BoFactory.GetBo(appMgBo.FacilityBo, this.Request);
        let facilityData = await facilityBO.GetFacilityById({ Id: FacilityId });
        printPreferencesData.Facilitylogo = '';
        if (facilityData && facilityData.LogoPath) {
            let imgReq = {
                Id: FacilityId,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Data: { 'LogoPath': facilityData.LogoPath }
            };
            let facilityImgData = await facilityBO.GetFacilityLogo(imgReq);
            if (facilityImgData && facilityImgData.Logo) {
                printPreferencesData.Facilitylogo = facilityImgData.Logo;
            }
        }
        printPreferencesData.NABHlogo = '';
        if (facilityData && facilityData.SecondLogoPath) {
            let imgReq = {
                Id: FacilityId,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Data: { 'SecondLogoPath': facilityData.SecondLogoPath }
            };
            let facilityNabhImgData = await facilityBO.GetSecondFacilityLogo(imgReq);
            if (facilityNabhImgData && facilityNabhImgData.Logo) {
                printPreferencesData.NABHlogo = facilityNabhImgData.Logo;
            }
        }

        return printPreferencesData;
    }

    public async GetFacilityIDCARDPreferenceWithLogo(FacilityId: number): Promise<any> {
        let printPreferencesData: any;
        printPreferencesData = await this.GetPrintPreferences('idcardprint', null, FacilityId);
        let facilityBO = BoFactory.GetBo(appMgBo.FacilityBo, this.Request);
        let facilityData = await facilityBO.GetFacilityById({ Id: FacilityId });
        printPreferencesData.Facilitylogo = '';
        if (facilityData && facilityData.LogoPath) {
            let imgReq = {
                Id: FacilityId,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Data: { 'LogoPath': facilityData.LogoPath }
            };
            let facilityImgData = await facilityBO.GetFacilityLogo(imgReq);
            if (facilityImgData && facilityImgData.Logo) {
                printPreferencesData.Facilitylogo = facilityImgData.Logo;
            }
        }
        return printPreferencesData;
    }

    public async GetPrintPreferences(category: any, prefKeys: any, facilityid: number): Promise<any> {
        let prefReq = {
            Id: 0,
            PageContext: { PageSize: 500, PageNumber: 1 },
            Params: [{ Key: FacilityPreferenceFilters.PreferenceKeys, Value: prefKeys },
            { Key: FacilityPreferenceFilters.Category, Value: category },
            { Key: FacilityPreferenceFilters.FacilityId, Value: facilityid }
            ]
        };
        var result = await this.GetFacilityPreferences(prefReq);
        let response: any = {};
        for (var idx in result.Data) {
            var item = result.Data[idx];
            response[item.PreferenceKey] = item.PreferenceValue;
        }
        return response;
    }

    public async GetFacilityPreferences(apiReq?: ApiRequest<FacilityPreferenceFilters>)
        : Promise<ApiResponse<FacilityPreferenceAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FacilityPreferenceFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FacilityPreferenceFilters.Category:
                        where['Category'] = param.Value;
                        break;
                    case FacilityPreferenceFilters.PreferenceKey:
                        where['PreferenceKey'] = param.Value;
                        break;
                    case FacilityPreferenceFilters.PreferenceKeys:
                        if (param.Value && param.Value.length > 0) {
                            where['PreferenceKey'] = { '$in': param.Value };
                        }
                        break;
                    case FacilityPreferenceFilters.FacilityId:
                        where['FacilityId'] = param.Value;
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
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId);
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
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId);
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
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId);
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
        let billingpreference = await this.GetPrintPreferences('billing', null, req.Data.facilityId);
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

    public async DeleteFacilityPreference(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<FacilityPreferenceInstance, FacilityPreferenceAttributes> {
        return this.Models.FacilityPreference;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<FacilityPreferenceFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'FacilityId', 'Category', ['PreferenceDisplay', 'Text'], 'PreferenceDisplay',
            'PreferenceKey', 'PreferenceValue'];
        let val = await this.GetFacilityPreferences(apiReq);
        return { [key]: val.Data };
    }

}
