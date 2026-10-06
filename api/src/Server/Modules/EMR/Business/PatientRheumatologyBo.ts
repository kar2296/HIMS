import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientRheumatologyInstance, PatientRheumatologyAttributes } from '../Model/Interface/Index';
import { PatientRheumatologyFilters } from '../Common/Filters.e';

export class PatientRheumatologyBo extends BaseBo<PatientRheumatologyInstance, PatientRheumatologyAttributes>  {
    public async AddPatientRheumatology(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientRheumatology(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientRheumatologyById(req: BaseRequest): Promise<PatientRheumatologyAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientRheumatologys(apiReq?: ApiRequest<PatientRheumatologyFilters>):
        Promise<ApiResponse<PatientRheumatologyAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('RheumatologyStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientRheumatologyFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientRheumatologyFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientRheumatologyFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientRheumatologyFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientRheumatology(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientRheumatologyInstance, PatientRheumatologyAttributes> {
        return this.Models.PatientRheumatology;
    }

}
