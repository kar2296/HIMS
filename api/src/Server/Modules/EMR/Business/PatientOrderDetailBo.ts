import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientOrderDetailInstance, PatientOrderDetailAttributes } from '../Model/Interface/Index';
import { PatientOrderDetailFilters } from '../Common/Filters.e';
import * as lisbo from '../../LIS/Business/Index';
import * as bo from '../../EMR/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as BillingBo from '../../Billing/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as PatientEmrBo from './Index';
import * as _ from 'lodash';

export class PatientOrderDetailBo extends BaseBo<PatientOrderDetailInstance, PatientOrderDetailAttributes>  {
    public async AddPatientOrderDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientOrderDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientOrderDetailById(req: BaseRequest): Promise<PatientOrderDetailAttributes> {
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

    public async ManagePatientVirtualOrderDetails(patientOrderId: number, details: PatientOrderDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
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

    public async ManagePatientOrderDetails(patientOrderId: number, details: PatientOrderDetailAttributes[],
        orderInfo: any): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail: any): Promise<void> => {
                let testmasterBO = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
                let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
                let orderFollowupBO = BoFactory.GetBo(bo.OrderFollowupBo, this.Request);
                // console.log('*********detail.TestId**********',detail.TestId);
                let tat = { Id: 0, Data: {} };
                let ordflwp = { Id: 0, Data: {} };
                let req: any = { 'Id': detail.TestId };
                let Testmasterdata = await testmasterBO.GetTestmasterById(req);
                // console.log('*********Testmasterdata**********',Testmasterdata);
                if (Testmasterdata) {
                    detail.SubDepartmentId = Testmasterdata.SubDepartmentId;
                    detail.IsDirectBill = Testmasterdata.IsDirectBill;
                } else detail.IsDirectBill = false;
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {

                    if (!detail.RequestDate)
                        detail.RequestDate = new Date();

                    let orderdet = await this.Save(detail);
                    //Create entry in OrderTAT
                    tat.Data = {
                        PatientOrderDetailId: orderdet.dataValues.Id,
                        PatientId: detail.PatientId,
                        PatientOrderId: detail.PatientOrderId,
                        DoctorId: detail.DoctorId,
                        TestId: detail.TestId,
                        TestName: detail.TestName,
                        OrderedOn: new Date()
                    };
                    await orderTATBO.AddOrderTAT(tat);
                    if (detail.IsFollowup) {
                        ordflwp.Data = {
                            Id: 0,
                            PatientOrderId: detail.PatientOrderId,
                            OrderDetailId: orderdet.dataValues.Id,
                            PatientId: detail.PatientId,
                            EncounterId: orderInfo.EncounterId,
                            FacilityId: orderInfo.FacilityId,
                            TestId: detail.TestId,
                            TestCode: detail.TestCode,
                            TestName: detail.TestName,
                            DoctorId: detail.DoctorId,
                            DepartmentId: detail.DepartmentId,
                            TestTypeId: detail.TestTypeId,
                            OrderedDate: detail.RequestDate,
                            FollowupAppointmentOn: detail.FollowupAppointmentOn,
                            FollowupStatusId: 1,
                        };
                        await orderFollowupBO.AddOrderFollowup(ordflwp);
                    }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async UpdatePatientOrderDetailStatus(req: BaseRequest): Promise<boolean> {
        if (req.Data.Details && Array.isArray(req.Data.Details)) {
            const details: any[] = req.Data.Details;
            // Update Bill details
            const patientbilldetailsBo = BoFactory.GetBo(BillingBo.PatientBillDetailsBo, this.Request);
            for (const item of details) {
                const billDetailId = item.PatientBillDetailId;
                const orderStatusId = item.OrderStatusId;
                if (billDetailId) {
                    const existingBillDetail = await patientbilldetailsBo.GetPatientBillDetailsById({ Id: billDetailId });

                    if (existingBillDetail) {
                        existingBillDetail.OrderStatusId = orderStatusId;
                        await patientbilldetailsBo.Update(existingBillDetail);
                    }
                }
            }
            // Update Patient Order Details
            await Promise.all(details.map((DetailItem: any): Promise<void> => {
                return (async (detail): Promise<void> => {
                    detail.Id = detail.Id || 0;
                    if (detail.Status === 2 && detail.Id !== 0) {
                        await this.MarkAsDelete(detail.Id);
                    } else if (detail.Id === 0) {
                        await this.Save(detail);
                    } else if (detail.Id > 0) {
                        await this.Update(detail);
                    }
                })(DetailItem);
            }));
            // Update Patient Order
            const patientOrderBo = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
            const orderreq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: req.Data.Header.Id }]
            };
            const patientorder: any = await this.GetPatientOrderDetails(orderreq);
            const patientOrderDeatailsData = patientorder.Data;
            const allOrderStatusAre1 = patientOrderDeatailsData.every(
                (x: any) => x.OrderStatusId === 1
            );
            if (allOrderStatusAre1) {
                const ordData: any = {
                    Id: req.Data.Header.Id,
                    OrderStatusId: 1
                };
                await patientOrderBo.Update(ordData);
            }

            return true;
        }

        return false;
    }

    public async GetTestStatisticsSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        let lisBO = BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request);
        let worderDetBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        result.push({ Key: 1, Value: await this.CreatedSummary(req) });
        result.push({ Key: 2, Value: await this.AcceptedSummary(req) });
        result.push({ Key: 3, Value: await lisBO.SampleCollectedSummary(req) });
        result.push({ Key: 4, Value: await worderDetBO.PendingProcessSummary(req) });
        result.push({ Key: 5, Value: await worderDetBO.CompleteProcessSummary(req) });
        result.push({ Key: 6, Value: await worderDetBO.PendingApprovalSummary(req) });
        result.push({ Key: 7, Value: await worderDetBO.ResultApprovalSummary(req) });
        result.push({ Key: 8, Value: await worderDetBO.ResultDispatchSummary(req) });
        return result;
    }

    public async CreatedSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let CreatedsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId', 'OrderStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$eq': req.Data.TestId },
                    'OrderStatusId': { '$eq': 1 },
                    'TestTypeId': req.Data.Testtypeid,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
            if (CreatedsummaryInst) {
                let createdCount: any = 0;
                let groupTest = _.groupBy(CreatedsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    createdCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'CreatedCount': createdCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let CreatedsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId', 'OrderStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$gt': req.Data.TestId },
                    'OrderStatusId': { '$eq': 1 },
                    'TestTypeId': req.Data.Testtypeid,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
            });
            if (CreatedsummaryInst) {
                let createdCount: any = 0;
                let groupTest = _.groupBy(CreatedsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    createdCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'CreatedCount': createdCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }

    public async AcceptedSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let AcceptedSummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId', 'OrderStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$eq': req.Data.TestId },
                    'OrderStatusId': { '$eq': 10 },
                    'TestTypeId': req.Data.Testtypeid,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
            if (AcceptedSummaryInst) {
                let acceptedCount: any = 0;
                let groupTest = _.groupBy(AcceptedSummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    acceptedCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'AcceptedCount': acceptedCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let AcceptedSummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId', 'OrderStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$gt': req.Data.TestId },
                    'OrderStatusId': { '$eq': 10 },
                    'TestTypeId': req.Data.Testtypeid,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
            });
            if (AcceptedSummaryInst) {
                let acceptedCount: any = 0;
                let groupTest = _.groupBy(AcceptedSummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    acceptedCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'AcceptedCount': acceptedCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }

    public async GetTestEncountertypeSummary(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPTestSummary(req) });
        result.push({ Key: 2, Value: await this.IPTestSummary(req) });
        return result;
    }

    public async OPTestSummary(req: BaseRequest): Promise<any> {
        let TestGroup: any = [];
        if (req.Data.TestId > 0) {
            let optestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1
                    },
                    required: true
                }]
            });
            if (optestsummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(optestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'OpCount': OpCount
                    };
                    TestGroup.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let optestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1
                    },
                    required: true
                }]
            });
            if (optestsummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(optestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'OpCount': OpCount
                    };
                    TestGroup.push(info);
                }
            }
        }
        return TestGroup;
    }

    public async IPTestSummary(req: BaseRequest): Promise<any> {
        let TestGroup: any = [];
        if (req.Data.TestId > 0) {
            let iptestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2
                    },
                    required: true
                }]
            });
            if (iptestsummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(iptestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        IpCount = groupedTest.length;
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'IpCount': IpCount
                    };
                    TestGroup.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let iptestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2
                    },
                    required: true
                }]
            });
            if (iptestsummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(iptestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        IpCount = groupedTest.length;
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'IpCount': IpCount
                    };
                    TestGroup.push(info);
                }
            }
        }
        return TestGroup;
    }

    public async GetLabSummarybysampletype(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPSampleSummary(req) });
        result.push({ Key: 2, Value: await this.IPSampleSummary(req) });
        return result;
    }

    public async OPSampleSummary(req: BaseRequest): Promise<any> {
        let TestGroup: any = [];
        if (req.Data.TestId > 0) {
            let optestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1
                    },
                    required: true
                }]
            });
            if (optestsummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(optestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'OpCount': OpCount
                    };
                    TestGroup.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let optestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1
                    },
                    required: true
                }]
            });
            if (optestsummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(optestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'OpCount': OpCount
                    };
                    TestGroup.push(info);
                }
            }
        }
        return TestGroup;
    }

    public async IPSampleSummary(req: BaseRequest): Promise<any> {
        let TestGroup: any = [];
        if (req.Data.TestId > 0) {
            let iptestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2
                    },
                    required: true
                }]
            });
            if (iptestsummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(iptestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        IpCount = groupedTest.length;
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'IpCount': IpCount
                    };
                    TestGroup.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let iptestsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'TestTypeId'],
                where: {
                    'Status': 1,
                    'RequestDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2
                    },
                    required: true
                }]
            });
            if (iptestsummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(iptestsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    let TestId: number = 0;
                    let TestTypeId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        IpCount = groupedTest.length;
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestTypeId = orderdata.TestTypeId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestTypeId': TestTypeId,
                        'TestName': TestName,
                        'IpCount': IpCount
                    };
                    TestGroup.push(info);
                }
            }
        }
        return TestGroup;
    }

    public async ManagePatientOrderDetailsWithExecutableProcedures(patientOrderId: number,
        details: PatientOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let testmasterBO = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
                let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
                let tat = { Id: 0, Data: {} };
                let req: any = { 'Id': detail.TestId };
                let Testmasterdata = await testmasterBO.GetTestmasterById(req);
                if (Testmasterdata) {
                    detail.SubDepartmentId = Testmasterdata.SubDepartmentId;
                    detail.IsDirectBill = Testmasterdata.IsDirectBill;
                } else detail.IsDirectBill = false;
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {

                    if (detail.RequestDate)
                        detail.RequestDate = new Date();

                    let orderdet = await this.Save(detail);
                    let PatientOrderId: number;
                    PatientOrderId = patientOrderId;
                    detail.Id = orderdet.dataValues.Id;
                    let PatientOrderDetailId = orderdet.dataValues.Id;
                    if (detail.Id && detail.Id > 0 && detail.IsExecutableProcedure) {
                        let ExecutableProcedureBO = BoFactory.GetBo(BillingBo.PatientExecutableProcedureBo, this.Request);
                        await ExecutableProcedureBO.ManagePatientExecutableProcedureFromPatientOrder(PatientOrderId,
                            PatientOrderDetailId, details);
                    }

                    //Create entry in OrderTAT
                    tat.Data = {
                        PatientOrderDetailId: orderdet.dataValues.Id,
                        PatientId: detail.PatientId,
                        PatientOrderId: detail.PatientOrderId,
                        DoctorId: detail.DoctorId,
                        TestId: detail.TestId,
                        TestName: detail.TestName,
                        OrderedOn: new Date()
                    };
                    await orderTATBO.AddOrderTAT(tat);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageAdditionalInPatientOrderDetails(
        patientOrderId: number, details: PatientOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let testmasterBO = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
                let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
                let tat = { Id: 0, Data: {} };
                let req: any = { 'Id': detail.TestId };
                let Testmasterdata = await testmasterBO.GetTestmasterById(req);
                if (Testmasterdata) {
                    detail.SubDepartmentId = Testmasterdata.SubDepartmentId;
                    detail.IsDirectBill = Testmasterdata.IsDirectBill;
                } else detail.IsDirectBill = false;
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
                if (detail.Id === 0) {
                    let orderdet = await this.Save(detail);
                    //Create entry in OrderTAT
                    tat.Data = {
                        PatientOrderDetailId: orderdet.dataValues.Id,
                        PatientId: detail.PatientId,
                        PatientOrderId: detail.PatientOrderId,
                        DoctorId: detail.DoctorId,
                        TestId: detail.TestId,
                        TestName: detail.TestName,
                        OrderedOn: new Date()
                    };
                    await orderTATBO.AddOrderTAT(tat);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageCancelOrderDetails(patientOrderId: number,
        OrderStatusId: number, details: PatientOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
                detail.OrderStatusId = OrderStatusId;
                detail.PatientBillStatusId = 2;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                if (detail.PatientBillDetailId) {
                    let BillBO = BoFactory.GetBo(BillingBo.PatientBillDetailsBo, this.Request);
                    let billDetailData = await BillBO.GetPatientBillDetailsById({ Id: detail.PatientBillDetailId });
                    if (billDetailData) {
                        let billdetail: any = {
                            Data: {
                                Id: detail.PatientBillDetailId,
                                PatientBillStatusId: 2
                            }
                        };
                        await BillBO.Update(billdetail.Data);
                    }
                }
            })(DetailItem);
        }));


        return true;
    }

    public async UpdateBillingStaus(patientOrderdetailId: number, billingStatusId: number): Promise<boolean> {
        var result = true;
        let orderUpdate: any = { PatientBillStatusId: billingStatusId };
        await this.Update(orderUpdate, {
            fields: ['PatientBillStatusId'],
            where: {
                Id: patientOrderdetailId
            }
        });
        return result;
    }

    public async UpdateOrderStatus(patientOrderdetailId: number, orderStatusId: any): Promise<boolean> {
        var result = true;

        let orderUpdate: any = { OrderStatusId: orderStatusId };
        await this.Update(orderUpdate, {
            fields: ['OrderStatusId'],
            where: {
                Id: patientOrderdetailId
            }
        });

        return result;
    }


    public async ProcessDetailsForOrder(patientOrderId: number): Promise<boolean> {
        let orderDetails = await this.FindAll({
            where: {
                PatientOrderId: patientOrderId
            }
        });
        //console.log('order details');
        //console.log(orderDetails);
        let orderBO = BoFactory.GetBo(bo.PatientOrderBo, this.Request);
        let isOrderableSplit = await orderBO.isOrderableSplit();
        let isExtLabOrderableSplit = await orderBO.isExtLabOrderableSplit();
        let keycode: any = '0';
        if (orderDetails) {
            let orderDetailAttribs = this.GetAttributes(orderDetails);
            let orderGroups: any = {};
            let firstKeyCode: any = '';
            let firstGroupKey: any = '';
            let firstSubDeptKey: any = '';
            for (var idx in orderDetailAttribs) {
                var item = orderDetailAttribs[idx];
                keycode = item.TestTypeId;
                if (isOrderableSplit) {
                    keycode = keycode + '-' + item.SubDepartmentId;
                }
                if (isExtLabOrderableSplit) {
                    keycode = keycode + '-' + item.IsExternalLab;
                }
                if (!orderGroups[keycode]) {
                    orderGroups[keycode] = [];
                }
                if (!firstGroupKey) {
                    firstGroupKey = item.TestTypeId;
                }
                if (!firstSubDeptKey) {
                    firstSubDeptKey = item.SubDepartmentId;
                }
                if (!firstKeyCode) {
                    firstKeyCode = keycode;
                }
                orderGroups[keycode].push(item);
            }
            var groupLength = Object.keys(orderGroups).length;
            //console.log('order groups length');
            //console.log(groupLength);
            if (groupLength > 1) {
                delete orderGroups[firstKeyCode];
                var result = await orderBO.PlaceOrder(patientOrderId, orderGroups, firstGroupKey, firstSubDeptKey);
                return result;
            } else {
                var result1 = await orderBO.UpdateTestType(patientOrderId, firstGroupKey, firstSubDeptKey);
                return result1;
            }
        }
        return true;
    }
    public async ManageOrderStatusDetails(patientOrderId: number,
        OrderStatusId: number, details: PatientOrderDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientOrderId = patientOrderId;
                detail.OrderStatusId = OrderStatusId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
                if (detail.PatientBillDetailId) {
                    let BillBO = BoFactory.GetBo(BillingBo.PatientBillDetailsBo, this.Request);
                    let billDetailData = await BillBO.GetPatientBillDetailsById({ Id: detail.PatientBillDetailId });
                    if (billDetailData) {
                        let billdetail: any = {
                            Data: {
                                Id: detail.PatientBillDetailId,
                                OrderStatusId: detail.OrderStatusId
                            }
                        };
                        await BillBO.Update(billdetail.Data);
                    }
                }
            })(DetailItem);
        }));


        return true;
    }
    public async GetPatientOrderDetails(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientOrderSearch: boolean = false;
        let isIncludeTestMaster = false;
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('Side'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push(this.GetReference('DurationPeriod'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.PatientWorkorderdetails, required: false,
            include: [
                { model: this.Models.PatientWorkorder, required: false }
            ]
        });
        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        });
        include.push({
            model: this.Models.PatientBillDetails, attributes: ['CancelReqRaisedStatusId',
                'PatientBillStatusId'], required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientOrderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.Ids:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case PatientOrderDetailFilters.IncludeServiceItem:
                        let info = param.Value;
                        include.push({
                            model: this.Models.ServiceItem,
                            attributes: ['Id', 'Name', 'ItemCode', 'CategoryId', 'GstId'],
                            required: false,
                            where: { 'MasterTypeId': 2 }, //TestMaster
                            include: [{
                                model: this.Models.ServiceItemTariffDetail,
                                attributes: ['Rate', 'DoctorShare'],
                                required: false,
                                where: { 'ServiceRateCategoryId': info.ServiceRateCategoryId }
                            }]
                        });
                        break;
                    case PatientOrderDetailFilters.IncludeTestMaster:
                        isIncludeTestMaster = true;
                        include.push({
                            model: this.Models.Testmaster, required: false,
                            include: [
                                { model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false },
                                { model: this.Models.Sampletype, attributes: ['Name'], required: false },
                                {
                                    model: this.Models.PriceMapping, required: false,
                                    where: { 'ActiveStatusId': 2 }, as: 'ExternalProviderPriceMap'
                                }
                            ]
                        });
                        break;
                    case PatientOrderDetailFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.OrderStatusId:
                        where['OrderStatusId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.EncounterId:
                        patientOrderWhere['EncounterId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientOrderDetailFilters.ConsultationId:
                        patientOrderWhere['ConsultationId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientOrderDetailFilters.RequestDate:
                        where['RequestDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientOrderDetailFilters.From:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.To:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.EncounterTypeId:
                        patientOrderWhere['EncounterTypeId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientOrder, where: patientOrderWhere, required: isReqPatientOrderSearch,
            include: [this.GetReference('TESTMASTERTYP'), this.GetReference('EncounterType'),
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                include: [this.GetReference('Title')]
            }]
        });
        if (!isIncludeTestMaster) {
            include.push({ model: this.Models.Testmaster, required: false });
        }
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetPatientOrderDetailswithoutorder(apiReq?: ApiRequest<PatientOrderDetailFilters>):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqPatientOrderSearch: boolean = false;
        let isIncludeTestMaster = false;
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('OrderPriority'));
        include.push(this.GetReference('Side'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push(this.GetReference('DurationPeriod'));
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });

        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'MRNTypeId', 'TitleId', 'GenderId'],
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientOrderDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientOrderId:
                        where['PatientOrderId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.Ids:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case PatientOrderDetailFilters.IncludeServiceItem:
                        let info = param.Value;
                        include.push({
                            model: this.Models.ServiceItem,
                            attributes: ['Id', 'Name', 'ItemCode', 'CategoryId', 'GstId'],
                            required: false,
                            where: { 'MasterTypeId': 2 }, //TestMaster
                            include: [{
                                model: this.Models.ServiceItemTariffDetail,
                                attributes: ['Rate', 'DoctorShare'],
                                required: false,
                                where: { 'ServiceRateCategoryId': info.ServiceRateCategoryId }
                            }]
                        });
                        break;
                    case PatientOrderDetailFilters.IncludeTestMaster:
                        isIncludeTestMaster = true;
                        include.push({
                            model: this.Models.Testmaster, required: false,
                            include: [
                                { model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false },
                                { model: this.Models.Sampletype, attributes: ['Name'], required: false },
                                {
                                    model: this.Models.PriceMapping, required: false,
                                    where: { 'ActiveStatusId': 2 }, as: 'ExternalProviderPriceMap'
                                }
                            ]
                        });
                        break;
                    case PatientOrderDetailFilters.IsPackage:
                        where['IsPackage'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillStatusId:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientBillDetailId:
                        where['PatientBillDetailId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.OrderStatusId:
                        where['OrderStatusId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.EncounterId:
                        patientOrderWhere['EncounterId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientOrderDetailFilters.ConsultationId:
                        patientOrderWhere['ConsultationId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    case PatientOrderDetailFilters.RequestDate:
                        where['RequestDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientOrderDetailFilters.From:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.To:
                        where['RequestDate'] = where['RequestDate'] || {};
                        (where['RequestDate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.TestType:
                        where['TestTypeId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.SubDepartmentId:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case PatientOrderDetailFilters.EncounterTypeId:
                        patientOrderWhere['EncounterTypeId'] = param.Value;
                        isReqPatientOrderSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientOrder, where: patientOrderWhere, required: isReqPatientOrderSearch,
            include: [this.GetReference('TESTMASTERTYP'), this.GetReference('EncounterType'),
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                include: [this.GetReference('Title')]
            }]
        });
        if (!isIncludeTestMaster) {
            include.push({ model: this.Models.Testmaster, required: false });
        }
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async DeletePatientOrderDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetPatientOrderDetailsFromOrderId(orderId: number, detailids: any):
        Promise<ApiResponse<PatientOrderDetailAttributes[]>> {
        let listReq: any = {};
        listReq = {
            Params: [
                { Key: PatientOrderDetailFilters.PatientOrderId, Value: orderId },
                { Key: PatientOrderDetailFilters.Id, Value: detailids || [] },
                { Key: PatientOrderDetailFilters.IncludeTestMaster, Value: true }
            ]
        };
        let response = await this.GetPatientOrderDetails(listReq);
        return response;
    }

    public async UpdateExternalProviderDetails(selectedOrderDetails: Array<any>): Promise<boolean> {
        await Promise.all(selectedOrderDetails.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (detail.ExternalProviderId) { // If External
                    let orderDetail: any = {
                        Id: 0, ExternalProviderId: detail.ExternalProviderId,
                        ExternalProviderCost: detail.ExternalProviderCost
                    };
                    await this.Models.PatientOrderDetail.update(orderDetail, {
                        fields: ['ExternalProviderId', 'ExternalProviderCost'],
                        where: {
                            Id: detail.Id
                        }
                    });
                }
            })(DetailItem);
        }));
        return true;
    }

    public GetModel(): SStatic.Model<PatientOrderDetailInstance, PatientOrderDetailAttributes> {
        return this.Models.PatientOrderDetail;
    }
    public async PrintLabDetailReport(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        let data = await this.GetPatientOrderDetailswithoutorder(apiReq);
        let PatientOrderdetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let PatientType = apiReq.Data.PatientType;
        let Department = apiReq.Data.Department;
        let TestName = apiReq.Data.TestName;
        let PatientOrderdetailData = data.Data[0];
        let OrderBillDetails: any = [];
        let item: any = {};
        for (let idx in PatientOrderdetail) {
            item = PatientOrderdetail[idx];
            item.BillNo = '';
            if (item.PatientOrder.OrderNumber) {
                item.BillNo = item.PatientOrder.OrderNumber;
            }
            if (item.PatientOrder.BillNumber) {
                item.BillNo += '/' + item.PatientOrder.BillNumber;
            }
            OrderBillDetails.push(item);
        }
        let billBO = BoFactory.GetBo(PatientEmrBo.PatientOrderBo, this.Request);
        let PatOrderData = await billBO.GetPatientOrderById({ Id: PatientOrderdetailData.PatientOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            PatientOrderdetail: PatientOrderdetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            OrderBillDetails: OrderBillDetails,
            PatientType: PatientType,
            Department: Department,
            TestName: TestName
        };
        let pdfOption: any = null;
        let key = 'labdetailreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintRadiologyDetailReport(apiReq?: ApiRequest<PatientOrderDetailFilters>): Promise<any> {
        let data = await this.GetPatientOrderDetails(apiReq);
        let PatientOrderdetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let PatientType = apiReq.Data.PatientType;
        let Department = apiReq.Data.Department;
        let TestName = apiReq.Data.TestName;
        let PatientOrderdetailData = data.Data[0];
        let OrderBillDetails: any = [];
        let item: any = {};
        for (let idx in PatientOrderdetail) {
            item = PatientOrderdetail[idx];
            item.BillNo = '';
            if (item.PatientOrder.OrderNumber) {
                item.BillNo = item.PatientOrder.OrderNumber;
            }
            if (item.PatientOrder.BillNumber) {
                item.BillNo += '/' + item.PatientOrder.BillNumber;
            }
            OrderBillDetails.push(item);
        }
        let billBO = BoFactory.GetBo(PatientEmrBo.PatientOrderBo, this.Request);
        let PatOrderData = await billBO.GetPatientOrderById({ Id: PatientOrderdetailData.PatientOrderId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            PatientOrderdetail: PatientOrderdetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            OrderBillDetails: OrderBillDetails,
            PatientType: PatientType,
            Department: Department,
            TestName: TestName
        };
        let pdfOption: any = null;
        let key = 'radiologydetailreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintLabSummaryByTest(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let TestName = req.Data.TestName;
        let LabData: any = [];
        let NetTestData: any = [];
        let NetTestSummary: any = [];
        let LabTest = req;
        LabData = await this.GetTestEncountertypeSummary(LabTest);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(LabTest.Data.FacilityId);
        let optestsummary = [];
        let iptestsummary = [];
        if (LabData) {
            if (LabData.length > 0) {
                optestsummary = LabData[0].Value;
            }
            if (LabData.length > 1) {
                iptestsummary = LabData[1].Value;
            }
            for (let idx in optestsummary) {
                let optest = optestsummary[idx];
                let Key = '';
                let opcount = 0;
                Key = optest.TestName;
                opcount = optest.OpCount;
                NetTestData.push({
                    'Key': Key,
                    'OpCount': opcount,
                    'IpCount': 0,
                });
            }
            for (let idx in iptestsummary) {
                let iptest = iptestsummary[idx];
                let Key = '';
                let ipcount = 0;
                Key = iptest.TestName;
                ipcount = iptest.IpCount;
                let valappended = 0;
                NetTestData.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.IpCount = ipcount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    NetTestData.push({
                        'Key': Key,
                        'OpCount': 0,
                        'IpCount': ipcount,
                    });
            }
        }
        for (let ix in NetTestData) {
            let NetData = NetTestData[ix];
            NetData.TotalCount = NetData.OpCount + NetData.IpCount;
            NetTestSummary.push(NetData);
        }

        let TotOpCount: number = 0;
        let TotIpCount: number = 0;
        let TotAllCount: number = 0;
        for (let ix in NetTestSummary) {
            let netdata = NetTestSummary[ix];
            TotOpCount += netdata.OpCount;
            TotIpCount += netdata.IpCount;
            TotAllCount += netdata.TotalCount;
        }
        let info = {
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            TestName: TestName,
            NetTestSummary: NetTestSummary,
            TotOpCount: TotOpCount,
            TotIpCount: TotIpCount,
            TotAllCount: TotAllCount,
        };
        let pdfOption: any = null;
        let key = '';
        if (req.Data.Testtypeid === 1) {
            key = 'labsummarybytest';
        } else if (req.Data.Testtypeid === 2) {
            key = 'radiologysummarybytest';
        }

        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public async PrintLabStatisticsSummary(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let TestName = req.Data.TestName;
        let StatisticSummary: any = [];
        let TestSummary: any = [];
        let NetTestSummary: any = [];
        let statisticsdata = req;
        StatisticSummary = await this.GetTestStatisticsSummary(statisticsdata);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(statisticsdata.Data.FacilityId);
        let createdsummary = [];
        let acceptedsummary = [];
        let samplesummary = [];
        let pendingprocesssummary = [];
        let completeprocesssummary = [];
        let pendingapprovalsummary = [];
        let resultapprovalsummary = [];
        let resultdispatchsummary = [];
        if (StatisticSummary) {
            if (StatisticSummary.length > 0) {
                createdsummary = StatisticSummary[0].Value;
            }
            if (StatisticSummary.length > 1) {
                acceptedsummary = StatisticSummary[1].Value;
            }
            if (StatisticSummary.length > 2) {
                samplesummary = StatisticSummary[2].Value;
            }
            if (StatisticSummary.length > 3) {
                pendingprocesssummary = StatisticSummary[3].Value;
            }
            if (StatisticSummary.length > 3) {
                completeprocesssummary = StatisticSummary[4].Value;
            }
            if (StatisticSummary.length > 3) {
                pendingapprovalsummary = StatisticSummary[5].Value;
            }
            if (StatisticSummary.length > 3) {
                resultapprovalsummary = StatisticSummary[6].Value;
            }
            if (StatisticSummary.length > 3) {
                resultdispatchsummary = StatisticSummary[7].Value;
            }

            for (let idx in createdsummary) {
                let createdsmry = createdsummary[idx];
                let Key = '';
                let createdcount = 0;
                Key = createdsmry.TestName;
                createdcount = createdsmry.CreatedCount;
                TestSummary.push({
                    'Key': Key,
                    'CreatedCount': createdcount,
                    'AcceptedCount': 0,
                    'SampleCollectedCount': 0,
                    'PendingProcessCount': 0,
                    'CompleteProcessCount': 0,
                    'PendingapprovalCount': 0,
                    'ResultapprovalCount': 0,
                    'ResultdispatchCount': 0
                });
            }
            for (let idx in acceptedsummary) {
                let acceptedsmry = acceptedsummary[idx];
                let Key = '';
                let acceptedcount = 0;
                Key = acceptedsmry.TestName;
                acceptedcount = acceptedsmry.AcceptedCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.AcceptedCount = acceptedcount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': acceptedcount,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in samplesummary) {
                let samplesmry = samplesummary[idx];
                let Key = '';
                let sampleclctdcount = 0;
                Key = samplesmry.TestName;
                sampleclctdcount = samplesmry.SampleCollectedCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.SampleCollectedCount = sampleclctdcount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': sampleclctdcount,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in pendingprocesssummary) {
                let pendingsummary = pendingprocesssummary[idx];
                let Key = '';
                let pendingprocesscount = 0;
                Key = pendingsummary.TestName;
                pendingprocesscount = pendingsummary.PendingProcessCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.PendingProcessCount = pendingprocesscount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': pendingprocesscount,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in completeprocesssummary) {
                let completesummary = completeprocesssummary[idx];
                let Key = '';
                let completeprocessCount = 0;
                Key = completesummary.TestName;
                completeprocessCount = completesummary.completeprocessCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.completeprocessCount = completeprocessCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': completeprocessCount,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in pendingapprovalsummary) {
                let pendingappsummary = pendingapprovalsummary[idx];
                let Key = '';
                let pendingapprovalCount = 0;
                Key = pendingappsummary.TestName;
                pendingapprovalCount = pendingappsummary.pendingapprovalCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.pendingapprovalCount = pendingapprovalCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': pendingapprovalCount,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in resultapprovalsummary) {
                let resultappsummary = resultapprovalsummary[idx];
                let Key = '';
                let resultapprovalCount = 0;
                Key = resultappsummary.TestName;
                resultapprovalCount = resultappsummary.resultapprovalCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.resultapprovalCount = resultapprovalCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': resultapprovalCount,
                        'ResultdispatchCount': 0
                    });
            }
            for (let idx in resultdispatchsummary) {
                let resultdispsummary = resultdispatchsummary[idx];
                let Key = '';
                let resultdispatchCount = 0;
                Key = resultdispsummary.TestName;
                resultdispatchCount = resultdispsummary.resultdispatchCount;
                let valappended = 0;
                TestSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.resultdispatchCount = resultdispatchCount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    TestSummary.push({
                        'Key': Key,
                        'CreatedCount': 0,
                        'AcceptedCount': 0,
                        'SampleCollectedCount': 0,
                        'PendingProcessCount': 0,
                        'CompleteProcessCount': 0,
                        'PendingapprovalCount': 0,
                        'ResultapprovalCount': 0,
                        'ResultdispatchCount': resultdispatchCount
                    });
            }
        }
        // for (let ix in NetTestData) {
        //     let NetData = NetTestData[ix];
        //     NetData.TotalCount = NetData.OpCount + NetData.IpCount;
        //     NetTestSummary.push(NetData);
        // }

        // let TotOpCount: number = 0;
        // let TotIpCount: number = 0;
        // let TotAllCount: number = 0;
        // for (let ix in NetTestSummary) {
        //     let netdata = NetTestSummary[ix];
        //     TotOpCount += netdata.OpCount;
        //     TotIpCount += netdata.IpCount;
        //     TotAllCount += netdata.TotalCount;
        // }
        let info = {
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            TestName: TestName,
            NetTestSummary: NetTestSummary,
            TestSummary: TestSummary
        };
        let pdfOption: any = null;
        let key = '';
        if (req.Data.Testtypeid === 1) {
            key = 'labstatisticssummaryreport';
        } else if (req.Data.Testtypeid === 2) {
            key = 'radiologystatisticssummaryreport';
        }

        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
        let LABPatientOrderCount: number = 0;
        let LABPatientOrderACKCount: number = 0;
        if (req.Data.TestId > 0) {
            LABPatientOrderCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                    'OrderStatusId': 1,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
        } else if (req.Data.TestId === 0) {
            LABPatientOrderCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                    'OrderStatusId': 1,
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
        }
        if (req.Data.TestId > 0) {
            LABPatientOrderACKCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$eq': req.Data.TestId },
                    'OrderStatusId': 10,//{ '$in': [1,10] }, Accepted
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
        } else if (req.Data.TestId === 0) {
            LABPatientOrderACKCount = await this.Items.count({
                where: {
                    'Status': 1,
                    'TestTypeId': req.Data.Testtypeid,
                    'TestId': { '$gt': req.Data.TestId },
                    'OrderStatusId': 10,//{ '$in': [1,10] }, Accepted
                    'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
        }
        // let LABPatientOrderACKCount = await this.Items.count({
        //     where: {
        //         'Status': 1,
        //         'TestTypeId': req.Data.Testtypeid,
        //         'TestId': req.Data.TestId || 0,
        //         'OrderStatusId': 1,//{ '$in': [1,10] }, Accepted
        //         'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
        //     }
        // });
        let LisTestTotaldata = await this.Items.findAll({
            where: {
                'Status': 1,
                'TestId': req.Data.TestId || 0,
                'OrderStatusId': { '$ne': null },
                'RequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        });

        return {
            'LABPatientOrderCount': LABPatientOrderCount,
            'LABPatientOrderACKCount': LABPatientOrderACKCount,
            'LisTestTotaldata': LisTestTotaldata
        };

    }

}
