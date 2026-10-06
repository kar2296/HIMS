import { BaseService, BoFactory } from '../../Base/Index';
import { OtNotesBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtNotesAttributes } from '../Model/Interface/Index';
import { OtNotesFilters } from '../Common/Filters.e';

export class OtNotesService extends BaseService {
    private OtNotesBo: OtNotesBo;
    constructor(req?: Request) {
        super(req);
        this.OtNotesBo = BoFactory.GetBo(OtNotesBo, this.Request);
    }

    public async AddOtNotes(req: BaseRequest): Promise<number> {
        return await this.OtNotesBo.AddOtNotes(req);
    }

    public async UpdateOtNotes(req: BaseRequest): Promise<boolean> {
        return await this.OtNotesBo.UpdateOtNotes(req);
    }

    public async GetOtNotesById(req: BaseRequest): Promise<OtNotesAttributes> {
        return await this.OtNotesBo.GetOtNotesById(req);
    }
    public async GetOtNotess(apiReq?: ApiRequest<OtNotesFilters>): Promise<ApiResponse<OtNotesAttributes[]>> {
        return await this.OtNotesBo.GetOtNotess(apiReq);
    }
    public async DeleteOtNotes(req: BaseRequest): Promise<Boolean> {
        return await this.OtNotesBo.DeleteOtNotes(req);
    }
}
