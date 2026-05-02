import {BaseService, BoFactory } from '../../Base/Index';
import { CdChartBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { CdChartAttributes } from '../Model/Interface/Index';
import { CdChartFilters } from '../Common/Filters.e';

export class CdChartService extends BaseService {
    private CdChartBo: CdChartBo;
    constructor(req?: Request) {
        super(req);
        this.CdChartBo = BoFactory.GetBo(CdChartBo, this.Request);
    }

    public async AddCdChart(req: BaseRequest): Promise<number> {
        return await this.CdChartBo.AddCdChart(req);
    }

    public async UpdateCdChart(req: BaseRequest): Promise<boolean> {
        return await this.CdChartBo.UpdateCdChart(req);
    }

    public async GetCdChartById(req: BaseRequest): Promise<CdChartAttributes> {
        return await this.CdChartBo.GetCdChartById(req);
    }

    public async GetCdCharts(apiReq?: ApiRequest<CdChartFilters>):
     Promise<ApiResponse<CdChartAttributes[]>> {
        return await this.CdChartBo.GetCdCharts(apiReq);
    }

    public async DeleteCdChart(req: BaseRequest): Promise<Boolean> {
        return await this.CdChartBo.DeleteCdChart(req);
    }
    public async PrintCdChart(req: BaseRequest): Promise<FileInfo> {
        return await this.CdChartBo.PrintCdChart(req);
    }
    public async PrintCdChartWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.CdChartBo.PrintCdChartWithoutHeader(req);
    }
}
