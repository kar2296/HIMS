import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { ReferralFeedbackInstance, ReferralFeedbackAttributes } from '../Model/Interface/Index';
import { ReferralFeedbackFilters } from '../Common/Filters.e';

export class ReferralFeedbackBo extends BaseBo<ReferralFeedbackInstance, ReferralFeedbackAttributes> implements IOptionProvider {
    public async AddReferralFeedback(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateReferralFeedback(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetReferralFeedbackById(req: BaseRequest): Promise<ReferralFeedbackAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetReferralFeedbacks(apiReq?: ApiRequest<ReferralFeedbackFilters>):
        Promise<ApiResponse<ReferralFeedbackAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
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
        include.push(this.GetReference('ReferralType'));
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
                    case ReferralFeedbackFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.PatientNameMRN:
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
                    case ReferralFeedbackFilters.VisitNo:
                        where['VisitNo'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.PhoneNo:
                        where['PhoneNo'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.ReferralDate:
                        where['ReferralDate'] = { '$between': param.Value || '' };
                        break;
                    case ReferralFeedbackFilters.SourceId:
                        where['SourceId'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.ReferralId:
                        where['ReferralId'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.ReferralStatusId:
                        where['ReferralStatusId'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.From:
                        where['ReferralDate'] = where['ReferralDate'] || {};
                        (where['ReferralDate'] as any)['$gte'] = param.Value;
                        break;
                    case ReferralFeedbackFilters.To:
                        where['ReferralDate'] = where['ReferralDate'] || {};
                        (where['ReferralDate'] as any)['$gte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteReferralFeedback(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ReferralFeedbackFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['TemplateName', 'Text'], 'TemplateName', 'TemplateCode'];
        let val = await this.GetReferralFeedbacks(apiReq);
        return { [key]: val.Data };
    }
    public async PrintReferralFeedback(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ReferralFeedbackFilters.Id, Value: req.Id }]
        };
        let data = await this.GetReferralFeedbacks(apiReq);
        let ReferralFeedback = data.Data[0];
        let info = {
            ReferralFeedback: ReferralFeedback,

        };
        return await Report.Generate('ReferralFeedback', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<ReferralFeedbackInstance, ReferralFeedbackAttributes> {
        return this.Models.ReferralFeedback;
    }
}
