import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterGuarantorGLInstance, EncounterGuarantorGLAttributes } from '../Model/Interface/Index';
import { EncounterGuarantorGLFilters } from '../Common/Filters.e';

export class EncounterGuarantorGLBo extends BaseBo<EncounterGuarantorGLInstance, EncounterGuarantorGLAttributes>  {
    public async AddEncounterGuarantorGL(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterGuarantorGL(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterGuarantorGLById(req: BaseRequest): Promise<EncounterGuarantorGLAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEncounterGuarantorGLs(apiReq?: ApiRequest<EncounterGuarantorGLFilters>):
     Promise<ApiResponse<EncounterGuarantorGLAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterGuarantorGLFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterGuarantorGLFilters.EncounterGuarantorId:
                        where['EncounterGuarantorId'] = param.Value;
                        break;
                    case EncounterGuarantorGLFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEncounterGuarantorGL(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EncounterGuarantorGLInstance, EncounterGuarantorGLAttributes> {
        return this.Models.EncounterGuarantorGL;
    }

}
