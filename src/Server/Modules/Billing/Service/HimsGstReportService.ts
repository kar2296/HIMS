import { BaseService, BoFactory } from '../../Base/Index';
import { GstReportBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { GstReportAttributes } from '../Model/Interface/Index';
import { GstReportFilters } from '../Common/Filters.e';

export class GstReportService extends BaseService {
    private GstReportBo: GstReportBo;
    constructor(req?: Request) {
        super(req);
        this.GstReportBo = BoFactory.GetBo(GstReportBo, this.Request);
    }
    public async AddGstReport(req: BaseRequest): Promise<number> {
        return await this.GstReportBo.AddGstReport(req);
    }
    public async UpdateGstReport(req: BaseRequest): Promise<boolean> {
        return await this.GstReportBo.UpdateGstReport(req);
    }
    public async GetGstReportById(req: BaseRequest): Promise<GstReportAttributes> {
        return await this.GstReportBo.GetGstReportById(req);
    }
    public async GetGstReports(apiReq?: ApiRequest<GstReportFilters>): Promise<ApiResponse<GstReportAttributes[]>> {
        return await this.GstReportBo.GetGstReports(apiReq);
    }
    public async DeleteGstReport(req: BaseRequest): Promise<Boolean> {
        return await this.GstReportBo.DeleteGstReport(req);
    }
    public async PrintConsolidateGSTSummaryforDeepam(apiReq?: ApiRequest<GstReportFilters>): Promise<any> {
        return await this.GstReportBo.PrintConsolidateGSTSummaryforDeepam(apiReq);
    }
}
