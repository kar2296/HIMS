import { BaseService, BoFactory } from '../../Base/Index';
import { FitnessCertificateBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { FitnessCertificateAttributes } from '../Model/Interface/Index';
import { FitnessCertificateFilters } from '../Common/Filters.e';

export class FitnessCertificateService extends BaseService {
    private FitnessCertificateBo: FitnessCertificateBo;
    constructor(req?: Request) {
        super(req);
        this.FitnessCertificateBo = BoFactory.GetBo(FitnessCertificateBo, this.Request);
    }

    public async AddFitnessCertificate(req: BaseRequest): Promise<number> {
        return await this.FitnessCertificateBo.AddFitnessCertificate(req);
    }

    public async UpdateFitnessCertificate(req: BaseRequest): Promise<boolean> {
        return await this.FitnessCertificateBo.UpdateFitnessCertificate(req);
    }

    public async GetFitnessCertificateById(req: BaseRequest): Promise<FitnessCertificateAttributes> {
        return await this.FitnessCertificateBo.GetFitnessCertificateById(req);
    }

    public async GetFitnessCertificates(apiReq?: ApiRequest<FitnessCertificateFilters>):
        Promise<ApiResponse<FitnessCertificateAttributes[]>> {
        return await this.FitnessCertificateBo.GetFitnessCertificates(apiReq);
    }

    public async DeleteFitnessCertificate(req: BaseRequest): Promise<Boolean> {
        return await this.FitnessCertificateBo.DeleteFitnessCertificate(req);
    }
    public async PrintFitnessCertificate(req: BaseRequest): Promise<FileInfo> {
        return await this.FitnessCertificateBo.PrintFitnessCertificate(req);
    }
}
