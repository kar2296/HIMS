import {BaseService, BoFactory } from '../../Base/Index';
import { PatientABGChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request ,FileInfo} from '../../../Core/Index';
import { PatientABGChartAttributes } from '../Model/Interface/Index';
import { PatientABGChartFilters } from '../Common/Filters.e';

export class PatientABGChartService extends BaseService {
    private PatientABGChartBo: PatientABGChartBo;
    constructor(req?: Request) {
        super(req);
        this.PatientABGChartBo = BoFactory.GetBo(PatientABGChartBo, this.Request);
    }

    public async AddPatientABGChart(req: BaseRequest): Promise<number> {
        return await this.PatientABGChartBo.AddPatientABGChart(req);
    }

    public async UpdatePatientABGChart(req: BaseRequest): Promise<boolean> {
        return await this.PatientABGChartBo.UpdatePatientABGChart(req);
    }

    public async GetPatientABGChartById(req: BaseRequest): Promise<PatientABGChartAttributes> {
        return await this.PatientABGChartBo.GetPatientABGChartById(req);
    }

    public async GetPatientABGCharts(apiReq?: ApiRequest<PatientABGChartFilters>):
     Promise<ApiResponse<PatientABGChartAttributes[]>> {
        return await this.PatientABGChartBo.GetPatientABGCharts(apiReq);
    }

    public async DeletePatientABGChart(req: BaseRequest): Promise<Boolean> {
        return await this.PatientABGChartBo.DeletePatientABGChart(req);
    }
	  public async PrintPatientABGChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientABGChartBo.PrintPatientABGChart(req);
    }
    public async PrintPatientABGChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientABGChartBo.PrintPatientABGChartWithoutHeader(req);
    }
}
