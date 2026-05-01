import {BaseService, BoFactory} from '../../Base/Index';
import { DepartmentBo} from '../Business/Index';
import {ApiRequest, ApiResponse, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DepartmentAttributes} from '../Model/Interface/Index';
import { DepartmentFilters } from '../Common/Filters.e';

export class DepartmentService extends BaseService {
    private DepartmentBo: DepartmentBo;
    constructor(req?: Request) {
        super(req);
        this.DepartmentBo = BoFactory.GetBo(DepartmentBo, this.Request);
    }

    public async AddDepartment(req: BaseRequest): Promise<number> {
        return await this.DepartmentBo.AddDepartment(req);
    }

    public async UpdateDepartment(req: BaseRequest): Promise<boolean> {
        return await this.DepartmentBo.UpdateDepartment(req);
    }

    public async GetDepartmentLogo(req: BaseRequest): Promise<DepartmentAttributes> {
        return await this.DepartmentBo.GetDepartmentLogo(req);
    }

    public async GetDepartmentById(req: BaseRequest): Promise<DepartmentAttributes> {
        return await this.DepartmentBo.GetDepartmentById(req);
    }

    public async GetDepartments(apiReq?: ApiRequest<DepartmentFilters>): Promise<ApiResponse<DepartmentAttributes[]>> {
        return await this.DepartmentBo.GetDepartments(apiReq);
    }
    public async PrintDepartmentListReport(apiReq?: ApiRequest<DepartmentFilters>): Promise<any> {
        return await this.DepartmentBo.PrintDepartmentListReport(apiReq);
    }
    public async DeleteDepartment(req: BaseRequest): Promise<Boolean> {
        return await this.DepartmentBo.DeleteDepartment(req);
    }
}
