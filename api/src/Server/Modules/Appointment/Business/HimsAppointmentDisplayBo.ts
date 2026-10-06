import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common';
import { AppointmentDisplayInstance, AppointmentDisplayAttributes } from '../Model/Interface/Index';
import { AppointmentDisplayFilters } from '../Common/Filters.e';
import * as moment from 'moment';

export class AppointmentDisplayBo extends BaseBo<AppointmentDisplayInstance, AppointmentDisplayAttributes>  {
    public async AddAppointmentDisplay(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let AppointmentDisplayId = result.dataValues.Id;
        return AppointmentDisplayId;
    }

    public async UpdateAppointmentDisplay(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAppointmentDisplayById(req: BaseRequest): Promise<AppointmentDisplayAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetListofTokens(req: BaseRequest):
        Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                LocationId: req.Id,
                Status: req.Data.Status,
                TokenStatusId: req.Data.TokenStatusId
            },
            attributes: ['Id']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.Id);
        });
        return result;
    }


    public async GetDRLastTokenCount(DoctorId_: Number): Promise<any> {
        let LastTokenNr = 1;
        let FrmDt = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        let ToDt = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let CreatedDtAt = [FrmDt, ToDt];
        LastTokenNr = await this.Items.count({
            where: {
                'DoctorId': DoctorId_,
                'CreatedAt': { '$between': CreatedDtAt },
                'TokenStatusId': { '$gt': 0 }
            }
        });
        if (!LastTokenNr) {
            LastTokenNr = 1;
        } else { LastTokenNr++; }

        return LastTokenNr;
    }

    public async GetAppointmentDisplays(apiReq?: ApiRequest<AppointmentDisplayFilters>):
        Promise<ApiResponse<AppointmentDisplayAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('TokenStatus'));
        include.push(this.GetReference('OPDRoom'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'QmsLocationId'], required: false,
            include: [this.GetReference('Title'), this.GetReference('OPDRoom')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AppointmentDisplayFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AppointmentDisplayFilters.DisplayNo:
                        where['DisplayNo'] = param.Value;
                        break;
                    case AppointmentDisplayFilters.TokenStatus:
                        where['TokenStatusId'] = param.Value;
                        break;
                    case AppointmentDisplayFilters.AppointmentId:
                        where['AppointmentId'] = param.Value;
                        break;
                    case AppointmentDisplayFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case AppointmentDisplayFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteAppointmentDisplay(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AppointmentDisplayInstance, AppointmentDisplayAttributes> {
        return this.Models.AppointmentDisplay;
    }
    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let QMSCount = await this.Items.count({
            where: {
                'Status': 1,
                'TokenStatusId': 2,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'QMSCount': QMSCount,
        };
    }
}
