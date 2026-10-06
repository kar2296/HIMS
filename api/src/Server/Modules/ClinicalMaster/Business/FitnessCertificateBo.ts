import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { FitnessCertificateInstance, FitnessCertificateAttributes } from '../Model/Interface/Index';
import { FitnessCertificateFilters } from '../Common/Filters.e';

export class FitnessCertificateBo extends BaseBo<FitnessCertificateInstance, FitnessCertificateAttributes> implements IOptionProvider {
    public async AddFitnessCertificate(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateFitnessCertificate(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetFitnessCertificateById(req: BaseRequest): Promise<FitnessCertificateAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetFitnessCertificates(apiReq?: ApiRequest<FitnessCertificateFilters>):
        Promise<ApiResponse<FitnessCertificateAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: [
                'FirstName', 'LastName', 'MRN', 'Age',
                'MRNTypeId', 'TitleId', 'GenderId', 'Mobile', 'DOB', 'AddressLine1', 'AddressLine2', 'Area', 'City', 'State', 'Country',
                'LandLine', 'NationalityIdentifier'
            ],
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push(this.GetReference('CertificateStatus'));
        include.push({
            model: this.Models.NoteTemplate, required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'MiddleName', 'LastName'], as: 'Doctor', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'UpdatedByUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case FitnessCertificateFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case FitnessCertificateFilters.PatientNameMRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'Mobile': { '$like': (param.Value || '') } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case FitnessCertificateFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case FitnessCertificateFilters.CertificateStatus:
                        where['CertificateStatusId'] = param.Value;
                        break;
                    case FitnessCertificateFilters.NoteTemplateId:
                        where['NoteTemplateId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteFitnessCertificate(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<FitnessCertificateFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['TemplateName', 'Text'], 'TemplateName', 'TemplateCode'];
        let val = await this.GetFitnessCertificates(apiReq);
        return { [key]: val.Data };
    }
    public async PrintFitnessCertificate(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: FitnessCertificateFilters.Id, Value: req.Id }]
        };
        let data = await this.GetFitnessCertificates(apiReq);
        let FitnessCertificate = data.Data[0];
        let info = {
            FitnessCertificate: FitnessCertificate,

        };
        return await Report.Generate('fitnesscertificate', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<FitnessCertificateInstance, FitnessCertificateAttributes> {
        return this.Models.FitnessCertificate;
    }
}
