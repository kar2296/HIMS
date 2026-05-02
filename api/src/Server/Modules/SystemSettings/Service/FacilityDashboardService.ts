import { BaseService, BoFactory } from '../../Base/Index';
import { FacilityDashboardBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

export class FacilityDashboardService extends BaseService {
    private FacilityDashboardBo: FacilityDashboardBo;
    constructor(req?: Request) {
        super(req);
        this.FacilityDashboardBo = BoFactory.GetBo(FacilityDashboardBo, this.Request);
    }

    public async GetFacilityDashboardOptions(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.GetFacilityDashboardOptions(req);
    }
    public async GetFacilityDashboardsReport(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.GetFacilityDashboardsReport(req);
    }
    public async GetFacilityVirtualDashboards(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.GetFacilityVirtualDashboards(req);
    }
    public async GetFacilityCovidBedDetails(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.GetFacilityCovidBedDetails(req);
    }
    public async SendFacilityDashboardMail(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.SendFacilityDashboardMail(req);
    }

    public async PrintFacilityDashboard(req: BaseRequest): Promise<any> {
        return await this.FacilityDashboardBo.PrintFacilityDashboard(req);
    }



}
