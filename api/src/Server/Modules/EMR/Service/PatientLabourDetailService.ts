import {BaseService, BoFactory} from '../../Base/Index';
import { PatientLabourDetailBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientLabourDetailAttributes} from '../Model/Interface/Index';
import { PatientLabourDetailFilters } from '../Common/Filters.e';

export class PatientLabourDetailService extends BaseService {
    private PatientLabourDetailBo: PatientLabourDetailBo;
    constructor(req?: Request) {
        super(req);
        this.PatientLabourDetailBo = BoFactory.GetBo(PatientLabourDetailBo, this.Request);
    }

    public async AddPatientLabourDetail(req: BaseRequest): Promise<number> {
        return await this.PatientLabourDetailBo.AddPatientLabourDetail(req);
    }

    public async UpdatePatientLabourDetail(req: BaseRequest): Promise<boolean> {
        return await this.PatientLabourDetailBo.UpdatePatientLabourDetail(req);
    }

    public async GetPatientLabourDetailById(req: BaseRequest): Promise<PatientLabourDetailAttributes> {
        return await this.PatientLabourDetailBo.GetPatientLabourDetailById(req);
    }

    public async GetPatientLabourDetails(apiReq?: ApiRequest<PatientLabourDetailFilters>):
     Promise<ApiResponse<PatientLabourDetailAttributes[]>> {
        return await this.PatientLabourDetailBo.GetPatientLabourDetails(apiReq);
    }

    public async DeletePatientLabourDetail(req: BaseRequest): Promise<Boolean> {
        return await this.PatientLabourDetailBo.DeletePatientLabourDetail(req);
    }
   public async PrintPatientLabourDetail(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientLabourDetailBo.PrintPatientLabourDetail(req);
    }
}

