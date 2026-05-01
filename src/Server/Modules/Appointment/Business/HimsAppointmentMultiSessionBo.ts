import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AppointmentMultiSessionInstance, AppointmentMultiSessionAttributes } from '../Model/Interface/Index';
import { AppointmentMultiSessionFilters } from '../Common/Filters.e';
import moment = require('moment');

export class AppointmentMultiSessionBo extends BaseBo<AppointmentMultiSessionInstance,
    AppointmentMultiSessionAttributes> {
    public async AddAppointmentMultiSession(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAppointmentMultiSession(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppointmentMultiSessionById(req: BaseRequest):
        Promise<AppointmentMultiSessionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAppointmentMultiSessions(apiReq?: ApiRequest<AppointmentMultiSessionFilters>):
        Promise<ApiResponse<AppointmentMultiSessionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('AppointmentSessionType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('SessionType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.ResourceMaster, attributes: ['ResourceName'], required: false });
        include.push({ model: this.Models.Speciality, attributes: ['SpecialityName'], required: false });
        include.push({ model: this.Models.VirtualSubCategory, attributes: ['SubCategoryName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentMultiSessionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.AppointmentSessionType:
                        where['AppointmentSessionTypeId'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.AppointmentDate:
                        //let FrmDt = moment(new Date(param.Value)).format('YYYY-MM-DD');
                        let FrmDt = moment(new Date(param.Value)).format('YYYY-MM-DD 00:00:00');
                        let ToDt = moment(new Date(param.Value)).format('YYYY-MM-DD 23:59:59');
                        console.log('&&&&&&&&&&&&&&&&&&');
                        console.log(param.Value);
                        console.log('&&&&&&&&&&&&&&&&&&');
                        (where as any)['$and'] = [{
                            'StartDate': {
                                '$lte': FrmDt
                            }
                        }, {
                            'EndDate': {
                                '$or': {
                                    '$gte': ToDt,
                                    '$eq': null
                                }
                            }
                        }];
                        break;
                    case AppointmentMultiSessionFilters.Doctor:
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
                    case AppointmentMultiSessionFilters.Resource:
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
                    case AppointmentMultiSessionFilters.SpecialityId:
                        where['SpecialityId'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                        case AppointmentMultiSessionFilters.OrderTypeId:
                        where['OrderTypeId'] = param.Value;
                        break;
                    case AppointmentMultiSessionFilters.onlyOrderTypeId:
                        where['OrderTypeId'] = { '$gt': '0' };
                        break;
                    case AppointmentMultiSessionFilters.withoutOrderTypeId:
                        where['OrderTypeId'] = { '$eq': '0' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppointmentMultiSession(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AppointmentMultiSessionInstance,
        AppointmentMultiSessionAttributes> {
        return this.Models.AppointmentMultiSession;
    }
}
