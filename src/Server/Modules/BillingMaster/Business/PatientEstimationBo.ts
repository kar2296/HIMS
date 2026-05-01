import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientEstimationInstance, PatientEstimationAttributes } from '../Model/Interface/Index';
import { PatientEstimationFilters, PatientEstimationDetailsFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../BillingMaster/Business/Index';
import { join } from 'path';
import * as regbo from '../../Registration/Business/Index';
import {
    PatientFilters
} from '../../Registration/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientEstimationBo extends BaseBo<PatientEstimationInstance, PatientEstimationAttributes> {
    public async AddPatientEstimation(req: BaseRequest): Promise<any> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        if (!result) {
            console.error('Failed to save header data');
            return null;
        }
        let detailBO = BoFactory.GetBo(bo.PatientEstimationDetailsBo, this.Request);
        let PatientEstimationId = result.dataValues.Id;
        await detailBO.ManagePatientEstimationDetails(PatientEstimationId, req.Data.Details);
        return PatientEstimationId;

    }

    public async UpdatePatientEstimation(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientEstimationDetailsBo, this.Request);
            let PatientEstimationId = req.Data.Header.Id;
            await detailBO.ManagePatientEstimationDetails(PatientEstimationId, req.Data.Details);

            return PatientEstimationId;
        }
        return result;
    }

    public async GetPatientEstimationById(req: BaseRequest): Promise<PatientEstimationAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);

    }

    public async GetPatientEstimation(apiReq?: ApiRequest<PatientEstimationFilters>): Promise<ApiResponse<PatientEstimationAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqItemSearch: boolean = false;
        let ItemWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        include.push(this.GetReference('BedType'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Relationship'));
        include.push(this.GetReference('SaveType'));
        include.push(this.GetReference('Gender'));
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'Age', 'FirstName', 'LastName'],
            required: false
        });
        include.push({
            model: this.Models.Facility,
            attributes: ['FacilityId'],
            required: false
        });
        include.push({
            model: this.Models.DoctorInvoiceDetails,
            attributes: ['DoctorId', 'DoctorName'],
            required: false
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['CreatedBy'], required: false,
        });
        if (apiReq && apiReq.Params && Array.isArray(apiReq.Params)) {
            apiReq.Params.forEach((param) => {
                if (this.IsValidParam(param)) {
                    switch (param.Key) {
                        case PatientEstimationFilters.Id:
                            where['Id'] = param.Value;
                            break;
                        case PatientEstimationFilters.SaveType:
                            where['SaveTypeId'] = param.Value;
                            break;
                        case PatientEstimationFilters.From:
                            where['EstimationDate'] = where['EstimationDate'] || {};
                            (where['EstimationDate'] as any)['$gte'] = param.Value;
                            break;
                        case PatientEstimationFilters.To:
                            where['EstimationDate'] = where['EstimationDate'] || {};
                            (where['EstimationDate'] as any)['$lte'] = param.Value;
                            break;
                        default:
                            throw 'Not Implemented';
                    }
                }
            });
        } else {
            console.error('apiReq.Params is undefined, null, or not an array');
        }
        include.push({
            model: this.Models.PatientEstimationDetails,
            required: isReqItemSearch,
            where: ItemWhere,
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientEstimation(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientEstimation(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientEstimationFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientEstimation(apiReq);
        let PatientEstimation: any = data.Data[0];

        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: PatientEstimation.PatientId }]
        };
        let patientData = await patientBo.GetPatients(patReq);
        let patientinfo: any = {};
        patientinfo = patientData.Data[0];
        let estimationDetailsBo = BoFactory.GetBo(bo.PatientEstimationDetailsBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientEstimationDetailsFilters.PatientEstimationId, Value: PatientEstimation.Id }]
        };
        let estimationDetailsData = await estimationDetailsBo.GetPatientEstimationDetails(encReq);
        let estimationDetails: any = [];
        estimationDetailsData.Data.forEach((Detail: any) => {
            let estimatedata = Detail;
            estimationDetails.push(estimatedata);
        });
        let totals: number = 0;
        estimationDetailsData.Data.forEach((Detail: any) => {
            totals += parseFloat(Detail.EstimationAmount);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientEstimation.FacilityId);
        let HeaderTitle = 'Patient Estimation Billing';
        let info = {
            HeaderTitle: HeaderTitle,
            PatientEstimation: PatientEstimation,
            patientData: patientinfo,
            EstimationDetailsData: estimationDetails,
            TotalAmount:totals,
            Preferences: printPreferencesData
        };
        let reportKey = 'patientestimation';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) pdfOption = {
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
        }; else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(reportKey, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintPatientEstimationwithoutheader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientEstimationFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientEstimation(apiReq);
        let PatientEstimation: any = data.Data[0];

        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: PatientEstimation.PatientId }]
        };
        let patientData = await patientBo.GetPatients(patReq);
        let patientinfo: any = {};
        patientinfo = patientData.Data[0];
        let estimationDetailsBo = BoFactory.GetBo(bo.PatientEstimationDetailsBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientEstimationDetailsFilters.PatientEstimationId, Value: PatientEstimation.Id }]
        };
        let estimationDetailsData = await estimationDetailsBo.GetPatientEstimationDetails(encReq);
        let estimationDetails: any = [];
        estimationDetailsData.Data.forEach((Detail: any) => {
            let estimatedata = Detail;
            estimationDetails.push(estimatedata);
        });
        let totals: number = 0;
        estimationDetailsData.Data.forEach((Detail: any) => {
            totals += parseFloat(Detail.EstimationAmount);
        });
        let HeaderTitle = 'Patient Estimation Billing';
        let info = {
            HeaderTitle: HeaderTitle,
            PatientEstimation: PatientEstimation,
            patientData: patientinfo,
            EstimationDetailsData: estimationDetails,
            TotalAmount:totals
        };
        let reportKey = 'patientestimationwithoutheader';
        let pdfOptionJSON = await Report.GetPdfOption(reportKey);
        let pdfOption: any = null;
        if (!pdfOptionJSON) pdfOption = {
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
        }; else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(reportKey, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<PatientEstimationInstance, PatientEstimationAttributes> {
        return this.Models.PatientEstimation;
    }
}
