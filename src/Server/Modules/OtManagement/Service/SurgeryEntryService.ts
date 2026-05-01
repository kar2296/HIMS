import { BaseService, BoFactory } from '../../Base/Index';
import { SurgeryEntryBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { SurgeryEntryAttributes } from '../Model/Interface/Index';
import { SurgeryEntryFilters } from '../Common/Filters.e';

export class SurgeryEntryService extends BaseService {
    private SurgeryEntryBo: SurgeryEntryBo;
    constructor(req?: Request) {
        super(req);
        this.SurgeryEntryBo = BoFactory.GetBo(SurgeryEntryBo, this.Request);
    }

    public async AddSurgeryEntry(req: BaseRequest): Promise<number> {
        return await this.SurgeryEntryBo.AddSurgeryEntry(req);
    }

    public async UpdateSurgeryEntry(req: BaseRequest): Promise<boolean> {
        return await this.SurgeryEntryBo.UpdateSurgeryEntry(req);
    }

    public async UpdateOTSurgeryEntry(req: BaseRequest): Promise<boolean> {
        return await this.SurgeryEntryBo.UpdateOTSurgeryEntry(req);
    }

    public async UpdateSurgeryEntryReview(req: BaseRequest): Promise<boolean> {
        return await this.SurgeryEntryBo.UpdateSurgeryEntryReview(req);
    }

    public async GetSurgeryEntryById(req: BaseRequest): Promise<SurgeryEntryAttributes> {
        return await this.SurgeryEntryBo.GetSurgeryEntryById(req);
    }

    public async GetSurgeryEntrys(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<ApiResponse<SurgeryEntryAttributes[]>> {
        return await this.SurgeryEntryBo.GetSurgeryEntrys(apiReq);
    }

    public async GetSurgerysummarybyProcedure(apiReq?: ApiRequest<SurgeryEntryFilters>):
        Promise<ApiResponse<SurgeryEntryAttributes[]>> {
        return await this.SurgeryEntryBo.GetSurgerysummarybyProcedure(apiReq);
    }
    public async GetSurgerysummarybyAnaesthetist(apiReq?: ApiRequest<SurgeryEntryFilters>):
        Promise<ApiResponse<SurgeryEntryAttributes[]>> {
        return await this.SurgeryEntryBo.GetSurgerysummarybyAnaesthetist(apiReq);
    }
    public async GetSurgerysummarybySurgeon(apiReq?: ApiRequest<SurgeryEntryFilters>):
        Promise<ApiResponse<SurgeryEntryAttributes[]>> {
        return await this.SurgeryEntryBo.GetSurgerysummarybySurgeon(apiReq);
    }
    public async PrintSurgeryEntry(req: BaseRequest): Promise<FileInfo> {
        return await this.SurgeryEntryBo.PrintSurgeryEntry(req);
    }
    // public async PrintSurgeryEntryReport(req: BaseRequest): Promise<FileInfo> {
    //     return await this.SurgeryEntryBo.PrintSurgeryEntryReport(req);
    // }

    public async PrintSurgeryEntryReport(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<any> {
        return await this.SurgeryEntryBo.PrintSurgeryEntryReport(apiReq);
    }

    public async PrintSurgerysummarybyProcedure(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<any> {
        return await this.SurgeryEntryBo.PrintSurgerysummarybyProcedure(apiReq);
    }
    public async PrintSurgerysummarybySurgeon(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<any> {
        return await this.SurgeryEntryBo.PrintSurgerysummarybySurgeon(apiReq);
    }
    public async PrintSurgerysummarybyAnaesthesist(apiReq?: ApiRequest<SurgeryEntryFilters>): Promise<any> {
        return await this.SurgeryEntryBo.PrintSurgerysummarybyAnaesthesist(apiReq);
    }
    public async DeleteSurgeryEntry(req: BaseRequest): Promise<Boolean> {
        return await this.SurgeryEntryBo.DeleteSurgeryEntry(req);
    }
}
