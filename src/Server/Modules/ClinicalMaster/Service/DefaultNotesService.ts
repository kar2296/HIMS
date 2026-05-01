import {BaseService, BoFactory} from '../../Base/Index';
import { DefaultNotesBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DefaultNotesAttributes} from '../Model/Interface/Index';
import { DefaultNotesFilters } from '../Common/Filters.e';

export class DefaultNotesService extends BaseService {
    private DefaultNotesBo: DefaultNotesBo;
    constructor(req?: Request) {
        super(req);
        this.DefaultNotesBo = BoFactory.GetBo(DefaultNotesBo, this.Request);
    }

    public async AddDefaultNotes(req: BaseRequest): Promise<number> {
        return await this.DefaultNotesBo.AddDefaultNotes(req);
    }

    public async UpdateDefaultNotes(req: BaseRequest): Promise<boolean> {
        return await this.DefaultNotesBo.UpdateDefaultNotes(req);
    }

    public async GetDefaultNotesById(req: BaseRequest): Promise<DefaultNotesAttributes> {
        return await this.DefaultNotesBo.GetDefaultNotesById(req);
    }

    public async GetDefaultNotess(apiReq?: ApiRequest<DefaultNotesFilters>): Promise<ApiResponse<DefaultNotesAttributes[]>> {
        return await this.DefaultNotesBo.GetDefaultNotess(apiReq);
    }

    public async DeleteDefaultNotes(req: BaseRequest): Promise<Boolean> {
        return await this.DefaultNotesBo.DeleteDefaultNotes(req);
    }
}
