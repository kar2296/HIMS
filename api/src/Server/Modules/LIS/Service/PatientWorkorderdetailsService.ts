import { BaseService, BoFactory } from '../../Base/Index';
import { PatientWorkorderdetailsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientWorkorderdetailsAttributes } from '../Model/Interface/Index';
import { PatientWorkorderdetailsFilters } from '../Common/Filters.e';

export class PatientWorkorderdetailsService extends BaseService {
    private PatientWorkorderdetailsBo: PatientWorkorderdetailsBo;
    constructor(req?: Request) {
        super(req);
        this.PatientWorkorderdetailsBo = BoFactory.GetBo(PatientWorkorderdetailsBo, this.Request);
    }

    public async AddPatientWorkorderdetails(req: BaseRequest): Promise<number> {
        return await this.PatientWorkorderdetailsBo.AddPatientWorkorderdetails(req);
    }

    public async UpdatePatientWorkorderdetails(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderdetailsBo.UpdatePatientWorkorderdetails(req);
    }

    public async UpdateIsLISRequest(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderdetailsBo.UpdateIsLISRequest(req);
    }

    public async GetPatientWorkorderdetailsById(req: BaseRequest): Promise<PatientWorkorderdetailsAttributes> {
        return await this.PatientWorkorderdetailsBo.GetPatientWorkorderdetailsById(req);
    }

    public async GetPatientWorkorderdetailss(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        return await this.PatientWorkorderdetailsBo.GetPatientWorkorderdetailss(apiReq);
    }

    public async GetMinPatientWorkorderdetailss(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        return await this.PatientWorkorderdetailsBo.GetMinPatientWorkorderdetailss(apiReq);
    }
    public async GetPatientWorkorderdetailssForCorrelation(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        return await this.PatientWorkorderdetailsBo.GetPatientWorkorderdetailssForCorrelation(apiReq);
    }
    public async DeletePatientWorkorderdetails(req: BaseRequest): Promise<Boolean> {
        return await this.PatientWorkorderdetailsBo.DeletePatientWorkorderdetails(req);
    }

    public async GetEncounterTypeBySample(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        return await this.PatientWorkorderdetailsBo.GetEncounterTypeBySample(apiReq);
    }

    public async GetAnalyzerAllBarcodeInfo(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<any> {
        return await this.PatientWorkorderdetailsBo.GetAnalyzerAllBarcodeInfo(apiReq);
    }
    public async GetAnalyzerTestdetails(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<any> {
        return await this.PatientWorkorderdetailsBo.GetAnalyzerTestdetails(apiReq);
    }
    public async PrintLabOrderStatisticsReport(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>): Promise<any> {
        return await this.PatientWorkorderdetailsBo.PrintLabOrderStatisticsReport(apiReq);
    }
    public async PrintRadiologyOrderStatisticsReport(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>): Promise<any> {
        return await this.PatientWorkorderdetailsBo.PrintRadiologyOrderStatisticsReport(apiReq);
    }
    public async PrintLabSummaryBySample(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>): Promise<any> {
        return await this.PatientWorkorderdetailsBo.PrintLabSummaryBySample(apiReq);
    }


}
