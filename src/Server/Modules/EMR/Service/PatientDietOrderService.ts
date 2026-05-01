import {BaseService, BoFactory } from '../../Base/Index';
import { PatientDietOrderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PatientDietOrderAttributes } from '../Model/Interface/Index';
import { PatientDietOrderFilters } from '../Common/Filters.e';

export class PatientDietOrderService extends BaseService {
    private PatientDietOrderBo: PatientDietOrderBo;
    constructor(req?: Request) {
        super(req);
        this.PatientDietOrderBo = BoFactory.GetBo(PatientDietOrderBo, this.Request);
    }

    public async AddPatientDietOrder(req: BaseRequest): Promise<number> {
        return await this.PatientDietOrderBo.AddPatientDietOrder(req);
    }

    public async UpdatePatientDietOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietOrderBo.UpdatePatientDietOrder(req);
    }

    public async GetPatientDietOrderById(req: BaseRequest): Promise<PatientDietOrderAttributes> {
        return await this.PatientDietOrderBo.GetPatientDietOrderById(req);
    }

    public async ManagePatientDietOrders(req: BaseRequest): Promise<boolean> {
        return await this.PatientDietOrderBo.ManagePatientDietOrders(req);
    }

    public async GetPatientDietOrders(apiReq?: ApiRequest<PatientDietOrderFilters>): Promise<ApiResponse<PatientDietOrderAttributes[]>> {
        return await this.PatientDietOrderBo.GetPatientDietOrders(apiReq);
    }

    public async DeletePatientDietOrder(req: BaseRequest): Promise<Boolean> {
        return await this.PatientDietOrderBo.DeletePatientDietOrder(req);
    }
     public async PrintPatientDietOrder(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientDietOrderBo.PrintPatientDietOrder(req);
    }
     public async PrintKitchenworklist(apiReq?: ApiRequest<PatientDietOrderFilters>): Promise<any> {
        return await this.PatientDietOrderBo.PrintKitchenworklist(apiReq);
    }
}
