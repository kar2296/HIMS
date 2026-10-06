import { BaseService, BoFactory } from '../../Base/Index';
import { ConsultationBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { ConsultationAttributes } from '../Model/Interface/Index';
import { ConsultationFilters } from '../Common/Filters.e';

export class ConsultationService extends BaseService {
    private ConsultationBo: ConsultationBo;
    constructor(req?: Request) {
        super(req);
        this.ConsultationBo = BoFactory.GetBo(ConsultationBo, this.Request);
    }

    public async AddConsultation(req: BaseRequest): Promise<number> {
        return await this.ConsultationBo.AddConsultation(req);
    }

    public async UpdateConsultation(req: BaseRequest): Promise<boolean> {
        return await this.ConsultationBo.UpdateConsultation(req);
    }

    public async UpdateProgressNoteStatus(req: BaseRequest): Promise<boolean> {
        return await this.ConsultationBo.UpdateProgressNoteStatus(req);
    }

    public async GetConsultationById(req: BaseRequest): Promise<ConsultationAttributes> {
        return await this.ConsultationBo.GetConsultationById(req);
    }

    public async GetConsultations(apiReq?: ApiRequest<ConsultationFilters>): Promise<ApiResponse<ConsultationAttributes[]>> {
        return await this.ConsultationBo.GetConsultations(apiReq);
    }

    public async DeleteConsultation(req: BaseRequest): Promise<Boolean> {
        return await this.ConsultationBo.DeleteConsultation(req);
    }

    public async PrintConsultation(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintConsultation(req);
    }
    public async PrintIPCaseSheetSummary(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintIPCaseSheetSummary(req);
    }

    public async PrintConsultationWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintConsultationWithoutHeader(req);
    }

    public async PrintDischargeLabResult(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintDischargeLabResult(req);
    }

    public async PrintDischargeCasesheet(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintDischargeCasesheet(req);
    }

    public async PrintDischargeCasesheetWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintDischargeCasesheetWithoutHeader(req);
    }

    public async PrintIPCasesheet(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintIPCasesheet(req);
    }

    public async PrintIndIPCasesheet(req: BaseRequest): Promise<FileInfo> {
        return await this.ConsultationBo.PrintIndIPCasesheet(req);
    }
}
