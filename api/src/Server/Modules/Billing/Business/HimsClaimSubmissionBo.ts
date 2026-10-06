import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ClaimSubmissionInstance, ClaimSubmissionAttributes, ClaimSubmissionDetailsAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { ClaimSubmissionFilters, ClaimSubmissionDetailsFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as moment from 'moment';

export class ClaimSubmissionBo extends BaseBo<ClaimSubmissionInstance, ClaimSubmissionAttributes> {
    public async AddClaimSubmission(req: BaseRequest): Promise<number> {
        let generateClaimSubReq: number = 0;
        if (!req.Data.ClaimNumber && req.Data.ClaimSubmissionStatusId === 2) {
            generateClaimSubReq = 1;
        }
        // if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result: any = await this.Save(req.Data);
        let ClaimSubmissionId = result.dataValues.Id;
        let DetailBo = BoFactory.GetBo(bo.ClaimSubmissionDetailsBo, this.Request);
        await DetailBo.ManageClaimSubmissionDetails(ClaimSubmissionId, req.Data.Details);
        if (req.Data.ClaimSubmissionStatusId === 2)
            await this.ManageClaimedBills(req.Data.Details);

        if (generateClaimSubReq === 1) {
            try {
                this.deferSequenceKey(ClaimSubmissionId, 'ClaimNumber',
                    this.getSequenceIdentifier(SequenceKeys.ClaimNumber));
            } catch (error) {
                throw { message: 'Sequence Issue.. Please contact Support' };
            }
        }

        return ClaimSubmissionId;
    }

    public async UpdateClaimSubmission(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let ClaimSubmissionId = req.Data.Id;
        let DetailBo = BoFactory.GetBo(bo.ClaimSubmissionDetailsBo, this.Request);
        await DetailBo.ManageClaimSubmissionDetails(ClaimSubmissionId, req.Data.Details);
        if (req.Data.ClaimSubmissionStatusId === 2)
            await this.ManageClaimedBills(req.Data.Details);
        return result;
    }

    public async UpdateCoveringClaimSubmission(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        let ClaimSubmissionId = req.Data.ClaimSubmissionId;
        let DetailBo = BoFactory.GetBo(bo.ClaimSubmissionDetailsBo, this.Request);
        await DetailBo.ManageClaimSubmissionDetails(ClaimSubmissionId, req.Data.Details);
        return result;
    }

    public async ManageClaimedBills(details: ClaimSubmissionDetailsAttributes[]): Promise<boolean> {
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

    public async GetClaimSubmissionById(req: BaseRequest): Promise<ClaimSubmissionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetClaimSubmissions(apiReq?: ApiRequest<ClaimSubmissionFilters>):
        Promise<ApiResponse<ClaimSubmissionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let detailswhere: WhereOptions<any> = {};
        let isClaimSubmissionDetailRequired: any = false;
        include.push({ model: this.Models.Guarantor, required: false });
        include.push({ model: this.Models.CityMaster, attributes: ['CityName'], required: false });
        include.push({ model: this.Models.CountryMaster, attributes: ['CountryName'], required: false });
        include.push({ model: this.Models.StateMaster, attributes: ['StateName'], required: false });
        include.push({ model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false });
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
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DispatchedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('ClaimSubmissionStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ClaimSubmissionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ClaimSubmissionFilters.ClaimNumber:
                        where['ClaimNumber'] = param.Value;
                        break;
                    case ClaimSubmissionFilters.Guarantor:
                        where['GuarantorId'] = param.Value;
                        break;
                    case ClaimSubmissionFilters.FromDate:
                        where['SubmittedOn'] = where['SubmittedOn'] || {};
                        (where['SubmittedOn'] as any)['$gte'] = param.Value;
                        break;
                    case ClaimSubmissionFilters.ToDate:
                        where['SubmittedOn'] = where['SubmittedOn'] || {};
                        (where['SubmittedOn'] as any)['$lte'] = param.Value;
                        break;
                    case ClaimSubmissionFilters.ClaimSubmissionStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ClaimSubmissionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case ClaimSubmissionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ClaimSubmissionDetails,
            required: isClaimSubmissionDetailRequired,
            where: detailswhere,

        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteClaimSubmission(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async IsAlreadyExist(req: any): Promise<number> {
        let billDate = new Date();
        // let FromDate = billDate.setMinutes(billDate.getMinutes() - 2);
        // let ToDate = billDate.setMinutes(billDate.getMinutes() + 2);
        let FromDate = billDate.setSeconds(billDate.getSeconds() - 30);
        let ToDate = billDate.setSeconds(billDate.getSeconds() + 30);
        let frmDate = moment(FromDate);
        let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                // { Key: ClaimSubmissionFilters.PatientId, Value: req.Data.Header.PatientId },
                { Key: ClaimSubmissionFilters.ClaimAmount, Value: req.Data.Header.ClaimAmount },
                { Key: ClaimSubmissionFilters.FromDate, Value: frmDate },
                { Key: ClaimSubmissionFilters.ToDate, Value: todate }]
        };
        // if (req.Data.Header.checkBill && req.Data.Header.checkBill === true) {
        //     apiReq.Params.push({
        //         Key: PatientBillsFilters.BillAmount, Value: req.Data.Header.BillAmount
        //     });
        //     apiReq.Params.push({
        //         Key: PatientBillsFilters.EncounterId, Value: req.Data.Header.EncounterId
        //     });
        // }
        let data = await this.GetClaimSubmissions(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    public async PrintClaimSubmission(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: ClaimSubmissionFilters.Id, Value: req.Id }]
        };
        let data = await this.GetClaimSubmissions(apiReq);
        let claimdetailBo = BoFactory.GetBo(bo.ClaimSubmissionDetailsBo, this.Request);
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: ClaimSubmissionDetailsFilters.ClaimSubmissionId, Value: req.Id }]
        };
        let ClaimSubmissionDetailsData = await claimdetailBo.GetClaimSubmissionDetails(Req);
        let ClaimSubmissionDetail = ClaimSubmissionDetailsData.Data;

        let ClaimSubmission = data.Data[0];
        let FacilityData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityData.FacilityId);

        let info = {
            ClaimSubmission: ClaimSubmission,
            ClaimSubmissionDetail: ClaimSubmissionDetail,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'claimsubmissions';

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

    public GetModel(): SStatic.Model<ClaimSubmissionInstance, ClaimSubmissionAttributes> {
        return this.Models.ClaimSubmission;
    }

}
