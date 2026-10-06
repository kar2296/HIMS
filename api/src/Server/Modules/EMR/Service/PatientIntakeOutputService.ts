import {BaseService, BoFactory } from '../../Base/Index';
import { PatientIntakeOutputBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request,FileInfo  } from '../../../Core/Index';
import { PatientIntakeOutputAttributes } from '../Model/Interface/Index';
import { PatientIntakeOutputFilters } from '../Common/Filters.e';

export class PatientIntakeOutputService extends BaseService {
    private PatientIntakeOutputBo: PatientIntakeOutputBo;
    constructor(req?: Request) {
        super(req);
        this.PatientIntakeOutputBo = BoFactory.GetBo(PatientIntakeOutputBo, this.Request);
    }

    public async AddPatientIntakeOutput(req: BaseRequest): Promise<number> {
        return await this.PatientIntakeOutputBo.AddPatientIntakeOutput(req);
    }

    public async UpdatePatientIntakeOutput(req: BaseRequest): Promise<boolean> {
        return await this.PatientIntakeOutputBo.UpdatePatientIntakeOutput(req);
    }

    public async GetPatientIntakeOutputById(req: BaseRequest): Promise<PatientIntakeOutputAttributes> {
        return await this.PatientIntakeOutputBo.GetPatientIntakeOutputById(req);
    }

    public async GetPatientIntakeOutputs(apiReq?: ApiRequest<PatientIntakeOutputFilters>):
     Promise<ApiResponse<PatientIntakeOutputAttributes[]>> {
        return await this.PatientIntakeOutputBo.GetPatientIntakeOutputs(apiReq);
    }

    public async DeletePatientIntakeOutput(req: BaseRequest): Promise<Boolean> {
        return await this.PatientIntakeOutputBo.DeletePatientIntakeOutput(req);
    }
    public async PrintPatientIntakeOutput(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientIntakeOutputBo.PrintPatientIntakeOutput(req);
    }
}
