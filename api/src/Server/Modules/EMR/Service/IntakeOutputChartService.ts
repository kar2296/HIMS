import { BaseService, BoFactory } from '../../Base/Index';
import { IntakeOutputChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { IntakeOutputChartAttributes } from '../Model/Interface/Index';
import { IntakeOutputChartFilters } from '../Common/Filters.e';

export class IntakeOutputChartService extends BaseService {
    private IntakeOutputChartBo: IntakeOutputChartBo;
    constructor(req?: Request) {
        super(req);
        this.IntakeOutputChartBo = BoFactory.GetBo(IntakeOutputChartBo, this.Request);
    }

    public async AddIntakeOutputChart(req: BaseRequest): Promise<number> {
        return await this.IntakeOutputChartBo.AddIntakeOutputChart(req);
    }

    public async UpdateIntakeOutputChart(req: BaseRequest): Promise<boolean> {
        return await this.IntakeOutputChartBo.UpdateIntakeOutputChart(req);
    }

    public async GetIntakeOutputChartById(req: BaseRequest): Promise<IntakeOutputChartAttributes> {
        return await this.IntakeOutputChartBo.GetIntakeOutputChartById(req);
    }

    public async GetIntakeOutputCharts(apiReq?: ApiRequest<IntakeOutputChartFilters>):
        Promise<ApiResponse<IntakeOutputChartAttributes[]>> {
        return await this.IntakeOutputChartBo.GetIntakeOutputCharts(apiReq);
    }

    public async DeleteIntakeOutputChart(req: BaseRequest): Promise<Boolean> {
        return await this.IntakeOutputChartBo.DeleteIntakeOutputChart(req);
    }
    public async PrintIntakeOutputChart(req: BaseRequest): Promise<FileInfo> {
        return await this.IntakeOutputChartBo.PrintIntakeOutputChart(req);
    }
    public async PrintIntakeOutputChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.IntakeOutputChartBo.PrintIntakeOutputChartWithoutHeader(req);
    }
}
