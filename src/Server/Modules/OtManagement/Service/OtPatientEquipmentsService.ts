import { BaseService, BoFactory } from '../../Base/Index';
import { OtPatientEquipmentsBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { OtPatientEquipmentsAttributes } from '../Model/Interface/Index';
import { OtPatientEquipmentsFilters } from '../Common/Filters.e';

export class OtPatientEquipmentsService extends BaseService {
    private OtPatientEquipmentsBo: OtPatientEquipmentsBo;
    constructor(req?: Request) {
        super(req);
        this.OtPatientEquipmentsBo = BoFactory.GetBo(OtPatientEquipmentsBo, this.Request);
    }

    public async AddOtPatientEquipments(req: BaseRequest): Promise<number> {
        return await this.OtPatientEquipmentsBo.AddOtPatientEquipments(req);
    }

    public async UpdateOtPatientEquipments(req: BaseRequest): Promise<boolean> {
        return await this.OtPatientEquipmentsBo.UpdateOtPatientEquipments(req);
    }
    public async ManageOtPatientEquipments(req: BaseRequest): Promise<boolean> {
        return await this.OtPatientEquipmentsBo.ManageOtPatientEquipments(req);
    }
    public async GetOtPatientEquipmentsById(req: BaseRequest): Promise<OtPatientEquipmentsAttributes> {
        return await this.OtPatientEquipmentsBo.GetOtPatientEquipmentsById(req);
    }

    public async GetOtPatientEquipmentss(apiReq?: ApiRequest<OtPatientEquipmentsFilters>):
        Promise<ApiResponse<OtPatientEquipmentsAttributes[]>> {
        return await this.OtPatientEquipmentsBo.GetOtPatientEquipmentss(apiReq);
    }

    public async DeleteOtPatientEquipments(req: BaseRequest): Promise<Boolean> {
        return await this.OtPatientEquipmentsBo.DeleteOtPatientEquipments(req);
    }

    public async PrintOtPatientEquipments(apiReq?: ApiRequest<OtPatientEquipmentsFilters>): Promise<any> {
        return await this.OtPatientEquipmentsBo.PrintOtPatientEquipments(apiReq);
    }
}
