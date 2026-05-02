import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { TreatmentPlanFollowupInstance, TreatmentPlanFollowupAttributes } from '../Model/Interface/Index';
import { TreatmentPlanFollowupFilters } from '../Common/Filters.e';
// import { BoFactory } from '../../Base/Business/Index';
// import * as emrbo from '../../EMR/Business/Index';

export class TreatmentPlanFollowupBo extends BaseBo<TreatmentPlanFollowupInstance, TreatmentPlanFollowupAttributes>  {
    public async AddTreatmentPlanFollowup(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateTreatmentPlanFollowup(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        // if (result) {
        //     if (req.Data.FollowupStatusId === 2) {
        //         let PatientOrderBO = BoFactory.GetBo(emrbo.PatientOrderBo, this.Request);
        //         let PatientOrderdetailBO = BoFactory.GetBo(emrbo.PatientOrderDetailBo, this.Request);
        //         let PatientOrder = await PatientOrderBO.GetPatientOrderById({ Id: req.Data.PatientOrderId });
        //         let PatientOrderDetailsApiReq = {
        //             Id: 0,
        //             PageContext: { PageSize: 1000, PageNumber: 1 },
        //             Params: [{ Key: PatientOrderDetailFilters.Id, Value: req.Data.OrderDetailId }]
        //         };
        //         let PatientOrderDetails =
        //             await PatientOrderdetailBO.GetPatientOrderDetails(PatientOrderDetailsApiReq);
        //         let OrderDetail: any = [];
        //         for (let px in PatientOrderDetails.Data) {
        //             let ordDet = PatientOrderDetails.Data[px];
        //             ordDet.Id = 0;
        //             ordDet.RequestDate = req.Data.FollowupAppointmentOn;
        //             ordDet.OrderStatusId = 1;
        //             ordDet.IsFollowup = false;
        //             ordDet.Duration = '1';
        //             ordDet.DurationPeriodId = 1;
        //             OrderDetail.push(ordDet);
        //         }
        //         PatientOrder.Id = 0;
        //         PatientOrder.OrderNumber = '';
        //         PatientOrder.OrderRequestDate = req.Data.FollowupAppointmentOn;
        //         PatientOrder.OrderStatusId = 1;
        //         let orderData: any = {
        //             Data: {
        //                 Header: PatientOrder,
        //                 Details: OrderDetail
        //             }
        //         };
        //         await PatientOrderBO.AddPatientOrder(orderData);
        //     }
        // }
        return result;
    }

    public async GetTreatmentPlanFollowupById(req: BaseRequest): Promise<TreatmentPlanFollowupAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'FollowupUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async ManageTreatmentPlanFollowups(req: BaseRequest): Promise<boolean> {
        let details: TreatmentPlanFollowupAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }
    public async GetTreatmentPlanFollowups(apiReq?: ApiRequest<TreatmentPlanFollowupFilters>):
        Promise<ApiResponse<TreatmentPlanFollowupAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encWhere: WhereOptions<any> = {};
        let isReqEnc: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('OrderFollowupStatus'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: true,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TreatmentPlanFollowupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.TreatmentRequestDate:
                        where['TreatmentRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case TreatmentPlanFollowupFilters.From:
                        where['TreatmentRequestDate'] = where['TreatmentRequestDate'] || {};
                        (where['TreatmentRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.To:
                        where['TreatmentRequestDate'] = where['TreatmentRequestDate'] || {};
                        (where['TreatmentRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.FollowupStatusId:
                        where['FollowupStatusId'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case TreatmentPlanFollowupFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.TreatmentScheduleDate:
                        where['TreatmentScheduleDate'] = { '$between': param.Value || '' };
                        break;
                    case TreatmentPlanFollowupFilters.FromScheduled:
                        where['TreatmentScheduleDate'] = where['TreatmentScheduleDate'] || {};
                        (where['TreatmentScheduleDate'] as any)['$gte'] = param.Value;
                        break;
                    case TreatmentPlanFollowupFilters.ToScheduled:
                        where['TreatmentScheduleDate'] = where['TreatmentScheduleDate'] || {};
                        (where['TreatmentScheduleDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter, attributes: ['Id', 'VisitIdentifier', 'DoctorId', 'DoctorName',
                'EncounterTypeId', 'DepartmentId'],
            where: encWhere,
            required: isReqEnc,
            include: [
                this.GetReference('EncounterType'),
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                        'PhotoPath', 'SignPath'], required: false,
                    include: [this.GetReference('Title')]
                },
                { model: this.Models.Department, attributes: ['DepartmentName'], required: false }
            ]
        });
        include.push(patientQryJoin);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteTreatmentPlanFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<TreatmentPlanFollowupInstance, TreatmentPlanFollowupAttributes> {
        return this.Models.TreatmentPlanFollowup;
    }
}
