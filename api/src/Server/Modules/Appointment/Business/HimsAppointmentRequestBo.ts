import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AppointmentRequestInstance, AppointmentRequestAttributes } from '../Model/Interface/Index';
import { AppointmentRequestFilters } from '../Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import * as bo from './Index';
import { BoFactory } from '../../Base/Business/Index';

export class AppointmentRequestBo extends BaseBo<AppointmentRequestInstance, AppointmentRequestAttributes>  {
    public async AddAppointmentRequest(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAppointmentRequest(req: BaseRequest): Promise<boolean> {
        let Id = req.Data.Id;
        if (req.Data.AppointmentId) {
            req.Data.AppointmentStatusId = req.Data.AppointmentRequestStatusId;
            req.Data.Id = req.Data.AppointmentId;
            let apptBo = BoFactory.GetBo(bo.AppointmentBo, this.Request);
            await apptBo.UpdateAppointmentStatus(req);
        }
        req.Data.Id = Id;
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageAppointmentRequest(req: BaseRequest): Promise<boolean> {
        let Id = req.Data.Id;
        if (!req.Data.AppointmentId) {
            let encBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            await encBo.CheckoutOldVisit(req);
            req.Data.Id = null;
            let apptBo = BoFactory.GetBo(bo.AppointmentBo, this.Request);
            let AppointmentId = await apptBo.AddAppointment(req);
            req.Data.AppointmentId = AppointmentId;
        }
        req.Data.Id = Id;
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppointmentRequestById(req: BaseRequest): Promise<AppointmentRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAppointmentRequests(apiReq?: ApiRequest<AppointmentRequestFilters>):
        Promise<ApiResponse<AppointmentRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.ResourceMaster, attributes: ['ResourceName'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Appointment, as: 'Appointment', required: false });
        include.push(this.GetReference('AppointmentRequestStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentRequestFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AppointmentRequestFilters.DoctorId:
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
                    case AppointmentRequestFilters.AppointmentDate:
                        where['AppointmentDate'] = param.Value;
                        break;
                    case AppointmentRequestFilters.AppointmentRequestStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AppointmentRequestStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case AppointmentRequestFilters.Pending:
                        where['AppointmentRequestStatusId'] = { '$lt': 5 };
                        break;
                    case AppointmentRequestFilters.Cancelled:
                        where['AppointmentRequestStatusId'] = { '$gt': 4 };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppointmentRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async UpdateAppointmentRequestStatus(req: BaseRequest): Promise<boolean> {
        if (req.Data && req.Data.AppointmentId) {
            let appointReq: any = { 'AppointmentRequestStatusId': req.Data.AppointmentRequestStatusId };
            await this.Update(appointReq, {
                fields: ['AppointmentRequestStatusId'],
                where: { 'AppointmentId': req.Data.AppointmentId },
            });
        }
        return true;
    }

    public async UpdateAppointmentId(req: BaseRequest): Promise<boolean> {
        let appointReq: any = { 'AppointmentId': req.Data.AppointmentId };
        await this.Update(appointReq, {
            fields: ['AppointmentId'],
            where: { 'Id': req.Data.AppointmentRequestId },
        });
        return true;
    }

    public GetModel(): SStatic.Model<AppointmentRequestInstance, AppointmentRequestAttributes> {
        return this.Models.AppointmentRequest;
    }

}
