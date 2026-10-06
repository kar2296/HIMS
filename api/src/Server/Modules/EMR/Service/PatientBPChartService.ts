import { BaseService, BoFactory } from '../../Base/Index';
import { PatientBPChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientBPChartAttributes } from '../Model/Interface/Index';
import { PatientBPChartFilters } from '../Common/Filters.e';

export class PatientBPChartService extends BaseService {
    private PatientBPChartBo: PatientBPChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientBPChartBo = BoFactory.GetBo(PatientBPChartBo, this.Request);
    }

    public async AddPatientBPChart(req: BaseRequest): Promise<number> {
        return await this.PatientBPChartBo.AddPatientBPChart(req);
    }

    public async UpdatePatientBPChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientBPChartBo.UpdatePatientBPChart(req);
    }

    public async GetPatientBPChartById(req: BaseRequest): Promise<PatientBPChartAttributes> {
        return await this.PatientBPChartBo.GetPatientBPChartById(req);
    }

    public async GetPatientBPCharts(apiReq?: ApiRequest<PatientBPChartFilters>):
        Promise<ApiResponse<PatientBPChartAttributes[]>> {
        return await this.PatientBPChartBo.GetPatientBPCharts(apiReq);
    }

    public async DeletePatientBPChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientBPChartBo.DeletePatientBPChart(req);
    }
    public async PrintPatientBPChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBPChartBo.PrintPatientBPChart(req);
    }
    public async PrintPatientBPChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientBPChartBo.PrintPatientBPChartWithoutHeader(req);
    }
}
