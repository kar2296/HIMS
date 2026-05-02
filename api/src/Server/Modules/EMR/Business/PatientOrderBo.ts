import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientOrderInstance, PatientOrderAttributes } from '../Model/Interface/Index';
import { PatientOrderDetailAttributes } from '../Model/Interface/Index';
import { PatientOrderFilters, PatientOrderDetailFilters } from '../Common/Filters.e';
import { PatientWorkorderFilters, PatientWorkorderdetailsFilters } from '../../LIS/Common/Filters.e';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import * as bo from '../../EMR/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as Userbo from '../../SystemSettings/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as billBo from '../../Billing/Business/Index';
import * as generalBo from '../../General/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as moment from 'moment';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import {
    ServiceItemFilters,
    ServiceItemPackageMapFilters
} from '../../ClinicalMaster/Common/Filters.e';
import {
    PatientFilters
} from '../../Registration/Common/Filters.e';
import * as vhmgmntbo from '../../VirtualHealthcare/Business/Index';
import * as apnmntbo from '../../Appointment/Business/Index';
import { join } from 'path';
export class PatientOrderBo extends BaseBo<PatientOrderInstance, PatientOrderAttributes> {
    public async AddPatientOrder(req: BaseRequest): Promise<number> {
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;

            // if (req.Data.Header.OrderRequestDate)
            //     req.Data.Header.OrderRequestDate = new Date();
        }
        // req.Data.Header.BillingStatusId = 1;
        // if (await this.IsAlreadyExist(req) <= -1) return -1;
        let result = await this.Save(req.Data.Header);
        let patientOrderId = result.dataValues.Id;
        if (generateOrderId === 1) {
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        await detailBO.ManagePatientOrderDetails(patientOrderId, req.Data.Details, req.Data.Header);

        if (req.Data.Header.OrderStatusId === 1) {
            await detailBO.ProcessDetailsForOrder(patientOrderId);
        }

        let withDirectBill = 0;
        for (var idx in req.Data.Details) {
            var detail = req.Data.Details[idx];
            if (detail.IsDirectBill)
                withDirectBill = 1;
        }
        // if (req.Data.Header.EncounterTypeId === 1) {
        //     await this.ManageDraftBill(req, patientOrderId);
        // }
        if (req.Data.Header.EncounterTypeId === 2 && withDirectBill === 1) {
            await this.ManageIPDirectBill(req, patientOrderId);
        } else if (req.Data.Header.EncounterTypeId === 5 && withDirectBill === 1) {
            await this.ManageIPDirectBill(req, patientOrderId);
        }
        // await this.AddInterfaceData(req, patientOrderId);
        return patientOrderId;
    }
    // public async AddInterfaceData(req: BaseRequest, patientOrderId: number): Promise<boolean> {
    //     let lisintDetBO = BoFactory.GetBo(lisbo.LISInterfacePatientDetailsBo, this.Request);
    //     let lisintresBO = BoFactory.GetBo(lisbo.LISInterfaceResultsBo, this.Request);
    //     let InterfaceData: any = {
    //         Id: 0,
    //         OrganizationId: this.Session.OrganizationId,
    //         FacilityId: req.Data.Header.FacilityId,
    //         AssetId: 1,
    //         PatientId: req.Data.Header.PatientId,
    //         EncounterId: req.Data.Header.EncounterId,
    //         Status: 1,
    //     };
    //     let lisData = await lisintDetBO.Save(InterfaceData);
    //     let lisId = lisData.dataValues.Id;
    //     let InterfaceResData: any = {
    //         Id: 0,
    //         LISId: lisId,
    //         OrganizationId: this.Session.OrganizationId,
    //         FacilityId: req.Data.Header.FacilityId,
    //         AssetId: 1,
    //         PatientId: req.Data.Header.PatientId,
    //         PatientName: req.Data.Header.PatientName,
    //         MRNNo: req.Data.Header.PatientMRN,
    //         EncounterId: req.Data.Header.EncounterId,
    //         Status: 1,
    //     };
    //     let lisresData = await lisintresBO.Save(InterfaceResData);
    //     let lisresId = lisresData.dataValues.Id;
    //     let orderData: any = {
    //         Id: patientOrderId,
    //         LISId: lisId,
    //         LISResultId: lisresId
    //     };
    //     await this.Update(orderData);
    //     return true;
    // }

    public async AddPatientOrderWithExecutableProcedures(req: BaseRequest): Promise<number> {
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;

            // if (req.Data.Header.OrderRequestDate)
            //     req.Data.Header.OrderRequestDate = new Date();
        }
        // req.Data.Header.BillingStatusId = 1;
        let result = await this.Save(req.Data.Header);
        let patientOrderId = result.dataValues.Id;
        if (generateOrderId === 1) {
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        await detailBO.ManagePatientOrderDetailsWithExecutableProcedures(patientOrderId, req.Data.Details);

        if (req.Data.Header.OrderStatusId === 1) {
            // if (!req.Data.Header.PatientBillId || req.Data.Header.PatientBillId === 0) {
            //     let PatientBillId: number = 0;
            //     let BillingBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            //     PatientBillId = await BillingBo.ManageOrderPatientBills(patientOrderId);
            //     let patientorderupdate: any = { PatientBillId: PatientBillId };
            //     await this.Models.PatientOrder.update(patientorderupdate, { fields: ['PatientBillId'], where: { Id: patientOrderId } });
            // }
            await detailBO.ProcessDetailsForOrder(patientOrderId);
        }

        let withDirectBill = 0;
        for (var idx in req.Data.Details) {
            var detail = req.Data.Details[idx];
            if (detail.IsDirectBill)
                withDirectBill = 1;
        }

        if (req.Data.Header.EncounterTypeId === 2 && withDirectBill === 1) {
            await this.ManageIPDirectBill(req, patientOrderId);
        }

        return patientOrderId;
    }

    public async ManageDraftBill(req: BaseRequest, orderId: number): Promise<boolean> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrder: any = await this.GetPatientOrderById({ Id: orderId });
        let PatientOrderDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId }]
        };
        let PatientOrderDetails =
            await PatientOrderDetailBo.GetPatientOrderDetails(PatientOrderDetailsApiReq);
        let ids = [];
        for (var idx in PatientOrderDetails.Data) {
            var detail = PatientOrderDetails.Data[idx];
            // if (detail.IsDirectBill)
            ids.push(detail.Id);
        }
        let fromward = req.Data.Header.IsFromWard;
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageOrderPatientDraftBills(orderId, ids, patientOrder, fromward, true);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            if (!req.Data.Header.BillNumber) {
                req.Data.Header.Id = orderId;
                req.Data.Header.BillingId = PatientBillId;
                req.Data.Header.BillDateTime = patientOrder.OrderRequestDate;
                req.Data.Header.BillNumber = PatientBillData.BillNumber;
                req.Data.Header.SubDepartmentId = patientOrder.SubDepartmentId;
                req.Data.Header.OTRegisterId = patientOrder.SurgeryEntryId;
                req.Data.Header.OTIdentifier = patientOrder.SurgeryIdentifier;
                req.Data.Header.IsFromWard = req.Data.Header.IsFromWard;
                req.Data.Header.Rev = patientOrder.Rev;
                req.Data.Header.IsDirectBill = true;
                await this.Update(req.Data.Header);
            }
        }
        return true;
    }

    public async ManageIPDirectBill(req: BaseRequest, orderId: number): Promise<boolean> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrder: any = await this.GetPatientOrderById({ Id: orderId });
        let PatientOrderDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId }]
        };
        let PatientOrderDetails =
            await PatientOrderDetailBo.GetPatientOrderDetails(PatientOrderDetailsApiReq);
        let ids = [];
        for (var idx in PatientOrderDetails.Data) {
            var detail = PatientOrderDetails.Data[idx];
            if (detail.IsDirectBill) {
                ids.push(detail.Id);
            }
        }
        let fromward = req.Data.Header.IsFromWard;
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageIPOrderPatientBills(orderId, ids, patientOrder,
            fromward, true, 1, req.Data.Details);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            if (!req.Data.Header.BillNumber) {
                // req.Data.Header.Id = orderId;
                // req.Data.Header.BillingId = PatientBillId;
                // req.Data.Header.BillDateTime = patientOrder.OrderRequestDate;
                // req.Data.Header.BillNumber = PatientBillData.BillNumber;
                // req.Data.Header.SubDepartmentId = patientOrder.SubDepartmentId;
                // req.Data.Header.OTRegisterId = patientOrder.SurgeryEntryId;
                // req.Data.Header.OTIdentifier = patientOrder.SurgeryIdentifier;
                // req.Data.Header.IsFromWard = req.Data.Header.IsFromWard;
                // req.Data.Header.Rev = patientOrder.Rev;
                // req.Data.Header.IsDirectBill = true;
                let updateData: any = {
                    Id: orderId,
                    BillingId: PatientBillId,
                    BillDateTime: patientOrder.OrderRequestDate,
                    BillNumber: PatientBillData.BillNumber,
                    SubDepartmentId: patientOrder.SubDepartmentId,
                    OTRegisterId: patientOrder.SurgeryEntryId,
                    OTIdentifier: patientOrder.SurgeryIdentifier,
                    IsFromWard: req.Data.Header.IsFromWard,
                    Rev: patientOrder.Rev,
                    IsDirectBill: true
                };
                await this.Update(updateData);
            }

            if (req.Data.Header && req.Data.Header.updateBillLock && req.Data.Header.updateBillLock === 1) {
                let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let IsbillLock: any = { IsBillLock: true };
                await encounterbo.Update(IsbillLock, {
                    fields: ['IsBillLock'],
                    where: {
                        Id: req.Data.Header.EncounterId
                    }
                });
            }
        }
        return true;
    }

    public async UpdatePatientOrder(req: BaseRequest): Promise<boolean> {
        let patientOrderId = req.Data.Header.Id;
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;
        }
        let result = await this.Update(req.Data.Header);
        if (generateOrderId === 1) {
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        await detailBO.ManagePatientOrderDetails(patientOrderId, req.Data.Details, req.Data.Header);

        if (req.Data.Header.OrderStatusId === 1) {
            // if (!req.Data.Header.PatientBillId || req.Data.Header.PatientBillId === 0) {
            //     let PatientBillId: number = 0;
            //     let BillingBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
            //     PatientBillId = await BillingBo.ManageOrderPatientBills(patientOrderId);
            //     let patientorderupdate: any = { PatientBillId: PatientBillId };
            //     await this.Models.PatientOrder.update(patientorderupdate, { fields: ['PatientBillId'], where: { Id: patientOrderId } });
            // }
            await detailBO.ProcessDetailsForOrder(patientOrderId);
        }
        return result;
    }

    public async UpdateOrderStatusPatientOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrderId = req.Data.Header.Id;
        let OrderStatusId = req.Data.Header.OrderStatusId;
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        if (req.Data.Header.BillingId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: req.Data.Header.BillingId });
            if (PatientBillData) {
                req.Data.Header.Id = PatientBillData.Id;
            }
            await BillBO.Update(req.Data.Header);
        }
        await detailBO.ManageOrderStatusDetails(patientOrderId, OrderStatusId, req.Data.Details);
        return result;
    }

    public async UpdateCancelPatientOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrderId = req.Data.Header.Id;
        let OrderStatusId = req.Data.Header.OrderStatusId;
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        if (req.Data.Header.BillingId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: req.Data.Header.BillingId });
            if (PatientBillData) {
                req.Data.Header.Id = PatientBillData.Id;
                req.Data.Header.PatientBillStatusId = 2;
            }
            await BillBO.Update(req.Data.Header);
        }
        await detailBO.ManageCancelOrderDetails(patientOrderId, OrderStatusId, req.Data.Details);
        return result;
    }

    public async UpdateCancelclinicalPatientOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async UpdateorderCancelPatientOrder(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrderId = req.Data.Header.Id;
        let OrderStatusId = req.Data.Header.OrderStatusId;
        if (req.Data.Header.VirtualOrderId) {
            let vhordBO = BoFactory.GetBo(vhmgmntbo.VirtualOrderBo, this.Request);
            let vorderData = await vhordBO.GetVirtualOrderById({ Id: req.Data.Header.VirtualOrderId });
            if (vorderData.AppointmentId) {
                let apnmntBO = BoFactory.GetBo(apnmntbo.AppointmentBo, this.Request);
                let virtualApnmntInfo = await apnmntBO.GetAppointmentById({ Id: vorderData.AppointmentId });
                let apnmntData: any = {
                    Id: virtualApnmntInfo.Id,
                    AppointmentStatusId: 5
                };
                await apnmntBO.Update(apnmntData);
            }
        }
        await detailBO.ManageCancelOrderDetails(patientOrderId, OrderStatusId, req.Data.Details);
        // await this.sendUserCancelSMS(req);
        return result;
    }

    public async UpdatePatientOrderReview(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async UpdateBillingStaus(patientOrderId: number, billingStatusId: number): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { PatientBillStatusId: billingStatusId };
        await this.Update(orderUpdate, {
            fields: ['PatientBillStatusId'],
            where: {
                Id: patientOrderId
            }
        });
        return result;
    }

    public async ManagePatientOrders(req: BaseRequest): Promise<boolean> {
        let details: PatientOrderAttributes[] = req.Data || [];
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

    public async UpdateOrderStatus(patientOrderId: number, orderStatusId: any): Promise<boolean> {
        var result = true;

        let orderUpdate: any = { OrderStatusId: orderStatusId };
        await this.Update(orderUpdate, {
            fields: ['OrderStatusId'],
            where: {
                Id: patientOrderId
            }
        });

        return result;
    }

    public async GetLastRequesDate(req: BaseRequest): Promise<any> {
        let CurrentDate = moment().toDate();
        let lastreqdate = moment(req.Data.TransactionDate).toDate();
        lastreqdate.setHours(CurrentDate.getHours());
        lastreqdate.setMinutes(CurrentDate.getMinutes());
        lastreqdate.setSeconds(CurrentDate.getSeconds());
        if (req.Data.TransactionDate) {
            let frmDate = moment(req.Data.TransactionDate).format('YYYY-MM-DD 00:00:00');
            let toDate = moment(req.Data.TransactionDate).format('YYYY-MM-DD 23:59:59');
            let maxpidInstance: any = await this.Find({
                attributes: [
                    [this.Dal.fn('MAX', this.Dal.col('OrderRequestDate')), 'OrderRequestDate'],
                ],
                where: {
                    OrderRequestDate: { '$gt': frmDate, '$lte': toDate }
                }
            });
            if (maxpidInstance) {
                let patient: any = this.GetAttribute(maxpidInstance);
                let lastreqdbdate = patient['OrderRequestDate'];
                if (lastreqdbdate) {
                    lastreqdate = lastreqdbdate;
                }
            }
        }
        return lastreqdate;
    }

    public async UpdateSubDepartment(patientOrderId: number, SubDepartmentId: any): Promise<boolean> {
        var result = true;

        //Update parent order testtypeid
        let SubDepartmentUpdate: any = { SubDepartmentId: parseInt(SubDepartmentId) };
        await this.Update(SubDepartmentUpdate, {
            fields: ['SubDepartmentId'],
            where: {
                Id: patientOrderId
            }
        });

        return result;
    }

    public async UpdateTestType(patientOrderId: number, parentOrderTestTypeId: any,
        parentSubDeptId: any): Promise<boolean> {
        var result = true;

        //Update parent order testtypeid
        let parentOrderUpdate: any = {
            TestTypeId: parseInt(parentOrderTestTypeId),
            SubDepartmentId: parseInt(parentSubDeptId)
        };
        await this.Update(parentOrderUpdate, {
            fields: ['TestTypeId', 'SubDepartmentId'],
            where: {
                Id: patientOrderId
            }
        });

        return result;
    }

    public async PlaceOrder(patientOrderId: number, detailGroups: any,
        parentOrderTestTypeId: any, parentSubDeptId: any): Promise<boolean> {
        var result = true;
        //Update parent order testtypeid
        let parentOrderUpdate: any = {
            TestTypeId: parseInt(parentOrderTestTypeId),
            SubDepartmentId: parseInt(parentSubDeptId)
        };
        await this.Update(parentOrderUpdate, {
            fields: ['TestTypeId', 'SubDepartmentId'],
            where: {
                Id: patientOrderId
            }
        });
        let isOrderableSplit = await this.isOrderableSplit();

        if (!isOrderableSplit || isOrderableSplit === 0) {
            await this.OrderByTestType(patientOrderId, detailGroups, parentOrderTestTypeId);
        } else {
            await this.OrderBySubDeptTestType(patientOrderId, detailGroups, parentOrderTestTypeId);
        }

        return result;
    }

    public async isExtLabOrderableSplit(): Promise<number> {
        let OrderableSeparateExternal = 0;
        try {
            let facilityprebo = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
            let facilityPreferencesData =
                await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
            if (facilityPreferencesData && facilityPreferencesData.externaltestoredersplit) {
                try {
                    OrderableSeparateExternal = parseInt(facilityPreferencesData.externaltestoredersplit);
                } catch (ex) { OrderableSeparateExternal = 0; }
            }
        } catch (ex) { OrderableSeparateExternal = 0; }

        return OrderableSeparateExternal;
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

    public async OrderBySubDeptTestType(patientOrderId: number, detailGroups: any,
        parentOrderTestTypeId: any): Promise<boolean> {
        let parentOrderInstance = await this.GetById(patientOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        for (var testTypeId in detailGroups) {
            var detailArr = detailGroups[testTypeId];
            let SubDepartmentId = -1;
            let OrderToId = parentOrder.OrderToId;
            let TestTypeId = -1;
            let netpatamt = 0;
            let netinsamt = 0;
            for (let odx in detailArr) {
                let orderDet = detailArr[odx];
                netpatamt += orderDet.PatNetAmount;
                netinsamt += orderDet.InsNetAmount;
            }
            try {
                SubDepartmentId = detailArr[0].SubDepartmentId;
                if (detailArr[0].DepartmentId && detailArr[0].DepartmentId > 0) {
                    OrderToId = detailArr[0].DepartmentId;
                }
                TestTypeId = detailArr[0].TestTypeId;
            } catch (ex) { console.log(ex); }
            parentOrder.Id = 0;
            parentOrder.OrderNumber = '';
            parentOrder.TestTypeId = TestTypeId;
            parentOrder.NetPatientAmount = netpatamt;
            parentOrder.NetInsuranceAmount = netinsamt;
            parentOrder.SubDepartmentId = SubDepartmentId;
            parentOrder.OrderToId = OrderToId;
            var inputData = {
                Id: 0, Data: {
                    Header: parentOrder,
                    Details: detailArr
                }
            };
            await this.AddPatientOrder(inputData);
        }

        return true;
    }

    public async OrderByTestType(patientOrderId: number, detailGroups: any,
        parentOrderTestTypeId: any): Promise<boolean> {

        let parentOrderInstance = await this.GetById(patientOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        console.log('***********');
        console.log(detailGroups);
        for (var testTypeId in detailGroups) {
            var detailArr = detailGroups[testTypeId];
            let SubDepartmentId = -1;
            let OrderToId = parentOrder.OrderToId;
            let netpatamt = 0;
            let netinsamt = 0;
            for (let odx in detailArr) {
                let orderDet = detailArr[odx];
                netpatamt += orderDet.PatNetAmount;
                netinsamt += orderDet.InsNetAmount;
            }
            try {
                SubDepartmentId = detailArr[0].SubDepartmentId;
                if (detailArr[0].DepartmentId && detailArr[0].DepartmentId > 0) {
                    OrderToId = detailArr[0].DepartmentId;
                }

            } catch (ex) { console.log(ex); }
            parentOrder.Id = 0;
            parentOrder.OrderNumber = '';
            parentOrder.TestTypeId = parseInt(testTypeId);
            parentOrder.SubDepartmentId = SubDepartmentId;
            parentOrder.OrderToId = OrderToId;
            parentOrder.NetPatientAmount = netpatamt;
            parentOrder.NetInsuranceAmount = netinsamt;
            var inputData = {
                Id: 0, Data: {
                    Header: parentOrder,
                    Details: detailArr
                }
            };
            await this.AddPatientOrder(inputData);
            await this.UpdateoldAmount(patientOrderId);
        }

        return true;
    }


    public async UpdateoldAmount(patientOrderId: number): Promise<boolean> {
        let parentOrderInstance = await this.GetById(patientOrderId);
        var parentOrder = this.GetAttribute(parentOrderInstance);
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);

        let PatientOrderDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: patientOrderId }]
        };
        let PatientOrderDetails =
            await detailBO.GetPatientOrderDetails(PatientOrderDetailsApiReq);
        if (PatientOrderDetails.Data.length > 0) {
            let netpatamt = 0;
            let netinsamt = 0;
            for (let odx in PatientOrderDetails.Data) {
                let orderDet = PatientOrderDetails.Data[odx];
                netpatamt += orderDet.PatNetAmount;
                netinsamt += orderDet.InsNetAmount;
            }
            parentOrder.Id = patientOrderId;
            parentOrder.NetPatientAmount = netpatamt;
            parentOrder.NetInsuranceAmount = netinsamt;
            await this.Update(parentOrder);
        }

        return true;
    }

    public async ManagePatientOrder(
        order: PatientOrderAttributes, orderdetails: PatientOrderDetailAttributes[]): Promise<boolean> {
        let orderNumber: number = 0;
        order.Id = order.Id || 0;
        if (order.Status === 2 && order.Id !== 0) {
            await this.MarkAsDelete(order.Id);
        } else if (order.Id === 0) {
            if (order.OrderStatusId === 1
                && !order.OrderNumber) { //Created
                order.OrderNumber = null; //await Sequence.Next(SequenceKeys.PatientOrderId);
                orderNumber = 1;
            }
            if (order.IsExternalLab) {
                order.ExternalOrderStatusId = 1;
            }
            // order.BillingStatusId = 1;
            let result = await this.Save(order);
            let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
            let patientOrderId = result.dataValues.Id;
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
            await detailBO.ManagePatientOrderDetails(patientOrderId, orderdetails, order);

        } else if (order.Id > 0) {
            if (order.OrderStatusId === 1
                && !order.OrderNumber) { //Created
                order.OrderNumber = null; //await Sequence.Next(SequenceKeys.PatientOrderId);
                orderNumber = 1;
            }
            await this.Update(order);
            let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
            let patientOrderId = order.Id;
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
            await detailBO.ManagePatientOrderDetails(patientOrderId, orderdetails, order);
        }

        return true;
    }

    public async ManageAdditionalInPatientOrder(
        order: PatientOrderAttributes,
        orderdetails: PatientOrderDetailAttributes[]): Promise<boolean> {

        order.Id = order.Id || 0;
        if (order.Id === 0) {
            if (order.OrderStatusId === 1
                && !order.OrderNumber) { //Created
                order.OrderNumber = null;
            }
            // order.BillingStatusId = 1;
            let result = await this.Save(order);
            let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
            let patientOrderId = result.dataValues.Id;
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
            await detailBO.ManageAdditionalInPatientOrderDetails(patientOrderId, orderdetails);

        }

        return true;
    }

    public async AddVirtualPatientOrder(req: any): Promise<number> {
        let generateOrderId = 0;
        if (req.OrderStatusId === 1
            && !req.OrderNumber) { //Created
            req.OrderNumber = null;
            generateOrderId = 1;
        }

        let result = await this.Save(req);
        let patientOrderId = result.dataValues.Id;
        // if (req.IsRenewed) {
        //     let orderReq = {
        //         Id: 0,
        //         PageContext: { PageSize: 1000, PageNumber: 1 },
        //         Params: [{ Key: PatientOrderFilters.VirtualOrderId, Value: req.vorderId }]
        //     };
        //     let renewData = await this.GetPatientOrders(orderReq);
        //     if (renewData.Data.length > 0) {
        //         let orderInfo = renewData.Data[0];
        //         let renewUpdate: any = {
        //             Id: orderInfo.Id,
        //             RenewalId: patientOrderId
        //         };
        //         await this.Update(renewUpdate);
        //     }
        // }
        if (generateOrderId === 1) {
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let vorderDetails: any = [];
        let vdetailData: any = {};
        if (req.Details.length > 0) {
            for (let idx in req.Details) {
                vdetailData = req.Details[idx];
                vdetailData.Id = 0;
                vdetailData.PatientId = req.PatientId;
                vdetailData.OrderStatusId = 1;
                vdetailData.PatientBillStatusId = 3;
                vdetailData.IsVirtualOrders = true;
                let ServiceItemPackageBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemPackageMapBo, this.Request);
                let ServiceItemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                if (vdetailData.IsPackageItem) {
                    let PackageApiReq = {
                        Id: 0,
                        PageContext: { PageSize: 1000, PageNumber: 1 },
                        Params: [{ Key: ServiceItemPackageMapFilters.ServiceItemId, Value: vdetailData.ServiceId }]
                    };
                    let PackageItems = await ServiceItemPackageBo.GetServiceItemPackageMaps(PackageApiReq);
                    if (PackageItems.Data.length > 0) {

                        for (let pdx in PackageItems.Data) {
                            let packData = PackageItems.Data[pdx];
                            let ServiceItemApiReq = {
                                Id: 0,
                                PageContext: { PageSize: 1000, PageNumber: 1 },
                                Params: [{ Key: ServiceItemFilters.Id, Value: packData.ServiceId }]
                            };
                            let ServiceItems = await ServiceItemBo.GetServiceItems(ServiceItemApiReq);
                            if (ServiceItems.Data.length > 0) {
                                let ServiceItem: any = ServiceItems.Data[0];
                                if (ServiceItem.IsOrderable) {
                                    // let testid = ServiceItem.OrderTypeId;
                                    let TestDetail = {
                                        BillDateTime: new Date(),
                                        CancelReason: 0,
                                        CancelledBy: 0,
                                        DepartmentId: ServiceItem.DepartmentId,
                                        MasterTypeId: 1,
                                        OrderDateTime: new Date(),
                                        PackageId: vdetailData.ServiceId,
                                        PackageName: vdetailData.ServiceName,
                                        Quantity: packData.Quantity,
                                        RequestDate: new Date(), ServiceCategoryId: ServiceItem.ServiceCategoryId,
                                        ServiceCode: ServiceItem.ServiceCode,
                                        ServiceId: ServiceItem.Id,
                                        ServiceName: ServiceItem.ServiceName,
                                        Status: 1,
                                        SubDepartmentId: ServiceItem.SubDepartmentId,
                                        TestCode: ServiceItem.ItemCode,
                                        TestDescription: ServiceItem.Description,
                                        TestId: ServiceItem.MasterItemId,
                                        TestName: ServiceItem.MasterName,
                                        TestTypeId: ServiceItem.OrderTypeId,
                                        IsPackage: true,
                                        PatientId: req.PatientId
                                    };
                                    vorderDetails.push(TestDetail);
                                }
                            }
                        }
                    }
                } else if (!vdetailData.IsPackageItem) {
                    vorderDetails.push(vdetailData);
                }
            }
        }
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        await detailBO.ManagePatientVirtualOrderDetails(patientOrderId, vorderDetails);
        await this.ManageVirtualBill(req, patientOrderId);
        // if (result && req.IsLabOrders) {
        //     await this.sendLabOrderConfirmSMS(req, patientOrderId);
        // }
        // if (result && req.IsVaccineOrders) {
        //     await this.sendVaccineOrderConfirmSMS(req, patientOrderId);
        // }
        // if (result && req.IsOxygenOrders) {
        //     await this.sendOxygenOrderConfirmSMS(req, patientOrderId);
        // }
        return patientOrderId;
    }

    public async ManageVirtualBill(req: any, orderId: number): Promise<boolean> {
        // let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let patientOrder: any = await this.GetPatientOrderById({ Id: orderId });
        // let PatientOrderDetailsApiReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 1000, PageNumber: 1 },
        //     Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId }]
        // };
        // let PatientOrderDetails =
        //     await PatientOrderDetailBo.GetPatientOrderDetails(PatientOrderDetailsApiReq);
        let Details = [];
        for (var idx in req.Details) {
            var detail = req.Details[idx];
            Details.push(detail);
        }
        let BillBO = BoFactory.GetBo(billBo.PatientBillsBo, this.Request);
        let PatientBillId = await BillBO.ManageVirtualOrderPatientBills(orderId, Details, patientOrder, true);
        if (PatientBillId) {
            let PatientBillData = await BillBO.GetPatientBillsById({ Id: PatientBillId });
            req.Id = orderId;
            req.BillingId = PatientBillId;
            req.BillNumber = PatientBillData.BillNumber;
            req.SubDepartmentId = patientOrder.SubDepartmentId;
            req.OTRegisterId = patientOrder.SurgeryEntryId;
            req.OTIdentifier = patientOrder.SurgeryIdentifier;
            req.Rev = patientOrder.Rev;
            req.IsDirectBill = true;
            await this.Update(req);
        }
        return true;
    }

    public async GetPatientOrderByIdWithoutDetails(req: BaseRequest): Promise<PatientOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.PatientBills, as: 'PatientBills', attributes: ['CancelReqRaisedStatusId',
                'PatientBillStatusId'], required: false
        });
        let result = await this.GetById(req.Id, {
            attributes: ['Id', 'BillingId',
                'EncounterTypeId'
            ], include: include
        });
        return this.GetAttribute(result);
    }

    public async GetPatientOrderById(req: BaseRequest): Promise<PatientOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Encounter, required: false });
        include.push({
            model: this.Models.VirtualOrder,
            include: [
                this.GetReference('PaymentMode'),
                { model: this.Models.VirtualCategory, required: false },
                { model: this.Models.VirtualSubCategory, required: false }],
            required: false
        });
        include.push(this.GetReference('OrderPriority'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.Patient, required: false });
        include.push({
            model: this.Models.PatientOrderDetail, required: false,
            include: [
                this.GetReference('OrderPriority'),
                { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false },
                { model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false }
            ]
        });
        include.push({
            model: this.Models.Facility, required: false,
        });
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
                { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false },
                { model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false },
                {
                    model: this.Models.PatientWorkorderdetails, required: false,
                    // include: [this.GetReference('Dosage'),
                    // this.GetReference('ResultValue'),
                    // this.GetReference('VaccinationType'),
                    // this.GetReference('InjectionSite'),
                    // this.GetReference('Route')
                    // ]
                },
                // { model: this.Models.PatientWorkorderdetails, required: false }
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetMinPatientOrderById(req: BaseRequest): Promise<PatientOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Encounter,
            attributes: ['Id', 'EncounterTypeid', 'GuarantorId',
                'GuarantorTypeId', 'ServiceRateCategoryId', 'FacilityId',
                'DepartmentId', 'OrganizationId'
            ],
            required: false
        });
        // include.push({
        //     model: this.Models.VirtualOrder,
        //     include: [
        //         this.GetReference('PaymentMode'),
        //         { model: this.Models.VirtualCategory, required: false },
        //         { model: this.Models.VirtualSubCategory, required: false }],
        //     required: false
        // });
        include.push(this.GetReference('OrderPriority'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'firstname', 'MRN'],
            required: false
        });
        // include.push({
        //     model: this.Models.PatientOrderDetail, required: false,
        //     include: [
        //         this.GetReference('OrderPriority'),
        //         { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false },
        //         { model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false }
        //     ]
        // });
        // include.push({
        //     model: this.Models.Facility, required: false,
        // });
        // include.push({
        //     model: this.Models.PatientWorkorder, required: false,
        //     include: [
        //         {
        //             model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
        //             as: 'ApprovedUser', required: false,
        //             include: [this.GetReference('Title')]
        //         },
        //         {
        //             model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
        //             include: [this.GetReference('Title')]
        //         },
        //         { model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false },
        //         { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false },
        //         { model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false },
        //         {
        //             model: this.Models.PatientWorkorderdetails, required: false,
        //             // include: [this.GetReference('Dosage'),
        //             // this.GetReference('ResultValue'),
        //             // this.GetReference('VaccinationType'),
        //             // this.GetReference('InjectionSite'),
        //             // this.GetReference('Route')
        //             // ]
        //         },
        //         // { model: this.Models.PatientWorkorderdetails, required: false }
        //     ]
        // });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }
    public async GetPatientOrderWithDetailsByBillingId(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
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
            model: this.Models.PatientPaymentDetails, required: false,
        });
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
                    case PatientOrderFilters.NoEncounterId:
                        (where as any)[Op.not] = [{ EncounterId: param.Value }];
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
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value + ' 23:59:59';
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
                        break;
                    case PatientOrderFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientOrderFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
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
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPrintMinPatientOrders(apiReq?: ApiRequest<PatientOrderFilters>): Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDeparement', required: false });
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
                    case PatientOrderFilters.OrderNumber:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                    // case PatientOrderFilters.Patient:
                    //     patientQryJoin['where']['$or'] = [
                    //         { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }
                    //     ];
                    //     patientQryJoin['required'] = true;
                    //     break;
                    // case PatientOrderFilters.TestName:
                    //     patientOrderDetailWhere['$or'] = [{ 'TestName': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     // patientOrderDetailWhere['where']['$or'] = [
                    //     //     { 'TestName': { '$like': (param.Value || '') + '%' } }
                    //     // ];
                    //     patientOrderDetailQryJoin['required'] = true;
                    //     break;
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
                    // case PatientOrderFilters.TestTypeId:
                    //     where['TestTypeId'] = param.Value;
                    //     break;
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
                        break;
                    case PatientOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
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
                            model: this.Models.PatientWorkorder, required: true,
                            // include: [
                            //     {
                            //         model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
                            //         as: 'ApprovedUser', required: false,
                            //         include: [this.GetReference('Title')]
                            //     },
                            //     {
                            //         model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
                            //         include: [this.GetReference('Title')]
                            //     },
                            //     { model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false },
                            //     { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                            //     { model: this.Models.PatientWorkorderdetails, required: false }
                            // ],
                            where: { 'WorkOrderStatusId': { '$in': paramArr } }
                        });
                        break;
                    case PatientOrderFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    // case PatientOrderFilters.VisitIdentifier:
                    //     EncounterQryJoin['where'] = [
                    //         { 'VisitIdentifier': { '$like': (param.Value || '') + '%' } }
                    //     ];
                    //     EncounterQryJoin['required'] = true;
                    //     break;
                    case PatientOrderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientOrderFilters.PatBillingId:
                        where['BillingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(patientQryJoin, patientOrderDetailQryJoin, EncounterQryJoin);
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB', 'AddressLine1', 'AddressLine2', 'Pincode', 'Area', 'City',
                'State', 'Mobile', 'MaritalStatusId'],
            // required: isReqPatientSearch,
            // where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender'), this.GetReference('MaritalStatus')]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'DoctorName', 'EncounterTypeId',
                'AdmissionDate', 'DischargeDate'],
            include: [
                this.GetReference('EncounterType'),
            ]
        });
        apiReq.Attributes = ['Id', 'TestTypeId', 'EncounterId',
            'PatientId', 'ParentDeparementId',
            'DoctorId', 'SubDepartmentId',
            'FacilityId', 'OrderRequestDate'];
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetMinPatientOrders(apiReq?: ApiRequest<PatientOrderFilters>): Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDeparement', required: false });
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
                    case PatientOrderFilters.OrderNumber:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                    // case PatientOrderFilters.Patient:
                    //     patientQryJoin['where']['$or'] = [
                    //         { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                    //         { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }
                    //     ];
                    //     patientQryJoin['required'] = true;
                    //     break;
                    // case PatientOrderFilters.TestName:
                    //     patientOrderDetailWhere['$or'] = [{ 'TestName': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     // patientOrderDetailWhere['where']['$or'] = [
                    //     //     { 'TestName': { '$like': (param.Value || '') + '%' } }
                    //     // ];
                    //     patientOrderDetailQryJoin['required'] = true;
                    //     break;
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
                    // case PatientOrderFilters.TestTypeId:
                    //     where['TestTypeId'] = param.Value;
                    //     break;
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
                        break;
                    case PatientOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
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
                            model: this.Models.PatientWorkorder, required: true,
                            // include: [
                            //     {
                            //         model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'],
                            //         as: 'ApprovedUser', required: false,
                            //         include: [this.GetReference('Title')]
                            //     },
                            //     {
                            //         model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Orderedby', required: false,
                            //         include: [this.GetReference('Title')]
                            //     },
                            //     { model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false },
                            //     { model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                            //     { model: this.Models.PatientWorkorderdetails, required: false }
                            // ],
                            where: { 'WorkOrderStatusId': { '$in': paramArr } }
                        });
                        break;
                    case PatientOrderFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    // case PatientOrderFilters.VisitIdentifier:
                    //     EncounterQryJoin['where'] = [
                    //         { 'VisitIdentifier': { '$like': (param.Value || '') + '%' } }
                    //     ];
                    //     EncounterQryJoin['required'] = true;
                    //     break;
                    case PatientOrderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientOrderFilters.PatBillingId:
                        where['BillingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        // include.push(patientQryJoin, patientOrderDetailQryJoin, EncounterQryJoin);
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientOrders(apiReq?: ApiRequest<PatientOrderFilters>): Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientOrderDetailWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };

        let EncounterQryJoin: any = {
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'
                , 'ReferralId', 'ReferralName', 'EncounterTypeId'],
            required: false,
            include: [{ model: this.Models.Referral, attributes: ['ReferralName', 'ReferralCode'], required: false },
            this.GetReference('EncounterType')]
        };
        let patientOrderDetailQryJoin: any = {
            //   include.push({
            model: this.Models.PatientOrderDetail, required: false,
            where: patientOrderDetailWhere,
            include: [
                this.GetReference('OrderPriority'),
                this.GetReference('Side'),
                this.GetReference('TESTMASTERTYP'),
                this.GetReference('DurationPeriod'),
                { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false },
                { model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false },
                {
                    model: this.Models.Testmaster,
                    include: [
                        {
                            model: this.Models.ServiceItem, attributes: ['Id', 'Name', 'ItemCode', 'CategoryId'],
                            required: false
                        }
                    ],
                    required: false
                }
            ]
            // });
        };
        include.push({
            model: this.Models.PatientPaymentDetails, required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        /* include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate', 'ReferralId', 'ReferralName'],
            required: false,
            include: [{ model: this.Models.Referral, attributes: ['ReferralName', 'ReferralCode'], required: false },
            this.GetReference('EncounterType')]
        }); */
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({
            model: this.Models.TokenDisplay, required: false,
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDeparement', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'ParentDeparement', required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        // include.push({
        //     model: this.Models.PatientOrderDetail, required: false,
        //     include: [
        //         this.GetReference('OrderPriority'),
        //         { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false },
        //         { model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false }
        //     ]
        // });
        // include.push({ model: this.Models.PatientWorkorder, attributes: ['Workorderid', 'WorkOrderStatusId', 'Orderid'], required: false,
        //     include: [
        //         {model: this.Models.WorkOrderStatus, attributes: ['WorkOrderStatusId', 'DisplayName'], required: false}]
        // });

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
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                            { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'MRN': { '$like': '%' + (param.Value || '') + '%' } },
                            { 'Mobile': { '$like': '%' + (param.Value || '') + '%' } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientOrderFilters.TestName:
                        (patientOrderDetailWhere as any)[Op.or] = [{ TestName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        // patientOrderDetailWhere['where']['$or'] = [
                        //     { 'TestName': { '$like': (param.Value || '') + '%' } }
                        // ];
                        patientOrderDetailQryJoin['required'] = true;
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
                    // case PatientOrderFilters.TestTypeId:
                    //     where['TestTypeId'] = param.Value;
                    //     break;
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
                        break;
                    case PatientOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
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
                            model: this.Models.PatientWorkorder, required: true,
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
                    case PatientOrderFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientOrderFilters.VisitIdentifier:
                        EncounterQryJoin['where'] = [
                            { 'VisitIdentifier': { '$like': (param.Value || '') + '%' } }
                        ];
                        EncounterQryJoin['required'] = true;
                        break;
                    case PatientOrderFilters.PatOrderBill:
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { BillNumber: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMRN: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { PatientMobile: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientOrderFilters.PatBillingId:
                        where['BillingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin, patientOrderDetailQryJoin, EncounterQryJoin);
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientOrdersforPreviousOrder(apiReq?: ApiRequest<PatientOrderFilters>):
        Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // let patientOrderDetailWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                'LicenseNo', 'UserName'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
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
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                    // case PatientOrderFilters.TestTypeId:
                    //     where['TestTypeId'] = param.Value;
                    //     break;
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
                        break;
                    case PatientOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
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
                            model: this.Models.PatientWorkorder, required: true,
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
                    case PatientOrderFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientOrderFilters.PatBillingId:
                        where['BillingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        apiReq.Attributes = ['Id', 'TestTypeId', 'EncounterId',
            'PatientId', 'ParentDeparementId',
            'DoctorId', 'SubDepartmentId',
            'FacilityId', 'OrderRequestDate',
            'OrderNumber', 'OrderStatusId'];
        order.push(['OrderRequestDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientOrderWithoutDetails(apiReq?: ApiRequest<PatientOrderFilters>): Promise<ApiResponse<PatientOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let GuarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({
            model: this.Models.PatientPaymentDetails, required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
        //     include: [this.GetReference('EncounterType')]
        // });
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('EncounterType'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({
            model: this.Models.TokenDisplay, required: false,
            include: [this.GetReference('TokenStatus', ['Description', 'ColorCode'])]
        });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderFrom', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderTo', required: false });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'],
            as: 'ParentDeparement',
            required: false
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'],
            as: 'SubDeparement',
            required: false
        });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomName', 'RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({
            model: this.Models.PatientBills, as: 'PatientBills',
            attributes: ['CancelReqRaisedStatusId',
                'PatientBillStatusId'],
            required: false
        });
        include.push({
            model: this.Models.PatientOrderDetail, attributes: ['Id', 'PatientBillDetailId'], required: false,
            include: [
                {
                    model: this.Models.PatientBillDetails, attributes: ['CancelReqRaisedStatusId',
                        'PatientBillStatusId'], required: false
                },
            ]
        });
        // include.push({
        //     model: this.Models.PatientOrderDetail, required: false,
        //     include: [
        //         this.GetReference('OrderPriority'),
        //         { model: this.Models.Department, attributes: ['DepartmentName'], as: 'OrderToLocation', required: false },
        //         { model: this.Models.PatientOrder, attributes: ['OrderNumber', 'OrderRequestDate'], required: false }
        //     ]
        // });
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
                        (where as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
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
                            { 'MRN': { '$like': (param.Value || '') + '%' } }
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
                        break;
                    case PatientOrderFilters.BillNumber:
                        (where as any)['BillNumber'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
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
                    case PatientOrderFilters.OrderType:
                        where['OrderTypeId'] = param.Value;
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
                    case PatientOrderFilters.VisitIdentifier:
                        (GuarantorWhere as any)['VisitIdentifier'] = { [Op.like]: '%' + ('' || param.Value || '') + '%' };
                        isGuarantorRequired = true;
                        break;
                    // case PatientOrderFilters.BillOrderNumber:
                    //     where['$or'] = [{ 'BillNumber': { '$like': '%' + (param.Value || '') + '%' } },
                    //     { 'OrderNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     break;
                    case PatientOrderFilters.BillOrderNumber:
                        (where as any)[Op.or] = [
                            { BillNumber: { [Op.like]: (param.Value || '') + '%' } },
                            { OrderNumber: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PatientOrderFilters.IsVirtualOrders:
                        where['IsVirtualOrders'] = param.Value;
                        break;
                    case PatientOrderFilters.IsLabOrders:
                        where['IsLabOrders'] = param.Value;
                        break;
                    case PatientOrderFilters.IsPaidFully:
                        where['IsPaidFully'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderScheduleDate:
                        where['OrderScheduleDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientOrderFilters.FromSch:
                        where['OrderScheduleDate'] = where['OrderScheduleDate'] || {};
                        (where['OrderScheduleDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientOrderFilters.ToSch:
                        where['OrderScheduleDate'] = where['OrderScheduleDate'] || {};
                        (where['OrderScheduleDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientOrderFilters.OrderRequestDate:
                        where['OrderRequestDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientOrderFilters.FromReqDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientOrderFilters.ToReqDate:
                        where['OrderRequestDate'] = where['OrderRequestDate'] || {};
                        (where['OrderRequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientOrderFilters.IsExternalLab:
                        where['IsExternalLab'] = param.Value;
                        break;
                    case PatientOrderFilters.GreaterBillingId:
                        where['BillingId'] = { '$gt': param.Value };
                        break;
                    case PatientOrderFilters.VisitTypeId:
                        GuarantorWhere['VisitTypeId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientOrderFilters.PatBillingId:
                        where['BillingId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Encounter, attributes: ['GuarantorId', 'GuarantorTypeId', 'VisitIdentifier', 'VisitTypeId'],
            // include: [this.GetReference('EncounterType')],
            required: isGuarantorRequired,
            where: GuarantorWhere,

        });
        include.push(patientQryJoin);
        order.push(['OrderRequestDate', 'DESC']);

        apiReq.Attributes = ['Id', 'EncounterId', 'PatientId',
            'OrderTypeId', 'OrderNumber', 'OrderRequestDate',
            'OrderScheduleDate', 'DoctorId', 'DoctorName',
            'OrderFromId', 'OrderToId', 'OrderStatusId',
            'OrderCompletedDate', 'OrderPriorityId', 'OrderTotal',
            'OrderToLocation', 'OrderLocationId', 'PatientMRN',
            'ExternalLabId', 'ReferredBy', 'OrderNotes',
            'OrderComments', 'BillingStatusId',
            'PatientBillStatusId', 'BillingId', 'BillNumber',
            'BillAmount', 'BillDate', 'OrderAuthorizedById',
            'OrderAuthorizeByName', 'OrderAuthorizedDate',
            'TestTypeId', 'Status', 'Rev', 'WardId',
            'RoomId', 'ServiceRateCategoryId',
            'EncounterTypeId', 'ReviewStatusId',
            'FacilityId', 'SubDepartmentId',
            'LISId', 'LISResultId', 'IsExternalLab',
            'ExternalOrderStatusId', 'NetPatientAmount',
            'NetInsuranceAmount', 'BedId',
            'ParentDeparementId', 'PatientReceiptId'];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeletePatientOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

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
        let PatientOrderDetails: any = [];
        let TotalNetAmount = 0;
        PatientOrderDetailData.Data.forEach((Detail: any) => {
            let PatientOrderDetail = Detail;
            TotalNetAmount = TotalNetAmount + Detail.NetAmount;
            PatientOrderDetails.push(PatientOrderDetail);
        });
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
            TotalNetAmount: TotalNetAmount,
            Preferences: printPreferencesData
        };

        let ephBO = BoFactory.GetBo(generalBo.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport('PatientOrder'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 3 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                /*, Watermark: 'CANCELLED' */ /* Provide watermark, if needed other than DUPLICATE */
                /*, PrintTypeId: 2 */ /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }
    public async PrintPatientOrderInv(req: BaseRequest): Promise<FileInfo> {
        let PatientOrderDetailBo = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderFilters.ConsultationId, Value: req.Data.ConsultationId }]
        };
        let PatientOrderData = await this.GetPatientOrders(apiReq);
        let PatientOrder = PatientOrderData.Data[0];

        let PatientOrderId = Array();
        PatientOrderData.Data.forEach((Detail) => {
            PatientOrderId.push(Detail.Id);
        });
        let PatientOrderDetailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: PatientOrderId }]
        };

        let PatientOrderDetailData = await PatientOrderDetailBo.GetPatientOrderDetails(PatientOrderDetailReq);
        let PatientOrderDetails: any = [];

        // let detailReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 50, PageNumber: 1 },
        //     Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: PatientOrder.Id }]
        // };
        // let PatientOrderDetailData = await PatientOrderDetailBo.GetPatientOrderDetails(detailReq);
        // let PatientOrderDetails: any = [];
        let TotalNetAmount = 0;
        PatientOrderDetailData.Data.forEach((Detail: any) => {
            let PatientOrderDetail = Detail;
            TotalNetAmount = TotalNetAmount + Detail.NetAmount;
            PatientOrderDetails.push(PatientOrderDetail);
        });


        // await Promise.all(PatientOrderDetailData.Data.map((DetailItem): Promise<void> => {
        //     return (async (detail): Promise<void> => {
        //         detail.Id = detail.Id || 0;
        //         PatientOrderDetails.push(detail);
        //     })(DetailItem);
        // }));

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
            PatientOrderDetail: PatientOrderDetails,
            user: userData.Data[0],
            TotalNetAmount: TotalNetAmount,
            Preferences: printPreferencesData
        };

        let ephBO = BoFactory.GetBo(generalBo.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport('PatientOrder'
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 3 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                /*, Watermark: 'CANCELLED' */ /* Provide watermark, if needed other than DUPLICATE */
                /*, PrintTypeId: 2 */ /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }
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
                , ObjectTypeId: 3 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                /*, Watermark: 'CANCELLED' */ /* Provide watermark, if needed other than DUPLICATE */
                /*, PrintTypeId: 2 */ /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }
    public async PrintPatientOrders(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.TestType, Value: 1 },
                { Key: PatientOrderFilters.EncounterId, Value: req.Id }
            ]
        };
        // let data = await this.GetPatientOrders(apiReq);
        let data = await this.GetPrintMinPatientOrders(apiReq);
        let PatientOrdersdata = data.Data;
        let PatientWorkorderData: any = {};
        let patientorderId = Array();
        PatientOrdersdata.forEach((Detail) => {
            patientorderId.push(Detail.Id);
        });

        let PatientOrder = data.Data[0];
        if (PatientOrder) {
            let Req = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderFilters.Orderid, Value: PatientOrder.Id }]
            };

            let PatientWorkorderBo = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
            // PatientWorkorderData = await PatientWorkorderBo.GetPatientWorkorders(Req);
            PatientWorkorderData = await PatientWorkorderBo.GetMinPatientWorkorders(Req);
        }
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrder.EncounterId },
                { Key: PatientWorkorderdetailsFilters.Orderid, Value: [patientorderId] }
            ]
        };
        let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let PatientWorkorderDetailData = await PatientWorkorderdetailsBo.GetMinPatientWorkorderdetailss(detailReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        // let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });
        let patReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientFilters.Id, Value: PatientOrder.PatientId }]
        };
        let patientinfo = await patientBo.GetMinPatientSearch(patReq);

        let patientData: any = {};
        patientData = patientinfo.Data[0];
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
        let ResWorkorders: any = [];
        if (PatientWorkorderDetailData.Data.length > 0) {
            for (let pdx in PatientWorkorderDetailData.Data) {
                let woInfo = PatientWorkorderDetailData.Data[pdx];
                if (woInfo.Resultvalue) {
                    ResWorkorders.push(woInfo);
                }
            }
        }

        ResWorkorders.sort(Test_sort);
        ResWorkorders.reduce(function (res: any, currentValue: any) {
            if (res.indexOf(currentValue.SubDepartment.DepartmentName) === -1) {
                res.push(currentValue.SubDepartment.DepartmentName);
            }
            return res;
        }, []).map(function (subdepartment: any) {
            let SubDepartment = subdepartment;
            let Details: any = ResWorkorders.filter(function (detail: any) {
                return detail.SubDepartment.DepartmentName === subdepartment;
            }).map(function (detail: any) {
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
                let Details: any = ResWorkorders.filter(function (detail: any) {
                    return detail.Testname === Testname;
                }).map(function (detail: any) {
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
        let key = 'consolidatelabresult';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '3in',
                    contents: '',
                },
                footer: {
                    height: '0.8in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/')

            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

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
        let key = 'consolidatelabresultwithoutheader';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '3in',
                    contents: '',
                },
                footer: {
                    height: '0.8in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/')

            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintConsolidatedLabResult(req: BaseRequest): Promise<FileInfo> {
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
        let PatientWorkOrderHeaderDetails: any = [];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Orderid, Value: [patientorderId] }]
        };
        let PatientWorkorderBo = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
        let PatientWorkorderData = await PatientWorkorderBo.GetPatientWorkorders(Req);

        await Promise.all(PatientOrdersdata.map((DetailItem): Promise<void> => {
            return (async (PatientOrders): Promise<void> => {
                let summary: any = PatientOrders;
                let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
                let PatientWorkorderDetailReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrders.EncounterId },
                        { Key: PatientWorkorderdetailsFilters.Orderid, Value: PatientOrders.Id }
                    ]
                };
                let PatientWorkorderDetailDataWithHeader =
                    await PatientWorkorderdetailsBo.GetPatientWorkorderdetailss(PatientWorkorderDetailReq);
                let BillDetail: any = {};
                BillDetail = PatientWorkorderDetailDataWithHeader.Data;

                summary['WorkOrderDetails'] = BillDetail;
                PatientWorkOrderHeaderDetails.push(summary);

                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                PatientWorkOrderHeaderDetails.sort(custom_sort);

            })(DetailItem);
        }));

        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });

        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData,
            PatientWorkOrderHeaderDetails: PatientWorkOrderHeaderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        let key = 'consolidatelabresult';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '3in',
                    contents: '',
                },
                footer: {
                    height: '0.8in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/')

            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintConsolidatedRadiologyResult(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: PatientOrderFilters.TestType, Value: 2 },
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
        let PatientWorkOrderHeaderDetails: any = [];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderFilters.Orderid, Value: [patientorderId] }]
        };
        let PatientWorkorderBo = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
        let PatientWorkorderData = await PatientWorkorderBo.GetPatientWorkorders(Req);

        await Promise.all(PatientOrdersdata.map((DetailItem): Promise<void> => {
            return (async (PatientOrders): Promise<void> => {
                let summary: any = PatientOrders;
                let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
                let PatientWorkorderDetailReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrders.EncounterId },
                        { Key: PatientWorkorderdetailsFilters.Orderid, Value: PatientOrders.Id }
                    ]
                };
                let PatientWorkorderDetailDataWithHeader =
                    await PatientWorkorderdetailsBo.GetPatientWorkorderdetailss(PatientWorkorderDetailReq);
                let BillDetail: any = {};
                BillDetail = PatientWorkorderDetailDataWithHeader.Data;

                summary['WorkOrderDetails'] = BillDetail;
                PatientWorkOrderHeaderDetails.push(summary);

                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                PatientWorkOrderHeaderDetails.sort(custom_sort);

            })(DetailItem);
        }));

        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientOrder.PatientId });

        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData,
            PatientWorkOrderHeaderDetails: PatientWorkOrderHeaderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('consolidateradiologyresult', { header: {}, body: info }, null);
    }

    public async Printpreviousrisresults(req: BaseRequest): Promise<FileInfo> {
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
                { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrder.EncounterId }

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
            if (item.SubDepartment === 'CT SCAN' || item.SubDepartment === 'ULTRASOUND'
                || item.SubDepartment === 'ECHO' || item.SubDepartment === 'X-RAY') {
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
        }
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData.Data[0],
            PatientWorkorderDetail: PatientWorkOrderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('radiologylabresult', { header: {}, body: info }, null);
    }
    public async Printpreviousendoscopyresults(req: BaseRequest): Promise<FileInfo> {
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
                { Key: PatientWorkorderdetailsFilters.EncounterId, Value: PatientOrder.EncounterId }

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
            if (item.SubDepartment === 'ERCP' || item.SubDepartment === 'ENDOSCOPY'
                || item.SubDepartment === 'COLONOSCOPY' || item.SubDepartment === 'SIGMOIDOSCOPY') {
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
        }
        let info = {
            PatientOrder: PatientOrder,
            PatientWorkorder: PatientWorkorderData.Data[0],
            PatientWorkorderDetail: PatientWorkOrderDetails,
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('endoscopylabresults', { header: {}, body: info }, null);
    }
    public async AddSplitOrder(req: BaseRequest): Promise<number> {
        let generateOrderId = 0;
        if (req.Data.Header.OrderStatusId === 1
            && !req.Data.Header.OrderNumber) { //Created
            req.Data.Header.OrderNumber = null;
            generateOrderId = 1;

            // if (req.Data.Header.OrderRequestDate)
            //     req.Data.Header.OrderRequestDate = new Date();
        }
        // req.Data.Header.BillingStatusId = 1;
        let result = await this.Save(req.Data.Header);
        let patientOrderId = result.dataValues.Id;
        if (generateOrderId === 1) {
            this.deferSequenceKey(patientOrderId, 'OrderNumber',
                this.getSequenceIdentifier(SequenceKeys.PatientOrderId));
        }
        let detailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        await detailBO.ManagePatientOrderDetails(patientOrderId, req.Data.Details, req.Data.Header);

        // if (req.Data.Header.OrderStatusId === 1) {
        //     await detailBO.ProcessDetailsForOrder(patientOrderId);
        // }

        let withDirectBill = 0;
        for (var idx in req.Data.Details) {
            var detail = req.Data.Details[idx];
            if (detail.IsDirectBill)
                withDirectBill = 1;
        }
        // if (req.Data.Header.EncounterTypeId === 1) {
        //     await this.ManageDraftBill(req, patientOrderId);
        // }
        if (req.Data.Header.EncounterTypeId === 2 && withDirectBill === 1) {
            await this.ManageIPDirectBill(req, patientOrderId);
        }
        // await this.AddInterfaceData(req, patientOrderId);
        return patientOrderId;
    }
    public GetModel(): SStatic.Model<PatientOrderInstance, PatientOrderAttributes> {
        return this.Models.PatientOrder;
    }

    public async GetDietDashboardInfo(req: BaseRequest): Promise<any> {
        let patientordercount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': { '$in': [1] },
            }
        });
        let kitchenworklistcount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': { '$in': [10, 11] },
            }
        });
        let rejectedcount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': { '$in': [2, 12] },
            }
        });
        return {
            'patientordercount': patientordercount,
            'kitchenworklistcount': kitchenworklistcount,
            'rejectedcount': rejectedcount,
        };
    }

    // public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
    //     let LABPatientOrderCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': req.Data.Testtypeid,
    //             'OrderStatusId': 1
    //             // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     let LABPatientOrderACKCount = await this.Items.count({
    //         where: {
    //             'Status': 1,
    //             'TestTypeId': req.Data.Testtypeid,
    //             'OrderStatusId': 1 //{ '$in': [1,10] }, Accepted
    //             // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
    //         }
    //     });
    //     return {
    //         'LABPatientOrderCount': LABPatientOrderCount,
    //         'LABPatientOrderACKCount': LABPatientOrderACKCount
    //     };
    // }

    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let LabResultCount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': 11,
                'TestTypeId': 1
            }
        });
        let RadiologyImagingCount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': 11,
                'TestTypeId': 2
            }
        });
        let EndoscopyresultCount = await this.Items.count({
            where: {
                'Status': 1,
                'OrderStatusId': 11,
                'TestTypeId': 4
            }
        });
        return {
            'LabResultCount': LabResultCount,
            'RadiologyImagingCount': RadiologyImagingCount,
            'EndoscopyresultCount': EndoscopyresultCount,
        };
    }

    public async GetEMRDashBoardInfo(req: BaseRequest): Promise<any> {
        let OrderCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid
            }
        });
        let LabCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid,
                'OrderStatusId': 11,
                'TestTypeId': 1
            }
        });
        let RadiologyCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid,
                'OrderStatusId': 11,
                'TestTypeId': 2
            }
        });
        let EndoscopyCount = await this.Items.count({
            where: {
                'Status': 1,
                'EncounterId': req.Data.eid,
                'PatientId': req.Data.pid,
                'OrderStatusId': 11,
                'TestTypeId': 4
            }
        });
        return {
            'OrderCount': OrderCount,
            'LabCount': LabCount,
            'RadiologyCount': RadiologyCount,
            'EndoscopyCount': EndoscopyCount
        };
    }

    public async UpdateLabConsultationNote(req: BaseRequest): Promise<boolean> {
        let orderinfo: any = req.Data.orders;
        let consultationid = req.Data.cid;
        if (orderinfo) {
            for (let i = 0, len = orderinfo.length; i < len; i++) {
                let patientOrderId = orderinfo[i].Id;
                let consultationidUpdate: any = { ConsultationId: consultationid };
                await this.Update(consultationidUpdate, {
                    fields: ['ConsultationId'],
                    where: {
                        Id: patientOrderId
                    }
                });
            }

            let PatientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);

            for (let jdx in orderinfo) {
                for (let kdx in orderinfo[jdx].PatientWorkorders) {
                    let testdispord = orderinfo[jdx].PatientWorkorders[kdx].woDetails;
                    let wodtinfo: any = [];
                    for (let testidx in testdispord) {
                        let detailinfo = testdispord[testidx].details;
                        for (let dtidx in detailinfo) {
                            let checked = detailinfo[dtidx].IsIncludeDischargeSheet;
                            if (checked) {
                                let wodetailsdata: any = {
                                    Id: detailinfo[dtidx].Id,
                                    ConsultationId: consultationid,
                                    IsIncludeDischargeSheet: checked,
                                };
                                wodtinfo.push(wodetailsdata);
                            } else {
                                let wodetailsdata: any = {
                                    Id: detailinfo[dtidx].Id,
                                    ConsultationId: null,
                                    IsIncludeDischargeSheet: checked,
                                };
                                wodtinfo.push(wodetailsdata);
                            }
                        }
                    }
                    if (wodtinfo.length > 0)
                        await PatientWorkorderdetailsBo.UpdateLabConsultationNote(wodtinfo);
                }
            }
        }


        return true;
    }

}
