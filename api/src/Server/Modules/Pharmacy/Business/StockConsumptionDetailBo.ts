import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockConsumptionDetailInstance, StockConsumptionDetailAttributes } from '../Model/Interface/Index';
import { StockConsumptionDetailFilters } from '../Common/Filters.e';
import * as moment from 'moment';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as inventoryBo from './Index';

export class StockConsumptionDetailBo extends BaseBo<StockConsumptionDetailInstance, StockConsumptionDetailAttributes> {
    public async AddStockConsumptionDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateStockConsumptionDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageStockConsumptionDetails(StockConsumptionId: number, details: StockConsumptionDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((detailItem): Promise<void> => {
            return (async (detail): Promise<any> => {
                detail.Id = detail.Id || 0;
                detail.StockConsumptionId = StockConsumptionId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    if (await this.IsAlreadyExist(detail) <= -1) return -1;
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(detailItem);
        }));
        return true;
    }


    public async GetStockConsumptionDetailById(req: BaseRequest): Promise<StockConsumptionDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetStockConsumptionDetails(apiReq?: ApiRequest<StockConsumptionDetailFilters>):
        Promise<ApiResponse<StockConsumptionDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let ConsumptionWhere: WhereOptions<any> = {};
        let isReqConsumptionSearch: boolean = false;
        // include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        // include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ConsumedStore', required: false });
        // include.push({
        //     model: this.Models.StockConsumption, as: 'StockConsumption',
        //     include: [
        //         this.GetReference('ConsumptionType'),
        //     ],
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockConsumptionDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.StockConsumptionId:
                        where['StockConsumptionId'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.BatchId:
                        where['BatchId'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value };
                        break;
                    case StockConsumptionDetailFilters.CreatedFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.CreatedTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.FacilityId:
                        ConsumptionWhere['FacilityId'] = param.Value;
                        break;
                    case StockConsumptionDetailFilters.ConsumptionDate:
                        ConsumptionWhere['ConsumptionDate'] = { '$between': param.Value };
                        break;
                    case StockConsumptionDetailFilters.From:
                        ConsumptionWhere['ConsumptionDate'] = ConsumptionWhere['ConsumptionDate'] || {};
                        (ConsumptionWhere['ConsumptionDate'] as any)['$gte'] = param.Value;
                        isReqConsumptionSearch = true;
                        break;
                    case StockConsumptionDetailFilters.To:
                        ConsumptionWhere['ConsumptionDate'] = ConsumptionWhere['ConsumptionDate'] || {};
                        (ConsumptionWhere['ConsumptionDate'] as any)['$lte'] = param.Value;
                        isReqConsumptionSearch = true;
                        break;
                    case StockConsumptionDetailFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.StockConsumption, as: 'StockConsumption',
            required: isReqConsumptionSearch,
            where: ConsumptionWhere,
            include: [
                this.GetReference('ConsumptionType'),
            ],
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockConsumptionDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async IsAlreadyExist(req: any): Promise<number> {
        let billDate = new Date();
        // let FromDate = billDate.setMinutes(billDate.getMinutes() - 2);
        // let ToDate = billDate.setMinutes(billDate.getMinutes() + 2);
        let FromDate = billDate.setSeconds(billDate.getSeconds() - 15);
        let ToDate = billDate.setSeconds(billDate.getSeconds() + 15);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StockConsumptionDetailFilters.StockConsumptionId, Value: req.StockConsumptionId },
            { Key: StockConsumptionDetailFilters.BatchId, Value: req.BatchId },
            { Key: StockConsumptionDetailFilters.ItemMasterId, Value: req.ItemMasterId },
            // { Key: PatientBillDetailsFilters.BatchId, Value: req.BatchId },
            { Key: StockConsumptionDetailFilters.From, Value: frmDate },
            { Key: StockConsumptionDetailFilters.To, Value: todate }]
        };
        let data = await this.GetStockConsumptionDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }
    public async PrintStockConsumptionReport(apiReq?: ApiRequest<StockConsumptionDetailFilters>): Promise<any> {
        let data = await this.GetStockConsumptionDetails(apiReq);
        let StockConsumptionDetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let StockConsumptionDetailData = data.Data[0];
        // let TotalAmount: number = 0;
        // let TotalDisAmount: number = 0;
        let TotalNetAmount: number = 0;
        // let TotalGSTAmount: number = 0;
        // let TotalOtherAmount: number = 0;
        // let TotalRoundoffAmount: number = 0;
        for (var idx in StockConsumptionDetail) {
            var item = StockConsumptionDetail[idx];
            // TotalAmount = TotalAmount + (item.TotalGrossAmount);
            // TotalDisAmount = TotalDisAmount + (item.TotalDiscountAmount);
            TotalNetAmount = TotalNetAmount + (item.NetAmount);
            // TotalGSTAmount = TotalGSTAmount + (item.TotalGstAmount);
            // TotalOtherAmount = TotalOtherAmount + (item.OtherCharges);
            // TotalRoundoffAmount = TotalRoundoffAmount + (item.RoundOff);

        }
        let StockConsumptionBO = BoFactory.GetBo(inventoryBo.StockConsumptionBo, this.Request);
        let StockConsumptionData = await StockConsumptionBO.GetStockConsumptionById({ Id: StockConsumptionDetailData.StockConsumptionId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockConsumptionData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockConsumptionData.FacilityId, StockConsumptionData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.printheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockConsumptionDetail: StockConsumptionDetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            // TotalAmount: TotalAmount,
            // TotalDisAmount: TotalDisAmount,
            TotalNetAmount: TotalNetAmount,
            // TotalGSTAmount: TotalGSTAmount,
            // TotalOtherAmount: TotalOtherAmount,
            // TotalRoundoffAmount: TotalRoundoffAmount
        };
        let pdfOption: any = null;
        let key = 'stockconsumptionreport';
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
    public GetModel(): SStatic.Model<StockConsumptionDetailInstance, StockConsumptionDetailAttributes> {
        return this.Models.StockConsumptionDetail;
    }

}
