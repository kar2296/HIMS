import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { WorkOrderSampleInstance, WorkOrderSampleAttributes } from '../Model/Interface/Index';
import { WorkOrderSampleFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as lisbo from '../../LIS/Business/Index';

export class WorkOrderSampleBo extends BaseBo<WorkOrderSampleInstance, WorkOrderSampleAttributes> {
    public async AddWorkOrderSample(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWorkOrderSample(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageWorkOrderSample(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let woSampleDetailBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        await woSampleDetailBO.ManageWorkOrderSampleDetails(req.Data.Details);
        return result;
    }

    public async ManageWorkOrderSampleByType(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let woSampleDetailBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        await woSampleDetailBO.ManageWorkOrderSampleTypeDetails(req.Data.Details);
        return result;
    }

    public async ManageWorkOrderReviewSample(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let woSampleDetailBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        await woSampleDetailBO.ManageWorkOrderReviewSampleDetails(req.Data.Details);
        return result;
    }

    public async GetWorkOrderSampleById(req: BaseRequest): Promise<WorkOrderSampleAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('SampleStatus'));
        include.push({
            model: this.Models.PatientOrder, required: false,
            include: [{
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
                include: [this.GetReference('Title')]
            }]
        });
        include.push({
            model: this.Models.PatientWorkorder, required: false,
        });

        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetWorkOrderSamples(apiReq?: ApiRequest<WorkOrderSampleFilters>): Promise<ApiResponse<WorkOrderSampleAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientWhere: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let patientWorkOrderWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let isReqPatientOrderSearch: boolean = false;
        let isReqPatientWorkOrderSearch: boolean = false;
        let GuarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let include: Array<IncludeOptions> = [];

        //include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('LabAssignType'));
        include.push(this.GetReference('SampleStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WorkOrderSampleFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.OrderNo:
                        // patientOrderWhere['OrderNumber'] = param.Value;
                        (patientOrderWhere as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.PatientType:
                        patientWhere['PatientTypeId'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.PatientNameMRN:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case WorkOrderSampleFilters.SampleStatus:
                        where['SampleStatusId'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.OrderRequestDate:
                        patientOrderWhere['OrderRequestDate'] = { '$between': param.Value || '' };
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.From:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$gte'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.To:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$lte'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.OrderStatus:
                        patientOrderWhere['OrderStatusId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.DoctorId:
                        patientOrderWhere['DoctorId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.OrderFromId:
                        patientOrderWhere['OrderFromId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.WardId:
                        patientOrderWhere['WardId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.FacilityId:
                        patientOrderWhere['FacilityId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.GuarantorId:
                        GuarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case WorkOrderSampleFilters.GuarantorTypeId:
                        GuarantorWhere['GuarantorTypeId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case WorkOrderSampleFilters.SubDepartmentId:
                        patientOrderWhere['SubDepartmentId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.WorkOrderdid:
                        // patientOrderWhere['OrderNumber'] = param.Value;
                        (patientWorkOrderWhere as any)[Op.or] = [{ WorkOrderdid: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientWorkOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.VisitIdentifier:
                        (GuarantorWhere as any).VisitIdentifier = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
                        isGuarantorRequired = true;
                        break;
                    case WorkOrderSampleFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.PatNameOrderNo:
                        (patientOrderWhere as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.CreatedFrom:
                        patientWorkOrderWhere['CreatedAt'] = patientWorkOrderWhere['CreatedAt'] || {};
                        (patientWorkOrderWhere['CreatedAt'] as any)['$gte'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.CreatedTo:
                        patientWorkOrderWhere['CreatedAt'] = patientWorkOrderWhere['CreatedAt'] || {};
                        (patientWorkOrderWhere['CreatedAt'] as any)['$lte'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case WorkOrderSampleFilters.CreatedAtFrom:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.CreatedAtTo:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case WorkOrderSampleFilters.MultiSampleStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['SampleStatusId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter, attributes: ['GuarantorId', 'GuarantorTypeId', 'VisitIdentifier'],
            required: isGuarantorRequired,
            where: GuarantorWhere,
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.PatientOrder,
            attributes: ['OrderNumber', 'OrderRequestDate', 'BillNumber'],
            required: isReqPatientOrderSearch,
            where: patientOrderWhere,
            include: [
                { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false },
                { model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDeparement', required: false }
            ],
        });
        include.push({
            model: this.Models.PatientWorkorder,
            attributes: ['WorkOrderdid', 'CreatedAt'],
            required: isReqPatientWorkOrderSearch,
            where: patientWorkOrderWhere,
            include: [
                { model: this.Models.WorkOrderStatus, attributes: ['DisplayName'], required: false }
            ],
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWorkOrderSample(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WorkOrderSampleInstance, WorkOrderSampleAttributes> {
        return this.Models.WorkOrderSample;
    }

    public async CreateWorkOrderSampleFromWorkOrder(workOrderId: number, orderDetailIds: any): Promise<number> {
        let patientWOBO = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
        let workOrder: any = await patientWOBO.GetById(workOrderId);
        let workOrderSample: any = {
            WorkOrderId: workOrder.Id,
            PatientOrderId: workOrder.Orderid,
            PatientId: workOrder.Patientid,
            Encounterid: workOrder.Encounterid,
            SampleStatusId: 1,
            SamplePriorityId: workOrder.OrderPriorityId,
            LabAssignTypeId: workOrder.LabAssignTypeId
        };
        let result = await this.Save(workOrderSample);
        let woSampleId = result.dataValues.Id;

        let woSampleDetailBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        await woSampleDetailBO.CreateWorkOrderSampleDetails(workOrderId, woSampleId, workOrderSample, workOrder.Orderid, orderDetailIds);
        return woSampleId;
    }

    // public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
    //     let patientorderjoin: any = {
    //         model: this.Models.PatientOrder,
    //         attributes: ['Id'],
    //         required: true,
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': req.Data.Testtypeid,
    //             'OrderStatusId': 10
    //             // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     };
    //     let LISSampleCollectionCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'SampleStatusId': 1
    //         },
    //         include: [patientorderjoin]
    //     });
    //     let LISSampleReviewCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'SampleStatusId': 1
    //         },
    //         include: [patientorderjoin]
    //     });
    //     return {
    //         'LISSampleCollectionCount': LISSampleCollectionCount,
    //         'LISSampleReviewCount': LISSampleReviewCount
    //     };
    // }

}
