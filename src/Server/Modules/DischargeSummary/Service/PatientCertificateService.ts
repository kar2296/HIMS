import {BaseService, BoFactory} from '../../Base/Index';
import { PatientCertificateBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import { Request,FileInfo } from '../../../Core/Index';
import { PatientCertificateAttributes} from '../Model/Interface/Index';
import { PatientCertificateFilters } from '../Common/Filters.e';

export class PatientCertificateService extends BaseService {
    private PatientCertificateBo: PatientCertificateBo;
    constructor(req?: Request) {
        super(req);
        this.PatientCertificateBo = BoFactory.GetBo(PatientCertificateBo, this.Request);
    }

    public async AddPatientCertificate(req: BaseRequest): Promise<number> {
        return await this.PatientCertificateBo.AddPatientCertificate(req);
    }

    public async UpdatePatientCertificate(req: BaseRequest): Promise<boolean> {
        return await this.PatientCertificateBo.UpdatePatientCertificate(req);
    }

    public async GetPatientCertificateById(req: BaseRequest): Promise<PatientCertificateAttributes> {
        return await this.PatientCertificateBo.GetPatientCertificateById(req);
    }

    public async GetPatientCertificates(apiReq?: ApiRequest<PatientCertificateFilters>):
     Promise<ApiResponse<PatientCertificateAttributes[]>> {
        return await this.PatientCertificateBo.GetPatientCertificates(apiReq);
    }

    public async DeletePatientCertificate(req: BaseRequest): Promise<Boolean> {
        return await this.PatientCertificateBo.DeletePatientCertificate(req);
    }
    public async PrintPatientCertificate(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientCertificateBo.PrintPatientCertificate(req);
    }
    public async PrintPatientCertificatewithoutheader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientCertificateBo.PrintPatientCertificatewithoutheader(req);
    }
}
