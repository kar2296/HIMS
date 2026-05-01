import {BaseService, BoFactory } from '../../Base/Index';
import { PatientToothChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request ,FileInfo} from '../../../Core/Index';
import { PatientToothChartAttributes } from '../Model/Interface/Index';
import { PatientToothChartFilters } from '../Common/Filters.e';

export class PatientToothChartService extends BaseService {
    private PatientToothChartBo: PatientToothChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientToothChartBo = BoFactory.GetBo(PatientToothChartBo, this.Request);
    }

    public async AddPatientToothChart(req: BaseRequest): Promise<number> {
        return await this.PatientToothChartBo.AddPatientToothChart(req);
    }

    public async UpdatePatientToothChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientToothChartBo.UpdatePatientToothChart(req);
    }

    public async GetPatientToothChartById(req: BaseRequest): Promise<PatientToothChartAttributes> {
        return await this.PatientToothChartBo.GetPatientToothChartById(req);
    }

    public async GetPatientToothCharts(apiReq?: ApiRequest<PatientToothChartFilters>):
     Promise<ApiResponse<PatientToothChartAttributes[]>> {
        return await this.PatientToothChartBo.GetPatientToothCharts(apiReq);
    }

    public async DeletePatientToothChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientToothChartBo.DeletePatientToothChart(req);
    }
	  public async PrintPatientToothChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientToothChartBo.PrintPatientToothChart(req);
    }
}
