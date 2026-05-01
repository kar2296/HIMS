import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientMergeInstance, PatientMergeAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Registration/Business/Index';
import { PatientMergeFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class PatientMergeBo extends BaseBo<PatientMergeInstance, PatientMergeAttributes>
    implements IOptionProvider {

    public async AddPatientMerge(req: BaseRequest): Promise<number> {
        for (let idx in req.Data) {
            let strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        let patientmergeId = result.dataValues.Id;
        return patientmergeId;
    }

    public async UpdatePatientMerge(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMaxTransactionId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('TrasactionId')), 'TrasactionId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let transid_: any = this.GetAttribute(maxidInstance);
            let lastid = transid_['TrasactionId'];
            if (lastid) MaxId = lastid;
        }

        return ++MaxId;
    }

    public async ManagePatientMerge(req: BaseRequest): Promise<boolean> {
        let TrasactionId = await this.GetMaxTransactionId(req);
        req.Data.PrimaryPatient.TrasactionId = TrasactionId;
        req.Data.SecondaryPatient.TrasactionId = TrasactionId;
        let newprireq: any = {
            Data: req.Data.PrimaryPatient
        };
        let newsecndreq: any = {
            Data: req.Data.SecondaryPatient
        };
        let patbo = BoFactory.GetBo(bo.PatientBo, this.Request);
        await this.AddPatientMerge(newprireq);
        await this.AddPatientMerge(newsecndreq);
        await patbo.Update(req.Data.PrimaryPatientAfterChange);
        await patbo.Update(req.Data.SecondaryPatientAfterChange);
        return true;
    }

    public async ManagePatientUnMerge(req: BaseRequest): Promise<boolean> {


        return true;
    }


    public async GetPatientMergeProfilePic(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.PhotoPath);
        let photoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Photo: photoBase64 };
    }

    public async GetPatientMergeById(req: BaseRequest): Promise<PatientMergeAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('PatientStatus'));
        include.push(this.GetReference('MaritalStatus'));
        include.push(this.GetReference('Religion'));
        include.push(this.GetReference('Nationality'));
        include.push(this.GetReference('BloodGroup'));
        include.push({ model: this.Models.Occupation, attributes: ['Occupations', 'Code'], required: false });
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathUpdated', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DeathApproved', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Referral, as: 'Referrer', required: false,
        });

        include.push({
            model: this.Models.Encounter, attributes: ['EncounterId', 'AppointmentId', 'VisitIdentifier', 'EncounterTypeId',
                'AdmissionDate', 'DischargeDate', 'EncounterStatusId', 'DoctorName', 'GuarantorId', 'AdmissionStatusId', 'IsBillLock',
                'ReferralId', 'ReferralName', 'ReferralTypeId'],
            required: false, where: { 'IsLatest': true },
        });

        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientMerge(apiReq?: ApiRequest<PatientMergeFilters>):
        Promise<ApiResponse<PatientMergeAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientMergeFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientMergeFilters.Name:
                        (where as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Mobile': { '$eq': param.Value } }];
                        break;
                    case PatientMergeFilters.VisitID:
                        break;
                    case PatientMergeFilters.MRN:
                        where['MRN'] = param.Value;
                        break;
                    case PatientMergeFilters.DOB:
                        where['DOB'] = param.Value;
                        break;
                    case PatientMergeFilters.PhoneNumber:
                        (where as any)['$or'] = [{ 'LandLine': param.Value },
                        { 'Mobile': param.Value }];
                        break;
                    case PatientMergeFilters.RegisteredDate:
                        where['RegisteredDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientMergeFilters.PatientStatus:
                        where['PatientStatusId'] = param.Value;
                        break;
                    case PatientMergeFilters.IncludeAppointments:
                        break;
                    case PatientMergeFilters.From:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientMergeFilters.To:
                        where['RegisteredDate'] = where['RegisteredDate'] || {};
                        (where['RegisteredDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientMergeFilters.ReferrerId:
                        where['ReferrerId'] = param.Value;
                        break;
                    case PatientMergeFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientMergeFilters.Pincode:
                        where['Pincode'] = param.Value;
                        break;
                    case PatientMergeFilters.CountryName:
                        (where as any)['$or'] = [{ 'Country': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientMergeFilters.StateName:
                        (where as any)['$or'] = [{ 'State': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientMergeFilters.CityTownName:
                        (where as any)['$or'] = [{ 'City': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientMergeFilters.Area:
                        (where as any)['$or'] = [{ 'Area': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientMergeFilters.AppointmentStatus:
                        break;
                    case PatientMergeFilters.VisitDate:
                        break;
                    case PatientMergeFilters.ConsultationStatus:
                        break;
                    case PatientMergeFilters.ShowTempPatient:
                        break;
                    case PatientMergeFilters.TransactionId:
                        where['TransactionId'] = param.Value;
                        break;
                    case PatientMergeFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientMergeFilters.NRIC:
                        break;
                    case PatientMergeFilters.visiteddate:
                        break;
                    case PatientMergeFilters.IsAdmitted:
                        break;
                    case PatientMergeFilters.EncFacilityId:
                        break;
                    case PatientMergeFilters.PatFacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientMergeFilters.GuardianName:
                        (where as any)['$or'] = [{ 'GuardianName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientMergeFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientMergeFilters.VisitTypeId:
                        break;
                    case PatientMergeFilters.MRNShortCode:
                        (where as any)['$or'] = [{ 'MRNShortCode': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        // where['MRNShortCode'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['RegisteredDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientMerge(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientMergeInstance, PatientMergeAttributes> {
        return this.Models.PatientMerge;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientMergeFilters>):
        Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['FirstName', 'Text'],
            'FirstName', 'MiddleName', 'LastName', 'DOB', 'Age', 'Mobile', 'MRN', 'GenderId',
            'TitleId', 'PatientStatusId', 'GuarantorId', 'RegisteredDate'];
        let val = await this.GetPatientMerge(apiReq);
        return { [key]: val.Data };
    }

}
