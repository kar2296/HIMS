import {BaseService, BoFactory } from '../../Base/Index';
import { PatientDietOrderDetailBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientDietOrderDetailAttributes } from '../Model/Interface/Index';
import { PatientDietOrderDetailFilters } from '../Common/Filters.e';

export class PatientDietOrderDetailService extends BaseService {
    private PatientDietOrderDetailBo: PatientDietOrderDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDietOrderDetailBo = BoFactory.GetBo(PatientDietOrderDetailBo, this.Request);
    }

    public async AddPatientDietOrderDetail(req: BaseRequest): Promise<number> {
        return await this.PatientDietOrderDetailBo.AddPatientDietOrderDetail(req);
    }

    public async UpdatePatientDietOrderDetail(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietOrderDetailBo.UpdatePatientDietOrderDetail(req);
    }

    public async GetPatientDietOrderDetailById(req: BaseRequest): Promise<PatientDietOrderDetailAttributes> {
        return await this.PatientDietOrderDetailBo.GetPatientDietOrderDetailById(req);
    }

    public async GetPatientDietOrderDetails(apiReq?: ApiRequest<PatientDietOrderDetailFilters>):
     Promise<ApiResponse<PatientDietOrderDetailAttributes[]>> {
        return await this.PatientDietOrderDetailBo.GetPatientDietOrderDetails(apiReq);
    }

    public async DeletePatientDietOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDietOrderDetailBo.DeletePatientDietOrderDetail(req);
    }
    public async PrintMonthlySalesandRevenueDetails(apiReq?: ApiRequest<PatientDietOrderDetailFilters>): Promise<any> {
        return await this.PatientDietOrderDetailBo.PrintMonthlySalesandRevenueDetails(apiReq);
    }
}
