import { BaseService, BoFactory } from '../../Base/Index';
import { PrescriptionBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PrescriptionAttributes } from '../Model/Interface/Index';
import { PrescriptionFilters } from '../Common/Filters.e';

export class PrescriptionService extends BaseService {
    private PrescriptionBo: PrescriptionBo;
    constructor(req?: Request) {
        super(req);
        this.PrescriptionBo = BoFactory.GetBo(PrescriptionBo, this.Request);
    }

    public async AddPrescription(req: BaseRequest): Promise<number> {
        return await this.PrescriptionBo.AddPrescription(req);
    }

    public async UpdatePrescription(req: BaseRequest): Promise<boolean> {
        return await this.PrescriptionBo.UpdatePrescription(req);
    }

    public async ManagePrescriptionNote(req: BaseRequest): Promise<boolean> {
        return await this.PrescriptionBo.ManagePrescriptionNote(req);
    }

    public async UpdateCancelPrescription(req: BaseRequest): Promise<boolean> {
        return await this.PrescriptionBo.UpdateCancelPrescription(req);
    }

    public async GetPrescriptionById(req: BaseRequest): Promise<PrescriptionAttributes> {
        return await this.PrescriptionBo.GetPrescriptionById(req);
    }

    public async GetPrescriptions(apiReq?: ApiRequest<PrescriptionFilters>): Promise<ApiResponse<PrescriptionAttributes[]>> {
        return await this.PrescriptionBo.GetPrescriptions(apiReq);
    }

    public async GetPrescriptionsWithoutDetails(apiReq?: ApiRequest<PrescriptionFilters>): Promise<ApiResponse<PrescriptionAttributes[]>> {
        return await this.PrescriptionBo.GetPrescriptionsWithoutDetails(apiReq);
    }

    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        return await this.PrescriptionBo.GetPendingPrescriptions(req);
    }

    public async DeletePrescription(req: BaseRequest): Promise<Boolean> {
        return await this.PrescriptionBo.DeletePrescription(req);
    }
    public async PrintPrescription(req: BaseRequest): Promise<FileInfo> {
        return await this.PrescriptionBo.PrintPrescription(req);
    }
    public async PrintActiveMedication(req: BaseRequest): Promise<FileInfo> {
        return await this.PrescriptionBo.PrintActiveMedication(req);
    }

}
