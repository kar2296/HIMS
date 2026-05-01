import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientOrderStatusInstance, PatientOrderStatusAttributes } from '../Model/Interface/Index';
import { PatientOrderStatusFilters } from '../Common/Filters.e';

export class PatientOrderStatusBo extends BaseBo<PatientOrderStatusInstance, PatientOrderStatusAttributes>  {
    public async AddPatientOrderStatus(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientOrderStatus(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientOrderStatusDetails(Encountersorderid: number, details: PatientOrderStatusAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.Encountersorderid = Encountersorderid;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }


    public async GetPatientOrderStatusById(req: BaseRequest): Promise<PatientOrderStatusAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientOrderStatus(apiReq?: ApiRequest<PatientOrderStatusFilters>):
        Promise<ApiResponse<PatientOrderStatusAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case PatientOrderStatusFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientOrderStatusFilters.Encountersorderid:
                    where['Encountersorderid'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientOrderStatus(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientOrderStatusInstance, PatientOrderStatusAttributes> {
        return this.Models.PatientOrderStatus;
    }

}
