import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProcedureOrderInstance, ProcedureOrderAttributes } from '../Model/Interface/Index';
import { ProcedureOrderFilters } from '../Common/Filters.e';
import * as bo from '../../EMR/Business/Index';
import * as Userbo from '../../SystemSettings/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class ProcedureOrderBo extends BaseBo<ProcedureOrderInstance, ProcedureOrderAttributes>  {
    public async AddProcedureOrder(req: BaseRequest): Promise<number> {
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) {
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;
        }
        let result = await this.Save(req.Data.Header);
        let procedureOrderId = result.dataValues.Id;
        if (generateOrderId === 1) {
            this.deferSequenceKey(procedureOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.ProcedureOrderDetailBo, this.Request);
        await detailBO.ManageProcedureOrderDetails(procedureOrderId, req.Data.Details);

        if (req.Data.Header.OrderStatusId === 1) {
            await detailBO.ProcessDetailsForOrder(procedureOrderId);
        }


        return procedureOrderId;
    }

    public async UpdateProcedureOrder(req: BaseRequest): Promise<boolean> {
        let procedureOrderId = req.Data.Header.Id;
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) {
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;
        }
        let result = await this.Update(req.Data.Header);
        if (generateOrderId === 1) {
            this.deferSequenceKey(procedureOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.ProcedureOrderDetailBo, this.Request);
        await detailBO.ManageProcedureOrderDetails(procedureOrderId, req.Data.Details);

        if (req.Data.Header.OrderStatusId === 1) {
            await detailBO.ProcessDetailsForOrder(procedureOrderId);
        }

        return result;
    }

    public async ManageProcedureOrders(req: BaseRequest): Promise<boolean> {
        let details: ProcedureOrderAttributes[] = req.Data || [];
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

    public async UpdateProcedureOrderReview(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateBillingStaus(procedureOrderId: number, billingStatusId: number): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { PatientBillStatusId: billingStatusId };
        await this.Update(orderUpdate, {
            fields: ['PatientBillStatusId'],
            where: {
                Id: procedureOrderId
            }
        });
        return result;
    }

    public async UpdateOrderStatus(procedureOrderId: number, orderStatusId: any): Promise<boolean> {
        var result = true;

        let orderUpdate: any = { OrderStatusId: orderStatusId };
        await this.Update(orderUpdate, {
            fields: ['OrderStatusId'],
            where: {
                Id: procedureOrderId
            }
        });

        return result;
    }

    public async UpdateSubDepartment(procedureOrderId: number, SubDepartmentId: any): Promise<boolean> {
        var result = true;
        let SubDepartmentUpdate: any = { SubDepartmentId: parseInt(SubDepartmentId) };
        await this.Update(SubDepartmentUpdate, {
            fields: ['SubDepartmentId'],
            where: {
                Id: procedureOrderId
            }
        });

        return result;
    }

    public async UpdateTestType(procedureOrderId: number, parentOrderTestTypeId: any): Promise<boolean> {
        var result = true;
        let parentOrderUpdate: any = { TestTypeId: parseInt(parentOrderTestTypeId) };
        await this.Update(parentOrderUpdate, {
            fields: ['TestTypeId'],
            where: {
                Id: procedureOrderId
            }
        });

        return result;
    }

    public async UpdateServiceCategory(procedureOrderId: number, serviceCategoryId: any): Promise<boolean> {
        var result = true;
        let parentOrderUpdate: any = { ServiceCategoryId: parseInt(serviceCategoryId) };
        await this.Update(parentOrderUpdate, {
            fields: ['ServiceCategoryId'],
            where: {
                Id: procedureOrderId
            }
        });

        return result;
    }

    public async PlaceOrder(procedureOrderId: number, detailGroups: any,
        servicecategoryId: any): Promise<boolean> {
        var result = true;

        let parentOrderUpdate: any = { ServiceCategoryId: parseInt(servicecategoryId) };
        await this.Update(parentOrderUpdate, {
            fields: ['ServiceCategoryId'],
            where: {
                Id: procedureOrderId
            }
        });

        /*
        let isOrderableSplit = await this.isOrderableSplit();
        if (!isOrderableSplit || isOrderableSplit === 0) {
            await this.OrderByTestType(patientOrderId, detailGroups, parentOrderTestTypeId);
        } else {
            await this.OrderBySubDeptTestType(patientOrderId, detailGroups, parentOrderTestTypeId);
        }
        */

        await this.OrderByServiceCategory(procedureOrderId, detailGroups, servicecategoryId);

        return result;
    }

    public async isOrderableSplit(): Promise<number> {
        let OrderableSeparateSubDept = 0;
        try {
            let facilityprebo = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
            let facilityPreferencesData =
                await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
            if (facilityPreferencesData && facilityPreferencesData.orderableseparatebysubdept) {
                try {
                    OrderableSeparateSubDept = parseInt(facilityPreferencesData.orderableseparatebysubdept);
                } catch (ex) { OrderableSeparateSubDept = 0; }
            }
        } catch (ex) { OrderableSeparateSubDept = 0; }

        return OrderableSeparateSubDept;
    }

    public async OrderByServiceCategory(procedureOrderId: number, detailGroups: any,
        servicecategoryId: any): Promise<boolean> {
        let parentOrderInstance = await this.GetById(procedureOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        for (var categoryId in detailGroups) {
            var detailArr = detailGroups[categoryId];
            for (var key in detailArr) {
                let ServiceCategoryId = -1;
                try {
                    ServiceCategoryId = detailArr[key].ServiceCategoryId;
                } catch (ex) { console.log(ex); }
                parentOrder.Id = 0;
                parentOrder.OrderNumber = '';
                parentOrder.ServiceCategoryId = ServiceCategoryId;
                var inputData = {
                    Id: 0, Data: {
                        Header: parentOrder,
                        Details: detailArr
                    }
                };
            }
            await this.AddProcedureOrder(inputData);
        }

        return true;
    }

    public async OrderBySubDeptTestType(patientOrderId: number, detailGroups: any,
        parentOrderTestTypeId: any): Promise<boolean> {
        let parentOrderInstance = await this.GetById(patientOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        for (var testTypeId in detailGroups) {
            var detailArr = detailGroups[testTypeId];
            for (var key in detailArr) {
                let SubDepartmentId = -1;
                try {
                    SubDepartmentId = detailArr[key].SubDepartmentId;
                } catch (ex) { console.log(ex); }
                parentOrder.Id = 0;
                parentOrder.OrderNumber = '';
                parentOrder.SubDepartmentId = SubDepartmentId;
                var inputData = {
                    Id: 0, Data: {
                        Header: parentOrder,
                        Details: detailArr
                    }
                };
                await this.AddProcedureOrder(inputData);
            }
        }

        return true;
    }

    public async OrderByTestType(patientOrderId: number, detailGroups: any,
        parentOrderTestTypeId: any): Promise<boolean> {
        let parentOrderInstance = await this.GetById(patientOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        for (var testTypeId in detailGroups) {
            var detailArr = detailGroups[testTypeId];
            let SubDepartmentId = -1;
            try {
                SubDepartmentId = detailArr[0].SubDepartmentId;
            } catch (ex) { console.log(ex); }
            parentOrder.Id = 0;
            parentOrder.OrderNumber = '';
            parentOrder.SubDepartmentId = SubDepartmentId;
            var inputData = {
                Id: 0, Data: {
                    Header: parentOrder,
                    Details: detailArr
                }
            };
            await this.AddProcedureOrder(inputData);
        }

        return true;
    }

    public async GetProcedureOrderById(req: BaseRequest): Promise<ProcedureOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Encounter, required: false });

        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetProcedureOrderWithDetailsByBillingId(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
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
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
            include: [this.GetReference('EncounterType')]
        });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({
            model: this.Models.TokenDisplay, required: false,
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDeparement', required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProcedureOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderStatus:
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
                    case ProcedureOrderFilters.BillingId:
                        where['BillingId'] = param.Value;
                        include.push({ model: this.Models.PatientOrderDetail, required: false });
                        break;
                    case ProcedureOrderFilters.OrderNumber:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ProcedureOrderFilters.OrderReqDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case ProcedureOrderFilters.From:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.To:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case ProcedureOrderFilters.ServiceCategory:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderFromId:
                        where['OrderFromId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderToId:
                        where['OrderToId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.BillingStatusId:
                        where['BillingStatusId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.IncludeWOStatus:
                        let paramArr: Array<number> = [];
                        if (param.Value) {
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                        }
                        include.push({
                            model: this.Models.PatientWorkorder, required: false,
                            include: [
                                {
                                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
                                    as: 'ApprovedUser', required: false,
                                    include: [this.GetReference('Title')]
                                },
                                {
                                    model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
                                    include: [this.GetReference('Title')]
                                },
                                { model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false },
                                { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                                { model: this.Models.PatientWorkorderdetails, required: false }
                            ],
                            where: { 'WorkOrderStatusId': { '$in': paramArr } }
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetProcedureOrders(apiReq?: ApiRequest<ProcedureOrderFilters>): Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let procedureOrderDetailWhere: WhereOptions<any> = {};
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
        let procedureOrderDetailQryJoin: any = {
            model: this.Models.ProcedureOrderDetail, required: false,
            where: procedureOrderDetailWhere,
            include: [
                this.GetReference('OrderPriority'),
                { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false }
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
            include: [this.GetReference('EncounterType')]
        });
        include.push(this.GetReference('OrderPriority'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProcedureOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderStatus:
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
                    case ProcedureOrderFilters.BillingId:
                        where['BillingId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderNumber:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ProcedureOrderFilters.OrderReqDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case ProcedureOrderFilters.From:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.To:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case ProcedureOrderFilters.ServiceCategory:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderFromId:
                        where['OrderFromId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderToId:
                        where['OrderToId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.BillingStatusId:
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
                    case ProcedureOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
                        break;
                    case ProcedureOrderFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ClaimProcessId:
                        where['ClaimProcessId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ClaimNumber:
                        where['ClaimNumber'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin, procedureOrderDetailQryJoin);
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetProcedureOrdersForApproval(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
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
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.PatientGuarantor, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProcedureOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderStatus:
                        where['OrderStatusId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.BillingId:
                        where['BillingId'] = param.Value;
                        include.push({ model: this.Models.PatientOrderDetail, required: false });
                        break;
                    case ProcedureOrderFilters.OrderNumber:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case ProcedureOrderFilters.OrderReqDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case ProcedureOrderFilters.From:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.To:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case ProcedureOrderFilters.ServiceCategory:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderFromId:
                        where['OrderFromId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderToId:
                        where['OrderToId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.BillingStatusId:
                        where['BillingStatusId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.BillNumber:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case ProcedureOrderFilters.OrderTypeId:
                        where['OrderTypeId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.IsSelf:
                        where['IsSelf'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetProcedureOrderDetailsForApproval(apiReq?: ApiRequest<ProcedureOrderFilters>):
        Promise<ApiResponse<ProcedureOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.Encounter,
            required: false,
            include: [
                {
                    model: this.Models.PatientGuarantor,
                    required: false,
                    include: [
                        { model: this.Models.GuarantorCustomer, required: false },
                        { model: this.Models.GuarantorCustomerCard, required: false }
                    ]
                }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProcedureOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProcedureOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case ProcedureOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.OrderStatus:
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
                    case ProcedureOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case ProcedureOrderFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        include.push({ model: this.Models.ProcedureOrderDetail, required: false });
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    /*
    public async GetPatientOrderWithoutDetails(apiReq?: ApiRequest<PatientOrderFilters>): Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let GuarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({
            model: this.Models.TokenDisplay, required: false,
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDeparement', required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientOrderFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientOrderFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderPriority:
                        where['OrderPriorityId'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderStatus:
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
                    case PatientOrderFilters.BillingId:
                        where['BillingId'] = param.Value;
                        include.push({ model: this.Models.PatientOrderDetail, required: false });
                        break;
                    case PatientOrderFilters.OrderNumber:
                        where['$or'] = [{ 'OrderNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientOrderFilters.OrderReqDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientOrderFilters.From:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientOrderFilters.To:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientOrderFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientOrderFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientOrderFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderFromId:
                        where['OrderFromId'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderToId:
                        where['OrderToId'] = param.Value;
                        break;
                    case PatientOrderFilters.TestTypeId:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientOrderFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    case PatientOrderFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientOrderFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientOrderFilters.BillingStatusId:
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
                    case PatientOrderFilters.BillNumber:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientOrderFilters.IncludeWOStatus:
                        let paramArr: Array<number> = [];
                        if (param.Value) {
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                        }
                        include.push({
                            model: this.Models.PatientWorkorder, required: false,
                            include: [
                                {
                                    model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
                                    as: 'ApprovedUser', required: false,
                                    include: [this.GetReference('Title')]
                                },
                                {
                                    model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
                                    include: [this.GetReference('Title')]
                                },
                                { model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false },
                                { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                                { model: this.Models.PatientWorkorderdetails, required: false }
                            ],
                            where: { 'WorkOrderStatusId': { '$in': paramArr } }
                        });
                        break;
                    case PatientOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientOrderFilters.GuarantorId:
                        GuarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientOrderFilters.GuarantorTypeId:
                        GuarantorWhere['GuarantorTypeId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientOrderFilters.SubDeptId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter, attributes: ['GuarantorId', 'GuarantorTypeId', 'VisitIdentifier'],
            required: isGuarantorRequired,
            where: GuarantorWhere
        });
        include.push(patientQryJoin);
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    */

    public async DeleteProcedureOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    /*
    public async PrintPatientOrder(req: BaseRequest): Promise<FileInfo> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientOrders(apiReq);
        let PatientOrder = data.Data[0];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: PatientOrder.Id }]
        };
        let PatientOrderDetailData = await PatientOrderDetailBo.GetPatientOrderDetails(detailReq);
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: PatientOrder.DoctorId }]
        };
        let userBo = BoFactory.GetBo(Userbo.UserBo, this.Request);
        let userData = await userBo.GetUsers(userReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let info = {
            Patient: patientData,
            PatientOrder: PatientOrder,
            PatientOrderDetail: PatientOrderDetailData.Data,
            user: userData.Data[0],
            Preferences: printPreferencesData
        };

        let ephBO = BoFactory.GetBo(generalBo.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport('PatientOrder'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 3
                , Reason: req.Data ? req.Data.Reason : null
            });
    }
    */

    /*
    public async GetOrderHtml(req: BaseRequest): Promise<string> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientOrders(apiReq);
        let PatientOrder = data.Data[0];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: PatientOrder.Id }]
        };
        let PatientOrderDetailData = await PatientOrderDetailBo.GetPatientOrderDetails(detailReq);
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: PatientOrder.DoctorId }]
        };
        let userBo = BoFactory.GetBo(Userbo.UserBo, this.Request);
        let userData = await userBo.GetUsers(userReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });
        let info = {
            Patient: patientData,
            PatientOrder: PatientOrder,
            PatientOrderDetail: PatientOrderDetailData.Data,
            user: userData.Data[0]
        };

        let ephBO = BoFactory.GetBo(generalBo.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintHTMLReport('PatientOrder'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 3
                , Reason: req.Data ? req.Data.Reason : null
            });
    }
    */

    /*
    public async PrintPatientOrders(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.TestType, Value: 1 },
                { Key: PatientOrderFilters.EncounterId, Value: req.Id }
            ]
        };
        let data = await this.GetPatientOrders(apiReq);
        let PatientOrdersdata = data.Data;
        let patientorderId = Array();
        PatientOrdersdata.forEach((Detail) => {
            patientorderId.push(Detail.Id);
        });

        let PatientOrder = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Orderid, Value: PatientOrder.Id }]
        };
        let PatientWorkorderBo = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
        let PatientWorkorderData = await PatientWorkorderBo.GetPatientWorkorders(Req);
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrder.EncounterId },
                { Key: PatientWorkorderdetailsFilters.Orderid, Value: patientorderId }
            ]
        };
        let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderdetailsBo.GetPatientWorkorderdetailss(detailReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let WorkOrderDetails: any = [];
        let Test_sort = function (a: any, b: any) {
            return parseInt(a.TestDisplayOrder) - parseInt(b.TestDisplayOrder);
        };
        let Analyte_sort = function (a: any, b: any) {
            return parseInt(a.AnalyteDisplayOrder) - parseInt(b.AnalyteDisplayOrder);
        };
        PatientWorkorderDetailData.Data.sort(Test_sort);
        PatientWorkorderDetailData.Data.reduce(function (res, currentValue: any) {
            if (res.indexOf(currentValue.SubDepartment.DepartmentName) === -1) {
                res.push(currentValue.SubDepartment.DepartmentName);
            }
            return res;
        }, []).map(function (subdepartment) {
            let SubDepartment = subdepartment;
            let Details: any = PatientWorkorderDetailData.Data.filter(function (detail: any) {
                return detail.SubDepartment.DepartmentName === subdepartment;
            }).map(function (detail) {
                return detail;
            });
            let orderid = Details[0].PatientOrder.OrderNumber;
            let orderdate = Details[0].PatientOrder.OrderRequestDate;
            WorkOrderDetails.push({ SubDepartment: SubDepartment, Details: Details, orderid: orderid, orderdate: orderdate });
        });
        let PatientWorkOrderDetails: any = [];
        for (var idx in WorkOrderDetails) {
            var item = WorkOrderDetails[idx];
            item.Details = item.Details.reduce(function (res: any, currentValue: any) {
                if (res.indexOf(currentValue.Testname) === -1) {
                    res.push(currentValue.Testname);
                }
                return res;
            }, []).map(function (Testname: any) {
                let TestName = Testname;
                let Details: any = PatientWorkorderDetailData.Data.filter(function (detail: any) {
                    return detail.Testname === Testname;
                }).map(function (detail) {
                    return detail;
                });
                let Sampletype = Details[0].Sampletype;
                Details.sort(Analyte_sort);
                return { TestName: TestName, Details: Details, Sampletype: Sampletype };
            });
            PatientWorkOrderDetails.push(item);
        }
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData.Data[0],
            PatientWorkorderDetail: PatientWorkOrderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('consolidatelabresult', { header: {}, body: info }, null);
    }
    */

    /*
    public async PrintPatientOrdersWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.TestType, Value: 1 },
                { Key: PatientOrderFilters.EncounterId, Value: req.Id }
            ]
        };
        let data = await this.GetPatientOrders(apiReq);
        let PatientOrdersdata = data.Data;
        let patientorderId = Array();
        PatientOrdersdata.forEach((Detail) => {
            patientorderId.push(Detail.Id);
        });

        let PatientOrder = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Orderid, Value: PatientOrder.Id }]
        };
        let PatientWorkorderBo = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
        let PatientWorkorderData = await PatientWorkorderBo.GetPatientWorkorders(Req);
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrder.EncounterId },
                { Key: PatientWorkorderdetailsFilters.Orderid, Value: [patientorderId] }
            ]
        };
        let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderdetailsBo.GetPatientWorkorderdetailss(detailReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let WorkOrderDetails: any = [];
        let Test_sort = function (a: any, b: any) {
            return parseInt(a.TestDisplayOrder) - parseInt(b.TestDisplayOrder);
        };
        let Analyte_sort = function (a: any, b: any) {
            return parseInt(a.AnalyteDisplayOrder) - parseInt(b.AnalyteDisplayOrder);
        };
        PatientWorkorderDetailData.Data.sort(Test_sort);
        PatientWorkorderDetailData.Data.reduce(function (res, currentValue: any) {
            if (res.indexOf(currentValue.SubDepartment.DepartmentName) === -1) {
                res.push(currentValue.SubDepartment.DepartmentName);
            }
            return res;
        }, []).map(function (subdepartment) {
            let SubDepartment = subdepartment;
            let Details: any = PatientWorkorderDetailData.Data.filter(function (detail: any) {
                return detail.SubDepartment.DepartmentName === subdepartment;
            }).map(function (detail) {
                return detail;
            });
            let orderid = Details[0].PatientOrder.OrderNumber;
            let orderdate = Details[0].PatientOrder.OrderRequestDate;
            WorkOrderDetails.push({ SubDepartment: SubDepartment, Details: Details, orderid: orderid, orderdate: orderdate });
        });
        let PatientWorkOrderDetails: any = [];
        for (var idx in WorkOrderDetails) {
            var item = WorkOrderDetails[idx];
            item.Details = item.Details.reduce(function (res: any, currentValue: any) {
                if (res.indexOf(currentValue.Testname) === -1) {
                    res.push(currentValue.Testname);
                }
                return res;
            }, []).map(function (Testname: any) {
                let TestName = Testname;
                let Details: any = PatientWorkorderDetailData.Data.filter(function (detail: any) {
                    return detail.Testname === Testname;
                }).map(function (detail) {
                    return detail;
                });
                let Sampletype = Details[0].Sampletype;
                Details.sort(Analyte_sort);
                return { TestName: TestName, Details: Details, Sampletype: Sampletype };
            });
            PatientWorkOrderDetails.push(item);
        }
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData.Data[0],
            PatientWorkorderDetail: PatientWorkOrderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('consolidatelabresultwithoutheader', { header: {}, body: info }, null);
    }
    */

    public GetModel(): SStatic.Model<ProcedureOrderInstance, ProcedureOrderAttributes> {
        return this.Models.ProcedureOrder;
    }
    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let ProcedureOrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        return {
            'ProcedureOrderCount': ProcedureOrderCount
        };
    }
}
