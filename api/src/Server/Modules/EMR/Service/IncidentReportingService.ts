import { BaseService, BoFactory } from '../../Base/Index';
import { IncidentReportingBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { IncidentReportingAttributes } from '../Model/Interface/Index';
import { IncidentReportingFilters } from '../Common/Filters.e';

export class IncidentReportingService extends BaseService {
    private IncidentReportingBo: IncidentReportingBo;
    constructor(req?: Request) {
        super(req);
        this.IncidentReportingBo = BoFactory.GetBo(IncidentReportingBo, this.Request);
    }

    public async AddIncidentReporting(req: BaseRequest): Promise<number> {
        return await this.IncidentReportingBo.AddIncidentReporting(req);
    }

    public async UpdateIncidentReporting(req: BaseRequest): Promise<boolean> {
        return await this.IncidentReportingBo.UpdateIncidentReporting(req);
    }

    public async UploadAttachment(req: BaseRequest): Promise<boolean> {
        return await this.IncidentReportingBo.UploadAttachment(req);
    }

    public async GetViewAttachment1(apiReq?: ApiRequest<IncidentReportingFilters>): Promise<ApiResponse<IncidentReportingAttributes[]>> {
        return await this.IncidentReportingBo.GetViewAttachment1(apiReq);
    }

    public async GetViewAttachment2(apiReq?: ApiRequest<IncidentReportingFilters>): Promise<ApiResponse<IncidentReportingAttributes[]>> {
        return await this.IncidentReportingBo.GetViewAttachment2(apiReq);
    }

    public async GetIncidentReportingById(req: BaseRequest): Promise<IncidentReportingAttributes> {
        return await this.IncidentReportingBo.GetIncidentReportingById(req);
    }

    public async GetIncidentReportings(apiReq?: ApiRequest<IncidentReportingFilters>):
    Promise<ApiResponse<IncidentReportingAttributes[]>> {
        return await this.IncidentReportingBo.GetIncidentReportings(apiReq);
    }

    public async PrintIncidentReporting(req: BaseRequest): Promise<FileInfo> {
        return await this.IncidentReportingBo.PrintIncidentReporting(req);
    }

    public async DeleteIncidentReporting(req: BaseRequest): Promise<Boolean> {
        return await this.IncidentReportingBo.DeleteIncidentReporting(req);
    }
}
