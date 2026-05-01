import {BaseService, BoFactory} from '../../Base/Index';
import { DiagnosisBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DiagnosisAttributes} from '../Model/Interface/Index';
import { DiagnosisFilters } from '../Common/Filters.e';

export class DiagnosisService extends BaseService {
    private DiagnosisBo: DiagnosisBo;
    constructor(req?: Request) {
        super(req);
        this.DiagnosisBo = BoFactory.GetBo(DiagnosisBo, this.Request);
    }

    public async AddDiagnosis(req: BaseRequest): Promise<number> {
        return await this.DiagnosisBo.AddDiagnosis(req);
    }

    public async UpdateDiagnosis(req: BaseRequest): Promise<boolean> {
        return await this.DiagnosisBo.UpdateDiagnosis(req);
    }

    public async GetDiagnosisById(req: BaseRequest): Promise<DiagnosisAttributes> {
        return await this.DiagnosisBo.GetDiagnosisById(req);
    }

    public async GetDiagnosiss(apiReq?: ApiRequest<DiagnosisFilters>): Promise<ApiResponse<DiagnosisAttributes[]>> {
        return await this.DiagnosisBo.GetDiagnosiss(apiReq);
    }

    public async DeleteDiagnosis(req: BaseRequest): Promise<Boolean> {
        return await this.DiagnosisBo.DeleteDiagnosis(req);
    }

    public async GetSNOMEDCT(apiReq?: ApiRequest<any>): Promise<Boolean> {
        return await this.DiagnosisBo.GetSNOMEDCT(apiReq);
    }

    public async GetSNOMEDCTByConceptId(apiReq?: ApiRequest<any>): Promise<Boolean> {
        return await this.DiagnosisBo.GetSNOMEDCTByConceptId(apiReq);
    }
}
