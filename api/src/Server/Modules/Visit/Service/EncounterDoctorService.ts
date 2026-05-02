import { BaseService, BoFactory } from '../../Base/Index';
import { EncounterDoctorBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { EncounterDoctorAttributes } from '../Model/Interface/Index';
import { EncounterDoctorFilters } from '../Common/Filters.e';
export class EncounterDoctorService extends BaseService {
    private EncounterDoctorBo: EncounterDoctorBo;
    constructor(req?: Request) {
        super(req);
        this.EncounterDoctorBo = BoFactory.GetBo(EncounterDoctorBo, this.Request);
    }

    public async AddEncounterDoctor(req: BaseRequest): Promise<number> {
        return await this.EncounterDoctorBo.AddEncounterDoctor(req);
    }

    public async UpdateEncounterDoctor(req: BaseRequest): Promise<boolean> {
        return await this.EncounterDoctorBo.UpdateEncounterDoctor(req);
    }

    public async GetEncounterDoctorById(req: BaseRequest): Promise<EncounterDoctorAttributes> {
        return await this.EncounterDoctorBo.GetEncounterDoctorById(req);
    }

    public async GetTransferEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>):
        Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        return await this.EncounterDoctorBo.GetTransferEncounterDoctors(apiReq);
    }

    public async GetEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>): Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        return await this.EncounterDoctorBo.GetEncounterDoctors(apiReq);
    }

    public async GetServiceEncounterDoctors(apiReq?: ApiRequest<EncounterDoctorFilters>):
        Promise<ApiResponse<EncounterDoctorAttributes[]>> {
        return await this.EncounterDoctorBo.GetServiceEncounterDoctors(apiReq);
    }

    public async DeleteEncounterDoctor(req: BaseRequest): Promise<Boolean> {
        return await this.EncounterDoctorBo.DeleteEncounterDoctor(req);
    }

    public async ManageIPEncounterDoctor(req: BaseRequest): Promise<boolean> {
        return await this.EncounterDoctorBo.ManageIPEncounterDoctor(req);
    }
    public async PrintCrossConsultation(req: BaseRequest): Promise<FileInfo> {
        return await this.EncounterDoctorBo.PrintCrossConsultation(req);
    }
    public async ManageEncounterDoctor(req: BaseRequest): Promise<number> {
        return await this.EncounterDoctorBo.ManageEncounterDoctor(req);
    }
}
