import * as SStatic from 'sequelize';
import { BaseBo, BoFactory } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ClaimSubmissionDetailsFilters } from '../Common/Filters.e';
import { ClaimSubmissionDetailsInstance, ClaimSubmissionDetailsAttributes } from '../Model/Interface/Index';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class ClaimSubmissionDetailsBo extends BaseBo<ClaimSubmissionDetailsInstance, ClaimSubmissionDetailsAttributes>  {
    public async AddClaimSubmissionDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateClaimSubmissionDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageClaimSubmissionDetails(ClaimSubmissionId: number, details: ClaimSubmissionDetailsAttributes[])
        : Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ClaimSubmissionId = ClaimSubmissionId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetClaimSubmissionDetailsById(req: BaseRequest): Promise<ClaimSubmissionDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClaimSubmissionDetails(apiReq?: ApiRequest<ClaimSubmissionDetailsFilters>):
        Promise<ApiResponse<ClaimSubmissionDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push({
            model: this.Models.ClaimSubmission,
            attributes: ['ClaimSubmissionId', 'ClaimSubmissionStatusId', 'SubmittedOn',
                'DispatchedOn', 'IsClaimCoveringLetter', 'ClaimNumber'], required: false
        });
        include.push({
            model: this.Models.PatientGuarantor,
            attributes: ['EncounterId', 'GuarantorId','GuarantorLetterNo', 'GuarantorName'], required: false
        });
        include.push({
            model: this.Models.PatientBills, attributes: ['BillDateTime', 'BillNumber', 'BillAmount', 'BillDiscount',
                'GuarantorId', 'GuarantorTypeId', 'PatientId', 'EncounterId', 'OutStandingAmount', 'FacilityId'],
            required: false, include: [
                {
                    model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
                    include: [
                        this.GetReference('Title')
                    ]
                },
                {
                    model: this.Models.Encounter, required: false,
                    include: [this.GetReference('TPA'),
                    {
                        model: this.Models.Guarantor, required: false,
                        include: [this.GetReference('TPA')]
                    },
                    {
                        model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                    },
                    {
                        model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'],
                        required: false,
                    },
                    {
                        model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                    },
                    ]

                }
            ]
        });
        include.push({
            model: this.Models.Guarantor, required: false,
            include: [this.GetReference('TPA')]
        });
        include.push({ model: this.Models.Encounter, required: false });
        include.push({ model: this.Models.Facility, required: false });
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case ClaimSubmissionDetailsFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case ClaimSubmissionDetailsFilters.ClaimSubmissionId:
                    where['ClaimSubmissionId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'PhotoPath', 'MaritalStatusId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteClaimSubmissionDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintGetClaimSubmission(req: BaseRequest): Promise<FileInfo> {
        let Facility = req.Data.FacilityId;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ClaimSubmissionDetailsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetClaimSubmissionDetails(apiReq);
        let ClaimCoveringletter = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ClaimSubmissionDetailsFilters.ClaimSubmissionId, Value: ClaimCoveringletter.Id }]
        };
        let ClaimSubmissionDetailsData = await this.GetClaimSubmissionDetails(Req);
        let ClaimSubmissionDetails: any = [];
        let BillAmount: any = [];
        let OutStandingAmount: any = [];
        // let Facility: any = [];
        ClaimSubmissionDetailsData.Data.forEach((Detail) => {
            var ClaimSubmissionDetail = Detail;
            ClaimSubmissionDetails.push(ClaimSubmissionDetail);
            let TotalNetAmt = 0;
            let TotalOutAmt = 0;
            // let FacilityId = 0;
            for (var idx in ClaimSubmissionDetails) {
                var item = ClaimSubmissionDetails[idx];
                TotalNetAmt += item.PatientBill.BillAmount;
            }
            for (var idx1 in ClaimSubmissionDetails) {
                var item1 = ClaimSubmissionDetails[idx1];
                TotalOutAmt += item1.PatientBill.OutStandingAmount;
            }
            // for (var idx2 in ClaimSubmissionDetails) {
            //     var item2 = ClaimSubmissionDetails[idx2];
            //     // FacilityId = item2.FacilityId;
            // }
            // var hospitalId = FacilityId;
            var BillAmt = TotalNetAmt;
            var OutStandingAmt = TotalOutAmt;
            BillAmount.push(BillAmt);
            OutStandingAmount.push(OutStandingAmt);
            // Facility.push(hospitalId);
        });
        let TotBillAmt = BillAmount[BillAmount.length - 1];
        let TotOutStandingAmt = OutStandingAmount[OutStandingAmount.length - 1];
        let HospitalId = Facility;
        let insuranceDetail = ClaimSubmissionDetailsData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(HospitalId);
        let info = {
            ClaimCoveringletter: ClaimCoveringletter,
            Preferences: printPreferencesData,
            format: req.Data.ids,
            ClaimSubmissionDetail: ClaimSubmissionDetails,
            TotBillAmt: TotBillAmt,
            TotOutStandingAmt: TotOutStandingAmt,
            insuranceDetail: insuranceDetail
        };
        let pdfOption: any = null;
        // let key = 'claimcoveringletter';
        let key = 'claimsubmissions';
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
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '0.7in',
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

    public GetModel(): SStatic.Model<ClaimSubmissionDetailsInstance, ClaimSubmissionDetailsAttributes> {
        return this.Models.ClaimSubmissionDetails;
    }

}
