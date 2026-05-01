import { BaseService, BoFactory } from '../../Base/Index';
import { AnalyzerTestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { AnalyzerTestAttributes } from '../Model/Interface/Index';
import { AnalyzerTestFilters } from '../Common/Filters.e';

export class AnalyzerTestService extends BaseService {
    private AnalyzerTestBo: AnalyzerTestBo;
    constructor(req?: Request) {
        super(req);
        this.AnalyzerTestBo = BoFactory.GetBo(AnalyzerTestBo, this.Request);
    }

    public async AddAnalyzerTest(req: BaseRequest): Promise<number> {
        return await this.AnalyzerTestBo.AddAnalyzerTest(req);
    }

    public async UpdateAnalyzerTest(req: BaseRequest): Promise<boolean> {
        return await this.AnalyzerTestBo.UpdateAnalyzerTest(req);
    }

    public async GetAnalyzerTestById(req: BaseRequest): Promise<AnalyzerTestAttributes> {
        return await this.AnalyzerTestBo.GetAnalyzerTestById(req);
    }

    public async GetAnalyzerTests(apiReq?: ApiRequest<AnalyzerTestFilters>): Promise<ApiResponse<AnalyzerTestAttributes[]>> {
        return await this.AnalyzerTestBo.GetAnalyzerTests(apiReq);
    }

    public async DeleteAnalyzerTest(req: BaseRequest): Promise<Boolean> {
        return await this.AnalyzerTestBo.DeleteAnalyzerTest(req);
    }
}
