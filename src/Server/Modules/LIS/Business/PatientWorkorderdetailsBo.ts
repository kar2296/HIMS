import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientWorkorderdetailsInstance, PatientWorkorderdetailsAttributes } from '../Model/Interface/Index';
import { PatientWorkorderdetailsFilters, PatientCriticalOrderFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as bo from '../../EMR/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import * as Lis from './Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as Encounter from '../../Visit/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class PatientWorkorderdetailsBo extends BaseBo<PatientWorkorderdetailsInstance, PatientWorkorderdetailsAttributes>  {
    public async AddPatientWorkorderdetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientWorkorderdetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async UpdateIsLISRequest(req: BaseRequest): Promise<boolean> {
        let IsLISRequestupdt: any = { IsLISRequest: true };
        await this.Update(IsLISRequestupdt, {
            fields: ['IsLISRequest'],
            where: {
                Id: [req.Id]
            }
        });
        return true;
    }

    public async ManagePatientWorkOrderDetails(details: PatientWorkorderdetailsAttributes[]): Promise<boolean> {
        let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        let PatientCriticalOrderBO = BoFactory.GetBo(lisbo.PatientCriticalOrderBo, this.Request);
        console.log(details);
        details = details || [];
        let promises: Array<any> = [];
        for (let dx in details) {
            let detail = details[dx];
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                detail.Performedondate = new Date();
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                detail.Performedondate = new Date();
                promises.push(this.Update(detail));
                if (detail.IsCriticalValue) {
                    let criticReq = {
                        Id: 0,
                        PageContext: { PageSize: -1, PageNumber: 1 },
                        Params: [{ Key: PatientCriticalOrderFilters.PatientWorkOrderDetailId, Value: detail.Id },
                        { Key: PatientCriticalOrderFilters.TestId, Value: detail.Testid },
                        { Key: PatientCriticalOrderFilters.AnalyteId, Value: detail.Analyteid }]
                    };
                    let CriticalList = await PatientCriticalOrderBO.GetPatientCriticalOrders(criticReq);
                    if (CriticalList.Data.length === 0) {
                        let criticData: any = {
                            Id: 0,
                            PatientId: detail.Patientid,
                            PatientOrderId: detail.Orderid,
                            PatientOrderDetailId: detail.Orderdetailid,
                            PatientWorkOrderId: detail.Workorderid,
                            PatientWorkOrderDetailId: detail.Id,
                            TestId: detail.Testid,
                            TestName: detail.Testname,
                            AnalyteId: detail.Analyteid,
                            AnalyteName: detail.Analytename,
                            Resultvalue: detail.Resultvalue,
                        };
                        promises.push(PatientCriticalOrderBO.Save(criticData));
                    }
                }
                let ordertat: any = { techValidationDate: detail.TechValidationdate, medValidationDate: detail.TechValidationdate };
                promises.push(orderTATBO.UpdateValidationDate(detail.Orderdetailid, ordertat));
            }
        }
        // details.forEach(detail => {
        //     detail.Id = detail.Id || 0;
        //     if (detail.Status === 2 && detail.Id !== 0) {
        //         promises.push(this.MarkAsDelete(detail.Id));
        //     } else if (detail.Id === 0) {
        //         detail.Performedondate = new Date();
        //         promises.push(this.Save(detail));
        //     } else if (detail.Id > 0) {
        //         detail.Performedondate = new Date();
        //         promises.push(this.Update(detail));
        //         if (detail.IsCriticalValue) {

        //             let criticData: any = {
        //                 Id: 0,
        //                 PatientId: detail.Patientid,
        //                 PatientOrderId: detail.Orderid,
        //                 PatientOrderDetailId: detail.Orderdetailid,
        //                 PatientWorkOrderId: detail.Workorderid,
        //                 PatientWorkOrderDetailId: detail.Id,
        //                 TestId: detail.Testid,
        //                 TestName: detail.Testname,
        //                 AnalyteId: detail.Analyteid,
        //                 AnalyteName: detail.Analytename,
        //                 Resultvalue: detail.Resultvalue,
        //             };
        //             promises.push(PatientCriticalOrderBO.Save(criticData));
        //         }
        //         let ordertat: any = { techValidationDate: detail.TechValidationdate, medValidationDate: detail.TechValidationdate };
        //         promises.push(orderTATBO.UpdateValidationDate(detail.Orderdetailid, ordertat));
        //     }
        // });
        await Promise.all(promises);
        return true;
    }

    public async ManagePrintPatientWorkOrderDetails(details: PatientWorkorderdetailsAttributes[]): Promise<boolean> {
        console.log(details);
        details = details || [];
        let promises: Array<any> = [];
        for (let dx in details) {
            let detail = details[dx];
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                detail.Performedondate = new Date();
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        }
        await Promise.all(promises);
        return true;
    }


    public async GetPatientWorkorderdetailsById(req: BaseRequest): Promise<PatientWorkorderdetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEncounterTypeBySample(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 1, Value: await this.OPSampleSummary(req) });
        result.push({ Key: 2, Value: await this.IPSampleSummary(req) });
        return result;
    }

    public async OPSampleSummary(req: BaseRequest): Promise<any> {
        let SampleGroup: any = [];
        if (req.Data.SampleTypeId > 0) {
            let opsamplesummaryInst: any = await this.FindAll({
                attributes: ['SampleTypeId', 'SampleType'],
                where: {
                    'Status': 1,
                    'AcceptedDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'SampleTypeId': { '$eq': req.Data.SampleTypeId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1,
                        'TestTypeId': 1,
                    },
                    required: true
                }]
            });
            if (opsamplesummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(opsamplesummaryInst, 'SampleTypeId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let SampleTypeId: number = 0;
                    let SampleName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let worderdata: any = groupedTest[i];
                        SampleTypeId = worderdata.SampleTypeId;
                        SampleName = worderdata.SampleType;
                    }
                    let info = {
                        'SampleTypeId': SampleTypeId,
                        'SampleName': SampleName,
                        'OpCount': OpCount
                    };
                    SampleGroup.push(info);
                }
            }
        } else if (req.Data.SampleTypeId === 0) {
            let opsamplesummaryInst: any = await this.FindAll({
                attributes: ['SampleTypeId', 'SampleType'],
                where: {
                    'Status': 1,
                    'AcceptedDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'SampleTypeId': { '$gt': req.Data.SampleTypeId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 1,
                        'TestTypeId': 1,
                    },
                    required: true
                }]
            });
            if (opsamplesummaryInst) {
                let OpCount: any = 0;
                let groupTest = _.groupBy(opsamplesummaryInst, 'SampleTypeId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    OpCount = groupedTest.length;
                    let SampleTypeId: number = 0;
                    let SampleName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let worderdata: any = groupedTest[i];
                        SampleTypeId = worderdata.SampleTypeId;
                        SampleName = worderdata.SampleType;
                    }
                    let info = {
                        'SampleTypeId': SampleTypeId,
                        'SampleName': SampleName,
                        'OpCount': OpCount
                    };
                    SampleGroup.push(info);
                }
            }
        }
        return SampleGroup;
    }

    public async IPSampleSummary(req: BaseRequest): Promise<any> {
        let SampleGroup: any = [];
        if (req.Data.SampleTypeId > 0) {
            let ipsamplesummaryInst: any = await this.FindAll({
                attributes: ['SampleTypeId', 'SampleType'],
                where: {
                    'Status': 1,
                    'AcceptedDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'SampleTypeId': { '$eq': req.Data.SampleTypeId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2,
                        'TestTypeId': 1,
                    },
                    required: true
                }]
            });
            if (ipsamplesummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(ipsamplesummaryInst, 'SampleTypeId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    IpCount = groupedTest.length;
                    let SampleTypeId: number = 0;
                    let SampleName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let worderdata: any = groupedTest[i];
                        SampleTypeId = worderdata.SampleTypeId;
                        SampleName = worderdata.SampleType;
                    }
                    let info = {
                        'SampleTypeId': SampleTypeId,
                        'SampleName': SampleName,
                        'IpCount': IpCount
                    };
                    SampleGroup.push(info);
                }
            }
        } else if (req.Data.SampleTypeId === 0) {
            let ipsamplesummaryInst: any = await this.FindAll({
                attributes: ['SampleTypeId', 'SampleType'],
                where: {
                    'Status': 1,
                    'AcceptedDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    'SampleTypeId': { '$gt': req.Data.SampleTypeId },
                },
                include: [{
                    model: this.Models.PatientOrder,
                    attributes: ['Id'],
                    where: {
                        'EncounterTypeId': 2,
                        'TestTypeId': 1,
                    },
                    required: true
                }]
            });
            if (ipsamplesummaryInst) {
                let IpCount: any = 0;
                let groupTest = _.groupBy(ipsamplesummaryInst, 'SampleTypeId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    IpCount = groupedTest.length;
                    let SampleTypeId: number = 0;
                    let SampleName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let worderdata: any = groupedTest[i];
                        SampleTypeId = worderdata.SampleTypeId;
                        SampleName = worderdata.SampleType;
                    }
                    let info = {
                        'SampleTypeId': SampleTypeId,
                        'SampleName': SampleName,
                        'IpCount': IpCount
                    };
                    SampleGroup.push(info);
                }
            }
        }
        return SampleGroup;
    }

    public async PendingProcessSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let PendingProcessSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$eq': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 1 },
                    'AcceptedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (PendingProcessSummaryInst) {
                let pendingprocessCount: any = 0;
                let groupTest = _.groupBy(PendingProcessSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    pendingprocessCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'PendingProcessCount': pendingprocessCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let PendingProcessSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$gt': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 1 },
                    'AcceptedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (PendingProcessSummaryInst) {
                let pendingprocessCount: any = 0;
                let groupTest = _.groupBy(PendingProcessSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    pendingprocessCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'PendingProcessCount': pendingprocessCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }
    public async CompleteProcessSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let completeProcessSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$eq': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 4 },
                    'TechValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (completeProcessSummaryInst) {
                let completeprocessCount: any = 0;
                let groupTest = _.groupBy(completeProcessSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    completeprocessCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'CompleteProcessCount': completeprocessCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let completeProcessSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$gt': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 4 },
                    'TechValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (completeProcessSummaryInst) {
                let completeprocessCount: any = 0;
                let groupTest = _.groupBy(completeProcessSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    completeprocessCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'CompleteProcessCount': completeprocessCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }
    public async PendingApprovalSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let pendingapprovalSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$eq': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 5 },
                    'TechValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (pendingapprovalSummaryInst) {
                let pendingapprovalCount: any = 0;
                let groupTest = _.groupBy(pendingapprovalSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    pendingapprovalCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'PendingapprovalCount': pendingapprovalCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let pendingapprovalSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$gt': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 5 },
                    'TechValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (pendingapprovalSummaryInst) {
                let pendingapprovalCount: any = 0;
                let groupTest = _.groupBy(pendingapprovalSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    pendingapprovalCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'PendingapprovalCount': pendingapprovalCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }
    public async ResultApprovalSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let ResultapprovalSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$eq': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 7 },
                    'MedValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (ResultapprovalSummaryInst) {
                let resultapprovalCount: any = 0;
                let groupTest = _.groupBy(ResultapprovalSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    resultapprovalCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'ResultapprovalCount': resultapprovalCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let ResultapprovalSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$gt': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 7 },
                    'MedValidationdate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (ResultapprovalSummaryInst) {
                let resultapprovalCount: any = 0;
                let groupTest = _.groupBy(ResultapprovalSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    resultapprovalCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'ResultapprovalCount': resultapprovalCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }
    public async ResultDispatchSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let ResultDispatchSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$eq': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 8 },
                    'ReleasedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (ResultDispatchSummaryInst) {
                let resultdispatchCount: any = 0;
                let groupTest = _.groupBy(ResultDispatchSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    resultdispatchCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'ResultdispatchCount': resultdispatchCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let ResultDispatchSummaryInst: any = await this.FindAll({
                attributes: ['Testid', 'Testname', 'WorkOrderDetailStatusId'],
                where: {
                    'Status': 1,
                    'Testid': { '$gt': req.Data.TestId },
                    'WorkOrderDetailStatusId': { '$eq': 8 },
                    'ReleasedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                },
                include: [{
                    model: this.Models.PatientWorkorder,
                    attributes: ['Id'],
                    where: {
                        'TestTypeId': req.Data.Testtypeid,
                    },
                    required: true
                }]
            });
            if (ResultDispatchSummaryInst) {
                let resultdispatchCount: any = 0;
                let groupTest = _.groupBy(ResultDispatchSummaryInst, 'Testid');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    resultdispatchCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.Testid;
                        TestName = orderdata.Testname;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'ResultdispatchCount': resultdispatchCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }

    public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
        let patientWorderjoin: any = {
            model: this.Models.PatientWorkorder,
            attributes: ['Id'],
            required: true,
            where: {
                'Status': 1,
                'TestTypeId': req.Data.Testtypeid,
            }
        };
        let LABNotOrderProcessCount = await this.Items.count({
            where: {
                'Status': 1,
                'Testid': req.Data.TestId,
                'WorkOrderDetailStatusId': { '$in': [2, 3, 4, 6] }
            },
            include: [patientWorderjoin]
        });
        let LABRejectedOrderProcessCount = await this.Items.count({
            where: {
                'Status': 1,
                'Testid': req.Data.TestId,
                'WorkOrderDetailStatusId': { '$in': [6] }
            },
            include: [patientWorderjoin]
        });
        let LABResultNotApprovalCount = await this.Items.count({
            where: {
                'Status': 1,
                'Testid': req.Data.TestId,
                'WorkOrderDetailStatusId': { '$in': [5, 9] }
            },
            include: [patientWorderjoin]
        });
        let LABResultNotReleaseCount = await this.Items.count({
            where: {
                'Status': 1,
                'Testid': req.Data.TestId,
                'WorkOrderDetailStatusId': { '$in': [7] }
            },
            include: [patientWorderjoin]
        });
        return {
            'LABNotOrderProcessCount': LABNotOrderProcessCount,
            'LABResultNotApprovalCount': LABResultNotApprovalCount,
            'LABResultNotReleaseCount': LABResultNotReleaseCount,
            'LABRejectedOrderProcessCount': LABRejectedOrderProcessCount
        };
    }

    // public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
    //     let count = 0;
    //     switch (key) {
    //         case 'abnormalresults':
    //             count = await this.Items.count({
    //                 where: {
    //                     'QualifierId': { '$in': [2, 3] },  //Other Than Normal
    //                     // 'DoctorId': this.GetSession().UserId,
    //                     // 'TestTypeId': { '$in': [1] }   // Lab

    //                 }, include: [{
    //                     model: this.Models.PatientOrder,
    //                     where: {
    //                         'OrderStatusId': { '$in': [11] },  //COMPLETED
    //                         'DoctorId': this.GetSession().UserId,
    //                         'TestTypeId': { '$in': [1] }   // Lab
    //                     },
    //                     required: true
    //                 }]
    //             });
    //             break;
    //         default:
    //             count = 0;
    //             break;
    //     }
    //     return { count: count };
    // }


    public async GetPatientInfoBySampleId(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<any> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let EquipmentId: number = -1;
        let attributes: any = {};
        attributes['include'] = [];
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({ model: this.Models.Testmaster, required: false });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        include.push({
            model: this.Models.Sampletype, attributes: ['Description'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EquipmentId:
                        EquipmentId = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (EquipmentId > 0) {
            include.push({
                model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name'],
                as: 'Analyte', required: false,
                include: [
                    {
                        model: this.Models.AnalyzerAnalyteMap,
                        attributes: ['AssetId', 'AssetName', 'Code', 'Name', 'Description', 'AnalyteId', 'AnalyteName', 'SampleType'],
                        required: true,
                        where: {
                            'AssetId': EquipmentId
                        }
                    },
                    {
                        model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
                            'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
                        required: false
                    }
                ]
            });
        }
        include.push(patientQryJoin);

        let PatientWorkOrderDetailsData: any =
            await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
        let TestCode = [];
        for (let idx in PatientWorkOrderDetailsData.Data) {
            let patientworkorderdetailitem = PatientWorkOrderDetailsData.Data[idx];
            if (patientworkorderdetailitem.Analyte
                && patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps) {
                for (let anrefidx in patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps) {
                    let AnalyteAnalzerMap = patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps[anrefidx];
                    AnalyteAnalzerMap.Patientid = patientworkorderdetailitem.Patientid;
                    AnalyteAnalzerMap.EncounterId = patientworkorderdetailitem.EncounterId;
                    TestCode.push(AnalyteAnalzerMap);
                }
            }
        }

        return { 'Data': TestCode };

    }

    public async GetAnalyzerAllBarcodeInfo(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<any> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let EquipmentId: number = -1;
        let attributes: any = {};
        attributes['include'] = [];
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({ model: this.Models.Testmaster, required: false });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        include.push({
            model: this.Models.Sampletype, attributes: ['Description'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['Samplecollectiondate'] = where['Samplecollectiondate'] || {};
                        (where['Samplecollectiondate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['Samplecollectiondate'] = where['Samplecollectiondate'] || {};
                        (where['Samplecollectiondate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EquipmentId:
                        EquipmentId = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.IsLISRequest:
                        where['IsLISRequest'] = !param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (EquipmentId > 0) {
            include.push({
                model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name'],
                as: 'Analyte', required: false,
                include: [
                    {
                        model: this.Models.AnalyzerAnalyteMap,
                        attributes: ['AssetId', 'AssetName', 'Code', 'Name', 'Description', 'AnalyteId', 'SampleType'],
                        required: true,
                        where: {
                            'AssetId': EquipmentId,
                            'ActiveStatusId': 2
                        }
                    },
                    {
                        model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
                            'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
                        required: false
                    }
                ]
            });
        }
        include.push(patientQryJoin);

        let PatientWorkOrderDetailsData: any =
            await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
        let AllBarcode = [];
        let objSampleid: any = {};
        for (let idx in PatientWorkOrderDetailsData.Data) {
            let patientworkorderdetailitem = PatientWorkOrderDetailsData.Data[idx];
            if (!objSampleid[patientworkorderdetailitem.Sampleid]) {
                objSampleid[patientworkorderdetailitem.Sampleid] = '' + patientworkorderdetailitem.Sampleid;
                objSampleid[patientworkorderdetailitem.Sampleid + 'SlNos'] = '' + patientworkorderdetailitem.Id;
            } else {
                objSampleid[patientworkorderdetailitem.Sampleid + 'SlNos'] += ',' + patientworkorderdetailitem.Id;
            }
        }
        for (let sampid in objSampleid) {
            let SampleIds = objSampleid[sampid];
            let slnos = objSampleid[sampid + 'SlNos'];
            AllBarcode.push({
                SampleIds: SampleIds,
                SlNos: slnos,
            });
        }
        return { 'Data': AllBarcode };
    }

    public async GetAnalyzerTestdetails(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<any> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let EquipmentId: number = -1;
        let attributes: any = {};
        attributes['include'] = [];
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        include.push({ model: this.Models.Testmaster, required: false });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        include.push({
            model: this.Models.Sampletype, attributes: ['Description'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EquipmentId:
                        EquipmentId = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (EquipmentId > 0) {
            include.push({
                model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name'],
                as: 'Analyte', required: false,
                include: [
                    {
                        model: this.Models.AnalyzerAnalyteMap,
                        attributes: ['AssetId', 'AssetName', 'Code', 'Name', 'Description', 'AnalyteId', 'SampleType'],
                        required: true,
                        where: {
                            'AssetId': EquipmentId,
                            'ActiveStatusId': 2
                        }
                    },
                    {
                        model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
                            'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
                        required: false
                    }
                ]
            });
        }
        include.push(patientQryJoin);

        let PatientWorkOrderDetailsData: any =
            await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
        let TestCode = [];
        for (let idx in PatientWorkOrderDetailsData.Data) {
            let patientworkorderdetailitem = PatientWorkOrderDetailsData.Data[idx];
            let patientinfo = patientworkorderdetailitem.Patient;
            if (patientworkorderdetailitem.Analyte
                && patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps) {
                for (let anrefidx in patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps) {
                    let AnalyteAnalzerMap = patientworkorderdetailitem.Analyte.AnalyzerAnalyteMaps[anrefidx];
                    TestCode.push({
                        Code: AnalyteAnalzerMap.Code, SampleType: AnalyteAnalzerMap.SampleType,
                        MRN: patientinfo.MRN,
                        PatientAge: patientinfo.Age,
                        LastName: patientinfo.LastName,
                        FirstName: patientinfo.FirstName,
                        Title: patientinfo.Title.Description,
                        GenderId: patientinfo.GenderId,
                        DOB: patientinfo.DOB,
                    });
                }
            }
        }

        return { 'Data': TestCode };
    }

    public async GetPatientWOdetailsByOrderdetailid(Orderdetailid: number):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        let listReq: any = {};
        listReq = {
            Params: [
                { Key: PatientWorkorderdetailsFilters.Orderdetailid, Value: Orderdetailid }
            ]
        };
        let response = await this.GetPatientWorkorderdetailss(listReq);
        return response;
    }

    public async GetMinPatientWorkorderdetailss(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        // let PatientWorkorderWhere: WhereOptions<any> = {};
        // let encounterWhere: WhereOptions<any> = {};
        let isReqPatientOrder: boolean = false;
        let include: Array<IncludeOptions> = [];
        let attributes: any = {};
        let order: Array<any> = [];
        attributes['include'] = [];
        // let patientQryJoin: any = {
        //     model: this.Models.Patient,
        //     required: false,
        //     where: {},
        //     include: [
        //         this.GetReference('Title'),
        //         this.GetReference('Gender')
        //     ]
        // };
        // include.push({
        //     model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name',
        //         'IsWrapResult', 'IsTemplates'],
        //     as: 'Analyte', required: false,
        //     include: [
        //         {
        //             model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
        //                 'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
        //             required: false
        //         }
        //     ]
        // });
        // include.push({
        //     model: this.Models.Testmaster, required: false,
        //     include: [{
        //         model: this.Models.TestmasterTemplate,
        //         required: false
        //     }]
        // });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        // include.push({
        //     model: this.Models.Department, attributes: ['DepartmentName'], as: 'Department', required: false,
        // });
        // include.push({
        //     model: this.Models.Sampletype, attributes: ['Description'], required: false,
        // });
        // include.push({
        //     model: this.Models.ClinicalFinding, attributes: ['Code', 'Name'], required: false,
        // });
        // include.push({
        //     model: this.Models.ImpressionMaster, attributes: ['Code', 'Name'], required: false,
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'MedUser', required: false,
        //     include: [
        //         this.GetReference('Title'), {
        //             model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
        //         }
        //     ]
        // });
        // include.push({
        //     model: this.Models.WorkOrderStatus, attributes: ['DisplayName'],
        //     as: 'WorkOrderDetailStatus', required: false
        // });
        // include.push({
        //     model: this.Models.PatientOrderDetail, attributes: ['PatientOrderId', 'TestId', 'PackageName', 'TestCost',
        //         'NetAmount', 'PatientBillDetailId'],
        //     include: [
        //         {
        //             model: this.Models.PatientBillDetails, attributes: ['PatientBillId', 'Rate', 'DiscountAmount', 'NetAmount'],
        //             required: false
        //         },
        //         {
        //             model: this.Models.Testmaster, attributes: ['Id', 'Name', 'IsNABLTest'],
        //             required: false
        //         }
        //     ]
        // });

        // let totalCommentsQuery = this.GetSelectQuery(this.Models.WorkOrderObservation, {
        //     attributes: [this.Dal.fn('COUNT', this.Dal.col('WorkOrderObservationId'))],
        //     where: [this.Dal.literal('`WorkOrderObservation`.`WorkOrderDetailId` = `PatientWorkorderdetails`.`Workorderdetailid`'),
        //     {
        //         'Status': 1
        //     }]
        // }, 'CommentsCount');

        // attributes.include.push(totalCommentsQuery);


        // let totalAttachmentQuery = this.GetSelectQuery(this.Models.WorkOrderAttachment, {
        //     attributes: [this.Dal.fn('COUNT', this.Dal.col('WorkOrderAttachmentId'))],
        //     where: [this.Dal.literal('`WorkOrderAttachment`.`WorkOrderDetailId` = `PatientWorkorderdetails`.`Workorderdetailid`'),
        //     {
        //         'Status': 1
        //     }]
        // }, 'AttachmentsCount');

        // attributes.include.push(totalAttachmentQuery);


        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    // case PatientWorkorderdetailsFilters.Patient:
                    //     patientQryJoin['where']['$or'] = [
                    //         { 'FirstName': { '$like': (param.Value || '') + '%' } },
                    //         { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                    //         { 'LastName': { '$like': (param.Value || '') + '%' } },
                    //         { 'MRN': { '$like': (param.Value || '') } }
                    //     ];
                    //     patientQryJoin['required'] = true;
                    //     break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    // case PatientWorkorderdetailsFilters.DoctorId:
                    //     patientOrderWhere['DoctorId'] = param.Value;
                    //     isReqPatientOrder = true;
                    //     break;
                    case PatientWorkorderdetailsFilters.OrderStatusId:
                        patientOrderWhere['OrderStatusId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.TestTypeId:
                        patientOrderWhere['TestTypeId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    // case PatientWorkorderdetailsFilters.OrderNumber:
                    //     patientOrderWhere['$or'] = [{ 'OrderNumber': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     isReqPatientOrder = true;
                    //     break;
                    case PatientWorkorderdetailsFilters.OrderRequestDate:
                        patientOrderWhere['OrderRequestDate'] = { '$between': param.Value || '' };
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.FromReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$gte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.ToReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$lte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderdetailid:
                        where['Orderdetailid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestName:
                        (where as any)[Op.or] = [{ Testname: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    // case PatientWorkorderdetailsFilters.WorkOrderStatusId:
                    //     PatientWorkorderWhere['WorkOrderStatusId'] = param.Value;
                    //     isReqPatientWorkorderSearch = true;
                    //     break;
                    // case PatientWorkorderdetailsFilters.WorkOrderdid:
                    //     PatientWorkorderWhere['$or'] = [{ 'WorkOrderdid': { '$like': '%' + (param.Value || '') + '%' } }];
                    //     isReqPatientWorkorderSearch = true;
                    //     break;
                    case PatientWorkorderdetailsFilters.ImpressionId:
                        where['ImpressionId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ClinicalFindingId:
                        where['ClinicalFindingId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Testid:
                        where['Testid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.MedValidationById:
                        where['MedValidationById'] = param.Value;
                        break;
                    // case PatientWorkorderdetailsFilters.EncounterTypeId:
                    //     encounterWhere['EncounterTypeId'] = param.Value;
                    //     isReqEncounterSearch = true;
                    //     break;
                    case PatientWorkorderdetailsFilters.AcceptedDate:
                        where['AcceptedDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderdetailsFilters.FromAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ToAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientWorkorderdetailsFilters.Analyteid:
                        where['Analyteid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Ids:
                        where['Id'] = { '$in': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientOrder,
            // required: isReqPatientOrder,
            // where: patientOrderWhere,
            attributes: ['Id', 'OrderNumber', 'OrderRequestDate'],
            // include: [
            //     this.GetReference('OrderPriority'),
            //     { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false },
            //     {
            //         model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            //         include: [this.GetReference('Title')]
            //     }
            // ]
        });
        // include.push({
        //     model: this.Models.PatientWorkorder, attributes: ['WorkOrderdid', 'WorkOrderStatusId'],
        //     required: isReqPatientWorkorderSearch,
        //     where: PatientWorkorderWhere
        // });
        // include.push({
        //     model: this.Models.Encounter, attributes: ['EncounterTypeId'],
        //     required: isReqEncounterSearch,
        //     where: encounterWhere,
        //     include: [
        //         this.GetReference('EncounterType')
        //     ]
        // });
        // include.push(patientQryJoin);
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = ['Id', 'Testid', 'Testname',
            'Departmentid', 'Subdepartmentid', 'SubdeptDisplayOrder',
            'Orderid', 'SampleType',
            'TestDisplayOrder', 'AnalyteDisplayOrder',
            'Resultvalue', 'QualifierId',
            'AnalyteUOM', 'Analyterange'
        ];
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientWorkorderdetailss(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let PatientWorkorderWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let isReqPatientOrder, isReqPatientWorkorderSearch, isReqEncounterSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let attributes: any = {};
        let order: Array<any> = [];
        attributes['include'] = [];
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
            model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name',
                'IsWrapResult', 'IsTemplates'],
            as: 'Analyte', required: false,
            include: [
                {
                    model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
                        'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
                    required: false
                }
            ]
        });
        include.push({
            model: this.Models.Testmaster, required: false,
            include: [{
                model: this.Models.TestmasterTemplate,
                required: false
            }]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'Department', required: false,
        });
        include.push({
            model: this.Models.Sampletype, attributes: ['Description'], required: false,
        });
        include.push({
            model: this.Models.ClinicalFinding, attributes: ['Code', 'Name'], required: false,
        });
        include.push({
            model: this.Models.ImpressionMaster, attributes: ['Code', 'Name'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'MedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.WorkOrderStatus, attributes: ['DisplayName'],
            as: 'WorkOrderDetailStatus', required: false
        });
        include.push({
            model: this.Models.PatientOrderDetail, attributes: ['PatientOrderId', 'TestId', 'PackageName', 'TestCost',
                'NetAmount', 'PatientBillDetailId'],
            include: [
                {
                    model: this.Models.PatientBillDetails, attributes: ['PatientBillId', 'Rate', 'DiscountAmount', 'NetAmount'],
                    required: false
                },
                {
                    model: this.Models.Testmaster, attributes: ['Id', 'Name', 'IsNABLTest'],
                    required: false
                }
            ]
        });

        let totalCommentsQuery = this.GetSelectQuery(this.Models.WorkOrderObservation, {
            attributes: [this.Dal.fn('COUNT', this.Dal.col('WorkOrderObservationId'))],
            where: [this.Dal.literal('`WorkOrderObservation`.`WorkOrderDetailId` = `PatientWorkorderdetails`.`Workorderdetailid`'),
            {
                'Status': 1
            }]
        }, 'CommentsCount');

        attributes.include.push(totalCommentsQuery);


        let totalAttachmentQuery = this.GetSelectQuery(this.Models.WorkOrderAttachment, {
            attributes: [this.Dal.fn('COUNT', this.Dal.col('WorkOrderAttachmentId'))],
            where: [this.Dal.literal('`WorkOrderAttachment`.`WorkOrderDetailId` = `PatientWorkorderdetails`.`Workorderdetailid`'),
            {
                'Status': 1
            }]
        }, 'AttachmentsCount');

        attributes.include.push(totalAttachmentQuery);


        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.DoctorId:
                        patientOrderWhere['DoctorId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderStatusId:
                        patientOrderWhere['OrderStatusId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.TestTypeId:
                        patientOrderWhere['TestTypeId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderNumber:
                        (patientOrderWhere as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderRequestDate:
                        patientOrderWhere['OrderRequestDate'] = { '$between': param.Value || '' };
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.FromReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$gte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.ToReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$lte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderdetailid:
                        where['Orderdetailid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestName:
                        (where as any)[Op.or] = [{ Testname: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderStatusId:
                        PatientWorkorderWhere['WorkOrderStatusId'] = param.Value;
                        isReqPatientWorkorderSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderdid:
                        (PatientWorkorderWhere as any)[Op.or] = [{ WorkOrderdid: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientWorkorderSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.ImpressionId:
                        where['ImpressionId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ClinicalFindingId:
                        where['ClinicalFindingId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Testid:
                        where['Testid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.MedValidationById:
                        where['MedValidationById'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterTypeId:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.AcceptedDate:
                        where['AcceptedDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderdetailsFilters.FromAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ToAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientWorkorderdetailsFilters.Analyteid:
                        where['Analyteid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Ids:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case PatientWorkorderdetailsFilters.MultiWorkOrderStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            PatientWorkorderWhere['WorkOrderStatusId'] = { '$in': paramArr };
                        }
                        isReqPatientWorkorderSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientOrder,
            required: isReqPatientOrder,
            where: patientOrderWhere,
            include: [
                this.GetReference('OrderPriority'),
                { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false },
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        include.push({
            model: this.Models.PatientWorkorder, attributes: ['WorkOrderdid', 'WorkOrderStatusId'],
            required: isReqPatientWorkorderSearch,
            where: PatientWorkorderWhere
        });
        include.push({
            model: this.Models.Encounter, attributes: ['EncounterTypeId'],
            required: isReqEncounterSearch,
            where: encounterWhere,
            include: [
                this.GetReference('EncounterType')
            ]
        });
        include.push(patientQryJoin);
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientWorkorderdetailssForCorrelation(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>):
        Promise<ApiResponse<PatientWorkorderdetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let patientOrderWhere: WhereOptions<any> = {};
        let PatientWorkorderWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let isReqPatientOrder, isReqPatientWorkorderSearch, isReqEncounterSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let attributes: any = {};
        let order: Array<any> = [];
        attributes['include'] = [];
        let patientQryJoin: any = {
            model: this.Models.Patient,
            required: false,
            where: {},
            include: [
                this.GetReference('Title'),
                this.GetReference('Gender')
            ]
        };
        // include.push({
        //     model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name'],
        //     as: 'Analyte', required: false,
        //     include: [
        //         {
        //             model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
        //                 'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
        //             required: false
        //         }
        //     ]
        // });
        include.push({
            model: this.Models.Testmaster, required: false,
            include: [{
                model: this.Models.TestmasterTemplate,
                required: false
            }]
        });
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], as: 'SubDepartment', required: false,
        });
        // include.push({
        //     model: this.Models.Sampletype, attributes: ['Description'], required: false,
        // });
        include.push({
            model: this.Models.ClinicalFinding, attributes: ['Code', 'Name'], required: false,
        });
        include.push({
            model: this.Models.ImpressionMaster, attributes: ['Code', 'Name'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], as: 'MedUser', required: false,
            include: [
                this.GetReference('Title'), {
                    model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.WorkOrderStatus, attributes: ['DisplayName'],
            as: 'WorkOrderDetailStatus', required: false
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkorderdetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderid:
                        where['Orderid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.PatientId:
                        where['Patientid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderDetailStatusId:
                        where['WorkOrderDetailStatusId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestIds:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['Testid'] = { '$in': paramArr };
                        }
                        break;
                    case PatientWorkorderdetailsFilters.IncludeObservations:
                        include.push({ model: this.Models.WorkOrderObservation, attributes: ['Comments'], required: false });
                        break;
                    case PatientWorkorderdetailsFilters.SubDepartmentId:
                        where['Subdepartmentid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestValueTypeId:
                        where['TestValueType'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.From:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.To:
                        where['MedValidationdate'] = where['MedValidationdate'] || {};
                        (where['MedValidationdate'] as any)['$lte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Patient:
                        patientQryJoin['where']['$or'] = [
                            { 'FirstName': { '$like': (param.Value || '') + '%' } },
                            { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                            { 'LastName': { '$like': (param.Value || '') + '%' } },
                            { 'MRN': { '$like': (param.Value || '') } }
                        ];
                        patientQryJoin['required'] = true;
                        break;
                    case PatientWorkorderdetailsFilters.QualifierId:
                        where['QualifierId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.DoctorId:
                        patientOrderWhere['DoctorId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderStatusId:
                        patientOrderWhere['OrderStatusId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.TestTypeId:
                        patientOrderWhere['TestTypeId'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderNumber:
                        (patientOrderWhere as any)[Op.or] = [{ OrderNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.OrderRequestDate:
                        patientOrderWhere['OrderRequestDate'] = { '$between': param.Value || '' };
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.FromReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$gte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.ToReq:
                        patientOrderWhere['OrderRequestDate'] = patientOrderWhere['OrderRequestDate'] || {};
                        (patientOrderWhere['OrderRequestDate'] as any)['$lte'] = param.Value;
                        isReqPatientOrder = true;
                        break;
                    case PatientWorkorderdetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Orderdetailid:
                        where['Orderdetailid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.TestName:
                        (where as any)[Op.or] = [{ Testname: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderStatusId:
                        PatientWorkorderWhere['WorkOrderStatusId'] = param.Value;
                        isReqPatientWorkorderSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.WorkOrderdid:
                        (PatientWorkorderWhere as any)[Op.or] = [{ WorkOrderdid: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientWorkorderSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.ImpressionId:
                        where['ImpressionId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ClinicalFindingId:
                        where['ClinicalFindingId'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.Testid:
                        where['Testid'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.MedValidationById:
                        where['MedValidationById'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.EncounterTypeId:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientWorkorderdetailsFilters.AcceptedDate:
                        where['AcceptedDate'] = { '$between': param.Value || '' };
                        break;
                    case PatientWorkorderdetailsFilters.FromAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientWorkorderdetailsFilters.ToAccDate:
                        where['AcceptedDate'] = where['AcceptedDate'] || {};
                        (where['AcceptedDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientOrder,
            required: isReqPatientOrder,
            where: patientOrderWhere,
            include: [
                this.GetReference('OrderPriority'),
                { model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false },
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                    include: [this.GetReference('Title')]
                }
            ]
        });
        include.push({
            model: this.Models.PatientWorkorder, attributes: ['WorkOrderdid', 'WorkOrderStatusId'],
            required: isReqPatientWorkorderSearch,
            where: PatientWorkorderWhere
        });
        include.push({
            model: this.Models.Encounter, attributes: ['EncounterTypeId'],
            required: isReqEncounterSearch,
            where: encounterWhere,
        });
        include.push(patientQryJoin);
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async DeletePatientWorkorderdetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetWorkOrderDetailsByWorkOrderId(woId: number): Promise<PatientWorkorderdetailsAttributes[]> {
        let response = await this.FindAll({
            where: {
                Workorderid: woId
            }
        });
        let result: any = [];
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs);
        });
        return result;
    }

    public async CreateWorkOrderFromOrderDetails(woId: number, orderId: number, encounterId: number, detailIds: any): Promise<boolean> {
        let patientODBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let analyteBO = BoFactory.GetBo(lisbo.AnalytemasterBo, this.Request);
        let testmasterBO = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
        let testmasteranalytemapBo = BoFactory.GetBo(lisbo.TestmasteranalytemapBo, this.Request);
        let orderTATBo = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        let IsSeparateSampleId = 0;
        let IsSeparateSampleIdx = 0;
        let orderDetails = await patientODBO.GetPatientOrderDetailsFromOrderId(orderId, detailIds);
        if (orderDetails.Data.length > 0) {
            await Promise.all(orderDetails.Data.map((orderdetail): Promise<void> => {
                return (async (od): Promise<void> => {

                    //Update accepted date in orderTAT
                    await orderTATBo.UpdateAcceptedDate(od.Id);
                    let orderTATUpdate: any = { WorkOrderId: woId };
                    await orderTATBo.Update(orderTATUpdate, {
                        fields: ['WorkOrderId'],
                        where: {
                            PatientOrderDetailId: od.Id
                        }
                    });

                    let testMaster: any = await testmasterBO.GetTestmasterById({ Id: od.TestId });
                    testMaster.Children = testMaster.TestOrProfiles;
                    if (testMaster.IsProfile && testMaster.Children && testMaster.Children.length > 0) {
                        //console.log('profiles');
                        await Promise.all(testMaster.Children.map((child: any): Promise<void> => {
                            return (async (mapObj): Promise<void> => {
                                let chld: any = mapObj.TestAnalyteName;
                                let tm: any = chld; //await testmasterBO.GetTestmasterById({ Id: chld.Id });
                                tm.RootProfileName = testMaster.Name;
                                tm.RootProfileDisplayOrder = testMaster.DisplayOrder;

                                let testIdArr: any = [chld.Id];
                                if (tm.IsProfile) {
                                    testIdArr = await testmasteranalytemapBo.GetProfileTestIds(chld.Id);
                                }
                                let testanalytes: any = await analyteBO.FindAll({
                                    include: [
                                        {
                                            model: this.Models.Testmaster,
                                            where: { 'TestmasterId': { '$in': testIdArr } }
                                        },
                                        { model: this.Models.Sampletype, attributes: ['Name'], required: false }
                                    ],
                                    where: { 'ActiveStatusId': 2 }
                                });

                                let tas: Array<any> = [];
                                for (let i of testanalytes) {
                                    let at = (<any>i)['dataValues'];
                                    tas.push(at);
                                }
                                IsSeparateSampleId = 0;
                                if (tm.IsSeparateSampleId)
                                    IsSeparateSampleId = ++IsSeparateSampleIdx;
                                await this.TransformWorkOrderDetails(woId, orderId, encounterId, od, tas, tm, IsSeparateSampleId);
                            })(child);
                        }));

                    } else {
                        let testanalytes: any;
                        if (testMaster.IsProfile) {
                            let testIdArr: any = await testmasteranalytemapBo.GetProfileTestIds(od.TestId);

                            testanalytes = await analyteBO.FindAll({
                                include: [
                                    {
                                        model: this.Models.Testmaster,
                                        where: { 'TestmasterId': { '$in': testIdArr } }
                                    },
                                    { model: this.Models.Sampletype, attributes: ['Name'], required: false }
                                ],
                                where: { 'ActiveStatusId': 2 }
                            });
                        } else {
                            testanalytes = await analyteBO.FindAll({
                                include: [
                                    {
                                        model: this.Models.Testmaster,
                                        where: { 'TestmasterId': od.TestId }
                                    },
                                    { model: this.Models.Sampletype, attributes: ['Name'], required: false }
                                ],
                                where: { 'ActiveStatusId': 2 }
                            });
                        }

                        let tas: Array<any> = [];
                        for (let i of testanalytes) {
                            let at = (<any>i)['dataValues'];
                            tas.push(at);
                        }
                        IsSeparateSampleId = 0;
                        if (testMaster.IsSeparateSampleId)
                            IsSeparateSampleId = ++IsSeparateSampleIdx;
                        await this.TransformWorkOrderDetails(woId, orderId, encounterId, od, tas, testMaster, IsSeparateSampleId);
                    }
                    let ods: any = { 'OrderStatusId': 10 }; //10 - Accepted
                    await patientODBO.Update(ods, {
                        fields: ['OrderStatusId'],
                        where: { 'Id': od.Id },
                    });
                })(orderdetail);
            }));
        }
        return true;
    }

    public async UpdateSpecReceiveddate(vPatientWorkOrderId: number, vRootProfileId: number, vSpecReceivedDt: Date): Promise<boolean> {
        let SampleidCodition: any = { SpecReceiveddate: vSpecReceivedDt };
        await this.Update(SampleidCodition, {
            fields: ['SpecReceiveddate'],
            where: {
                Workorderid: vPatientWorkOrderId, RootProfileId: vRootProfileId
            }
        });
        return true;
    }

    public async UpdateLISResult(vAnalyteId: number, vSampleid: string, vResultvalue: Date): Promise<boolean> {
        let SampleidCodition: any = { Resultvalue: vResultvalue, IsLISResult: true };
        await this.Update(SampleidCodition, {
            fields: ['Resultvalue', 'IsLISResult'],
            where: {
                AnalyteId: vAnalyteId, Sampleid: vSampleid, Resultvalue: null
            }
        });
        return true;
    }

    public async UpdateLabConsultationNote(details: PatientWorkorderdetailsAttributes[]):
        Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Id > 0) {
                detail.Performedondate = new Date();
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async DispatchResultDetails(woId: number): Promise<boolean> {
        let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        let ordertat: any = { releasedDate: new Date() };
        let detailsList = await this.FindAll({
            where: {
                Workorderid: woId
            }
        });
        await Promise.all(detailsList.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                let item = this.GetAttribute(detail);
                item.ReleasedDate = new Date();
                item.IsReleased = true;
                item.ReleasedBy = this.Session.UserId;
                await this.Update(item);
                await orderTATBO.UpdateReleasedDate(item.Orderdetailid, ordertat);
            })(DetailItem);
        }));
        return true;
    }

    public GetModel(): SStatic.Model<PatientWorkorderdetailsInstance, PatientWorkorderdetailsAttributes> {
        return this.Models.PatientWorkorderdetails;
    }
    public async PrintLabOrderStatisticsReport(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>): Promise<any> {
        let data = await this.GetPatientWorkorderdetailss(apiReq);
        let PatientWorkOrderdetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let PathologistName = apiReq.Data.PathologistName;
        let PatientWorkOrderdetailData = data.Data[0];
        let OrderBillDetails: any = [];
        let item: any = {};
        for (let idx in PatientWorkOrderdetail) {
            item = PatientWorkOrderdetail[idx];
            item.BillNo = '';
            if (item.PatientOrder.OrderNumber) {
                item.BillNo = item.PatientOrder.OrderNumber;
            }
            if (item.PatientOrder.BillNumber) {
                item.BillNo += '/' + item.PatientOrder.BillNumber;
            }
            OrderBillDetails.push(item);
        }
        let billBO = BoFactory.GetBo(Lis.PatientWorkorderBo, this.Request);
        let PatOrderData = await billBO.GetPatientWorkorderById({ Id: PatientWorkOrderdetailData.Workorderid });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            PatientWorkOrderdetail: PatientWorkOrderdetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            OrderBillDetails: OrderBillDetails,
            PathologistName: PathologistName
        };
        let pdfOption: any = null;
        let key = 'orderstatisticspathologistreport';
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
    public async PrintRadiologyOrderStatisticsReport(apiReq?: ApiRequest<PatientWorkorderdetailsFilters>): Promise<any> {
        let data = await this.GetPatientWorkorderdetailss(apiReq);
        let PatientWorkOrderdetail = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let PathologistName = apiReq.Data.PathologistName;
        let PatientWorkOrderdetailData = data.Data[0];
        let OrderBillDetails: any = [];
        let item: any = {};
        for (let idx in PatientWorkOrderdetail) {
            item = PatientWorkOrderdetail[idx];
            item.BillNo = '';
            if (item.PatientOrder.OrderNumber) {
                item.BillNo = item.PatientOrder.OrderNumber;
            }
            if (item.PatientOrder.BillNumber) {
                item.BillNo += '/' + item.PatientOrder.BillNumber;
            }
            OrderBillDetails.push(item);
        }
        let billBO = BoFactory.GetBo(Lis.PatientWorkorderBo, this.Request);
        let PatOrderData = await billBO.GetPatientWorkorderById({ Id: PatientWorkOrderdetailData.Workorderid });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatOrderData.FacilityId);
        let info = {
            PatientWorkOrderdetail: PatientWorkOrderdetail,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            OrderBillDetails: OrderBillDetails,
            PathologistName: PathologistName
        };
        let pdfOption: any = null;
        let key = 'orderstatisticsradiologistreport';
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
    public async PrintLabSummaryBySample(req: BaseRequest): Promise<any> {
        let FromDate = req.Data.FromDate;
        let ToDate = req.Data.ToDate;
        let TestName = req.Data.TestName;
        let LabSampleData: any = [];
        let SampleSummary: any = [];
        let NetSampleSummary: any = [];
        let LabSamples = req;
        LabSampleData = await this.GetEncounterTypeBySample(LabSamples);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(LabSamples.Data.FacilityId);
        let opsamplesummary = [];
        let ipsamplesummary = [];
        if (LabSampleData) {
            if (LabSampleData.length > 0) {
                opsamplesummary = LabSampleData[0].Value;
            }
            if (LabSampleData.length > 1) {
                ipsamplesummary = LabSampleData[1].Value;
            }
            for (let idx in opsamplesummary) {
                let opsample = opsamplesummary[idx];
                let Key = '';
                let opcount = 0;
                Key = opsample.SampleName;
                opcount = opsample.OpCount;
                SampleSummary.push({
                    'Key': Key,
                    'OpCount': opcount,
                    'IpCount': 0,
                });
            }
            for (let idx in ipsamplesummary) {
                let ipsample = ipsamplesummary[idx];
                let Key = '';
                let ipcount = 0;
                Key = ipsample.SampleName;
                ipcount = ipsample.IpCount;
                let valappended = 0;
                SampleSummary.forEach(function (item: any) {
                    if (Key === item.Key) {
                        item.IpCount = ipcount;
                        valappended = 1;
                    }
                });
                if (valappended === 0)
                    SampleSummary.push({
                        'Key': Key,
                        'OpCount': 0,
                        'IpCount': ipcount,
                    });
            }
        }
        for (let ix in SampleSummary) {
            let NetData = SampleSummary[ix];
            NetData.TotalCount = NetData.OpCount + NetData.IpCount;
            NetSampleSummary.push(NetData);
        }

        let TotOpCount: number = 0;
        let TotIpCount: number = 0;
        let TotAllCount: number = 0;
        for (let ix in NetSampleSummary) {
            let netdata = NetSampleSummary[ix];
            TotOpCount += netdata.OpCount;
            TotIpCount += netdata.IpCount;
            TotAllCount += netdata.TotalCount;
        }
        let info = {
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            TestName: TestName,
            NetSampleSummary: NetSampleSummary,
            TotOpCount: TotOpCount,
            TotIpCount: TotIpCount,
            TotAllCount: TotAllCount,
        };
        let pdfOption: any = null;
        let key = 'labsummarybysample';
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
    private async TransformWorkOrderDetails(woId: number, orderId: number, encounterId: number, od: any,
        testanalytes: any, orderDetailTest: any, isSeparateSampleId: number) {
        return await Promise.all(testanalytes.map((testanalyte: any): Promise<void> => {
            return (async (ta): Promise<void> => {
                let testMaster;
                let subDepartmentId = null;
                let testDisplayOrder = null;
                let testPrintOrder = null;
                let profileDisplayOrder = 1000;
                let testName = od.TestName;
                let testId = od.TestId;
                let profileId = od.TestId;
                let profileName = '';
                let rootProfileName;

                let rootProfileDisplayOrder = 1000;
                if (orderDetailTest.IsProfile) {
                    profileDisplayOrder = orderDetailTest.DisplayOrder;
                    profileName = orderDetailTest.Name;
                }

                if (orderDetailTest.RootProfileName) {
                    rootProfileName = orderDetailTest.RootProfileName;
                    rootProfileDisplayOrder = orderDetailTest.RootProfileDisplayOrder;
                }

                if (testanalyte.Testmasters && testanalyte.Testmasters.length > 0) {
                    testMaster = testanalyte.Testmasters[0];
                    subDepartmentId = testMaster.SubDepartmentId;
                    testDisplayOrder = testMaster.DisplayOrder;
                    testPrintOrder = testMaster.PrintOrder;
                    testName = testMaster.Name;
                    testId = testMaster.Id;
                }

                const deptBO = BoFactory.GetBo(userbo.DepartmentBo, this.Request);
                const dept: any = await deptBO.GetById(subDepartmentId);
                let workOrderdetail: any = {
                    Workorderid: woId,
                    Orderid: orderId,
                    Patientid: od.PatientId,
                    EncounterId: encounterId,
                    Orderdetailid: od.Id,
                    Displayorder: od.DisplaySeqId,
                    IsExternalLab: od.IsExternalLab,
                    Testid: testId,
                    Testname: testName,
                    ProfileName: profileName,
                    Analyteid: testanalyte.Id,
                    AnalyteCode: testanalyte.Code,
                    Analytename: testanalyte.Name,
                    AnalyteUOM: testanalyte.AnalyteuomId,
                    Methodology: testanalyte.Methodology,
                    TestValueType: testanalyte.Valuetype_e,
                    WorkOrderDetailStatusId: 1, //Created
                    Departmentid: od.DepartmentId,
                    Subdepartmentid: subDepartmentId,
                    SubdeptDisplayOrder: dept.DisplayOrder,
                    SampleTypeId: testanalyte.SampletypeId,
                    SampleType: testanalyte.Sampletype ? testanalyte.Sampletype.Name : null,
                    ProfileDisplayOrder: profileDisplayOrder,
                    TestDisplayOrder: testDisplayOrder,
                    TestPrintOrder: testPrintOrder,
                    AnalyteDisplayOrder: testanalyte.Displayorder,
                    AnalytePrintOrder: testanalyte.Printorder,
                    AcceptedDate: new Date(),
                    RootProfileId: profileId,
                    RootProfileName: rootProfileName,
                    RootProfileDisplayOrder: rootProfileDisplayOrder,
                    IsSeparateSampleId: isSeparateSampleId
                };
                let result = await this.Save(workOrderdetail);
                let wodetailId = result.dataValues.Id;
                let orderObserveBO = BoFactory.GetBo(lisbo.WorkOrderObservationBo, this.Request);
                if (testanalyte.Observation) {
                    let obsData: any = {
                        Id: 0,
                        PatientId: od.PatientId,
                        WorkOrderId: woId,
                        WorkOrderDetailId: wodetailId,
                        ObservationDate: new Date(),
                        Comments: testanalyte.Observation,
                        Status: 1
                    };
                    await orderObserveBO.Save(obsData);
                }
                if (od.DepartmentId === 62 && orderDetailTest.IsRISSync === true) {
                    let patientbo = BoFactory.GetBo(regbo.PatientBo, this.Request);
                    let patientData: any = await patientbo.GetPatientById({ Id: od.PatientId });
                    let gender = '';
                    if (patientData.GenderId === 1) {
                        gender = 'M';
                    } else if (patientData.GenderId === 2) {
                        gender = 'F';
                    } else {
                        gender = 'Other';
                    }
                    let depData: any = await deptBO.GetById(od.DepartmentId);
                    let subDepData: any = await deptBO.GetById(subDepartmentId);
                    let modality = depData.DepartmentName;
                    let modality1 = subDepData.DepartmentName;
                    let encounterbo = BoFactory.GetBo(Encounter.EncounterBo, this.Request);
                    let encData: any = await encounterbo.GetById(encounterId);
                    let testmasterbo = BoFactory.GetBo(lisbo.TestmasterBo, this.Request);
                    let testMasterData: any = await testmasterbo.GetById(testId);
                    let risBO = BoFactory.GetBo(lisbo.RISInterfaceResultBo, this.Request);
                    let workorder = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);
                    let workorderData: any = await workorder.GetById(woId);
                    let priority = '';
                    if (workorderData.OrderPriorityId === 1) {
                        priority = 'R';
                    } else {
                        priority = 'U';
                    }
                    let ptstatus = '';
                    if (encData.EncounterTypeId === 1) {
                        ptstatus = 'O';
                    } else {
                        ptstatus = 'I';
                    }
                    let risInterface: any = {
                        WorkOrderId: woId,
                        RISId: orderId,
                        OrganizationId: this.Session.OrganizationId,
                        FacilityId: this.Session.FacilityId,
                        FirstName: patientData.FirstName,
                        LastName: patientData.LastName,
                        MRNNo: patientData.MRN,
                        TestmasterId: testId,
                        AnalyteCode: testanalyte.Code,
                        AnalyteId: testanalyte.Id,
                        AnalyteName: testanalyte.Name,
                        ApproveDt: new Date(),
                        RisInterfaceStatusId: 1,
                        PatientId: od.PatientId,
                        DOB: patientData.DOB,
                        Gender: gender,
                        Modality: modality,
                        Modality1: modality1,
                        VisitNo: encData.VisitIdentifier,
                        DoctorName: encData.DoctorName,
                        TestCode: testMasterData.Code,
                        TestName: testMasterData.Name,
                        FacilityName: this.Session.FacilityName,
                        PatientType: ptstatus,
                        UpdatedByUser: this.Session.UserName,
                        Priority: priority,
                    };
                    await risBO.Save(risInterface);
                }
            })(testanalyte);
        }));
    }


}
