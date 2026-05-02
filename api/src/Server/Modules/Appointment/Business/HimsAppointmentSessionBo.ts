import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { AppointmentSessionInstance, AppointmentSessionAttributes } from '../Model/Interface/Index';
import { AppointmentSessionFilters } from '../Common/Filters.e';
import * as apptbo from './Index';

export class AppointmentSessionBo extends BaseBo<AppointmentSessionInstance, AppointmentSessionAttributes> {
    public async AddAppointmentSession(req: BaseRequest): Promise<number> {
        if (await this.ApptSessionIsAlreadyExists(req) === -1) {
            throw { code: 'APPT_SESSION_EXISTS' };
        } else {
            this.HandleActiveState(req.Data);
            let result = await this.Save(req.Data);
            let apptmultisess = BoFactory.GetBo(apptbo.AppointmentMultiSessionBo, this.Request);
            await apptmultisess.AddAppointmentMultiSession(req);
            return result.dataValues.Id;
        }
    }

    public async ApptSessionIsAlreadyExists(req: BaseRequest): Promise<number> {
        if (req && req.Data && req.Data.DoctorId) {
            let AppIsExists = await this.Find({
                where: {
                    DoctorId: req.Data.DoctorId,
                    AppointmentSessionTypeId: req.Data.AppointmentSessionTypeId,
                    ActiveStatusId: 2
                },
                order: [['Id', 'DESC']],
            });
            return AppIsExists ? -1 : 1;
        }
        return 1;
    }


    public async UpdateAppointmentSession(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppointmentSessionById(req: BaseRequest): Promise<AppointmentSessionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAppointmentSessions(apiReq?: ApiRequest<AppointmentSessionFilters>):
        Promise<ApiResponse<AppointmentSessionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('AppointmentSessionType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'],
            where: {
                IsActive: 1
            },
            required: true,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.ResourceMaster, attributes: ['ResourceName'], required: false });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentSessionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentSessionFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentSessionFilters.AppointmentSessionType:
                        where['AppointmentSessionTypeId'] = param.Value;
                        break;
                    case AppointmentSessionFilters.AppointmentDate:
                        (where as any)['$and'] = [{
                            'StartDate': {
                                '$lte': param.Value
                            }
                        }, {
                            'EndDate': {
                                '$or': {
                                    '$gte': param.Value,
                                    '$eq': null
                                }
                            }
                        }];
                        break;
                    case AppointmentSessionFilters.Doctor:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DoctorId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentSessionFilters.Resource:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ResourceId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentSessionFilters.SpecialityId:
                        where['SpecialityId'] = param.Value;
                        break;
                    case AppointmentSessionFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppointmentSession(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AppointmentSessionInstance, AppointmentSessionAttributes> {
        return this.Models.AppointmentSession;
    }
}
