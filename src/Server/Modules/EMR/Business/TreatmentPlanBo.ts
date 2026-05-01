import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TreatmentPlanInstance, TreatmentPlanAttributes } from '../Model/Interface/Index';
import { TreatmentPlanFilters, TreatmentPlanDetailFilters } from '../Common/Filters.e';
import * as bo from '../../EMR/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as billBo from '../../Billing/Business/Index';
import { PatientBillDetailsFilters } from '../../Billing/Common/Filters.e';

export class TreatmentPlanBo extends BaseBo<TreatmentPlanInstance, TreatmentPlanAttributes>  {
    public async AddTreatmentPlan(req: BaseRequest): Promise<number> {
        let generateOrderId = 0;
        if (req.Data.Header.PlanStatusId === 1
            && !req.Data.Header.PlanNumber) {
            req.Data.Header.PlanNumber = null;
            generateOrderId = 1;
        }
        let result = await this.Save(req.Data.Header);
        let TreatmentPlanId = result.dataValues.Id;
        if (generateOrderId === 1) {
            this.deferSequenceKey(TreatmentPlanId, 'PlanNumber',
                this.getSequenceIdentifier(SequenceKeys.TreatmentPlanId));
        }
        let detailBO = BoFactory.GetBo(bo.TreatmentPlanDetailBo, this.Request);
        await detailBO.ManageTreatmentPlanDetails(TreatmentPlanId, req.Data.Details, req.Data.Header);
        // if (req.Data.Header.PlanStatusId === 1) {
        //     await this.ManageTreatmentPlanBill(req, TreatmentPlanId);
        // }
        return TreatmentPlanId;
    }

    public async UpdateTreatmentPlan(req: BaseRequest): Promise<boolean> {
        let TreatmentPlanId = req.Data.Header.Id;
        let generateOrderId = 0;
        if (req.Data.Header.PlanStatusId === 1
            && !req.Data.Header.PlanNumber) {
            req.Data.Header.PlanNumber = null;
            generateOrderId = 1;
        }
        let result = await this.Update(req.Data.Header);
        if (generateOrderId === 1) {
            this.deferSequenceKey(TreatmentPlanId, 'PlanNumber',
                this.getSequenceIdentifier(SequenceKeys.TreatmentPlanId));
        }
        let detailBO = BoFactory.GetBo(bo.TreatmentPlanDetailBo, this.Request);
        await detailBO.ManageTreatmentPlanDetails(TreatmentPlanId, req.Data.Details, req.Data.Header);

        return result;
    }

    public async GetTreatmentPlanById(req: BaseRequest): Promise<TreatmentPlanAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Encounter, required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async UpdateTreatmentPlanBillInfo(req: BaseRequest): Promise<boolean> {
        let PatientBillDetailBo = BoFactory.GetBo(billBo.PatientBillDetailsBo, this.Request);
        let patientBillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let treatmentPlanDetailBO = BoFactory.GetBo(bo.TreatmentPlanDetailBo, this.Request);
        let billdetail: any = {};
        let result: any;
        let PatientBillData = await patientBillBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
        if (req.Data.PatientBillId) {
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: req.Data.PatientBillId }]
            };
            let PatientBillDetailData = await PatientBillDetailBo.GetPatientBillDetails(apiReq);
            if (PatientBillDetailData.Data.length > 0) {
                billdetail = PatientBillDetailData.Data[0];
            }
            req.Data.PatientBillDetailId = billdetail.Id;
            req.Data.BillNumber = PatientBillData.BillNumber;
            result = await this.Update(req.Data);
            if (result) {
                let treatmentPlanDetailsApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 1000, PageNumber: 1 },
                    Params: [{ Key: TreatmentPlanDetailFilters.TreatmentPlanId, Value: req.Data.Id }]
                };
                let TreatmentPlanDetails = await treatmentPlanDetailBO.GetTreatmentPlanDetails(treatmentPlanDetailsApiReq);
                if (TreatmentPlanDetails.Data.length > 0) {
                    for (let jx in TreatmentPlanDetails.Data) {
                        let planDetail = TreatmentPlanDetails.Data[jx];
                        let detaupdate: any = {
                            Id: planDetail.Id,
                            PatientBillId: req.Data.PatientBillId,
                            PatientBillDetailId: billdetail.Id,
                            PatientBillStatusId: 3,
                            IsPaid: true
                        };
                        await treatmentPlanDetailBO.Update(detaupdate);
                    }
                }
            }
        }
        return result;
    }

    public async GetTreatmentPlans(apiReq?: ApiRequest<TreatmentPlanFilters>): Promise<ApiResponse<TreatmentPlanAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let TreatmentPlanDetailWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        let TreatmentPlanDetailQryJoin: any = {
            model: this.Models.TreatmentPlanDetail, required: false,
            where: TreatmentPlanDetailWhere
        };
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
            include: [this.GetReference('EncounterType')]
        });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('PlanStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TreatmentPlanFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TreatmentPlanFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.PlanPriority:
                        where['PlanPriorityId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.PlanStatus:
                        where['PlanStatusId'] = param.Value;
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PlanStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case TreatmentPlanFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.PlanNumber:
                        (where as any)[Op.or] = [{ PlanNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case TreatmentPlanFilters.PlanRequestDate:
                        where['PlanRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case TreatmentPlanFilters.From:
                        where['PlanRequestDate'] = where['PlanRequestDate'] || {};
                        (where['PlanRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case TreatmentPlanFilters.To:
                        where['PlanRequestDate'] = where['PlanRequestDate'] || {};
                        (where['PlanRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case TreatmentPlanFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case TreatmentPlanFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case TreatmentPlanFilters.BillingStatusId:
                        where['BillingStatusId'] = param.Value;
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['BillingStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case TreatmentPlanFilters.BillNumber:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin, TreatmentPlanDetailQryJoin);
        order.push(['PlanRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async ManageTreatmentPlanBill(req: BaseRequest, planId: number): Promise<boolean> {
        // let treatmentPlanDetailBO = BoFactory.GetBo(bo.TreatmentPlanDetailBo, this.Request);
        let PlanInfo: any = await this.GetTreatmentPlanById({ Id: planId });
        // let treatmentPlanDetailsApiReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 1000, PageNumber: 1 },
        //     Params: [{ Key: TreatmentPlanDetailFilters.TreatmentPlanId, Value: planId }]
        // };
        // let TreatmentPlanDetails =
        //     await treatmentPlanDetailBO.GetTreatmentPlanDetails(treatmentPlanDetailsApiReq);
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageTreatmenPlanBills(planId, PlanInfo, req.Data.Details);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            if (!req.Data.Header.BillNumber) {
                req.Data.Header.Id = planId;
                req.Data.Header.PatientBillId = PatientBillId;
                req.Data.Header.BillingStatusId = PatientBillData.PatientBillStatusId;
                req.Data.Header.BillNumber = PatientBillData.BillNumber;
                req.Data.Header.BillAmount = PatientBillData.BillAmount;
                req.Data.Header.Rev = PlanInfo.Rev;
                await this.Update(req.Data.Header);
            }
        }
        return true;
    }

    public async DeleteTreatmentPlan(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TreatmentPlanInstance, TreatmentPlanAttributes> {
        return this.Models.TreatmentPlan;
    }
}
