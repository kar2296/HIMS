import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientGuarantorGLInstance, PatientGuarantorGLAttributes } from '../Model/Interface/Index';
import { PatientGuarantorGLFilters } from '../Common/Filters.e';

export class PatientGuarantorGLBo extends BaseBo<PatientGuarantorGLInstance, PatientGuarantorGLAttributes>  {
    public async AddPatientGuarantorGL(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientGuarantorGL(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientGuarantorGLById(req: BaseRequest): Promise<PatientGuarantorGLAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientGuarantorGLs(apiReq?: ApiRequest<PatientGuarantorGLFilters>):
    Promise<ApiResponse<PatientGuarantorGLAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientGuarantorGLFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientGuarantorGLFilters.PatientGuarantorId:
                        where['PatientGuarantorId'] = param.Value;
                        break;
                    case PatientGuarantorGLFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientGuarantorGL(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientGuarantorGLInstance, PatientGuarantorGLAttributes> {
        return this.Models.PatientGuarantorGL;
    }

}
