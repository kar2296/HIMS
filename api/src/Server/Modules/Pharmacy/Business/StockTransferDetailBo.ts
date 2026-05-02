import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockTransferDetailInstance, StockTransferDetailAttributes } from '../Model/Interface/Index';
import { StockTransferDetailFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as BillingBo from './Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';
import * as moment from 'moment';

export class StockTransferDetailBo extends BaseBo<StockTransferDetailInstance, StockTransferDetailAttributes> {
    public async AddStockTransferDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockTransferDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageStockTransferDetails(StockTransferId: number, details: StockTransferDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.StockTransferId = StockTransferId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    if (await this.IsAlreadyExist(detail) <= -1) throw { message: 'Stock Transfer Detail Already Exist' };
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                    await this.UpdateStockTransferDetailId(detail, detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageStockTransferItemDetails(StockTransferId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManageStockTransferItem(StockTransferId, request, detail);
            })(item);
        }));
    }

    public async ManageStockTransferItem(StockTransferId: number, request: any, detail: any): Promise<void> {
        let StockTransferDetailId = detail.Id;
        if (StockTransferDetailId > 0) {
            let StockTransferDetailedItem = await this.GetStockTransferDetailById({ Id: StockTransferDetailId });
            StockTransferDetailedItem.AcceptedQuantity = StockTransferDetailedItem.AcceptedQuantity + detail.AcceptedQuantity;
            StockTransferDetailedItem.TransitQuantity = 0;
            await this.Update(StockTransferDetailedItem);
        }
    }

    public async GetStockTransferDetailById(req: BaseRequest): Promise<StockTransferDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockTransferDetails(apiReq?: ApiRequest<StockTransferDetailFilters>):
        Promise<ApiResponse<StockTransferDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let StocktransferWhere: WhereOptions<any> = {};
        let isReqStockTransferSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.StockItem, required: false });
        include.push({ model: this.Models.StockSerialItem, required: false });
        include.push({ model: this.Models.ItemMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockTransferDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockTransferDetailFilters.StockTransferId:
                        where['StockTransferId'] = param.Value;
                        break;
                    case StockTransferDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockTransferDetailFilters.BatchId:
                        where['BatchId'] = param.Value;
                        break;
                    case StockTransferDetailFilters.RequestedQuantity:
                        where['RequestedQuantity'] = param.Value;
                        break;
                    case StockTransferDetailFilters.TransferedQuantity:
                        where['TransferedQuantity'] = param.Value;
                        break;
                    case StockTransferDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case StockTransferDetailFilters.FromDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case StockTransferDetailFilters.ToDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case StockTransferDetailFilters.StoreMasterId:
                        StocktransferWhere['StoreMasterId'] = param.Value;
                        isReqStockTransferSearch = true;
                        break;
                    case StockTransferDetailFilters.TransitQuantity:
                        where['TransitQuantity'] = { '$gt': '0' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StockTransfer,
            required: isReqStockTransferSearch,
            where: StocktransferWhere,
            include: [
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TranferedUser', required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async IsAlreadyExist(req: any): Promise<number> {
        let stocktransferDate = new Date();
        let FromDate = stocktransferDate.setSeconds(stocktransferDate.getSeconds() - 30);
        let ToDate = stocktransferDate.setSeconds(stocktransferDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockTransferDetailFilters.ItemMasterId, Value: req.ItemMasterId },
            { Key: StockTransferDetailFilters.StoreMasterId, Value: req.StoreMasterId },
            { Key: StockTransferDetailFilters.FromDate, Value: frmDate },
            { Key: StockTransferDetailFilters.ToDate, Value: todate },
            { Key: StockTransferDetailFilters.StockTransferId, Value: req.StockTransferId },
                // { Key: GrnDetailFilters.TotalGrossAmount, Value: req.Data.Header.TotalGrossAmount }
            ]
        };
        let data = await this.GetStockTransferDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public async DeleteStockTransferDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintStockIssueVocherReport(apiReq?: ApiRequest<StockTransferDetailFilters>): Promise<any> {
        let data = await this.GetStockTransferDetails(apiReq);
        let StockTransferDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let StockTransferDetailsData = data.Data[0];
        let TotalNetAmt: number = 0;
        let StoreMasterId = apiReq.Data.StoreMasterId;
        for (var idx in StockTransferDetails) {
            var item = StockTransferDetails[idx];
            TotalNetAmt += item.NetAmount;
        }
        let StockBO = BoFactory.GetBo(BillingBo.StockTransferBo, this.Request);
        let StockData = await StockBO.GetStockTransferById({ Id: StockTransferDetailsData.StockTransferId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockData.FacilityId);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockData.FacilityId, StoreMasterId);
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockTransferDetailsData.FacilityId);
        let info = {
            StockTransferDetails: StockTransferDetails,
            Preferences: printPreferencesData,
            StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            ItemName: ItemName,
            TotalNetAmt: TotalNetAmt
        };
        let pdfOption: any = null;
        let key = 'stockissuevocherreport';
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
    public async PrintStockTransistReport(apiReq?: ApiRequest<StockTransferDetailFilters>): Promise<any> {
        let data = await this.GetStockTransferDetails(apiReq);
        let StockTransferDetails = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let ItemName = apiReq.Data.ItemName;
        let StockTransferDetailsData = data.Data[0];
        let TotalNetAmt: number = 0;
        for (var idx in StockTransferDetails) {
            var item = StockTransferDetails[idx];
            TotalNetAmt += item.NetAmount;
        }
        let StockBO = BoFactory.GetBo(BillingBo.StockTransferBo, this.Request);
        let StockData = await StockBO.GetStockTransferById({ Id: StockTransferDetailsData.StockTransferId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockData.FacilityId);
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockTransferDetailsData.FacilityId);
        let info = {
            StockTransferDetails: StockTransferDetails,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            ItemName: ItemName,
            TotalNetAmt: TotalNetAmt
        };
        let pdfOption: any = null;
        let key = 'stocktransistreport';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<StockTransferDetailInstance, StockTransferDetailAttributes> {
        return this.Models.StockTransferDetail;
    }

    private async UpdateStockTransferDetailId(req: any, detailId: number) {
        let stockreqBO = BoFactory.GetBo(invbo.StockRequestDetailBo, this.Request);
        // let stockreq = await stockreqBO.GetStockRequestById({ Id: req.Data.Header.StockRequestId });
        let transferDetailId: any = { StockTransferDetailId: detailId };
        await stockreqBO.Update(transferDetailId, {
            fields: ['StockTransferDetailId'],
            where: { StockRequestDetailId: req.StockRequestDetailId }
        });
    }

}
