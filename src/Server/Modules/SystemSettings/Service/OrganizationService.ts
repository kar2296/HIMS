import {BaseService, BoFactory} from '../../Base/Index';
import { OrganizationBo} from '../Business/Index';
import {ApiRequest, ApiResponse, BaseRequest } from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { OrganizationAttributes} from '../Model/Interface/Index';
import { OrganizationFilters } from '../Common/Filters.e';

export class OrganizationService extends BaseService {
    private OrganizationBo: OrganizationBo;
    constructor(req?: Request) {
        super(req);
        this.OrganizationBo = BoFactory.GetBo(OrganizationBo, this.Request);
    }

    public async AddOrganization(req: BaseRequest): Promise<number> {
        return await this.OrganizationBo.AddOrganization(req);
    }

    public async UpdateOrganization(req: BaseRequest): Promise<boolean> {
        return await this.OrganizationBo.UpdateOrganization(req);
    }

    public async GetOrganizationLogo(req: BaseRequest): Promise<OrganizationAttributes> {
        return await this.OrganizationBo.GetOrganizationLogo(req);
    }

    public async GetOrganizationById(req: BaseRequest): Promise<OrganizationAttributes> {
        return await this.OrganizationBo.GetOrganizationById(req);
    }

    public async GetOrganizations(apiReq?: ApiRequest<OrganizationFilters>): Promise<ApiResponse<Array<OrganizationAttributes>>> {
        return await this.OrganizationBo.GetOrganizations(apiReq);
    }

    public async DeleteOrganization(req: BaseRequest): Promise<Boolean> {
        return await this.OrganizationBo.DeleteOrganization(req);
    }
}
