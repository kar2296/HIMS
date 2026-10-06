import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ItemWantedListInstance, ItemWantedListAttributes } from '../Model/Interface/Index';
import { ItemWantedListFilters } from '../Common/Filters.e';
import * as appMgrBO from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as bo from '../../Pharmacy/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class ItemWantedListBo extends BaseBo<ItemWantedListInstance, ItemWantedListAttributes> {
    public async AddItemWantedList(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateItemWantedList(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetItemWantedListById(req: BaseRequest): Promise<ItemWantedListAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetItemWantedLists(apiReq?: ApiRequest<ItemWantedListFilters>): Promise<ApiResponse<ItemWantedListAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ItemWantedListFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ItemWantedListFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case ItemWantedListFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case ItemWantedListFilters.RequestedDate:
                        where['RequestedDate'] = { '$between': param.Value };
                        break;
                    case ItemWantedListFilters.From:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$gte'] = param.Value;
                        break;
                    case ItemWantedListFilters.To:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case ItemWantedListFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteItemWantedList(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ItemWantedListInstance, ItemWantedListAttributes> {
        return this.Models.ItemWantedList;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ItemWantedListFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CategoryName', 'Text'], 'CategoryName', 'CategoryCode'];
        let val = await this.GetItemWantedLists(apiReq);
        return { [key]: val.Data };
    }
    public async PrintItemWantedReport(apiReq?: ApiRequest<ItemWantedListFilters>): Promise<any> {
        let data = await this.GetItemWantedLists(apiReq);
        let ItemWanted = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreMaster = apiReq.Data.StoreMaster;
        let ItemWantedData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(appMgrBO.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ItemWantedData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(ItemWantedData.FacilityId, ItemWantedData.StoreMasterId);
        // if (printStoreData && printStoreData.pharmacyprintheader)
        //     printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        // if (printStoreData && printStoreData.pharmacyprintfooter)
        //     printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        // if (printStoreData && printStoreData.StoreLogo)
        //     printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            ItemWanted: ItemWanted,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            StoreMaster: StoreMaster,
            FromDate: FromDate,
            ToDate: ToDate
        };
        let pdfOption: any = null;
        let key = 'itemwantedlist';
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
