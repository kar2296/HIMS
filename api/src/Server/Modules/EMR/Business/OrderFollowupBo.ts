import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OrderFollowupInstance, OrderFollowupAttributes } from '../Model/Interface/Index';
import { OrderFollowupFilters, PatientOrderDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as emrbo from '../../EMR/Business/Index';

export class OrderFollowupBo extends BaseBo<OrderFollowupInstance, OrderFollowupAttributes>  {
    public async AddOrderFollowup(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateOrderFollowup(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (result) {
            if (req.Data.FollowupStatusId === 2) {
                let PatientOrderBO = BoFactory.GetBo(emrbo.PatientOrderBo, this.Request);
                let PatientOrderdetailBO = BoFactory.GetBo(emrbo.PatientOrderDetailBo, this.Request);
                let PatientOrder = await PatientOrderBO.GetPatientOrderById({ Id: req.Data.PatientOrderId });
                let PatientOrderDetailsApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 1000, PageNumber: 1 },
                    Params: [{ Key: PatientOrderDetailFilters.Id, Value: req.Data.OrderDetailId }]
                };
                let PatientOrderDetails =
                    await PatientOrderdetailBO.GetPatientOrderDetails(PatientOrderDetailsApiReq);
                let OrderDetail: any = [];
                for (let px in PatientOrderDetails.Data) {
                    let ordDet = PatientOrderDetails.Data[px];
                    ordDet.Id = 0;
                    ordDet.RequestDate = req.Data.FollowupAppointmentOn;
                    ordDet.OrderStatusId = 1;
                    ordDet.IsFollowup = false;
                    ordDet.Duration = '1';
                    ordDet.DurationPeriodId = 1;
                    OrderDetail.push(ordDet);
                }
                PatientOrder.Id = 0;
                PatientOrder.OrderNumber = '';
                PatientOrder.OrderRequestDate = req.Data.FollowupAppointmentOn;
                PatientOrder.OrderStatusId = 1;
                let orderData: any = {
                    Data: {
                        Header: PatientOrder,
                        Details: OrderDetail
                    }
                };
                await PatientOrderBO.AddPatientOrder(orderData);
            }
        }
        return result;
    }

    public async GetOrderFollowupById(req: BaseRequest): Promise<OrderFollowupAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageOrderFollowups(req: BaseRequest): Promise<boolean> {
        let details: OrderFollowupAttributes[] = req.Data || [];
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
    public async GetOrderFollowups(apiReq?: ApiRequest<OrderFollowupFilters>):
        Promise<ApiResponse<OrderFollowupAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encWhere: WhereOptions<any> = {};
        let isReqEnc: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push(this.GetReference('OrderFollowupStatus'));
        // include.push({
        //     model: this.Models.Patient,
        //     attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
        //     include: [this.GetReference('Title'), this.GetReference('Gender')]
        // });
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
                    case OrderFollowupFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case OrderFollowupFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case OrderFollowupFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case OrderFollowupFilters.OrderedDate:
                        where['OrderedDate'] = { '$between': param.Value || '' };
                        break;
                    case OrderFollowupFilters.From:
                        where['OrderedDate'] = where['OrderedDate'] || {};
                        (where['OrderedDate'] as any)['$gte'] = param.Value;
                        break;
                    case OrderFollowupFilters.To:
                        where['OrderedDate'] = where['OrderedDate'] || {};
                        (where['OrderedDate'] as any)['$lte'] = param.Value;
                        break;
                    case OrderFollowupFilters.TestTypeId:
                        where['TestTypeId'] = param.Value;
                        break;
                    case OrderFollowupFilters.FollowupStatusId:
                        where['FollowupStatusId'] = param.Value;
                        break;
                    case OrderFollowupFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case OrderFollowupFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case OrderFollowupFilters.FollowupAppointmentOn:
                        where['FollowupAppointmentOn'] = { '$between': param.Value || '' };
                        break;
                    case OrderFollowupFilters.FromFollowup:
                        where['FollowupAppointmentOn'] = where['FollowupAppointmentOn'] || {};
                        (where['FollowupAppointmentOn'] as any)['$gte'] = param.Value;
                        break;
                    case OrderFollowupFilters.ToFollowup:
                        where['FollowupAppointmentOn'] = where['FollowupAppointmentOn'] || {};
                        (where['FollowupAppointmentOn'] as any)['$lte'] = param.Value;
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

    public async DeleteOrderFollowup(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OrderFollowupInstance, OrderFollowupAttributes> {
        return this.Models.OrderFollowup;
    }
}
