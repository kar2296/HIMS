import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { Paginator, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientKinInstance, PatientKinAttributes } from '../Model/Interface/Index';
import { PatientKinFilters } from '../Common/Filters.e';

export class PatientKinBo extends BaseBo<PatientKinInstance, PatientKinAttributes> {
    public async AddPatientKin(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientKin(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientKinById(req: BaseRequest): Promise<PatientKinAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientKins(apiReq?: ApiRequest<PatientKinFilters>): Promise<Array<PatientKinAttributes>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push(this.GetReference('Relationship'));
        include.push(this.GetReference('Title'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientKinFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientKinFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientKinFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, include: include, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }

    public async DeletePatientKin(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientKinInstance, PatientKinAttributes> {
        return this.Models.PatientKin;
    }
}
