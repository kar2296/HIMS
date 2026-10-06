import { BaseService, BoFactory } from '../../Base/Index';
import { PatientDiabetesChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientDiabetesChartAttributes } from '../Model/Interface/Index';
import { PatientDiabetesChartFilters } from '../Common/Filters.e';

export class PatientDiabetesChartService extends BaseService {
    private PatientDiabetesChartBo: PatientDiabetesChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDiabetesChartBo = BoFactory.GetBo(PatientDiabetesChartBo, this.Request);
    }

    public async AddPatientDiabetesChart(req: BaseRequest): Promise<number> {
        return await this.PatientDiabetesChartBo.AddPatientDiabetesChart(req);
    }

    public async UpdatePatientDiabetesChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientDiabetesChartBo.UpdatePatientDiabetesChart(req);
    }

    public async GetPatientDiabetesChartById(req: BaseRequest): Promise<PatientDiabetesChartAttributes> {
        return await this.PatientDiabetesChartBo.GetPatientDiabetesChartById(req);
    }

    public async GetPatientDiabetesCharts(apiReq?: ApiRequest<PatientDiabetesChartFilters>):
        Promise<ApiResponse<PatientDiabetesChartAttributes[]>> {
        return await this.PatientDiabetesChartBo.GetPatientDiabetesCharts(apiReq);
    }

    public async DeletePatientDiabetesChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDiabetesChartBo.DeletePatientDiabetesChart(req);
    }
    public async PrintPatientDiabetesChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDiabetesChartBo.PrintPatientDiabetesChart(req);
    }
    public async PrintPatientDiabetesChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDiabetesChartBo.PrintPatientDiabetesChartWithoutHeader(req);
    }
}
