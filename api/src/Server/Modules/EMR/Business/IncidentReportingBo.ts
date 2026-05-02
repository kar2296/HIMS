import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IncidentReportingInstance, IncidentReportingAttributes } from '../Model/Interface/Index';
import { IncidentReportingFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import { readFileSync } from 'fs';


export class IncidentReportingBo extends BaseBo<IncidentReportingInstance, IncidentReportingAttributes> {
    public async AddIncidentReporting(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async UpdateIncidentReporting(req: BaseRequest): Promise<boolean> {
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

    public async GetIncidentReportingById(req: BaseRequest):
        Promise<IncidentReportingAttributes> {
        let include: Array<IncludeOptions> = [];
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
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetIncidentReportings(apiReq?: ApiRequest<IncidentReportingFilters>):
        Promise<ApiResponse<IncidentReportingAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
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
        include.push(this.GetReference('IncidentReportingType'));
        include.push(this.GetReference('IncidentReportingStatus'));
        include.push(this.GetReference('IncidentOccurred'));
        include.push(this.GetReference('ClassificationIncident'));
        include.push(this.GetReference('TypeOfIncident'));
        include.push(this.GetReference('AdverseDrug'));
        include.push(this.GetReference('Fall'));
        include.push(this.GetReference('SurgicalError'));
        include.push(this.GetReference('PatientCare'));
        include.push(this.GetReference('Miscellaneous'));
        include.push(this.GetReference('Equipment'));
        include.push(this.GetReference('Security'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IncidentReportingFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case IncidentReportingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case IncidentReportingFilters.IncidentReportingStatusId:
                        where['IncidentReportingStatusId'] = param.Value;
                        break;
                    case IncidentReportingFilters.IncidentReportingTypeId:
                        where['IncidentReportingTypeId'] = param.Value;
                        break;
                    case IncidentReportingFilters.FromDate:
                        where['IncidentReportingTime'] = where['IncidentReportingTime'] || {};
                        (where['IncidentReportingTime'] as any)['$gte'] = param.Value;
                        break;
                    case IncidentReportingFilters.ToDate:
                        where['IncidentReportingTime'] = where['IncidentReportingTime'] || {};
                        (where['IncidentReportingTime'] as any)['$lte'] = param.Value;
                        break;
                    case IncidentReportingFilters.ReportedBy:
                        where['ReportedBy'] = param.Value;
                        break;
                    case IncidentReportingFilters.EmpId:
                        where['EmpId'] = param.Value;
                        break;
                    case IncidentReportingFilters.UHID:
                        where['UHID'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
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
    public async PrintIncidentReporting(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: IncidentReportingFilters.Id, Value: req.Id }]
        };
        let data = await this.GetIncidentReportings(apiReq);
        let Data = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Data.FacilityId);
        // Preferences: printPreferencesData
        let info = {
            IncidentReporting: Data,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'incidentreporting';
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

    public async DeleteIncidentReporting(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IncidentReportingInstance, IncidentReportingAttributes> {
        return this.Models.IncidentReporting;
    }
}
