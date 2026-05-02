import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { PatientWorkorderObservationInstance, PatientWorkorderObservationAttributes } from '../Model/Interface/Index';
//import { PatientWorkorderObservationFilters } from '../Common/Filters.e';

export class PatientWorkorderObservationBo extends BaseBo<PatientWorkorderObservationInstance, PatientWorkorderObservationAttributes>  {
    public async AddPatientWorkorderObservation(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientWorkorderObservation(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientWorkorderObservationById(req: BaseRequest): Promise<PatientWorkorderObservationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientWorkorderObservations
        (apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientWorkorderObservationAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ISearchEnums.Id:
                    where['Id'] = param.Value;
                    break;
                case ISearchEnums.Name:
                    where['Name'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientWorkorderObservation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientWorkorderObservationInstance, PatientWorkorderObservationAttributes> {
        return this.Models.PatientWorkorderObservation;
    }

}
