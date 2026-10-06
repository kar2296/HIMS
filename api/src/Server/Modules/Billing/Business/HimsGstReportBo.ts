import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GstReportInstance, GstReportAttributes } from '../Model/Interface/Index';
import { GstReportFilters } from '../Common/Filters.e';
// import { BoFactory } from '../../Base/Business/Index';
// import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class GstReportBo extends BaseBo<GstReportInstance, GstReportAttributes> {
    public async AddGstReport(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGstReport(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetGstReportById(req: BaseRequest): Promise<GstReportAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGstReports(apiReq?: ApiRequest<GstReportFilters>): Promise<ApiResponse<GstReportAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GstReportFilters.RunDate:
                        where['RUNDATE'] = param.Value;
                        break;
                    case GstReportFilters.FROMDATE:
                        where['FROMDATE'] = where['FROMDATE'] || {};
                        (where['FROMDATE'] as any)['$eq'] = param.Value;
                        break;
                    case GstReportFilters.TODATE:
                        where['TODATE'] = where['TODATE'] || {};
                        (where['TODATE'] as any)['$eq'] = param.Value;
                        break;
                    case GstReportFilters.STORES:
                        where['STORES'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['GST_TYPE', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteGstReport(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GstReportInstance, GstReportAttributes> {
        return this.Models.GstReport;
    }
    public async PrintConsolidateGSTSummaryforDeepam(apiReq?: ApiRequest<GstReportFilters>): Promise<any> {
        let data = await this.GetGstReports(apiReq);
        let Consolidategst = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreMaster = apiReq.Data.StoreMaster;
        let totalSALE_TOTAL_AMOUNT = 0;
        let totalSALE_TAXABLE = 0;
        let totalSALE_NEW_GST = 0;
        let totalRETURN_TOTAL_AMOUNT = 0;
        let totalRETURN_TAXABLE = 0;
        let totalRETURN_NEW_GST = 0;
        let totalNetAmt = 0;
        let totalNetGst = 0;
        let totalFINAL_GST = 0;
        let TotSALE_TOTAL_AMOUNT = 0;
        let TotSALE_TAXABLE = 0;
        let TotSALE_NEW_GST = 0;
        let TotRETURN_TOTAL_AMOUNT = 0;
        let TotRETURN_TAXABLE = 0;
        let TotRETURN_NEW_GST = 0;
        let TotNetAmt = 0;
        let TotNetGst = 0;
        let TotFINAL_GST = 0;
        for (var gdx in Consolidategst) {
            var gstData = Consolidategst[gdx];
            totalSALE_TOTAL_AMOUNT = totalSALE_TOTAL_AMOUNT + gstData.SALE_TOTAL_AMOUNT;
            totalSALE_TAXABLE = totalSALE_TAXABLE + gstData.SALE_TAXABLE;
            totalSALE_NEW_GST = totalSALE_NEW_GST + gstData.SALE_NEW_GST;
            totalRETURN_TOTAL_AMOUNT = totalRETURN_TOTAL_AMOUNT + gstData.RETURN_TOTAL_AMOUNT;
            totalRETURN_TAXABLE = totalRETURN_TAXABLE + gstData.RETURN_TAXABLE;
            totalRETURN_NEW_GST = totalRETURN_NEW_GST + gstData.RETURN_NEW_GST;
            totalNetAmt = totalNetAmt + gstData.SALEmRETURN;
            totalNetGst = totalNetGst + gstData.SALEmRETURN_TAX;
            totalFINAL_GST = totalFINAL_GST + gstData.FINAL_GST;
        }

        TotSALE_TOTAL_AMOUNT = totalSALE_TOTAL_AMOUNT;
        TotSALE_TAXABLE = totalSALE_TAXABLE;
        TotSALE_NEW_GST = totalSALE_NEW_GST;
        TotRETURN_TOTAL_AMOUNT = totalRETURN_TOTAL_AMOUNT;
        TotRETURN_TAXABLE = totalRETURN_TAXABLE;
        TotRETURN_NEW_GST = totalRETURN_NEW_GST;
        TotNetAmt = totalNetAmt;
        TotNetGst = totalNetGst;
        TotFINAL_GST = totalFINAL_GST;

        // let ConsolidategstData = data.Data[0];
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Consolidategst.FacilityId);
        let info = {
            Consolidategst: Consolidategst,
            // Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreMaster: StoreMaster,
            TotSALE_TOTAL_AMOUNT: TotSALE_TOTAL_AMOUNT,
            TotSALE_TAXABLE: TotSALE_TAXABLE,
            TotSALE_NEW_GST: TotSALE_NEW_GST,
            TotRETURN_TOTAL_AMOUNT: TotRETURN_TOTAL_AMOUNT,
            TotRETURN_TAXABLE: TotRETURN_TAXABLE,
            TotRETURN_NEW_GST: TotRETURN_NEW_GST,
            TotNetAmt: TotNetAmt,
            TotNetGst: TotNetGst,
            TotFINAL_GST: TotFINAL_GST,

        };
        let pdfOption: any = null;
        let key = 'consolidategstreportfordeepam';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
