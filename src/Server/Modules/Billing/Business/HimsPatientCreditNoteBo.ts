import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientCreditNoteInstance, PatientCreditNoteAttributes } from '../Model/Interface/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientCreditNoteFilters, PatientCreditNoteDetailsFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as generalBO from '../../General/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as regbo from '../../Registration/Business/Index';

export class PatientCreditNoteBo extends BaseBo<PatientCreditNoteInstance, PatientCreditNoteAttributes>  {
    public async AddPatientCreditNote(req: BaseRequest): Promise<number> {
        let generateCN = 0;
        if (!req.Data.Header.CreditNoteIdentifier && req.Data.Header.CreditNoteStatusId === 2) {
            req.Data.Header.CreditNoteIdentifier = null;
            generateCN = 1;
        }
        let result: any = await this.Save(req.Data.Header);
        let PatientCreditNoteId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.PatientCreditNoteDetailsBo, this.Request);
        if (result) {
            await detailBO.ManagePatientCreditNoteDetails(PatientCreditNoteId, req.Data.Details);
        }
        // if (req.Data.Header.CreditNoteStatusId === 2) {
        //     await detailBO.ManagePatientBills(PatientCreditNoteId);
        // }
        if (generateCN === 1) {
            this.deferSequenceKey(PatientCreditNoteId, 'CreditNoteIdentifier',
                this.getSequenceIdentifier(SequenceKeys.CreditNoteIdentifier));
        }
        return PatientCreditNoteId;
    }

    public async ManagePatientCreditNoteBillCancel(req: BaseRequest): Promise<number> {
        let generateCN = 0;
        if (!req.Data.Header.CreditNoteIdentifier && req.Data.Header.CreditNoteStatusId === 2) {
            req.Data.Header.CreditNoteIdentifier = null;
            generateCN = 1;
        }
        let result: any = await this.Save(req.Data.Header);
        let PatientCreditNoteId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.PatientCreditNoteDetailsBo, this.Request);
        if (result) {
            await detailBO.ManagePatientCreditNoteDetails(PatientCreditNoteId, req.Data.Details);
        }
        if (generateCN === 1) {
            this.deferSequenceKey(PatientCreditNoteId, 'CreditNoteIdentifier',
                this.getSequenceIdentifier(SequenceKeys.CreditNoteIdentifier));
        }
        return PatientCreditNoteId;
    }

    public async UpdatePatientCreditNote(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetPatientCreditNoteById(req: BaseRequest): Promise<PatientCreditNoteAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientCreditNotes(apiReq?: ApiRequest<PatientCreditNoteFilters>):
        Promise<ApiResponse<PatientCreditNoteAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName','UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName','UserName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientBills, attributes: ['BillNumber', 'BillDateTime', 'CNAmount', 'RefundAmount'], required: false,
        });
        include.push({
            model: this.Models.PatientCreditNoteDetails, required: false,
        });
        include.push(this.GetReference('CreditNoteStatus'));
        include.push(this.GetReference('CreditNoteType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientCreditNoteFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.CreditNoteDateTime:
                        where['CreditNoteDateTime'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientCreditNoteFilters.CreditNoteType:
                        where['CreditNoteTypeId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.CreditNoteIdentifier:
                        where['CreditNoteIdentifier'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientCreditNoteFilters.CreditNoteStatus:
                        where['CreditNoteStatusId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.Guarantor:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.CreditNoteAmount:
                        where['CreditNoteAmount'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.From:
                        where['CreditNoteDateTime'] = where['CreditNoteDateTime'] || {};
                        (where['CreditNoteDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientCreditNoteFilters.To:
                        where['CreditNoteDateTime'] = where['CreditNoteDateTime'] || {};
                        (where['CreditNoteDateTime'] as any)['$lte'] = param.Value;
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
        order.push(['CreditNoteDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientCreditNote(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientCreditNote(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientCreditNoteFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientCreditNotes(apiReq);
        let PatientCreditNotes = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientCreditNoteDetailsFilters.PatientCreditNoteId, Value: PatientCreditNotes.Id }]
        };
        let PatientCreditNoteDetailBo = BoFactory.GetBo(bo.PatientCreditNoteDetailsBo, this.Request);
        let PatientCreditNoteDetailData = await PatientCreditNoteDetailBo.GetPatientCreditNoteDetails(Req);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientCreditNotes.PatientId });
        let patientbillBo = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
        let patientBillData = await patientbillBo.GetPatientBillsById({ Id: PatientCreditNotes.PatientBillId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientCreditNotes.FacilityId);
        let info = {
            PatientBills: patientBillData,
            Patient: patientData,
            PatientCreditNotes: PatientCreditNotes,
            PatientCreditNoteDetail: PatientCreditNoteDetailData.Data,
            Preferences: printPreferencesData
        };
        let Watermark = 'DUPLICATE';
        let PrintTypeId: number;
        if (info.PatientCreditNotes.CreditNoteStatusId === 3) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport('creditnotes'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark
                , PrintTypeId: PrintTypeId
            });
    }

    public GetModel(): SStatic.Model<PatientCreditNoteInstance, PatientCreditNoteAttributes> {
        return this.Models.PatientCreditNote;
    }

    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let CreditCount = await this.Items.count({
            where: {
                'Status': 1,
                'CreditNoteStatusId': 2,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'CreditCount': CreditCount,
        };
    }
}
