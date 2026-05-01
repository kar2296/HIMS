import { BaseService, BoFactory } from '../../Base/Index';
import { ERPIntegrationBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class ERPIntegrationService extends BaseService {
    private ERPIntegrationBo: ERPIntegrationBo;
    constructor(req?: Request) {
        super(req);
        this.ERPIntegrationBo = BoFactory.GetBo(ERPIntegrationBo, this.Request);
    }

    public async ERPIntegrationXML(req: BaseRequest): Promise<boolean> {
        return await this.ERPIntegrationBo.ERPIntegrationXML(req);
    }

    public async ERPIntegrationXL(req: BaseRequest): Promise<boolean> {
        return await this.ERPIntegrationBo.ERPIntegrationXL(req);
    }

    public async ERPValidation(req: BaseRequest): Promise<boolean> {
        return await this.ERPIntegrationBo.ERPValidation(req);
    }
}
