import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { AdmissionRequestInstance, AdmissionRequestAttributes } from '../Model/Interface/Index';
import { AdmissionRequestFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import { join } from 'path';

export class AdmissionRequestBo extends BaseBo<AdmissionRequestInstance, AdmissionRequestAttributes> {
    public async AddAdmissionRequest(req: BaseRequest): Promise<number> {
        let generateAddmisionReq = 0;
        if (req.Data.AdmissionRequestStatusId === 2) {
            req.Data.RequestIdentifier = null; // await Sequence.Next(SequenceKeys.AdmissionRequest);
            generateAddmisionReq = 1;
        }
        let result = await this.Save(req.Data);
        let admissionId = result.dataValues.Id;
        if (generateAddmisionReq === 1) {
            this.deferSequenceKey(admissionId, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.AdmissionRequest));
        }

        return admissionId;
    }

    public async UpdateAdmissionRequest(req: BaseRequest): Promise<boolean> {
        let generateAddmisionReq = 0;
        if (req.Data.AdmissionRequestStatusId === 2) {
            req.Data.RequestIdentifier = null; // await Sequence.Next(SequenceKeys.AdmissionRequest);
            generateAddmisionReq = 1;
        }
        let result = await this.Update(req.Data);
        if (generateAddmisionReq === 1) {
            this.deferSequenceKey(req.Data.Id, 'RequestIdentifier',
                this.getSequenceIdentifier(SequenceKeys.AdmissionRequest));
        }
        return result;
    }
    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'admissionrequest':
    //             count = await this.Items.count({
    //                 where: {
    //                     'AdmissionRequestStatusId': { '$in': [2] },  //COMPLETED
    //                     'DoctorId': this.GetSession().UserId
    //                 }
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }
    public async GetAdmissionRequestById(req: BaseRequest): Promise<AdmissionRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAdmissionRequests(apiReq?: ApiRequest<AdmissionRequestFilters>): Promise<ApiResponse<AdmissionRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Diagnosis, attributes: ['DiagnosisName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AdvisedDoctor', required: false,
            include: [{ model: this.Models.Department, as: 'UserDept', attributes: ['DepartmentName'], required: false },
            this.GetReference('Title')]
        });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push(this.GetReference('Priority'));
        include.push(this.GetReference('AdmissionRequestType'));
        include.push(this.GetReference('AdmittingRequestReason'));
        include.push(this.GetReference('YesNo'));
        include.push(this.GetReference('Payer'));
        include.push(this.GetReference('AdmissionRequestStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AdmissionRequestFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.AdmissionRequestStatusId:
                        where['AdmissionRequestStatusId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AdmissionRequestFilters.RemarkId:
                        where['Remarks'] = param.Value;
                        break;
                    case AdmissionRequestFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.AdmittingReasonId:
                        where['Reasons'] = param.Value;
                        break;
                    case AdmissionRequestFilters.PriorityId:
                        where['PriorityId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.AdmissionRequestTypeId:
                        where['AdmissionRequestTypeId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.DiagnosisId:
                        where['DiagnosisId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case AdmissionRequestFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case AdmissionRequestFilters.RequestNo:
                        (where as any)[Op.or] = [{ RequestIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case AdmissionRequestFilters.FromDate:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$gte'] = param.Value;
                        break;
                    case AdmissionRequestFilters.ToDate:
                        where['AdmissionDate'] = where['AdmissionDate'] || {};
                        (where['AdmissionDate'] as any)['$lte'] = param.Value;
                        break;
                    case AdmissionRequestFilters.RequestFromDate:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case AdmissionRequestFilters.RequestToDate:
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
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async PrintAdmissionRequest(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: AdmissionRequestFilters.Id, Value: req.Id }]
        };
        let data = await this.GetAdmissionRequests(apiReq);
        let Data = data.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);

        let patientData = await patientBo.GetPatientById({ Id: Data.PatientId });
        let info = {
            Patient: patientData,
            AdmissionRequest: Data,
        };
        let pdfOption: any = null;
        let key = 'admissionrequest';
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

    public async DeleteAdmissionRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AdmissionRequestInstance, AdmissionRequestAttributes> {
        return this.Models.AdmissionRequest;
    }
    public async GetDashBoardInfo(req: BaseRequest): Promise<any> {
        let admissioncount = await this.Items.count({
            where: {
                'Status': 1,
                'AdmissionRequestStatusId': { '$in': [2] },
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
