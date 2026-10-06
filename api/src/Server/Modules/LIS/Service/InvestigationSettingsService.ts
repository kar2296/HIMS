import {BaseService, BoFactory} from '../../Base/Index';
import { InvestigationSettingsBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { InvestigationSettingsAttributes} from '../Model/Interface/Index';

export class InvestigationSettingsService extends BaseService {
    private InvestigationSettingsBo: InvestigationSettingsBo;
    constructor(req?: Request) {
        super(req);
        this.InvestigationSettingsBo = BoFactory.GetBo(InvestigationSettingsBo, this.Request);
    }

    public async AddInvestigationSettings(req: BaseRequest): Promise<number> {
        return await this.InvestigationSettingsBo.AddInvestigationSettings(req);
    }

    public async UpdateInvestigationSettings(req: BaseRequest): Promise<boolean> {
        return await this.InvestigationSettingsBo.UpdateInvestigationSettings(req);
    }

    public async GetInvestigationSettingsById(req: BaseRequest): Promise<InvestigationSettingsAttributes> {
        return await this.InvestigationSettingsBo.GetInvestigationSettingsById(req);
    }

    public async GetInvestigationSettings(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<InvestigationSettingsAttributes>> {
        return await this.InvestigationSettingsBo.GetInvestigationSettings(apiReq);
    }

    public async DeleteInvestigationSettings(req: BaseRequest): Promise<Boolean> {
        return await this.InvestigationSettingsBo.DeleteInvestigationSettings(req);
    }
}
