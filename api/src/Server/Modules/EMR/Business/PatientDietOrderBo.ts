import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, FileInfo, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDietOrderInstance, PatientDietOrderAttributes } from '../Model/Interface/Index';
import { PatientDietOrderFilters, PatientDietOrderDetailFilters } from '../Common/Filters.e';
import * as bo from '../../EMR/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as generalBO from '../../General/Business/Index';
import * as billBo from '../../Billing/Business/Index';

export class PatientDietOrderBo extends BaseBo<PatientDietOrderInstance, PatientDietOrderAttributes>  {
    public async AddPatientDietOrder(req: BaseRequest): Promise<number> {
        let generateDietOrder = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            generateDietOrder = 1;
            req.Data.Header.OrderNumber = null;
        }
        // req.Data.Header.BillingStatusId = 1;
        let result = await this.Save(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientDietOrderDetailBo, this.Request);
        let patientDietOrderId = result.dataValues.Id;
        if (generateDietOrder === 1) {
            this.deferSequenceKey(patientDietOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientDietOrderId));
        }

        await detailBO.ManagePatientDietOrderDetails(patientDietOrderId, req.Data.Details);

        if (req.Data.Header.OrderStatusId === 1) {
            await detailBO.ProcessDetailsForOrder(patientDietOrderId);
        }
        let withDirectBill = 0;
        for (var idx in req.Data.Details) {
            var detail = req.Data.Details[idx];
            if (detail.IsDirectBill)
                withDirectBill = 1;
        }
        if (req.Data.Header.EncounterTypeId === 2 && withDirectBill === 1) {
            await this.ManageIPDirectBill(req, patientDietOrderId);
        }
        return patientDietOrderId;
    }
    public async ManageIPDirectBill(req: BaseRequest, DietorderId: number): Promise<boolean> {
        let PatientDietOrderDetailBo = BoFactory.GetBo(bo.PatientDietOrderDetailBo, this.Request);
        let patientDietOrder: any = await this.GetPatientDietOrderById({ Id: DietorderId });
        let PatientDietOrderDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientDietOrderDetailFilters.PatientDietOrderId, Value: DietorderId }]
        };
        let PatientDietOrderDetails =
            await PatientDietOrderDetailBo.GetPatientDietOrderDetails(PatientDietOrderDetailsApiReq);
        let ids = [];
        for (var idx in PatientDietOrderDetails.Data) {
            var detail = PatientDietOrderDetails.Data[idx];
            if (detail.IsDirectBill) ids.push(detail.Id);
        }
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageIPDietOrderPatientBills(DietorderId, ids, patientDietOrder, true);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            if (!req.Data.Header.BillNumber) {
                req.Data.Header.Id = DietorderId;
                req.Data.Header.BillingId = PatientBillId;
                req.Data.Header.BillNumber = PatientBillData.BillNumber;
                req.Data.Header.Rev = patientDietOrder.Rev;
                await this.Update(req.Data.Header);
            }
        }
        return true;
    }

    public async UpdatePatientDietOrder(req: BaseRequest): Promise<boolean> {
        let generateDietOrder = 0;
        let patientDietOrderId = req.Data.Header.Id;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            generateDietOrder = 1;
            req.Data.Header.OrderNumber = null;
        }
        let result = await this.Update(req.Data.Header);
        if (generateDietOrder === 1) {
            this.deferSequenceKey(patientDietOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientDietOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.PatientDietOrderDetailBo, this.Request);
        await detailBO.ManagePatientDietOrderDetails(patientDietOrderId, req.Data.Details);

        if (req.Data.Header.OrderStatusId === 1) {
            await detailBO.ProcessDetailsForOrder(patientDietOrderId);
        }

        let withCancelDirectBill = 0;
        for (var idx in req.Data.Details) {
            var detail = req.Data.Details[idx];
            if (detail.IsDirectBill && detail.OrderStatusId === 2)
                withCancelDirectBill = 1;
        }
        if (req.Data.Header.EncounterTypeId === 2 && withCancelDirectBill === 1) {
            await this.ManageIPCancelDirectBill(req, patientDietOrderId);
        }

        return result;
    }


    public async ManagePatientDietOrders(req: BaseRequest): Promise<boolean> {
        let details: PatientDietOrderAttributes[] = req.Data || [];
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

    public async ManageIPCancelDirectBill(req: BaseRequest, DietorderId: number): Promise<boolean> {
        let PatientDietOrderDetailBo = BoFactory.GetBo(bo.PatientDietOrderDetailBo, this.Request);
        let patientDietOrder: any = await this.GetPatientDietOrderById({ Id: DietorderId });
        let PatientDietOrderDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientDietOrderDetailFilters.PatientDietOrderId, Value: DietorderId }]
        };
        let PatientDietOrderDetails =
            await PatientDietOrderDetailBo.GetPatientDietOrderDetails(PatientDietOrderDetailsApiReq);
        let ids = [];
        for (var idx in PatientDietOrderDetails.Data) {
            var detail = PatientDietOrderDetails.Data[idx];
            if (detail.IsDirectBill) ids.push(detail.Id);
        }
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageIPCancelDietOrderPatientBills(DietorderId, ids, patientDietOrder, true);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            if (!req.Data.Header.BillNumber) {
                req.Data.Header.Id = DietorderId;
                req.Data.Header.BillingId = PatientBillId;
                req.Data.Header.BillNumber = PatientBillData.BillNumber;
                req.Data.Header.Rev = patientDietOrder.Rev;
                await this.Update(req.Data.Header);
            }
        }
        return true;
    }

    public async PlaceOrder(patientDietOrderId: number, detailGroups: any, parentOrderFrequencyId: any): Promise<boolean> {
        var result = true;
        let parentOrderInstance = await this.GetById(patientDietOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);

        //Update parent order testtypeid
        let parentOrderUpdate: any = { Id: 0, TestTypeId: parseInt(parentOrderFrequencyId) };
        await this.Models.PatientOrder.update(parentOrderUpdate, {
            fields: ['DietFrequencyId'],
            where: {
                Id: patientDietOrderId
            }
        });

        for (var frequencyId in detailGroups) {
            var detailArr = detailGroups[frequencyId];
            parentOrder.Id = 0;
            parentOrder.OrderNumber = '';
            parentOrder.DietFrequencyId = parseInt(frequencyId);

            var inputData = {
                Id: 0, Data: {
                    Header: parentOrder,
                    Details: detailArr
                }
            };
            await this.AddPatientDietOrder(inputData);
        }
        return result;
    }

    public async UpdateDietFrequency(patientDietOrderId: number, parentOrderDietFrequencyId: any): Promise<boolean> {
        var result = true;

        //Update parent order testtypeid
        let parentOrderUpdate: any = { Id: 0, DietFrequencyId: parseInt(parentOrderDietFrequencyId) };
        await this.Models.PatientOrder.update(parentOrderUpdate, {
            fields: ['DietFrequencyId'],
            where: {
                Id: patientDietOrderId
            }
        });

        return result;
    }

    public async GetPatientDietOrderById(req: BaseRequest): Promise<PatientDietOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Encounter, required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientDietOrders(apiReq?: ApiRequest<PatientDietOrderFilters>): Promise<ApiResponse<PatientDietOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let PatientDietOrderDetailWhere: WhereOptions<any> = {};
        let isReqPatientDietOrderDetailSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push(this.GetReference('DietFrequency'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
            include: [this.GetReference('EncounterType')]
        });
        include.push(this.GetReference('OrderPriority'));
        include.push({
            model: this.Models.PatientDietOrderDetail,
            attributes: ['DietName', 'IsAttender'], required: false,
            include: [
                this.GetReference('DietFrequency'),
                this.GetReference('DietItemType'),
            ]
        });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        // include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDietOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDietOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientDietOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.OrderStatus:
                        where['OrderStatusId'] = param.Value;
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['OrderStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDietOrderFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientDietOrderFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.FromDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDietOrderFilters.ToDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDietOrderFilters.OrderNumber:
                        where['OrderNumber'] = where['OrderNumber'] || {};
                        (where['OrderNumber'] as any)['$like'] = '%' + (param.Value || '') + '%';
                        break;
                    // case PatientDietOrderFilters.DietFrequencyId:
                    //     where['DietFrequencyId'] = param.Value;
                    //     break;
                    case PatientDietOrderFilters.OrderToId:
                        where['OrderToId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.UserId:
                        where['UserId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDietOrderFilters.DietFrequency:
                        PatientDietOrderDetailWhere['DietFrequencyId'] = param.Value;
                        isReqPatientDietOrderDetailSearch = true;
                        break;
                    case PatientDietOrderFilters.DietFrequencyId:
                        where['DietFrequencyId'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDietOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let dietordercount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': { '$in': [1] },
                'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate },
            }
        });
        return {
            'dietordercount': dietordercount,
        };
    }
    public async PrintPatientDietOrder(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDietOrderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientDietOrders(apiReq);
        let PatientDietOrders = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDietOrderDetailFilters.PatientDietOrderId, Value: PatientDietOrders.Id }]
        };
        let PatientDietOrderDetailBo = BoFactory.GetBo(bo.PatientDietOrderDetailBo, this.Request);
        let PatientDietOrderDetailData = await PatientDietOrderDetailBo.GetPatientDietOrderDetails(Req);
        let info = {
            Diet: PatientDietOrders,
            DietDetails: PatientDietOrderDetailData.Data
        };
        let Watermark = 'DUPLICATE';
        let PrintTypeId: number;
        if (info.Diet.OrderStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        // return await Report.Generate(key, { header: {}, body: info });
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport('dietorder'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }
    public async PrintKitchenworklist(apiReq?: ApiRequest<PatientDietOrderFilters>): Promise<any> {
        let data = await this.GetPatientDietOrders(apiReq);
        let PatientDietOrders = data.Data;
        let OrderDetails: any = [];
        PatientDietOrders.forEach((Detail: any) => {
            var item = Detail;
            Detail.PatientDietOrderDetails.forEach((v: any) => {
                var detail = v;
                detail.Patient = item.Patient;
                detail.Date = item.OrderRequestDate;
                detail.CreatedUser = item.CreatedUser;
                detail.OrderStatus = item.OrderStatus.DisplayName;
                detail.Ward = item.WardMaster.WardName;
                detail.Room = item.WardRoomMaster.RoomNo;
                detail.Bed = item.WardRoomBedMaster.BedNo;
                OrderDetails.push(detail);
            });
        });
        let info = {
            Diet: OrderDetails
        };

        return await Report.Generate('kitchendiet', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<PatientDietOrderInstance, PatientDietOrderAttributes> {
        return this.Models.PatientDietOrder;
    }

}
