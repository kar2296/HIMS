import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientEmarInstance, PatientEmarAttributes } from '../Model/Interface/Index';
import { PatientEmarFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';

export class PatientEmarBo extends BaseBo<PatientEmarInstance, PatientEmarAttributes>  {
    public async AddPatientEmar(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientEmarDetailsBo, this.Request);
        let patientemarId = result.dataValues.Id;
        await detailBO.ManagePatientEmarDetails(patientemarId, req.Data.Details);
        return patientemarId;
    }

    public async UpdatePatientEmar(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientEmarDetailsBo, this.Request);
        let patientemarId = req.Data.Header.Id;
        await detailBO.ManagePatientEmarDetails(patientemarId, req.Data.Details);
        return result;
    }

    public async GetPatientEmarById(req: BaseRequest): Promise<PatientEmarAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }
    public async GetPatientEmars(apiReq?: ApiRequest<PatientEmarFilters>): Promise<ApiResponse<PatientEmarAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        // include.push({ model: this.Models.Prescription,required: false });
        include.push({ model: this.Models.PrescriptionDetail, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientEmarFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientEmar(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientEmarInstance, PatientEmarAttributes> {
        return this.Models.PatientEmar;
    }
}

