import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { IPFileRequestInstance, IPFileRequestAttributes } from '../Model/Interface/Index';
import { IPFileRequestFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import { BoFactory } from '../../Base/Business/Index';

export class IPFileRequestBo extends BaseBo<IPFileRequestInstance, IPFileRequestAttributes> {
    public async AddIPFileRequest(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let IPFileRequestId = result.dataValues.Id;
        return IPFileRequestId;
    }

    public async UpdateIPFileRequest(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetIPFileRequestById(req: BaseRequest): Promise<IPFileRequestAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB'],
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApproveUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TransferredUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReceivedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetIPFileRequests(apiReq?: ApiRequest<IPFileRequestFilters>): Promise<ApiResponse<IPFileRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('MRDIPFileStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApproveUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'TransferredUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReceivedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case IPFileRequestFilters.Id:
                        where['IPFileRequestId'] = param.Value;
                        break;
                    case IPFileRequestFilters.PatientName:
                        (where as any)[Op.or] = [{ PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case IPFileRequestFilters.VisitNo:
                        (where as any)[Op.or] = [{ VisitNo: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case IPFileRequestFilters.DischargeDate:
                        where['DischargeDate'] = { '$between': param.Value || '' };
                        break;
                    case IPFileRequestFilters.From:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$gte'] = param.Value;
                        break;
                    case IPFileRequestFilters.To:
                        where['DischargeDate'] = where['DischargeDate'] || {};
                        (where['DischargeDate'] as any)['$lte'] = param.Value;
                        break;
                    case IPFileRequestFilters.MRDIPFileStatusId:
                        where['MRDIPFileStatusId'] = param.Value;
                        break;
                    case IPFileRequestFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case IPFileRequestFilters.RequestDate:
                        where['RequestDate'] = { '$between': param.Value || '' };
                        break;
                    case IPFileRequestFilters.RequestFrom:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case IPFileRequestFilters.RequestTo:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'Mobile'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title')]
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteIPFileRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<IPFileRequestInstance, IPFileRequestAttributes> {
        return this.Models.IPFileRequest;
    }
    public async PrintNotifyIncompleteFileReport(apiReq?: ApiRequest<IPFileRequestFilters>): Promise<any> {
        let data = await this.GetIPFileRequests(apiReq);
        let NotifyIncomplete = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let DoctorName = apiReq.Data.DoctorName;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            NotifyIncomplete: NotifyIncomplete,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,
        };
        let pdfOption: any = null;
        let key = 'notifyincompletefilereport';
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
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
