import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AdverseDrugReactionInstance, AdverseDrugReactionAttributes } from '../Model/Interface/Index';
import { AdverseDrugReactionFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import { readFileSync } from 'fs';

export class AdverseDrugReactionBo extends BaseBo<AdverseDrugReactionInstance, AdverseDrugReactionAttributes> {
    public async AddAdverseDrugReaction(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async UpdateAdverseDrugReaction(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async UploadAttachment(req: BaseRequest): Promise<boolean> {
        if (req.Data.UploadedFile === 'Attachment1') {
            let Attachment1 = this.Request.file;
            if (Attachment1) {
                let filepath: string = Attachment1.path;
                req.Data.Attachment1 = filepath;
            }
        } else if (req.Data.UploadedFile === 'Attachment2') {
            let Attachment2 = this.Request.file;
            if (Attachment2) {
                let filepath: string = Attachment2.path;
                req.Data.Attachment2 = filepath;
            }
        }
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetViewAttachment1(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Attachment1);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }
    public async GetViewAttachment2(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Attachment2);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }
    public async GetAdverseDrugReactionById(req: BaseRequest):
        Promise<AdverseDrugReactionAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Diagnosis, attributes: ['DiagnosisName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('AdverseDrugReactionType'));
        include.push(this.GetReference('AdverseDrugReactionStatus'));
        include.push(this.GetReference('SourceofDrug'));
        include.push(this.GetReference('TypeofReaction'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetAdverseDrugReactions(apiReq?: ApiRequest<AdverseDrugReactionFilters>):
        Promise<ApiResponse<AdverseDrugReactionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Diagnosis, attributes: ['DiagnosisName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('AdverseDrugReactionType'));
        include.push(this.GetReference('AdverseDrugReactionStatus'));
        include.push(this.GetReference('SourceofDrug'));
        include.push(this.GetReference('TypeofReaction'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AdverseDrugReactionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.AdverseDrugReactionStatusId:
                        where['AdverseDrugReactionStatusId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.AdverseDrugReactionTypeId:
                        where['AdverseDrugReactionTypeId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.PatientNameMRN:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case AdverseDrugReactionFilters.FromDate:
                        where['AdverseDateTime'] = where['AdverseDateTime'] || {};
                        (where['AdverseDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.ToDate:
                        where['AdverseDateTime'] = where['AdverseDateTime'] || {};
                        (where['AdverseDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.SourceofDrugId:
                        where['SourceofDrugId'] = param.Value;
                        break;
                    case AdverseDrugReactionFilters.TypeofReactionId:
                        where['TypeofReactionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async PrintAdverseDrugReaction(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AdverseDrugReactionFilters.Id, Value: req.Id }]
        };
        let data = await this.GetAdverseDrugReactions(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);

        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        // Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        // Preferences: printPreferencesData
        let info = {
            Patient: patientData,
            AdverseDrugReaction: Data,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'adversedrugreaction';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '0.5in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async DeleteAdverseDrugReaction(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AdverseDrugReactionInstance, AdverseDrugReactionAttributes> {
        return this.Models.AdverseDrugReaction;
    }
    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let admissioncount = await this.Items.count({
            where: {
                'Status': 1,
                'AdverseDrugReactionStatusId': { '$in': [2] },
                'DoctorId': req.Data.DoctorId,
            }
        });
        return {
            'admissioncount': admissioncount,
        };
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let AdmitCount = await this.Items.count({
            where: {
                'Status': 1,
                // 'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'AdmitCount': AdmitCount
        };
    }
}
