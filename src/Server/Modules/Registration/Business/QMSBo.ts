import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { QMSInstance, QMSAttributes } from '../Model/Interface/Index';
import { QMSFilters, PatientFilters } from '../Common/Filters.e';
import * as moment from 'moment';
import { BoFactory } from '../../Base/Business/Index';
import * as Regbo from '../../Registration/Business/Index';

export class QMSBo extends BaseBo<QMSInstance, QMSAttributes> implements IOptionProvider {
    public async AddQMS(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        req.Data.TokenNo = await this.GetLastTokenCount();
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async GetLastTokenCount(): Promise<any> {
        let LastTokenNr = 1;
        let FrmDt = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        let ToDt = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let CreatedDtAt = [FrmDt, ToDt];
        LastTokenNr = await this.Items.count({
            where: {
                'CreatedAt': { '$between': CreatedDtAt },
            }
        });
        if (!LastTokenNr) {
            LastTokenNr = 1;
        } else { LastTokenNr++; }

        return LastTokenNr;
    }

    public async createTokenForOldPatient(req: BaseRequest): Promise<number> {
        let QMSInfo = req.Data;
        let TokenNo = await this.GetLastTokenCount();
        let QMSReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: QMSFilters.PatientId, Value: QMSInfo.PatientId }
            ]
        };
        let QMSData = await this.GetQMS(QMSReq);
        let InsertQMSInfo: any = {};
        InsertQMSInfo = {
            Id: 0,
            FacilityId: QMSData.Data[0].FacilityId,
            QMSReasonId: 2,
            PatientId: QMSData.Data[0].PatientId,
            TitleId: QMSData.Data[0].TitleId,
            MRN: QMSData.Data[0].MRN,
            FirstName: QMSData.Data[0].FirstName,
            MiddleName: QMSData.Data[0].MiddleName,
            LastName: QMSData.Data[0].LastName,
            Age: QMSData.Data[0].Age,
            DOB: QMSData.Data[0].DOB,
            GenderId: QMSData.Data[0].GenderId,
            LandLine: QMSData.Data[0].LandLine,
            Mobile: QMSData.Data[0].Mobile,
            Email: QMSData.Data[0].Email,
            RegisteredDate: new Date(),
            TokenNo: TokenNo,
            GuardianName: QMSData.Data[0].GuardianName,
            ReligionId: QMSData.Data[0].ReligionId,
            AddressLine1: QMSData.Data[0].AddressLine1,
            AddressLine2: QMSData.Data[0].AddressLine2,
            Pincode: QMSData.Data[0].Pincode,
            Area: QMSData.Data[0].Area,
            City: QMSData.Data[0].City,
            State: QMSData.Data[0].State,
            Country: QMSData.Data[0].Country,
            PinCodeId: QMSData.Data[0].PinCodeId,
            CityId: QMSData.Data[0].CityId,
            StateId: QMSData.Data[0].StateId,
            CountryId: QMSData.Data[0].CountryId,
            ActiveStatusId: 2
        };
        let result = await this.Save(InsertQMSInfo);

        return result.dataValues.Id;
    }

    public async updatePatientQMSData(QMSId: number, PatientId: number, PatientMrn: string): Promise<void> {
        let PatientReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientFilters.Id, Value: PatientId }
            ]
        };
        let PatientBo = BoFactory.GetBo(Regbo.PatientBo, this.Request);
        let PatientData = await PatientBo.GetPatients(PatientReq);
        let Patient = PatientData.Data[0];
        if (QMSId && QMSId > 0) {
            let QMSInfo = await this.GetQMSById({ Id: QMSId });
            QMSInfo.PatientId = Patient.Id;
            QMSInfo.TitleId = Patient.TitleId;
            QMSInfo.MRN = PatientMrn;
            QMSInfo.FirstName = Patient.FirstName;
            QMSInfo.MiddleName = Patient.MiddleName;
            QMSInfo.LastName = Patient.LastName;
            QMSInfo.Age = Patient.Age;
            QMSInfo.DOB = Patient.DOB;
            QMSInfo.GenderId = Patient.GenderId;
            QMSInfo.LandLine = Patient.LandLine;
            QMSInfo.Mobile = Patient.Mobile;
            QMSInfo.Email = Patient.Email;
            QMSInfo.GuardianName = Patient.GuardianName;
            QMSInfo.ReligionId = Patient.ReligionId;
            QMSInfo.AddressLine1 = Patient.AddressLine1;
            QMSInfo.AddressLine2 = Patient.AddressLine2;
            QMSInfo.Pincode = Patient.Pincode;
            QMSInfo.Area = Patient.Area;
            QMSInfo.City = Patient.City;
            QMSInfo.State = Patient.State;
            QMSInfo.Country = Patient.Country;
            QMSInfo.PinCodeId = Patient.PinCodeId;
            QMSInfo.CityId = Patient.CityId;
            QMSInfo.StateId = Patient.StateId;
            QMSInfo.CountryId = Patient.CountryId;
            QMSInfo.IsPatientCreated = true;
            QMSInfo.QMSStatusId = 2;
            await this.Update(QMSInfo);
        }

    }

    public async UpdateQMS(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetQMSById(req: BaseRequest): Promise<QMSAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetQMS(apiReq?: ApiRequest<QMSFilters>): Promise<ApiResponse<QMSAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('QMSReason'));
        include.push(this.GetReference('QMSStatus'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case QMSFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case QMSFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case QMSFilters.QMSReasonId:
                        where['QMSReasonId'] = param.Value;
                        break;
                    case QMSFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case QMSFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case QMSFilters.FirstName:
                        where['FirstName'] = param.Value;
                        break;
                    case QMSFilters.Mobile:
                        where['Mobile'] = param.Value;
                        break;
                    case QMSFilters.Email:
                        where['Email'] = param.Value;
                        break;
                    case QMSFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case QMSFilters.NameAndMrnSearch:
                        (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$eq': param.Value } }];
                        break;
                    case QMSFilters.TokenNo:
                        where['TokenNo'] = param.Value;
                        break;
                    case QMSFilters.IsPatientCreated:
                        where['IsPatientCreated'] = param.Value;
                        break;
                    case QMSFilters.QMSStatusId:
                        where['QMSStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteQMS(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<QMSInstance, QMSAttributes> {
        return this.Models.QMS;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<QMSFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['QMS', 'Text'], 'QMS', 'Code'];
        let val = await this.GetQMS(apiReq);
        return { [key]: val.Data };
    }
}
