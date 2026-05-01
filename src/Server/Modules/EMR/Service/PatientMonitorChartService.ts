import {BaseService, BoFactory } from '../../Base/Index';
import { PatientMonitorChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo  } from '../../../Core/Index';
import { PatientMonitorChartAttributes } from '../Model/Interface/Index';
import { PatientMonitorChartFilters } from '../Common/Filters.e';

export class PatientMonitorChartService extends BaseService {
    private PatientMonitorChartBo: PatientMonitorChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientMonitorChartBo = BoFactory.GetBo(PatientMonitorChartBo, this.Request);
    }

    public async AddPatientMonitorChart(req: BaseRequest): Promise<number> {
        return await this.PatientMonitorChartBo.AddPatientMonitorChart(req);
    }

    public async UpdatePatientMonitorChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientMonitorChartBo.UpdatePatientMonitorChart(req);
    }

    public async GetPatientMonitorChartById(req: BaseRequest): Promise<PatientMonitorChartAttributes> {
        return await this.PatientMonitorChartBo.GetPatientMonitorChartById(req);
    }

    public async GetPatientMonitorCharts(apiReq?: ApiRequest<PatientMonitorChartFilters>):
     Promise<ApiResponse<PatientMonitorChartAttributes[]>> {
        return await this.PatientMonitorChartBo.GetPatientMonitorCharts(apiReq);
    }

    public async DeletePatientMonitorChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientMonitorChartBo.DeletePatientMonitorChart(req);
    }
    public async PrintPatientMonitorChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientMonitorChartBo.PrintPatientMonitorChart(req);
    }
    public async PrintPatientMonitorChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientMonitorChartBo.PrintPatientMonitorChartWithoutHeader(req);
    }
}
