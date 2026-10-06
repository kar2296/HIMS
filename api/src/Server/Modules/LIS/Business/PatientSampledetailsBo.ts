import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { PatientSampledetailsInstance, PatientSampledetailsAttributes } from '../Model/Interface/Index';
//import { PatientSampledetailsFilters } from '../Common/Filters.e';

export class PatientSampledetailsBo extends BaseBo<PatientSampledetailsInstance, PatientSampledetailsAttributes>  {
    public async AddPatientSampledetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientSampledetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientSampledetailsById(req: BaseRequest): Promise<PatientSampledetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientSampledetailss(apiReq?: ApiRequest<ISearchEnums>): Promise<ApiResponse<PatientSampledetailsAttributes[]>> {
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

    public async DeletePatientSampledetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientSampledetailsInstance, PatientSampledetailsAttributes> {
        return this.Models.PatientSampledetails;
    }

}
