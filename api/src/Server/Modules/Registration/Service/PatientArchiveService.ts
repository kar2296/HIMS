import { BaseService, BoFactory } from '../../Base/Index';
import { PatientArchiveBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientArchiveAttributes } from '../Model/Interface/Index';
import { PatientArchiveFilters } from '../Common/Filters.e';

export class PatientArchiveService extends BaseService {
    private PatientArchiveBo: PatientArchiveBo;
    constructor(req?: Request) {
        super(req);
        this.PatientArchiveBo = BoFactory.GetBo(PatientArchiveBo, this.Request);
    }

    public async AddPatientArchive(req: BaseRequest): Promise<number> {
        return await this.PatientArchiveBo.AddPatientArchive(req);
    }

    public async RegistrationCumVisit(req: BaseRequest): Promise<number> {
        return await this.PatientArchiveBo.RegistrationCumVisit(req);
    }

    public async ManageCrossConsultation(req: BaseRequest): Promise<boolean> {
        return await this.PatientArchiveBo.ManageCrossConsultation(req);
    }

    public async RegCumVisitWithBill(req: BaseRequest): Promise<number> {
        return await this.PatientArchiveBo.RegCumVisitWithBill(req);
    }

    public async UpdatePatientArchive(req: BaseRequest): Promise<boolean> {
        return await this.PatientArchiveBo.UpdatePatientArchive(req);
    }

    public async GetPatientArchiveProfilePic(req: BaseRequest): Promise<PatientArchiveAttributes> {
        return await this.PatientArchiveBo.GetPatientArchiveProfilePic(req);
    }

    public async GetPatientArchiveMinimalInfoById(req: BaseRequest): Promise<PatientArchiveAttributes> {
        return await this.PatientArchiveBo.GetPatientArchiveMinimalInfoById(req);
    }

    public async GetPatientArchiveById(req: BaseRequest): Promise<PatientArchiveAttributes> {
        return await this.PatientArchiveBo.GetPatientArchiveById(req);
    }

    public async GetPatientArchiveInfoById(req: BaseRequest): Promise<PatientArchiveAttributes> {
        return await this.PatientArchiveBo.GetPatientArchiveInfoById(req);
    }

    public async GetPatientArchiveByIdForPharmacy(req: BaseRequest): Promise<PatientArchiveAttributes> {
        return await this.PatientArchiveBo.GetPatientArchiveByIdForPharmacy(req);
    }

    public async GetPatientArchives(apiReq?: ApiRequest<PatientArchiveFilters>): Promise<ApiResponse<PatientArchiveAttributes[]>> {
        return await this.PatientArchiveBo.GetPatientArchives(apiReq);
    }

    public async DeletePatientArchive(req: BaseRequest): Promise<Boolean> {
        return await this.PatientArchiveBo.DeletePatientArchive(req);
    }

    public async PrintPatientArchive(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientArchiveBo.PrintPatientArchive(req);
    }

    public async PrintPatientArchiveLabel(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientArchiveBo.PrintPatientArchiveLabel(req);
    }
    public async PrintPatientArchiveCard(req: BaseRequest): Promise<string> {
        return await this.PatientArchiveBo.PrintPatientArchiveCard(req);
    }


    }
