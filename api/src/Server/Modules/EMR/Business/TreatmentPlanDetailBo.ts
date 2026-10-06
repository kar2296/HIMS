import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TreatmentPlanDetailInstance, TreatmentPlanDetailAttributes } from '../Model/Interface/Index';
import { TreatmentPlanDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as billingBO from '../../Billing/Business/Index';
import * as emrbo from '../../EMR/Business/Index';
import { PatientBillDetailsFilters } from '../../Billing/Common/Filters.e';

export class TreatmentPlanDetailBo extends BaseBo<TreatmentPlanDetailInstance, TreatmentPlanDetailAttributes>  {
    public async AddTreatmentPlanDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTreatmentPlanDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateTreatmentPlanBills(req: BaseRequest): Promise<boolean> {
        let treatmentPlanBO = BoFactory.GetBo(emrbo.TreatmentPlanBo, this.Request);
        let result: any;
        let planId: number;
        let PlanDetail = await this.GetTreatmentPlanDetailById({ Id: req.Data.Id });
        if (PlanDetail) {
            planId = PlanDetail.TreatmentPlanId;
        }
        let planDetReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: TreatmentPlanDetailFilters.TreatmentPlanId, Value: planId }]
        };
        let allPlanDetails = await this.GetTreatmentPlanDetails(planDetReq);
        let paidplanDetReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: TreatmentPlanDetailFilters.TreatmentPlanId, Value: planId },
            { Key: TreatmentPlanDetailFilters.IsPaid, Value: true }]
        };
        let PaidPlanDetails = await this.GetTreatmentPlanDetails(paidplanDetReq);
        if (PaidPlanDetails.Data.length === allPlanDetails.Data.length) {
            let planupdate: any = {
                Id: planId,
                IsPaid: true,
            };
            await treatmentPlanBO.Update(planupdate);
        }
        result = await this.Update(req.Data);
        return result;
    }

    public async UpdateTreatmentPlanBillDetail(req: BaseRequest): Promise<boolean> {
        let PatientBillDetailBo = BoFactory.GetBo(billingBO.PatientBillDetailsBo, this.Request);
        let billdetail: any = {};
        let result: any;
        if (req.Data.PatientBillId) {
            let billDetapiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: req.Data.PatientBillId }]
            };
            let PatientBillDetailData = await PatientBillDetailBo.GetPatientBillDetails(billDetapiReq);
            if (PatientBillDetailData.Data.length > 0) {
                billdetail = PatientBillDetailData.Data[0];
            }
            req.Data.PatientBillDetailId = billdetail.Id;
            result = await this.Update(req.Data);
        }
        return result;
    }

    public async GetTreatmentPlanDetailById(req: BaseRequest): Promise<TreatmentPlanDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageTreatmentPlanDetails(TreatmentPlanId: number, details: TreatmentPlanDetailAttributes[],
        planInfo: any): Promise<boolean> {
        details = details || [];

        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let planFollowupBO = BoFactory.GetBo(emrbo.TreatmentPlanFollowupBo, this.Request);
                let ordflwp = { Id: 0, Data: {} };
                detail.Id = detail.Id || 0;
                detail.TreatmentPlanId = TreatmentPlanId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let plandetail = await this.Save(detail);
                    ordflwp.Data = {
                        Id: 0,
                        TreatmentPlanId: detail.TreatmentPlanId,
                        TreatmentPlanDetailId: plandetail.dataValues.Id,
                        PatientId: detail.PatientId,
                        EncounterId: planInfo.EncounterId,
                        FacilityId: planInfo.FacilityId,
                        ServiceCategoryId: detail.ServiceCategoryId,
                        ServiceItemId: detail.ServiceItemId,
                        ServiceCode: detail.ServiceCode,
                        ServiceName: detail.ServiceName,
                        DoctorId: detail.DoctorId,
                        DepartmentId: detail.DepartmentId,
                        TreatmentRequestDate: planInfo.PlanRequestDate,
                        TreatmentScheduleDate: detail.PlanScheduleDate,
                        FollowupStatusId: 1,
                    };
                    await planFollowupBO.AddTreatmentPlanFollowup(ordflwp);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetTreatmentPlanDetails(apiReq?: ApiRequest<TreatmentPlanDetailFilters>):
        Promise<ApiResponse<TreatmentPlanDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let TreatmentPlanWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqTreatmentPlan: boolean = false;
        include.push({ model: this.Models.Encounter, required: false });
        include.push({ model: this.Models.ServiceItem, required: false });
        include.push({
            model: this.Models.TreatmentPlan,
            where: TreatmentPlanWhere, required: isReqTreatmentPlan,
        });
        include.push(this.GetReference('PlanStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TreatmentPlanDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.TreatmentPlanId:
                        where['TreatmentPlanId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.ServiceItemId:
                        where['ServiceItemId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.CategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.PlanDetailStatusId:
                        where['PlanDetailStatusId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case TreatmentPlanDetailFilters.IsPaid:
                        where['IsPaid'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTreatmentPlanDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TreatmentPlanDetailInstance, TreatmentPlanDetailAttributes> {
        return this.Models.TreatmentPlanDetail;
    }
}
