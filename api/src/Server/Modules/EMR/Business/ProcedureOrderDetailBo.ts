import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProcedureOrderDetailInstance, ProcedureOrderDetailAttributes } from '../Model/Interface/Index';
import { ProcedureOrderDetailFilters } from '../Common/Filters.e';
//import * as lisbo from '../../LIS/Business/Index';
import * as bo from '../../EMR/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as _ from 'lodash';

export class ProcedureOrderDetailBo extends BaseBo<ProcedureOrderDetailInstance, ProcedureOrderDetailAttributes>  {
    public async AddProcedureOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProcedureOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProcedureOrderDetailById(req: BaseRequest): Promise<ProcedureOrderDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async IsTestAssociated(testId: number): Promise<boolean> {
        let orderDetails = await this.FindAll({
            where: {
                TestId: testId
            }
        });
        if (orderDetails && orderDetails.length > 0) {
            return true;
        }
        return false;
    }

    public async ManageProcedureOrderDetails(procedureOrderId: number, details: ProcedureOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ProcedureOrderId = procedureOrderId;
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

    public async ManageProcedureOrderDetailStatus(procedureOrderId: number, details: ProcedureOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.ProcedureOrderId = procedureOrderId;
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

    public async ManageProcedureOrderDetailStatusAfterBill(patientBillId: number, procedureOrderId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.OrderDetailId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManageProcedureOrderDetailItem(patientBillId, procedureOrderId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManageProcedureOrderDetailItem(PatientBillId: number, ProcedureOrderId: number, request: any,
        details: Array<any>): Promise<void> {
        let ProcedureOrderDetailId = details[0].ProcedureOrderDetailId;
        if (ProcedureOrderDetailId > 0) {
            let ProcedureOrderDetailedItem = await this.GetProcedureOrderDetailById({ Id: ProcedureOrderDetailId });
            ProcedureOrderDetailedItem.PatientBillId = PatientBillId;
            ProcedureOrderDetailedItem.PatientBillDetailId = details[0].Id;
            ProcedureOrderDetailedItem.PatientBillStatusId = details[0].PatientBillStatusId;
            await this.Update(ProcedureOrderDetailedItem);
        }
    }

    public async UpdateBillingStaus(procedureOrderdetailId: number, billingStatusId: number): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { PatientBillStatusId: billingStatusId };
        await this.Update(orderUpdate, {
            fields: ['PatientBillStatusId'],
            where: { Id: procedureOrderdetailId }
        });
        return result;
    }

    public async UpdateOrderStatus(procedureOrderdetailId: number, orderStatusId: any): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { OrderStatusId: orderStatusId };
        await this.Update(orderUpdate, {
            fields: ['OrderStatusId'],
            where: { Id: procedureOrderdetailId }
        });

        return result;
    }

    public async ProcessDetailsForOrder(procedureOrderId: number): Promise<boolean> {
        let orderDetails = await this.FindAll({
            where: {
                ProcedureOrderId: procedureOrderId
            }
        });
        if (orderDetails) {
            let orderDetailAttribs = this.GetAttributes(orderDetails);
            let orderGroups: any = {};
            let firstGroupKey: any = '';
            for (var idx in orderDetailAttribs) {
                var item = orderDetailAttribs[idx];
                if (!orderGroups[item.ServiceCategoryId]) {
                    orderGroups[item.ServiceCategoryId] = [];
                }
                if (!firstGroupKey) {
                    firstGroupKey = item.ServiceCategoryId;
                }
                orderGroups[item.ServiceCategoryId].push(item);
            }
            var groupLength = Object.keys(orderGroups).length;
            let orderBO = BoFactory.GetBo(bo.ProcedureOrderBo, this.Request);
            if (groupLength > 1) {
                delete orderGroups[firstGroupKey];
                var result = await orderBO.PlaceOrder(procedureOrderId, orderGroups, firstGroupKey);
                return result;
            } else {
                var result1 = await orderBO.UpdateServiceCategory(procedureOrderId, firstGroupKey);
                return result1;
            }
        }
        return true;
    }

    public async GetProcedureOrderDetails(apiReq?: ApiRequest<ProcedureOrderDetailFilters>):
        Promise<ApiResponse<ProcedureOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let ProcedureOrderWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqProcedureOrder: boolean = false;
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('OrderPriority'));
        include.push({ model: this.Models.Encounter, required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureOrderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.ProcedureOrderId:
                        where['ProcedureOrderId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.Ids:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case ProcedureOrderDetailFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.CategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.OrderStatusId:
                        where['OrderStatusId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ProcedureOrderDetailFilters.ConsultationId:
                        ProcedureOrderWhere['ConsultationId'] = param.Value;
                        isReqProcedureOrder = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.ProcedureOrder,
            where: ProcedureOrderWhere, required: isReqProcedureOrder,
            include: [
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteProcedureOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetProcedureOrderDetailsFromOrderId(orderId: number, detailids: any):
        Promise<ApiResponse<ProcedureOrderDetailAttributes[]>> {
        let listReq: any = {};
        listReq = {
            Params: [
                { Key: ProcedureOrderDetailFilters.ProcedureOrderId, Value: orderId },
                { Key: ProcedureOrderDetailFilters.Id, Value: detailids || [] },
                { Key: ProcedureOrderDetailFilters.IncludeTestMaster, Value: true }
            ]
        };
        let response = await this.GetProcedureOrderDetails(listReq);
        return response;
    }

    public GetModel(): SStatic.Model<ProcedureOrderDetailInstance, ProcedureOrderDetailAttributes> {
        return this.Models.ProcedureOrderDetail;
    }
}
