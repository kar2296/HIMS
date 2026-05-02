import { BaseService, BoFactory } from '../../Base/Index';
import { AnalyzerAnalyteMapBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AnalyzerAnalyteMapAttributes } from '../Model/Interface/Index';
import { AnalyzerAnalyteMapFilters } from '../Common/Filters.e';

export class AnalyzerAnalyteMapService extends BaseService {
    private AnalyzerAnalyteMapBo: AnalyzerAnalyteMapBo;
    constructor(req?: Request) {
        super(req);
        this.AnalyzerAnalyteMapBo = BoFactory.GetBo(AnalyzerAnalyteMapBo, this.Request);
    }

    public async AddAnalyzerAnalyteMap(req: BaseRequest): Promise<number> {
        return await this.AnalyzerAnalyteMapBo.AddAnalyzerAnalyteMap(req);
    }

    public async UpdateAnalyzerAnalyteMap(req: BaseRequest): Promise<boolean> {
        return await this.AnalyzerAnalyteMapBo.UpdateAnalyzerAnalyteMap(req);
    }

    public async GetAnalyzerAnalyteMapById(req: BaseRequest): Promise<AnalyzerAnalyteMapAttributes> {
        return await this.AnalyzerAnalyteMapBo.GetAnalyzerAnalyteMapById(req);
    }

    public async GetAnalyzerAnalyteMaps(apiReq?: ApiRequest<AnalyzerAnalyteMapFilters>):
        Promise<ApiResponse<AnalyzerAnalyteMapAttributes[]>> {
        return await this.AnalyzerAnalyteMapBo.GetAnalyzerAnalyteMaps(apiReq);
    }

    public async DeleteAnalyzerAnalyteMap(req: BaseRequest): Promise<Boolean> {
        return await this.AnalyzerAnalyteMapBo.DeleteAnalyzerAnalyteMap(req);
    }
}
