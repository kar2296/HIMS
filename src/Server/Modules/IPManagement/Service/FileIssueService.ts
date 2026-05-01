import { BaseService, BoFactory } from '../../Base/Index';
import { FileIssueBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { FileIssueAttributes } from '../Model/Interface/Index';
import { FileIssueFilters } from '../Common/Filters.e';

export class FileIssueService extends BaseService {
    private FileIssueBo: FileIssueBo;
    constructor(req?: Request) {
        super(req);
        this.FileIssueBo = BoFactory.GetBo(FileIssueBo, this.Request);
    }

    public async AddFileIssue(req: BaseRequest): Promise<number> {
        return await this.FileIssueBo.AddFileIssue(req);
    }

    public async UpdateFileIssue(req: BaseRequest): Promise<boolean> {
        return await this.FileIssueBo.UpdateFileIssue(req);
    }

    public async GetFileIssueById(req: BaseRequest): Promise<FileIssueAttributes> {
        return await this.FileIssueBo.GetFileIssueById(req);
    }

    public async GetFileIssues(apiReq?: ApiRequest<FileIssueFilters>): Promise<ApiResponse<FileIssueAttributes[]>> {
        return await this.FileIssueBo.GetFileIssues(apiReq);
    }

    public async DeleteFileIssue(req: BaseRequest): Promise<Boolean> {
        return await this.FileIssueBo.DeleteFileIssue(req);
    }
}
