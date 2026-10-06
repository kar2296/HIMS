import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockAdjustmentDetailInstance, StockAdjustmentDetailAttributes } from '../Model/Interface/Index';
import { StockAdjustmentDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as inventoryBo from './Index';

export class StockAdjustmentDetailBo extends BaseBo<StockAdjustmentDetailInstance, StockAdjustmentDetailAttributes>  {
    public async AddStockAdjustmentDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockAdjustmentDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    /*
    public async ManageStockAdjustmentDetails(StockAdjustmentId: number, details: StockAdjustmentDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StockAdjustmentId = StockAdjustmentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }
    */

    public async ManageStockAdjustmentDetails(StockAdjustmentId: number, request: any,
        details: StockAdjustmentDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StockAdjustmentId = StockAdjustmentId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    if (request.Header.AdjustmentStatusId === 2) {
                        let stockserialitem = {};
                        stockserialitem = {
                            Id: detail.StockSerialItemId,
                            StockItemId: detail.StockItemId,
                            ItemMasterId: detail.ItemMasterId,
                            Quantity: Number(detail.BatchQtyAfterAdj),
                            StoreMasterId: request.Header.StoreMasterId,
                            FacilityId: request.Header.FacilityId,
                            Rev: detail.Rev
                        };

                        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
                        await ssiBO.ManageAdjustedStockSerial(StockAdjustmentId, request, stockserialitem as any, detail);
                    }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    if (request.Header.AdjustmentStatusId === 2) {
                        let stockserialitem = {};
                        stockserialitem = {
                            Id: detail.StockSerialItemId,
                            StockItemId: detail.StockItemId,
                            ItemMasterId: detail.ItemMasterId,
                            Quantity: Number(detail.BatchQtyAfterAdj),
                            StoreMasterId: request.Header.StoreMasterId,
                            FacilityId: request.Header.FacilityId
                        };

                        let ssiBO = BoFactory.GetBo(bo.StockSerialItemBo, this.Request);
                        await ssiBO.ManageAdjustedStockSerial(StockAdjustmentId, request, stockserialitem as any, detail);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetStockAdjustmentDetailById(req: BaseRequest): Promise<StockAdjustmentDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockAdjustmentDetails(apiReq?: ApiRequest<StockAdjustmentDetailFilters>):
        Promise<ApiResponse<StockAdjustmentDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let adjustWhere: WhereOptions<any> = {};
        let isReqadjustSearch: boolean = true;
        include.push(this.GetReference('AdjustmentType'));
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', attributes: ['UomCode', 'UomName'], required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', attributes: ['UomCode', 'UomName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockAdjustmentDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.StockAdjustmentId:
                        where['StockAdjustmentId'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.AdjustedDate:
                        adjustWhere['AdjustedDate'] = { '$between': param.Value };
                        break;
                    case StockAdjustmentDetailFilters.From:
                        adjustWhere['AdjustedDate'] = adjustWhere['AdjustedDate'] || {};
                        (adjustWhere['AdjustedDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.To:
                        adjustWhere['AdjustedDate'] = adjustWhere['AdjustedDate'] || {};
                        (adjustWhere['AdjustedDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.FacilityId:
                        adjustWhere['FacilityId'] = param.Value;
                        isReqadjustSearch = true;
                        break;
                    case StockAdjustmentDetailFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockAdjustmentDetailFilters.AdjustmentTypeId:
                        adjustWhere['AdjustmentTypeId'] = param.Value;
                        isReqadjustSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StockAdjustment,
            required: isReqadjustSearch,
            where: adjustWhere,
            include: [
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AdjustedUser', required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockAdjustmentDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintStockAdjustmentReport(apiReq?: ApiRequest<StockAdjustmentDetailFilters>): Promise<any> {
        let data = await this.GetStockAdjustmentDetails(apiReq);
        let StockAdjustmentDetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let StockAdjustmentStatus = apiReq.Data.StockAdjustmentStatus;
        let StockAdjustmentDetailData = data.Data[0];
        // let TotalAmount: number = 0;
        // let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        // let TotalGSTAmount: number = 0;
        // let TotalOtherAmount: number = 0;
        // let TotalRoundoffAmount: number = 0;
        for (var idx in StockAdjustmentDetail) {
            var item = StockAdjustmentDetail[idx];
            // TotalAmount = TotalAmount + (item.TotalGrossAmount);
            // TotalDisAmount = TotalDisAmount + (item.TotalDiscountAmount);
            TotalNetAmount = TotalNetAmount + (item.NetAmount);
            // TotalGSTAmount = TotalGSTAmount + (item.TotalGstAmount);
            // TotalOtherAmount = TotalOtherAmount + (item.OtherCharges);
            // TotalRoundoffAmount = TotalRoundoffAmount + (item.RoundOff);

        }
        let StockAdjustmentBO = BoFactory.GetBo(inventoryBo.StockAdjustmentBo, this.Request);
        let StockAdjustmentData = await StockAdjustmentBO.GetStockAdjustmentById({ Id: StockAdjustmentDetailData.StockAdjustmentId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockAdjustmentData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockAdjustmentData.FacilityId, StockAdjustmentData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockAdjustmentDetail: StockAdjustmentDetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            StockAdjustmentStatus: StockAdjustmentStatus,
            // TotalAmount: TotalAmount,
            // TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            // TotalGSTAmount: TotalGSTAmount,
            // TotalOtherAmount: TotalOtherAmount,
            // TotalRoundoffAmount: TotalRoundoffAmount
        };
        let pdfOption: any = null;
        let key = 'stockadjustmentreport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<StockAdjustmentDetailInstance, StockAdjustmentDetailAttributes> {
        return this.Models.StockAdjustmentDetail;
    }

}
