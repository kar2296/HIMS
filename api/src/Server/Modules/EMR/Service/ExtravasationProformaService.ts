import { BaseService, BoFactory } from '../../Base/Index';
import { ExtravasationProformaBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ExtravasationProformaAttributes } from '../Model/Interface/Index';
import { ExtravasationProformaFilters } from '../Common/Filters.e';

export class ExtravasationProformaService extends BaseService {
    private ExtravasationProformaBo: ExtravasationProformaBo;
    constructor(req?: Request) {
        super(req);
        this.ExtravasationProformaBo = BoFactory.GetBo(ExtravasationProformaBo, this.Request);
    }

    public async AddExtravasationProforma(req: BaseRequest): Promise<number> {
        return await this.ExtravasationProformaBo.AddExtravasationProforma(req);
    }

    public async UpdateExtravasationProforma(req: BaseRequest): Promise<boolean> {
        return await this.ExtravasationProformaBo.UpdateExtravasationProforma(req);
    }

    public async GetExtravasationProformaById(req: BaseRequest): Promise<ExtravasationProformaAttributes> {
        return await this.ExtravasationProformaBo.GetExtravasationProformaById(req);
    }

    public async UploadPhoto(req: BaseRequest): Promise<boolean> {
        return await this.ExtravasationProformaBo.UploadPhoto(req);
    }

    public async GetExtravasationProformas(apiReq?: ApiRequest<ExtravasationProformaFilters>):
    Promise<ApiResponse<ExtravasationProformaAttributes[]>> {
        return await this.ExtravasationProformaBo.GetExtravasationProformas(apiReq);
    }

    public async PrintExtravasationProforma(req: BaseRequest): Promise<FileInfo> {
        return await this.ExtravasationProformaBo.PrintExtravasationProforma(req);
    }
    public async GetPhotoAfterextravasation(apiReq?: ApiRequest<ExtravasationProformaFilters>):
    Promise<ApiResponse<ExtravasationProformaAttributes[]>> {
        return await this.ExtravasationProformaBo.GetPhotoAfterextravasation(apiReq);
    }
    public async GetPhotoAfterHealing(apiReq?: ApiRequest<ExtravasationProformaFilters>):
    Promise<ApiResponse<ExtravasationProformaAttributes[]>> {
        return await this.ExtravasationProformaBo.GetPhotoAfterHealing(apiReq);
    }
    public async DeleteExtravasationProforma(req: BaseRequest): Promise<Boolean> {
        return await this.ExtravasationProformaBo.DeleteExtravasationProforma(req);
    }
}
