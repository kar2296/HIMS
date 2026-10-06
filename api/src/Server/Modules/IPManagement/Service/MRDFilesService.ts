import { BaseService, BoFactory } from '../../Base/Index';
import { MRDFilesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { MRDFilesAttributes } from '../Model/Interface/Index';
import { MRDFilesFilters } from '../Common/Filters.e';

export class MRDFilesService extends BaseService {
    private MRDFilesBo: MRDFilesBo;
    constructor(req?: Request) {
        super(req);
        this.MRDFilesBo = BoFactory.GetBo(MRDFilesBo, this.Request);
    }

    public async AddMRDFiles(req: BaseRequest): Promise<number> {
        return await this.MRDFilesBo.AddMRDFiles(req);
    }

    public async UpdateMRDFiles(req: BaseRequest): Promise<boolean> {
        return await this.MRDFilesBo.UpdateMRDFiles(req);
    }

    public async GetMRDFilesById(req: BaseRequest): Promise<MRDFilesAttributes> {
        return await this.MRDFilesBo.GetMRDFilesById(req);
    }

    public async GetMRDFiless(apiReq?: ApiRequest<MRDFilesFilters>): Promise<ApiResponse<MRDFilesAttributes[]>> {
        return await this.MRDFilesBo.GetMRDFiless(apiReq);
    }

    public async DeleteMRDFiles(req: BaseRequest): Promise<Boolean> {
        return await this.MRDFilesBo.DeleteMRDFiles(req);
    }
    public async PrintMrdFileSubmittedReport(apiReq?: ApiRequest<MRDFilesFilters>): Promise<any> {
        return await this.MRDFilesBo.PrintMrdFileSubmittedReport(apiReq);
    }
}
