import { BaseService, BoFactory } from '../../Base/Index';
import { MasterExportBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class MasterExportService extends BaseService {
    private MasterExportBo: MasterExportBo;
    constructor(req?: Request) {
        super(req);
        this.MasterExportBo = BoFactory.GetBo(MasterExportBo, this.Request);
    }

    public async MasterExportXL(req: BaseRequest): Promise<boolean> {
        return await this.MasterExportBo.MasterExportXL(req);
    }
}
