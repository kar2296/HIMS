import {BaseService, BoFactory } from '../../Base/Index';
import { PositionBpChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PositionBpChartAttributes } from '../Model/Interface/Index';
import { PositionBpChartFilters } from '../Common/Filters.e';

export class PositionBpChartService extends BaseService {
    private PositionBpChartBo: PositionBpChartBo;
    constructor(req?: Request) {
        super(req);
        this.PositionBpChartBo = BoFactory.GetBo(PositionBpChartBo, this.Request);
    }

    public async AddPositionBpChart(req: BaseRequest): Promise<number> {
        return await this.PositionBpChartBo.AddPositionBpChart(req);
    }

    public async UpdatePositionBpChart(req: BaseRequest): Promise<boolean> {
        return await this.PositionBpChartBo.UpdatePositionBpChart(req);
    }

    public async GetPositionBpChartById(req: BaseRequest): Promise<PositionBpChartAttributes> {
        return await this.PositionBpChartBo.GetPositionBpChartById(req);
    }

    public async GetPositionBpCharts(apiReq?: ApiRequest<PositionBpChartFilters>):
     Promise<ApiResponse<PositionBpChartAttributes[]>> {
        return await this.PositionBpChartBo.GetPositionBpCharts(apiReq);
    }

    public async DeletePositionBpChart(req: BaseRequest): Promise<Boolean> {
        return await this.PositionBpChartBo.DeletePositionBpChart(req);
    }
    public async PrintPositionBpChart(req: BaseRequest): Promise<FileInfo> {
        return await this.PositionBpChartBo.PrintPositionBpChart(req);
    }
    public async PrintPositionBpChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.PositionBpChartBo.PrintPositionBpChartWithoutHeader(req);
    }
}
