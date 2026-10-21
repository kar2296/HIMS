import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { WorkOrderSampleDetailInstance, WorkOrderSampleDetailAttributes } from '../Model/Interface/Index';
import { WorkOrderSampleDetailFilters, PatientWorkorderdetailsFilters, PatientWorkorderFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../EMR/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import * as _ from 'lodash';
import * as regbo from '../../Registration/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { PatientFilters, } from '../../Registration/Common/Filters.e';
export class WorkOrderSampleDetailBo extends BaseBo<WorkOrderSampleDetailInstance, WorkOrderSampleDetailAttributes>  {
    public async AddWorkOrderSampleDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWorkOrderSampleDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManageWorkOrderSampleTypeDetails(details: any[]): Promise<boolean> {
        details = details || [];
        let samplegrp: any;
        samplegrp = _.groupBy(details, 'SampleTypeId');
        let sampledetail: any;
        for (let sx in samplegrp) {
            sampledetail = samplegrp[sx];
            await this.ManageWorkOrderSampleDetails(sampledetail);
        }
        return true;
    }

    public async ManageWorkOrderSampleDetails(details: any[]): Promise<boolean> {
        let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        details = details || [];

        // Group details being collected that do not yet have a SampleIdentifier.
        // Items sharing the same specimen/SampleTypeId (and without a separate sample ID requirement)
        // share the sequence key within this collection batch.
        let groupMap: { [key: string]: any[] } = {};
        for (let detail of details) {
            if (detail.Id > 0 && !detail.IsReadOnly && !detail.SampleIdentifier && detail.Status !== 2) {
                let groupKey = '';
                if (detail.IsSeparateSampleId && Number(detail.IsSeparateSampleId) > 0) {
                    groupKey = 'sep_' + detail.IsSeparateSampleId;
                } else {
                    groupKey = 'type_' + (detail.SampleTypeId || 0);
                }
                if (!groupMap[groupKey]) {
                    groupMap[groupKey] = [];
                }
                groupMap[groupKey].push(detail);
            }
        }

        // For each group being collected, defer sequence generation once and update ONLY the items in that group
        for (let groupKey in groupMap) {
            let groupItems = groupMap[groupKey];
            let firstDetail = groupItems[0];
            let detailIds = groupItems.map(d => d.Id);
            let orderDetailIds = groupItems.map(d => d.OrderDetailId);
            let testIds = groupItems.map(d => d.TestId);

            const afterO: any = () => {
                return ((bo, request: any) => {
                    return {
                        updateSampleTypeInfo: async (code: string) => {
                            request['code'] = code;
                            await bo.UpdateSampleTypeInfo(request);
                        },
                        UpdatePatientWorkOrderInfo: async (code: string) => {
                            request['code'] = code;
                            await bo.UpdatePatientWorkOrderInfo(request);
                        },
                        AddLisInterfaceData: async (code: string) => {
                            request['code'] = code;
                            await bo.AddLisInterfaceData(request);
                        }
                    };
                })(this, {
                    sampleId: firstDetail.Id,
                    detailIds: detailIds,
                    orderDetailIds: orderDetailIds,
                    woId: firstDetail.WorkOrderSampleId,
                    isSeparateSampleId: firstDetail.IsSeparateSampleId,
                    sampleTypeId: firstDetail.SampleTypeId,
                    patientWorkOrderId: firstDetail.PatientWorkOrderId,
                    testId: testIds,
                    collectedDate: firstDetail.CollectedDate,
                    IsCulture: firstDetail.Testmaster ? firstDetail.Testmaster.IsCulture : false
                });
            };

            this.deferSequenceKey(firstDetail.Id, 'SampleIdentifier',
                this.getSequenceIdentifier(SequenceKeys.SampleDetailIdentifier), [
                afterO().updateSampleTypeInfo,
                afterO().UpdatePatientWorkOrderInfo,
                afterO().AddLisInterfaceData
            ]);
        }

        // Update each item in details (marking status, date, etc.)
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0 && !detail.IsReadOnly) {
                    await this.Update(detail);
                    if (detail.CollectedDate) {
                        let ordertat: any = { sampleCollectedDate: detail.CollectedDate, sampleReceivedDate: null };
                        await orderTATBO.UpdateSampleCollectedDate(detail.OrderDetailId, ordertat);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageWorkOrderReviewSampleDetails(details: any[]): Promise<boolean> {
        let orderTATBO = BoFactory.GetBo(lisbo.OrderTATBo, this.Request);
        let patientWorkorderdtailBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    if (detail.ReviewDate) {
                        await patientWorkorderdtailBo.UpdateSpecReceiveddate(
                            detail.PatientWorkOrderId, detail.TestId, detail.ReviewDate);
                        let ordertat: any = { sampleCollectedDate: detail.CollectedDate, sampleReceivedDate: detail.ReviewDate };
                        await orderTATBO.UpdateSampleCollectedDate(detail.OrderDetailId, ordertat);
                    }
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetWorkOrderSampleDetailById(req: BaseRequest): Promise<WorkOrderSampleDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async CreateWorkOrderSampleDetails(woId: number, woSampleId: number, workOrderSample: any,
        patientOrderId: any, orderDetailIds: any): Promise<boolean> {
        let pworderDetailData: any = {};
        let pworderDetails: Array<any> = [];
        let orderDetailBO = BoFactory.GetBo(bo.PatientOrderDetailBo, this.Request);
        let pworderDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let orderDetailResp: any =
            await orderDetailBO.GetPatientOrderDetailsFromOrderId(patientOrderId, orderDetailIds);
        await Promise.all(orderDetailResp.Data.map((morderDetail: any): Promise<void> => {
            return (async (itemdata): Promise<void> => {
                pworderDetailData = await pworderDetailBO.GetPatientWOdetailsByOrderdetailid(itemdata.Id);
                pworderDetails.push(pworderDetailData.Data);
            })(morderDetail);
        }));

        let promises: Array<any> = [];
        if (pworderDetails && pworderDetails.length > 0) {
            let testidpresent: { [id: number]: any[] } = {};
            for (let i = 0; i < pworderDetails.length; i++) {
                let pworderdetail: Array<any> = pworderDetails[i];
                pworderdetail.forEach(itemdata => {
                    if (!testidpresent[itemdata.Testid]) {
                        testidpresent[itemdata.Testid] = itemdata.Testid;
                        let woSampleDetail: any = {};
                        woSampleDetail.WorkOrderSampleId = woSampleId;
                        woSampleDetail.OrderDetailId = itemdata.Orderdetailid;
                        woSampleDetail.TestId = itemdata.Testid;
                        woSampleDetail.TestName = itemdata.Testname;
                        woSampleDetail.SamplePriorityId = workOrderSample.SamplePriorityId;
                        woSampleDetail.SampleDetailStatusId = 1; //Pending = 1
                        woSampleDetail.SampleTypeId = itemdata.SampleTypeId;
                        woSampleDetail.SampleType = itemdata.SampleType || null;
                        woSampleDetail.PatientWorkOrderId = woId;
                        woSampleDetail.IsSeparateSampleId = itemdata.IsSeparateSampleId || 0;
                        promises.push(this.Save(woSampleDetail));
                    }
                });
            }
            if (promises && promises.length > 0)
                await Promise.all(promises);
        }

        /*
        let promises: Array<any> = [];
        orderdetails.forEach(item => {
            let woSampleDetail: any = {};
            woSampleDetail.WorkOrderSampleId = woSampleId;
            woSampleDetail.OrderDetailId = item.Id;
            woSampleDetail.TestId = item.TestId;
            woSampleDetail.TestName = item.TestName;
            woSampleDetail.SamplePriorityId = workOrderSample.SamplePriorityId;
            woSampleDetail.SampleDetailStatusId = 1; //Pending = 1
            woSampleDetail.SampleTypeId = item.Testmaster.SampletypeId;
            woSampleDetail.SampleType = item.Testmaster.Sampletype ? item.Testmaster.Sampletype.Name : null;
            woSampleDetail.PatientWorkOrderId = woId;
            woSampleDetail.IsSeparateSampleId = IsSeparateSampleIdGroup[item.Id] || 0;
            promises.push(this.Save(woSampleDetail));
        });
        await Promise.all(promises);
        */

        return true;
    }

    public async GetWorkOrderSampleDetails(apiReq?: ApiRequest<WorkOrderSampleDetailFilters>):
        Promise<ApiResponse<WorkOrderSampleDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Testmaster, required: false,
            include: [{ model: this.Models.Department, as: 'Department', attributes: ['DepartmentCode'], required: false }]
        });
        include.push(this.GetReference('SampleStatus'));
        include.push(this.GetReference('OrderPriority'));

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WorkOrderSampleDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WorkOrderSampleDetailFilters.WorkOrderSampleId:
                        where['WorkOrderSampleId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteWorkOrderSampleDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WorkOrderSampleDetailInstance, WorkOrderSampleDetailAttributes> {
        return this.Models.WorkOrderSampleDetail;
    }

    public async SampleCollectedSummary(req: BaseRequest): Promise<any> {
        let StatusSummary: any = [];
        if (req.Data.TestId > 0) {
            let SampleCollectedsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'SampleDetailStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$eq': req.Data.TestId },
                    'SampleDetailStatusId': { '$eq': 3 },
                    'CollectedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
            if (SampleCollectedsummaryInst) {
                let samplecollectedCount: any = 0;
                let groupTest = _.groupBy(SampleCollectedsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    samplecollectedCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'SampleCollectedCount': samplecollectedCount
                    };
                    StatusSummary.push(info);
                }
            }
        } else if (req.Data.TestId === 0) {
            let SampleCollectedsummaryInst: any = await this.FindAll({
                attributes: ['TestId', 'TestName', 'SampleDetailStatusId'],
                where: {
                    'Status': 1,
                    'TestId': { '$gt': req.Data.TestId },
                    'SampleDetailStatusId': { '$eq': 3 },
                    'CollectedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
                }
            });
            if (SampleCollectedsummaryInst) {
                let samplecollectedCount: any = 0;
                let groupTest = _.groupBy(SampleCollectedsummaryInst, 'TestId');
                for (let i in groupTest) {
                    let groupedTest = groupTest[i];
                    samplecollectedCount = groupedTest.length;
                    let TestId: number = 0;
                    let TestName: string = '';
                    for (let i = 0; i < groupedTest.length; i++) {
                        let orderdata: any = groupedTest[i];
                        TestId = orderdata.TestId;
                        TestName = orderdata.TestName;
                    }
                    let info = {
                        'TestId': TestId,
                        'TestName': TestName,
                        'SampleCollectedCount': samplecollectedCount
                    };
                    StatusSummary.push(info);
                }
            }
        }
        return StatusSummary;
    }

    public async GetLABInfoDashBoard(req: BaseRequest): Promise<any> {
        let patientorderjoin: any = {
            model: this.Models.PatientOrderDetail,
            attributes: ['Id'],
            required: true,
            where: {
                'Status': 1,
                'TestTypeId': req.Data.Testtypeid,
                'TestId': req.Data.TestId,
                'OrderStatusId': 10
                // 'OrderRequestDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        };
        let LISSampleCollectionCount = await this.Items.count({
            where: {
                'Status': 1,
                'SampleDetailStatusId': 3
            },
            include: [patientorderjoin]
        });
        let LISSampleReviewCount = await this.Items.count({
            where: {
                'Status': 1,
                'SampleDetailStatusId': 3
            },
            include: [patientorderjoin]
        });
        let LisTestTotaldata = await this.Items.findAll({
            where: {
                'Status': 1,
                'SampleDetailStatusId': 3,
                'TestId': req.Data.TestId || 0,
                'CollectedDate': { '$gte': req.Data.FromDate, '$lte': req.Data.ToDate }
            },
            include: [patientorderjoin]
        });
        return {
            'LISSampleCollectionCount': LISSampleCollectionCount,
            'LISSampleReviewCount': LISSampleReviewCount,
            'LisTestTotaldata': LisTestTotaldata
        };
    }

    private async UpdateSampleTypeInfo(req: any) {
        let siInfo: any = { Id: 1, SampleIdentifier: req.code };
        let whereCondition: any = {
            WorkOrderSampleId: req.woId,
            SampleIdentifier: null
        };
        if (req.detailIds && req.detailIds.length > 0) {
            whereCondition['Id'] = req.detailIds;
        } else if (req.sampleId) {
            whereCondition['Id'] = req.sampleId;
        } else if (req.isSeparateSampleId !== undefined) {
            whereCondition['IsSeparateSampleId'] = req.isSeparateSampleId;
        }

        await this.Update(siInfo, {
            fields: ['SampleIdentifier'],
            where: whereCondition
        });
    }

    private async UpdatePatientWorkOrderInfo(req: any) {
        let vSampleid = req.code;
        let vSampleCollectionDt = req.collectedDate;
        let vPatientWorkOrderId = req.patientWorkOrderId;
        let isculture = req.IsCulture;
        let SampleidCodition: any = { Id: 1, Sampleid: vSampleid, Samplecollectiondate: vSampleCollectionDt };
        let Sampledata: any = { Id: vPatientWorkOrderId, SampleIdentifier: vSampleid };
        let workorderDetailBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let workorderBO = BoFactory.GetBo(lisbo.PatientWorkorderBo, this.Request);

        let whereCondition: any = {
            Workorderid: vPatientWorkOrderId,
            Sampleid: null
        };
        if (req.testId && req.testId.length > 0) {
            whereCondition['Testid'] = req.testId;
        } else if (req.orderDetailIds && req.orderDetailIds.length > 0) {
            whereCondition['Orderdetailid'] = req.orderDetailIds;
        } else if (req.isSeparateSampleId !== undefined) {
            whereCondition['IsSeparateSampleId'] = req.isSeparateSampleId;
        }

        if (!isculture) {
            await workorderDetailBO.Update(SampleidCodition, {
                fields: ['Sampleid', 'Samplecollectiondate'],
                where: whereCondition
            });
            await workorderBO.Update(Sampledata, {
                fields: ['SampleIdentifier', 'ManualBarcode'],
                where: {
                    Id: vPatientWorkOrderId,
                }
            });
        }
        if (isculture) {
            let WoIds: any = [];
            let ptwoInfo: any = {};
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientWorkorderFilters.Id, Value: vPatientWorkOrderId }]
            };
            let woInfo = await workorderBO.GetPatientWorkorders(apiReq);
            WoIds.push(vPatientWorkOrderId);
            if (woInfo.Data.length > 0) {
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientWorkorderFilters.ParentWorkOrderId, Value: vPatientWorkOrderId }]
                };
                ptwoInfo = await workorderBO.GetPatientWorkorders(apiReq);
            }
            if (ptwoInfo.Data.length > 0) {
                for (let wdx in ptwoInfo.Data) {
                    let wInfo = ptwoInfo.Data[wdx];
                    WoIds.push(wInfo.Id);
                }
            }
            if (WoIds.length > 0) {
                for (let ix in WoIds) {
                    let wId = WoIds[ix];
                    let cultWhere = { ...whereCondition, Workorderid: wId };
                    await workorderDetailBO.Update(SampleidCodition, {
                        fields: ['Sampleid', 'Samplecollectiondate'],
                        where: cultWhere
                    });
                    await workorderBO.Update(Sampledata, {
                        fields: ['SampleIdentifier', 'ManualBarcode'],
                        where: {
                            Id: wId,
                        }
                    });
                }
            }
        }

        return true;
    }

    private async AddLisInterfaceData(req: any) {
        let vSampleid = req.code;
        let vPatientWorkOrderId = req.patientWorkOrderId;
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patwDetBO = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
        let listReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientWorkorderdetailsFilters.WorkOrderId, Value: vPatientWorkOrderId }]
        };
        let wdetails = await patwDetBO.GetPatientWorkorderdetailss(listReq);
        let lisInpatDetBo = BoFactory.GetBo(lisbo.LISInterfacePatientDetailsBo, this.Request);
        let lisIntResBo = BoFactory.GetBo(lisbo.LISInterfaceResultsBo, this.Request);
        let patInfo: any = {};

        let targetDetails = wdetails.Data || [];
        if (req.testId && req.testId.length > 0) {
            targetDetails = targetDetails.filter((w: any) => req.testId.includes(w.Testid));
        } else if (req.orderDetailIds && req.orderDetailIds.length > 0) {
            targetDetails = targetDetails.filter((w: any) => req.orderDetailIds.includes(w.Orderdetailid));
        }

        for (let idx in targetDetails) {
            let wDetData = targetDetails[idx];
            let patReq = {
                Id: 0,
                PageContext: { PageSize: 1000, PageNumber: 1 },
                Params: [{ Key: PatientFilters.Id, Value: wDetData.Patientid }]
            };
            let patientData = await patientBo.GetPatients(patReq);
            patInfo = patientData.Data[0];
            let vpatName = '';
            if (patInfo.Title) {
                vpatName = patInfo.Title.Description;
            }
            if (patInfo.FirstName) {
                vpatName += ' ' + patInfo.FirstName;
            }
            if (patInfo.LastName) {
                vpatName += ' ' + patInfo.LastName;
            }
            let InterfaceData: any = {
                Id: 0,
                OrganizationId: this.Session.OrganizationId,
                FacilityId: patInfo.FacilityId,
                AssetId: 1,
                Sampleid: vSampleid,
                PatientId: wDetData.Patientid,
                EncounterId: wDetData.EncounterId,
                Status: 1,
            };
            let lisData = await lisInpatDetBo.Save(InterfaceData);
            let lisId = lisData.dataValues.Id;
            let InterfaceResData: any = {
                Id: 0,
                LISId: lisId,
                OrganizationId: this.Session.OrganizationId,
                FacilityId: patInfo.FacilityId,
                AssetId: 1,
                Sampleid: vSampleid,
                Code: wDetData.AnalyteCode,
                AnalyteId: wDetData.Analyteid,
                AnalyteName: wDetData.Analytename,
                PatientId: wDetData.Patientid,
                PatientName: vpatName,
                MRNNo: patInfo.MRN,
                EncounterId: wDetData.EncounterId,
                Status: 1,
                WorkOrderId: vPatientWorkOrderId
            };
            await lisIntResBo.Save(InterfaceResData);
        }
        return true;
    }

}
