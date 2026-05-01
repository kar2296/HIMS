import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientAlertInstance, PatientAlertAttributes } from '../Model/Interface/Index';
import { PatientAlertFilters } from '../Common/Filters.e';
import * as bo from '../../GeneralMaster/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class PatientAlertBo extends BaseBo<PatientAlertInstance, PatientAlertAttributes> implements IOptionProvider {
    public async AddPatientAlert(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientAlert(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientAlertById(req: BaseRequest): Promise<PatientAlertAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientAlerts(apiReq?: ApiRequest<PatientAlertFilters>): Promise<ApiResponse<PatientAlertAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AlertType'));
        include.push(this.GetReference('Severity'));
        include.push(this.GetReference('Priority'));
        include.push({ model: this.Models.User, attributes: ['UserName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        let userId: any = 0;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientAlertFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientAlertFilters.AlertTypeId:
                        where['AlertTypeId'] = param.Value;
                        break;
                    case PatientAlertFilters.SeverityId:
                        where['SeverityId'] = param.Value;
                        break;
                    case PatientAlertFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case PatientAlertFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientAlertFilters.DepartmentId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            paramArr.push(-1);
                            where['DepartmentId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientAlertFilters.UserId:
                        userId = parseInt(param.Value);
                        break;
                    case PatientAlertFilters.SkipPatient:
                        if(param.Value) {
                            where['PatientId'] = null;
                        }
                        break;
                    case PatientAlertFilters.IsValidAlerts:
                        let currentDate = new Date();
                        where['OnsetDate'] = { '$lte': currentDate };
                        //where['ClosureDate'] = { '$gte' : currentDate };
                        (where as any)['ClosureDate'] = { [Op.or]: [{'$eq': null },{ '$gte' : currentDate }]};
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        let patientAlertReviewBo = BoFactory.GetBo(bo.PatientAlertReviewBo, this.Request);
        let patientAlertIdArr = await patientAlertReviewBo.GetUserReviewedAlerts(userId);
        console.log(patientAlertIdArr);
        if(patientAlertIdArr && patientAlertIdArr.length > 0) {
            where['Id'] = { '$notIn': patientAlertIdArr };
        }

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientAlert(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAlertInstance, PatientAlertAttributes> {
        return this.Models.PatientAlert;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<PatientAlertFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'AlertTypeId', 'SeverityId', 'PriorityId'];
        let val = await this.GetPatientAlerts(apiReq);
        return { [key]: val.Data };
    }
}

