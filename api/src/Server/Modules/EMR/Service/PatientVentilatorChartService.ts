import { BaseService, BoFactory } from '../../Base/Index';
import { PatientVentilatorChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientVentilatorChartAttributes } from '../Model/Interface/Index';
import { PatientVentilatorChartFilters } from '../Common/Filters.e';

export class PatientVentilatorChartService extends BaseService {
    private PatientVentilatorChartBo: PatientVentilatorChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientVentilatorChartBo = BoFactory.GetBo(PatientVentilatorChartBo, this.Request);
    }

    public async AddPatientVentilatorChart(req: BaseRequest): Promise<number> {
        return await this.PatientVentilatorChartBo.AddPatientVentilatorChart(req);
    }

    public async UpdatePatientVentilatorChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientVentilatorChartBo.UpdatePatientVentilatorChart(req);
    }

    public async GetPatientVentilatorChartById(req: BaseRequest): Promise<PatientVentilatorChartAttributes> {
        return await this.PatientVentilatorChartBo.GetPatientVentilatorChartById(req);
    }

    public async GetPatientVentilatorCharts(apiReq?: ApiRequest<PatientVentilatorChartFilters>):
        Promise<ApiResponse<PatientVentilatorChartAttributes[]>> {
        return await this.PatientVentilatorChartBo.GetPatientVentilatorCharts(apiReq);
    }

    public async DeletePatientVentilatorChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientVentilatorChartBo.DeletePatientVentilatorChart(req);
    }
    public async PrintPatientVentilatorChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientVentilatorChartBo.PrintPatientVentilatorChart(req);
    }
    public async PrintPatientVentilatorChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientVentilatorChartBo.PrintPatientVentilatorChartWithoutHeader(req);
    }
}
