import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { EventDashboardInstance, EventDashboardAttributes } from '../Model/Interface/Index';
import { EventDashboardFilters } from '../Common/Filters.e';
import { ReferenceValueFilters } from '../Common/Filters.e';
import * as appbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as moment from 'moment';

export enum SmsStatus {
    Success = 0,
    Pending = 1,
    Error = 2,
    ResponseError = 3,
    Others = 4
}

export class EventDashboardBo extends BaseBo<EventDashboardInstance, EventDashboardAttributes> implements IOptionProvider {
    public async AddEventDashboard(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEventDashboard(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSMSOutBound(response: any, sent_data: any): Promise<boolean> {
        let errorcode: any = '';
        let smsstatus: number = -1;
        let errormsg: any = '';
        if (response) {
            if (response.body) { // Response
                try {
                    let resjson = JSON.parse(response.body);
                    let SMSSuccess: number = 0;
                    if(resjson && resjson === 1) SMSSuccess = 1;
                    else if(resjson && resjson.ErrorCode === '000') SMSSuccess = 1;
                    if (SMSSuccess === 1) {
                        if(resjson.ErrorCode)  errorcode = resjson.ErrorCode;
                        else errorcode = 100;
                        smsstatus = SmsStatus.Success;
                        if(resjson.ErrorMessage) errormsg = resjson.ErrorMessage;
                        else errormsg = 'SMSSuccess';
                    } else {
                        errorcode = resjson.ErrorCode;
                        smsstatus = SmsStatus.Pending;
                        errormsg = JSON.stringify(response);
                    }
                } catch (ex) {
                    errorcode = 1000;
                    smsstatus = SmsStatus.ResponseError;
                    errormsg = JSON.stringify(response);
                }
            } else { // Error
                errorcode = 1000;
                smsstatus = SmsStatus.Error;
                errormsg = JSON.stringify(response);
            }
        }
        console.log(errorcode);
        if (errormsg) {
            let vEventStatusId = 1;
            let detail: any = {};
            if (smsstatus === SmsStatus.Success) {
                vEventStatusId = 2;
            } else if (smsstatus === SmsStatus.Pending) {
                vEventStatusId = 1;
            } else { // Error
                vEventStatusId = 3;
            }

            detail = {
                Id: 0,
                EventDirectionId: 2,
                EventTypeId: 1,
                EventName: null,
                EventSourceId: 1,
                EventSourceKey: null,
                EventDestinationId: 1,
                EvenDestinationKey: null,
                EventEntityId: null,
                ConsultationId: null,
                EncounterId: null,
                PatientId: null,
                EventDataTypeId: 1,
                EventData: sent_data,
                EventStatusId: vEventStatusId,
                EventMessage: errormsg,
                EventTrace: null,
                PracticeId: null
            };
            if (detail.Id === 0) {
                await this.Save(detail);
            }
        }

        return true;
    }

    public async ManageOutBound(patientid: number, req: BaseRequest): Promise<boolean> {
        let eventTemplateBO = BoFactory.GetBo(appbo.EventTemplateBo, this.Request);
        let ptDemTemplateInfo =
            await eventTemplateBO.GetTemplateInfo('Registration', 'PatientDemographics', 3);
        if (ptDemTemplateInfo) {
            let detail: any = {};
            let message = await this.ManageHL7Format(req);
            detail.Id = 0;
            detail.EventDirectionId = 2;
            detail.EventTypeId = 3;
            detail.EventName = null;
            detail.EventSourceId = 1;
            detail.EventSourceKey = null;
            detail.EventDestinationId = 2;
            detail.EvenDestinationKey = null;
            detail.EventEntityId = null;
            detail.ConsultationId = null;
            detail.EncounterId = null;
            detail.PatientId = patientid;
            detail.EventDataTypeId = 1;
            detail.EventData = message;
            detail.EventStatusId = 1;
            detail.EventMessage = message;
            detail.EventTrace = null;
            detail.PracticeId = null;
            if (detail.Id === 0) {
                await this.Save(detail);
            }
        }
        return true;
    }

    public async ManageSMSOutBoundWithoutSession(response: any, sent_data: any): Promise<boolean> {
        let errorcode: any = '';
        let smsstatus: number = -1;
        let errormsg: any = '';
        if (response) {
            if (response.body) { // Response
                try {
                    let resjson = JSON.parse(response.body);
                    let SMSSuccess: number = 0;
                    if (resjson && resjson === 1) SMSSuccess = 1;
                    else if (resjson && resjson.ErrorCode === '000') SMSSuccess = 1;
                    if (SMSSuccess === 1) {
                        if (resjson.ErrorCode) errorcode = resjson.ErrorCode;
                        else errorcode = 100;
                        smsstatus = SmsStatus.Success;
                        if (resjson.ErrorMessage) errormsg = resjson.ErrorMessage;
                        else errormsg = 'SMSSuccess';
                    } else {
                        errorcode = resjson.ErrorCode;
                        smsstatus = SmsStatus.Pending;
                        errormsg = JSON.stringify(response);
                    }
                } catch (ex) {
                    errorcode = 1000;
                    smsstatus = SmsStatus.ResponseError;
                    errormsg = JSON.stringify(response);
                }
            } else { // Error
                errorcode = 1000;
                smsstatus = SmsStatus.Error;
                errormsg = JSON.stringify(response);
            }
        }
        console.log(errorcode);
        if (errormsg) {
            let vEventStatusId = 1;
            let detail: any = {};
            if (smsstatus === SmsStatus.Success) {
                vEventStatusId = 2;
            } else if (smsstatus === SmsStatus.Pending) {
                vEventStatusId = 1;
            } else { // Error
                vEventStatusId = 3;
            }

            detail = {
                Id: 0,
                EventDirectionId: 2,
                EventTypeId: 1,
                EventName: null,
                EventSourceId: 1,
                EventSourceKey: null,
                EventDestinationId: 1,
                EvenDestinationKey: null,
                EventEntityId: null,
                ConsultationId: null,
                EncounterId: null,
                PatientId: null,
                EventDataTypeId: 1,
                EventData: sent_data,
                EventStatusId: vEventStatusId,
                EventMessage: errormsg,
                EventTrace: null,
                PracticeId: null
            };
            if (detail.Id === 0) {
                await this.SaveWithOutSession(detail);
            }
        }

        return true;
    }
    /**
     * getRefernceValue
     */
    public async getRefernceValue(GroupCode: string, ValueCodeId: number) {
        let result = '';
        let AppManBORef = BoFactory.GetBo(appbo.ReferenceValueBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: GroupCode },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: ValueCodeId }
            ]
        };
        let Refres = await AppManBORef.GetReferenceValues(apiReq);
        if (Refres)
            if (Refres.Data.length > 0)
                result = Refres.Data[0].Description;

        return result;
    }


    public async ManageHL7Format(req: BaseRequest): Promise<string> {
        let PatientData = req.Data;
        let Gender = await this.getRefernceValue('Gender', PatientData.GenderId);
        console.log(Gender);
        let currentdate = new Date();
        let currentdatesendingformat = moment(currentdate).format('YYYYMMDDHHmmss');
        let dataformation: string = '';
        dataformation += 'MSH|^~\&|HM|HM|REC_APPLICATION|REC_FACILITY|' + currentdatesendingformat + '||ADT^A04||P|2.3||||';
        dataformation += 'EVN|A04|' + currentdatesendingformat + '|||';
        dataformation += 'PID|1||' + PatientData.MRN + '||' + PatientData.LastName + '^';
        dataformation += '' + PatientData.FirstName + '^' + PatientData.MiddleName;
        dataformation += '||' + PatientData.DOB + '|' + Gender + '|||';
        dataformation += '' + PatientData.AddressLine1 + '^' + PatientData.AddressLine2;
        dataformation += '^' + PatientData.City + '^' + PatientData.State + '^';
        dataformation += '' + PatientData.Pincode + '||' + PatientData.Phonenr + '^^^';
        dataformation += '' + PatientData.Email + '|||||1719|99999999||||||||||||||||||||';
        dataformation += 'PV1|1|O||||||||||||||||||||||||||||||||||||||||||||||||||';
        return dataformation;
    }

    public async GetEventDashboardById(req: BaseRequest): Promise<EventDashboardAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEventDashboards(apiReq?: ApiRequest<EventDashboardFilters>): Promise<ApiResponse<EventDashboardAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('EventType'));
        include.push(this.GetReference('EventSource'));
        include.push(this.GetReference('EventStatus'));
        include.push(this.GetReference('EventDataType'));
        include.push(this.GetReference('EventDestination'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EventDashboardFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EventDashboardFilters.EventDirectionId:
                        where['EventDirectionId'] = param.Value;
                        break;
                    case EventDashboardFilters.EventStatusId:
                        where['EventStatusId'] = param.Value;
                        break;
                    case EventDashboardFilters.EventTypeId:
                        where['EventTypeId'] = param.Value;
                        break;
                    case EventDashboardFilters.EventSourceId:
                        where['EventSourceId'] = param.Value;
                        break;
                    case EventDashboardFilters.EventDataType:
                        where['EventDataType'] = param.Value;
                        break;
                    case EventDashboardFilters.EventData:
                        where['EventData'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case EventDashboardFilters.EventMessage:
                        where['EventMessage'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEventDashboard(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EventDashboardFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetEventDashboards(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EventDashboardInstance, EventDashboardAttributes> {
        return this.Models.EventDashboard;
    }
}
