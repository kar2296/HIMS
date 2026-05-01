import { BaseService, BoFactory } from '../../Base/Index';
import { DailyNoteBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { DailyNoteAttributes } from '../Model/Interface/Index';
import { DailyNoteFilters } from '../Common/Filters.e';

export class DailyNoteService extends BaseService {
    private DailyNoteBo: DailyNoteBo;
    constructor(req?: Request) {
        super(req);
        this.DailyNoteBo = BoFactory.GetBo(DailyNoteBo, this.Request);
    }

    public async AddDailyNote(req: BaseRequest): Promise<number> {
        return await this.DailyNoteBo.AddDailyNote(req);
    }

    public async UpdateDailyNote(req: BaseRequest): Promise<boolean> {
        return await this.DailyNoteBo.UpdateDailyNote(req);
    }

    public async GetDailyNoteById(req: BaseRequest): Promise<DailyNoteAttributes> {
        return await this.DailyNoteBo.GetDailyNoteById(req);
    }

    public async GetDailyNotes(apiReq?: ApiRequest<DailyNoteFilters>): Promise<ApiResponse<DailyNoteAttributes[]>> {
        return await this.DailyNoteBo.GetDailyNotes(apiReq);
    }

    public async DeleteDailyNote(req: BaseRequest): Promise<Boolean> {
        return await this.DailyNoteBo.DeleteDailyNote(req);
    }

    public async PrintDailyNotes(req: BaseRequest): Promise<FileInfo> {
        return await this.DailyNoteBo.PrintDailyNotes(req);
    }
}
