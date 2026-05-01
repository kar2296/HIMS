import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseOrderDetailInstance, PurchaseOrderDetailAttributes } from '../Model/Interface/Index';
import { PurchaseOrderDetailFilters } from '../Common/Filters.e';
import * as _ from 'lodash';
import { BoFactory } from '../../Base/Business/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';

export class PurchaseOrderDetailBo extends BaseBo<PurchaseOrderDetailInstance, PurchaseOrderDetailAttributes>  {
    public async AddPurchaseOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePurchaseOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    /*
    public async ManagePurchaseOrderDetails(PurchaseOrderId: number, details: PurchaseOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PurchaseOrderId = PurchaseOrderId;
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
    */

    public async ManagePurchaseOrderDetails(PurchaseOrderId: number, details: PurchaseOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PurchaseOrderId = PurchaseOrderId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                    /*
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    if (request.Header.GrnStatusId === 2) {
                        let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                        await stockitemBO.ManageGrnStockItem(GrnId, request, detail);
                    }
                    */
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManagePurchaseOrderItemDetails(GrnId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        /*
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePurchaseOrderItem(GrnId, request, detail);
            })(item);
        }));
        */

        let itemDetails: any = _.groupBy(details, (item: any) => { return item.PurchaseOrderDetailId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManagePurchaseOrderItem(GrnId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManagePurchaseOrderItem(GrnId: number, request: any, details: Array<any>): Promise<void> {
        let PurchaseOrderDetailId = details[0].PurchaseOrderDetailId;
        var GrnQty = _.sumBy(details, (detail: any) => Number(detail.GrnQuantity));
        // var FreeQuantity = _.sumBy(details, (detail: any) => Number(detail.FreeQty));
        if (PurchaseOrderDetailId > 0) {
            let PurchaseOrderDetailedItem = await this.GetPurchaseOrderDetailById({ Id: PurchaseOrderDetailId });
            PurchaseOrderDetailedItem.ReceivedQuantity = PurchaseOrderDetailedItem.ReceivedQuantity + GrnQty;
            if (PurchaseOrderDetailedItem.FreeQty) {
                // PurchaseOrderDetailedItem.FreeQty = PurchaseOrderDetailedItem.FreeQty + FreeQuantity;
                PurchaseOrderDetailedItem.FreeQty = PurchaseOrderDetailedItem.FreeQty;
            }
            await this.Update(PurchaseOrderDetailedItem);
        }
    }

    /*
    public async ManagePurchaseOrderItem(GrnId: number, request: any, detail: any): Promise<void> {
        let PurchaseOrderDetailId = detail.PurchaseOrderDetailId;
        if (PurchaseOrderDetailId > 0) {
            let PurchaseOrderDetailedItem = await this.GetPurchaseOrderDetailById({ Id: PurchaseOrderDetailId });
            PurchaseOrderDetailedItem.ReceivedQuantity = PurchaseOrderDetailedItem.ReceivedQuantity + detail.GrnQuantity;
            PurchaseOrderDetailedItem.FreeQty = PurchaseOrderDetailedItem.FreeQty + detail.FreeQty;
            await this.Update(PurchaseOrderDetailedItem);
        }
    }
    */

    public async GetPurchaseOrderDetailById(req: BaseRequest): Promise<PurchaseOrderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPurchaseOrderDetails(apiReq?: ApiRequest<PurchaseOrderDetailFilters>):
        Promise<ApiResponse<PurchaseOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let PoWhere: WhereOptions<any> = {};
        let IsPoRequired: boolean = false;
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'InGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'CGstMaster', required: false });
        include.push({ model: this.Models.GstMaster, as: 'SGstMaster', required: false });
        include.push({ model: this.Models.ItemVendorMap, as: 'VendorItem', required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.StoreMaster, as: 'RequestedStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'DeliveryStore', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseOrderDetailFilters.Id:
                        where['PurchaseOrderDetailId'] = param.Value;
                        break;
                    case PurchaseOrderDetailFilters.PurchaseOrderId:
                        where['PurchaseOrderId'] = param.Value;
                        break;
                    case PurchaseOrderDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PurchaseOrderDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case PurchaseOrderDetailFilters.StoreMasterId:
                        storemasterId = param.Value;
                        break;
                    case PurchaseOrderDetailFilters.PoDate:
                        PoWhere['PoDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseOrderDetailFilters.From:
                        PoWhere['PoDate'] = PoWhere['PoDate'] || {};
                        (PoWhere['PoDate'] as any)['$gte'] = param.Value;
                        IsPoRequired = true;
                        break;
                    case PurchaseOrderDetailFilters.To:
                        PoWhere['PoDate'] = PoWhere['PoDate'] || {};
                        (PoWhere['PoDate'] as any)['$lte'] = param.Value;
                        IsPoRequired = true;
                        break;
                    case PurchaseOrderDetailFilters.PoStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            PoWhere['PoStatusId'] = { '$in': paramArr };
                        }
                        IsPoRequired = true;
                        break;
                    case PurchaseOrderDetailFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PurchaseOrder, as: 'PurchaseOrder',
            where: PoWhere, required: IsPoRequired,
            include: [this.GetReference('PoStatus'),
            {
                model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
                include: [this.GetReference('Title')]
            },
            { model: this.Models.StoreMaster, as: 'FromStore', required: false }

            ]
        });
        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                { model: this.Models.ItemFacilityMap, required: false },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                    where: { 'StoreMasterId': storemasterId }
                }
            ]
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async PrintPendingPOReport(apiReq?: ApiRequest<PurchaseOrderDetailFilters>): Promise<any> {
        let data = await this.GetPurchaseOrderDetails(apiReq);
        let PurchaseOrderdetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let PurchaseOrderdetailData = data.Data[0];
        let TotalNetAmt: number = 0;
        for (var idx in PurchaseOrderdetail) {
            var item = PurchaseOrderdetail[idx];
            TotalNetAmt += item.NetAmount;
        }
        let invBO = BoFactory.GetBo(invbo.PurchaseOrderBo, this.Request);
        let PoData = await invBO.GetPurchaseOrderById({ Id: PurchaseOrderdetailData.PurchaseOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PoData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PoData.FacilityId, PoData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let info = {
            PurchaseOrderdetail: PurchaseOrderdetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            TotalNetAmt: TotalNetAmt
        };
        let pdfOption: any = null;
        let key = 'pendingporeport';
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
    public async PrintPurchaseOrderDetailReport(apiReq?: ApiRequest<PurchaseOrderDetailFilters>): Promise<any> {
        let data = await this.GetPurchaseOrderDetails(apiReq);
        let PurchaseOrder = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let FacilityId = apiReq.Data.FacilityId;
        let PoStatus = apiReq.Data.PoStatus;
        let PurchaseOrderData = data.Data[0];
        let TotalGrossAmt: number = 0;
        let TotalDisAmt: number = 0;
        let TotalGstAmt: number = 0;
        let TotalMrPrice: number = 0;
        let TotalPurchasePrice: number = 0;
        let TotalNetAmt: number = 0;
        for (var idx in PurchaseOrder) {
            var item = PurchaseOrder[idx];
            TotalGrossAmt += item.GrossAmount;
            TotalDisAmt += item.DiscountAmount;
            TotalGstAmt += item.GstAmount;
            TotalMrPrice += item.MrPrice;
            TotalPurchasePrice += item.PurchasePrice;
            TotalNetAmt += item.NetAmount;

        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, PurchaseOrderData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let info = {
            PurchaseOrder: PurchaseOrder,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            TotalNetAmt: TotalNetAmt,
            PoStatus: PoStatus,
            TotalGrossAmt: TotalGrossAmt,
            TotalDisAmt: TotalDisAmt,
            TotalGstAmt: TotalGstAmt,
            TotalMrPrice: TotalMrPrice,
            TotalPurchasePrice: TotalPurchasePrice,
        };
        let pdfOption: any = null;
        let key = 'purchaseorderdetailreport';
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
    public async DeletePurchaseOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PurchaseOrderDetailInstance, PurchaseOrderDetailAttributes> {
        return this.Models.PurchaseOrderDetail;
    }

}
