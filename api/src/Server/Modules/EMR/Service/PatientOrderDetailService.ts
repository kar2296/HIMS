import { BaseService, BoFactory } from '../../Base/Index';
import { PatientOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientOrderDetailAttributes } from '../Model/Interface/Index';
import { PatientOrderDetailFilters } from '../Common/Filters.e';

export class PatientOrderDetailService extends BaseService {
    private PatientOrderDetailBo: PatientOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PatientOrderDetailBo = BoFactory.GetBo(PatientOrderDetailBo, this.Request);
    }

    public async AddPatientOrderDetail(req: BaseRequest): Promise<number> {
        return await this.PatientOrderDetailBo.AddPatientOrderDetail(req);
    }

    public async UpdatePatientOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderDetailBo.UpdatePatientOrderDetail(req);
    }

    public async GetPatientOrderDetailById(req: BaseRequest): Promise<PatientOrderDetailAttributes> {
        return await this.PatientOrderDetailBo.GetPatientOrderDetailById(req);
    }
    public async GetTestStatisticsSummary(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        return await this.PatientOrderDetailBo.GetTestStatisticsSummary(apiReq);
    }
    public async UpdatePatientOrderDetailStatus(req: BaseRequest): Promise<boolean> {
        return await this.PatientOrderDetailBo.UpdatePatientOrderDetailStatus(req);
    }
    public async GetTestEncountertypeSummary(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        return await this.PatientOrderDetailBo.GetTestEncountertypeSummary(apiReq);
    }
    public async GetPatientOrderDetailswithoutorder(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        return await this.PatientOrderDetailBo.GetPatientOrderDetailswithoutorder(apiReq);
    }
    public async GetPatientOrderDetails(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        return await this.PatientOrderDetailBo.GetPatientOrderDetails(apiReq);
    }

    public async DeletePatientOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PatientOrderDetailBo.DeletePatientOrderDetail(req);
    }
    public async PrintLabDetailReport(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        return await this.PatientOrderDetailBo.PrintLabDetailReport(apiReq);
    }
    public async PrintRadiologyDetailReport(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        return await this.PatientOrderDetailBo.PrintRadiologyDetailReport(apiReq);
    }
    public async PrintLabSummaryByTest(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        return await this.PatientOrderDetailBo.PrintLabSummaryByTest(apiReq);
    }
    public async PrintLabStatisticsSummary(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        return await this.PatientOrderDetailBo.PrintLabStatisticsSummary(apiReq);
    }
}
