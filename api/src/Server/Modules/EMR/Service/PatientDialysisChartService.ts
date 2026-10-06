import {BaseService, BoFactory } from '../../Base/Index';
import { PatientDialysisChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PatientDialysisChartAttributes } from '../Model/Interface/Index';
import { PatientDialysisChartFilters } from '../Common/Filters.e';

export class PatientDialysisChartService extends BaseService {
    private PatientDialysisChartBo: PatientDialysisChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDialysisChartBo = BoFactory.GetBo(PatientDialysisChartBo, this.Request);
    }

    public async AddPatientDialysisChart(req: BaseRequest): Promise<number> {
        return await this.PatientDialysisChartBo.AddPatientDialysisChart(req);
    }

    public async UpdatePatientDialysisChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientDialysisChartBo.UpdatePatientDialysisChart(req);
    }

    public async GetPatientDialysisChartById(req: BaseRequest): Promise<PatientDialysisChartAttributes> {
        return await this.PatientDialysisChartBo.GetPatientDialysisChartById(req);
    }

    public async GetPatientDialysisCharts(apiReq?: ApiRequest<PatientDialysisChartFilters>):
     Promise<ApiResponse<PatientDialysisChartAttributes[]>> {
        return await this.PatientDialysisChartBo.GetPatientDialysisCharts(apiReq);
    }

    public async DeletePatientDialysisChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDialysisChartBo.DeletePatientDialysisChart(req);
    }
	 public async PrintPatientDialysisChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDialysisChartBo.PrintPatientDialysisChart(req);
    }
    public async PrintPatientDialysisChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDialysisChartBo.PrintPatientDialysisChartWithoutHeader(req);
    }
}
