import {BaseService, BoFactory} from '../../Base/Index';
import { EventDashboardBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { EventDashboardAttributes} from '../Model/Interface/Index';
import { EventDashboardFilters } from '../Common/Filters.e';

export class EventDashboardService extends BaseService {
    private EventDashboardBo: EventDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.EventDashboardBo = BoFactory.GetBo(EventDashboardBo, this.Request);
    }

    public async AddEventDashboard(req: BaseRequest): Promise<number> {
        return await this.EventDashboardBo.AddEventDashboard(req);
    }

    public async UpdateEventDashboard(req: BaseRequest): Promise<boolean> {
        return await this.EventDashboardBo.UpdateEventDashboard(req);
    }

    public async GetEventDashboardById(req: BaseRequest): Promise<EventDashboardAttributes> {
        return await this.EventDashboardBo.GetEventDashboardById(req);
    }

    public async GetEventDashboards(apiReq?: ApiRequest<EventDashboardFilters>): Promise<ApiResponse<EventDashboardAttributes[]>> {
        return await this.EventDashboardBo.GetEventDashboards(apiReq);
    }

    public async DeleteEventDashboard(req: BaseRequest): Promise<Boolean> {
        return await this.EventDashboardBo.DeleteEventDashboard(req);
    }
}
