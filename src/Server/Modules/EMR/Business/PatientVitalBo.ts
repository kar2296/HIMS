import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientVitalInstance, PatientVitalAttributes } from '../Model/Interface/Index';
import { PatientVitalFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NotificationService } from '../../../Notification/OneSignalNotification';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientVitalBo extends BaseBo<PatientVitalInstance, PatientVitalAttributes>  {
    public async AddPatientVital(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientVital(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientVitalById(req: BaseRequest): Promise<PatientVitalAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetVitalGroupId(req: BaseRequest): Promise<number> {
        let GroupId_ = 1;
        let GroupIdVal: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('GroupId')), 'GroupId'],
            ]
        });
        if (GroupIdVal) {
            let GroupIdAttr: any = this.GetAttribute(GroupIdVal);
            GroupId_ = GroupIdAttr['GroupId'];
            if (!GroupId_) {
                GroupId_ = 1;
            } else { GroupId_++; }
        }
        return GroupId_;
    }

    public async ManagePatientVitals(req: BaseRequest): Promise<boolean> {
        let GroupId_ = await this.GetVitalGroupId(req);
        let details: PatientVitalAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        const patientBO = BoFactory.GetBo(regbo.PatientBo, this.Request);
        const patient: any = await patientBO.GetById(details[0].PatientId);
        if (patient && (patient.NotificationToken)) {
            /* tslint:disable-next-line */
            const pushMessage: string = 'Dear ' + patient.FirstName + ', ' + ' Your vital detail is created,have look in DrHMS' + '.';
            const notificationService: any = new NotificationService();
            const body = {
                type: 'appoinment_booking',
            };
            const pushTokens: string[] = [];
            if (patient.NotificationToken) {
                pushTokens.push(patient.NotificationToken);
            }
            await notificationService.sendNotification(pushMessage, pushTokens, body);
            console.log('*******************************',pushMessage);
            console.log('*******************************',pushTokens);
        }
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (!detail.GroupId) detail.GroupId = GroupId_;
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

    public async GetPatientVitals(apiReq?: ApiRequest<PatientVitalFilters>): Promise<ApiResponse<PatientVitalAttributes[]>> {
        let where: WhereOptions<any> = {};
        let EncounterWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let IsEncounterRequired: any = true;
        include.push({ model: this.Models.VitalMaster, attributes: ['VitalName', 'DisplayOrder'], required: false });
        // include.push({ model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false });
        include.push({
            model: this.Models.User, as: 'PerformedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('PatientVitalStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientVitalFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientVitalFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientVitalFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientVitalFilters.VitalId:
                        where['VitalId'] = param.Value;
                        break;
                    case PatientVitalFilters.PerformedBy:
                        where['PerformedBy'] = param.Value;
                        break;
                    case PatientVitalFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientVitalFilters.PatientVitalStatusId:
                        where['PatientVitalStatusId'] = param.Value;
                        break;
                    case PatientVitalFilters.From:
                        where['PerformedDate'] = where['PerformedDate'] || {};
                        (where['PerformedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientVitalFilters.To:
                        where['PerformedDate'] = where['PerformedDate'] || {};
                        (where['PerformedDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientVitalFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientVitalFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientVitalFilters.GroupId:
                        where['GroupId'] = param.Value;
                        break;
                    case PatientVitalFilters.FromAdm:
                        EncounterWhere['AdmissionDate'] = EncounterWhere['AdmissionDate'] || {};
                        (EncounterWhere['AdmissionDate'] as any)['$gte'] = param.Value;
                        IsEncounterRequired = true;
                        break;
                    case PatientVitalFilters.ToPerformedDate:
                        where['PerformedDate'] = { '$between': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.Encounter,
            where: EncounterWhere,
            required: IsEncounterRequired,
            include: [
                { model: this.Models.WardMaster, required: false },
                { model: this.Models.WardRoomMaster, required: false },
                { model: this.Models.WardRoomBedMaster, required: false }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientVital(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientVital(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVitalFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientVitals(apiReq);
        let PatientVitals = data.Data[0];
        let PatientVitalList = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let VitalChartList: any = _.groupBy(data.Data, 'PerformedDate');
        let VitalHeader: any = [];
        let VitalDetails: any = [];
        VitalHeader.push({ 'VitalName': 'PerformedDate' });
        let header = 0;
        for (let idx in VitalChartList) {
            let detaildt = 0;
            let VitalValueDetails: any = [];
            let VitalValues = VitalChartList[idx];
            for (let iddx in VitalValues) {
                let ValueHeader = VitalValues[iddx].VitalName;
                if (header === 0) {
                    VitalHeader.push({ 'VitalName': ValueHeader });
                }
                let ValueDetail = VitalValues[iddx].VitalValue + ' ' + VitalValues[iddx].UOM;
                let vitaldate = '';
                let vitaltime = '';
                let dateformat = 'DD/MM/YYYY';
                let timeformat = 'HH:mm:ss';
                vitaldate = moment(VitalValues[iddx].PerformedDate).format(dateformat);
                vitaltime = moment(VitalValues[iddx].PerformedDate).format(timeformat);
                let VitalDate = vitaldate + ' ' + vitaltime;
                if (detaildt === 0) {
                    VitalValueDetails.push({ 'VitalValues': VitalDate });
                    detaildt++;
                }
                VitalValueDetails.push({ 'VitalValues': ValueDetail });
            }
            VitalDetails.push({ 'Vitals': VitalValueDetails });
            header++;
        }
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncounterFilters.FacilityId);
        let info = {
            PatientVitals: PatientVitals,
            Encounter: Encounter,
            PatientVitalList: PatientVitalList,
            VitalHeader: VitalHeader,
            VitalDetails: VitalDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('vitalchart', { header: {}, body: info });
    }
    public async PrintPatientVitalWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientVitalFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientVitals(apiReq);
        let PatientVitals = data.Data[0];
        let PatientVitalList = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let VitalChartList: any = _.groupBy(data.Data, 'PerformedDate');
        let VitalHeader: any = [];
        let VitalDetails: any = [];
        VitalHeader.push({ 'VitalName': 'PerformedDate' });
        let header = 0;
        for (let idx in VitalChartList) {
            let detaildt = 0;
            let VitalValueDetails: any = [];
            let VitalValues = VitalChartList[idx];
            for (let iddx in VitalValues) {
                let ValueHeader = VitalValues[iddx].VitalName;
                if (header === 0) {
                    VitalHeader.push({ 'VitalName': ValueHeader });
                }
                let ValueDetail = VitalValues[iddx].VitalValue + ' ' + VitalValues[iddx].UOM;
                let vitaldate = '';
                let vitaltime = '';
                let dateformat = 'DD/MM/YYYY';
                let timeformat = 'HH:mm:ss';
                vitaldate = moment(VitalValues[iddx].PerformedDate).format(dateformat);
                vitaltime = moment(VitalValues[iddx].PerformedDate).format(timeformat);
                let VitalDate = vitaldate + ' ' + vitaltime;
                if (detaildt === 0) {
                    VitalValueDetails.push({ 'VitalValues': VitalDate });
                    detaildt++;
                }
                VitalValueDetails.push({ 'VitalValues': ValueDetail });
            }
            VitalDetails.push({ 'Vitals': VitalValueDetails });
            header++;
        }
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(EncounterFilters.FacilityId);
        let info = {
            PatientVitals: PatientVitals,
            Encounter: Encounter,
            PatientVitalList: PatientVitalList,
            VitalHeader: VitalHeader,
            VitalDetails: VitalDetails,
            Preferences: printPreferencesData
        };
        return await Report.Generate('vitalchartwithoutheader', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientVitalInstance, PatientVitalAttributes> {
        return this.Models.PatientVital;
    }
}
