import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ClaimCoveringletterInstance, ClaimCoveringletterAttributes, ClaimCoveringletterDetailsAttributes } from '../Model/Interface/Index';
import { ClaimCoveringletterFilters, ClaimCoveringletterDetailsFilters, ClaimSubmissionDetailsFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import { join } from 'path';

export class ClaimCoveringletterBo extends BaseBo<ClaimCoveringletterInstance, ClaimCoveringletterAttributes>  {
    public async AddClaimCoveringletter(req: BaseRequest): Promise<number> {
        let result: any = await this.Save(req.Data.Header);
        let ClaimCoveringletterId = result.dataValues.Id;
        let DetailBo = BoFactory.GetBo(bo.ClaimCoveringletterDetailsBo, this.Request);
        await DetailBo.ManageClaimCoveringletterDetails(ClaimCoveringletterId, req.Data.Details);
        // let clsimsubbo = BoFactory.GetBo(bo.ClaimSubmissionBo, this.Request);
        // let apiReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 1, PageNumber: 1 },
        //     Params: [
        //         { Key: ClaimSubmissionFilters.Id, Value: req.Data.Header.ClaimSubmissionId }
        //     ]
        // };
        // let claimsubdata = await clsimsubbo.GetClaimSubmissions(apiReq);
        // if (claimsubdata && claimsubdata.Data.length > 0) {
        //     let csubdata: any = {
        //         Id: req.Data.Header.ClaimSubmissionId,
        //         IsClaimCoveringLetter: true
        //     };
        //     await clsimsubbo.Update(csubdata);
        // }
        let clsimsubdetailbo = BoFactory.GetBo(bo.ClaimSubmissionDetailsBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1, PageNumber: 1 },
            Params: [
                { Key: ClaimSubmissionDetailsFilters.Id, Value: req.Data.Header.ClaimSubmissionDetailId }
            ]
        };
        let claimsubdata = await clsimsubdetailbo.GetClaimSubmissionDetails(apiReq);
        if (claimsubdata && claimsubdata.Data.length > 0) {
            let csubdata: any = {
                Id: req.Data.Header.ClaimSubmissionDetailId,
                IsClaimCoveringLetter: true
            };
            await clsimsubdetailbo.Update(csubdata);
        }
        return ClaimCoveringletterId;
    }

    public async UpdateClaimCoveringletter(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let ClaimCoveringletterId = req.Data.Id;
        let DetailBo = BoFactory.GetBo(bo.ClaimCoveringletterDetailsBo, this.Request);
        await DetailBo.ManageClaimCoveringletterDetails(ClaimCoveringletterId, req.Data.Details);
        return result;
    }

    public async ManageClaimedBills(details: ClaimCoveringletterDetailsAttributes[]): Promise<boolean> {
        let BillsBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        await Promise.all(details.map((detail): Promise<void> => {
            return (async (Detail): Promise<void> => {
                let BillData: any = {
                    Data: {
                        Header: {
                            Id: Detail.PatientBillId,
                            IsClaimed: true
                        },
                        paymentDetail: [],
                        Details: []
                    }
                };
                await BillsBo.UpdatePatientBills(BillData);
            })(detail);
        }));
        return true;
    }

    public async GetClaimCoveringletterById(req: BaseRequest): Promise<ClaimCoveringletterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClaimCoveringletters(apiReq?: ApiRequest<ClaimCoveringletterFilters>):
        Promise<ApiResponse<ClaimCoveringletterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let admissionWhere: WhereOptions<any> = {};
        let isadmissionRequired: any = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({ model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'SubmittedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DispatchedUser', required: false,
        //     include: [
        //         this.GetReference('Title')
        //     ]
        // });
        include.push(this.GetReference('ClaimSubmissionStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ClaimCoveringletterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.ClaimNumber:
                        where['ClaimNumber'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.Guarantor:
                        where['GuarantorId'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.FromDate:
                        where['SubmittedOn'] = where['SubmittedOn'] || {};
                        (where['SubmittedOn'] as any)['$gte'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.ToDate:
                        where['SubmittedOn'] = where['SubmittedOn'] || {};
                        (where['SubmittedOn'] as any)['$lte'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.ClaimSubmissionId:
                        where['ClaimSubmissionId'] = param.Value;
                        break;
                    case ClaimCoveringletterFilters.ClaimSubmissionDetailId:
                        where['ClaimSubmissionDetailId'] = param.Value;
                        break;
                    // case ClaimCoveringletterFilters.ClaimCoveringletterStatus:
                    //     if (param.Value) {
                    //         let paramArr: Array<number> = [];
                    //         if (param.Value.toString().indexOf(',') > -1) {
                    //             paramArr = param.Value.toString().split(',');
                    //         } else {
                    //             paramArr = [param.Value];
                    //         }
                    //         where['ClaimCoveringletterStatusId'] = { '$in': paramArr };
                    //     }
                    //     break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate', 'WardId'],
            include: [{ model: this.Models.EncounterGuarantor, required: false },
            this.GetReference('AdmissionStatus')],
            required: isadmissionRequired,
            where: admissionWhere
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId', 'LandLine', 'Email', 'RemarkId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async PrintClaimCoveringletter(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ClaimCoveringletterFilters.Id, Value: req.Id }]
        };
        let data = await this.GetClaimCoveringletters(apiReq);
        let ClaimCoveringletter = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ClaimCoveringletterDetailsFilters.ClaimCoveringletterId, Value: ClaimCoveringletter.Id }]
        };
        let ClaimCoveringletterDetailBo = BoFactory.GetBo(bo.ClaimCoveringletterDetailsBo, this.Request);
        let ClaimCoveringletterDetailData = await ClaimCoveringletterDetailBo.GetClaimCoveringletterDetails(Req);
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ClaimCoveringletter.FacilityId);

        let info = {
            ClaimCoveringletter: ClaimCoveringletter,
            ClaimCoveringletterDetail: ClaimCoveringletterDetailData.Data,
            format: req.Data.ids,
            // Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'claimcoveringletter';
        if (info.format === 1) {
            key = 'corporatecoveringletter';
        }
        if (info.format === 2) {
            key = 'opcoveringletter';
        }
        if (info.format === 3) {
            key = 'tpacoveringletter';
        }
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

    public async DeleteClaimCoveringletter(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ClaimCoveringletterInstance, ClaimCoveringletterAttributes> {
        return this.Models.ClaimCoveringletter;
    }

}
