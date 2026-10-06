import { BaseService, BoFactory } from '../../Base/Index';
import { FileRequestBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FileRequestAttributes } from '../Model/Interface/Index';
import { FileRequestFilters } from '../Common/Filters.e';

export class FileRequestService extends BaseService {
    private FileRequestBo: FileRequestBo;
    constructor(req?: Request) {
        super(req);
        this.FileRequestBo = BoFactory.GetBo(FileRequestBo, this.Request);
    }

    public async AddFileRequest(req: BaseRequest): Promise<number> {
        return await this.FileRequestBo.AddFileRequest(req);
    }

    public async UpdateFileRequest(req: BaseRequest): Promise<boolean> {
        return await this.FileRequestBo.UpdateFileRequest(req);
    }

    public async ManageFileRequestFromApptReq(req: BaseRequest): Promise<boolean> {
        return await this.FileRequestBo.ManageFileRequestFromApptReq(req);
    }

    public async GetFileRequestById(req: BaseRequest): Promise<FileRequestAttributes> {
        return await this.FileRequestBo.GetFileRequestById(req);
    }

    public async GetFileRequests(apiReq?: ApiRequest<FileRequestFilters>): Promise<ApiResponse<FileRequestAttributes[]>> {
        return await this.FileRequestBo.GetFileRequests(apiReq);
    }

    public async DeleteFileRequest(req: BaseRequest): Promise<Boolean> {
        return await this.FileRequestBo.DeleteFileRequest(req);
    }
}
