import {BaseService, BoFactory} from '../../Base/Index';
import { DepartmentLocationBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ISearchEnums} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DepartmentLocationAttributes} from '../Model/Interface/Index';

export class DepartmentLocationService extends BaseService {
    private DepartmentLocationBo: DepartmentLocationBo;
    constructor(req?: Request) {
        super(req);
        this.DepartmentLocationBo = BoFactory.GetBo(DepartmentLocationBo, this.Request);
    }

    public async AddDepartmentLocation(req: BaseRequest): Promise<number> {
        return await this.DepartmentLocationBo.AddDepartmentLocation(req);
    }

    public async UpdateDepartmentLocation(req: BaseRequest): Promise<boolean> {
        return await this.DepartmentLocationBo.UpdateDepartmentLocation(req);
    }

    public async GetDepartmentLocationById(req: BaseRequest): Promise<DepartmentLocationAttributes> {
        return await this.DepartmentLocationBo.GetDepartmentLocationById(req);
    }

    public async GetDepartmentLocations(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<DepartmentLocationAttributes>> {
        return await this.DepartmentLocationBo.GetDepartmentLocations(apiReq);
    }

    public async DeleteDepartmentLocation(req: BaseRequest): Promise<Boolean> {
        return await this.DepartmentLocationBo.DeleteDepartmentLocation(req);
    }
}
