import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LISInterfaceResultInstance, LISInterfaceResultAttributes } from '../Model/Interface/Index';
import { LISInterfaceResultsFilters } from '../Common/Filters.e';
import { PatientWorkorderdetailsFilters } from '../Common/Filters.e';
import { AssetFilters } from '../../AssetManagement/Common/Filters.e';
import * as assetbo from '../../AssetManagement/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import { BoFactory } from '../../Base/Business/Index';

export class LISInterfaceBo extends BaseBo<LISInterfaceResultInstance, LISInterfaceResultAttributes> {
    public async GetEquipmentList(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: AssetFilters.IsLabInterface, Value: true }]
        };
        let assetBo = BoFactory.GetBo(assetbo.AssetBo, this.Request);
        let assetdata = assetBo.GetAssets(apiReq);
        return assetdata;
    }

    public async AddLISResult(req: BaseRequest): Promise<boolean> {
        if (req && req.Data) {
            let vPatientId = -1;
            let vEncounterId = -1;
            let vAssetId = req.Data.AssetId;
            let vSampleid = req.Data.Sampleid;
            let vFacilityId = req.Data.FacilityId;
            let vfullresult = req.Data.FullResults;
            let analyzerTestbo = BoFactory.GetBo(lisbo.AnalyzerTestBo, this.Request);
            let patientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
            let lispatientdetailinfobo = BoFactory.GetBo(lisbo.LISInterfacePatientDetailsBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: PatientWorkorderdetailsFilters.Sampleid, Value: vSampleid },
                    { Key: PatientWorkorderdetailsFilters.EquipmentId, Value: vAssetId },
                ]
            };
            let IsMappedData = false;
            let patientinfo = await patientWorkorderdetailsBo.GetPatientInfoBySampleId(apiReq);
            if (patientinfo && patientinfo.Data) {
                if (patientinfo.Data.length > 0) {
                    for (let idx in vfullresult) {
                        let vCode1 = idx;
                        for (let idx1 in patientinfo.Data) {
                            let reqlist1 = patientinfo.Data[idx1];
                            if (reqlist1.Code === vCode1) {
                                IsMappedData = true;
                                break;
                            }
                        }
                        if (IsMappedData)
                            break;
                    }
                    if (IsMappedData) {
                        let detail = patientinfo.Data[0];
                        vPatientId = detail.Patientid;
                        vEncounterId = detail.EncounterId;

                        let vsfullresult = JSON.stringify(vfullresult);
                        let LISPatinfo: any = {
                            AssetId: vAssetId,
                            Sampleid: vSampleid,
                            FacilityId: vFacilityId,
                            PatientId: vPatientId,
                            EncounterId: vEncounterId,
                            FullResult: vsfullresult,
                        };
                        req.Data = LISPatinfo;
                        let LISId = await lispatientdetailinfobo.AddLISPatientDetails(req);
                        if (LISId) {
                            for (let idx in vfullresult) {
                                let vCode = idx;
                                let vResultValue = vfullresult[idx];
                                for (let idx1 in patientinfo.Data) {
                                    let reqlist = patientinfo.Data[idx1];
                                    if (reqlist.Code === vCode) {
                                        let vDisplayNo = await analyzerTestbo.getDisplayNo(vAssetId, vCode);
                                        if (await analyzerTestbo.IsAnalyzerItemCode(vAssetId, vCode)) {
                                            let LISResults: any = {
                                                LISId: LISId,
                                                AssetId: vAssetId,
                                                Sampleid: vSampleid,
                                                FacilityId: vFacilityId,
                                                Code: vCode,
                                                ResultValue: vResultValue,
                                                DisplayNo: vDisplayNo,
                                                AnalyteId: reqlist.AnalyteId,
                                                AnalyteName: reqlist.AnalyteName,
                                            };
                                            ////console.log(LISResults);
                                            await this.Save(LISResults);
                                        } // Analyzer Test code in master
                                    }// Pateint Req Code
                                } // Patient Req
                            } // LIS Result
                        } // LIS Patient Info
                    }
                } else {  // Entier Patient Req / Non Req
                    let vsfullresult = JSON.stringify(vfullresult);
                    let LISPatinfo: any = {
                        AssetId: vAssetId,
                        Sampleid: vSampleid,
                        FacilityId: vFacilityId,
                        PatientId: vPatientId,
                        EncounterId: vEncounterId,
                        FullResult: vsfullresult,
                    };
                    req.Data = LISPatinfo;
                    let LISId = await lispatientdetailinfobo.AddLISPatientDetails(req);
                    if (LISId) {
                        for (let idx in vfullresult) {
                            let vCode = idx;
                            let vResultValue = vfullresult[idx];
                            let vDisplayNo = await analyzerTestbo.getDisplayNo(vAssetId, vCode);
                            let vName = await analyzerTestbo.getLISName(vAssetId, vCode);
                            if (await analyzerTestbo.IsAnalyzerItemCode(vAssetId, vCode)) {
                                let LISResults: any = {
                                    LISId: LISId,
                                    AssetId: vAssetId,
                                    Sampleid: vSampleid,
                                    FacilityId: vFacilityId,
                                    Code: vCode,
                                    ResultValue: vResultValue,
                                    DisplayNo: vDisplayNo,
                                    AnalyteId: -1,
                                    AnalyteName: vName,
                                };
                                await this.Save(LISResults);
                            } // Analyzer Test code in master
                        }
                    }
                } // Non Raised Req Data
            }
        }
        return true;
    }

    public async AddLISImage(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLISResultsById(req: BaseRequest): Promise<LISInterfaceResultAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLISResults(apiReq?: ApiRequest<LISInterfaceResultsFilters>):
        Promise<ApiResponse<LISInterfaceResultAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let isencounterRequired: any = false;
        let patientWhere: WhereOptions<any> = {};
        include.push({ model: this.Models.LISInterfacePatientDetails, required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LISInterfaceResultsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Code:
                        where['Code'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientWorkorder,
            attributes: ['Workorderid', 'WorkOrderdid', 'Orderid', 'Encounterid', 'Patientid'],
            required: false,
            include: [
                {
                    model: this.Models.Encounter,
                    attributes: ['EncounterId', 'PatientId', 'VisitIdentifier', 'Patientid'],
                    where: encounterWhere,
                    required: isencounterRequired,
                },
                {
                    model: this.Models.Patient,
                    where: patientWhere,
                }],
        });
        include.push({
            model: this.Models.PatientWorkorderdetails,
            attributes: ['AnalyteUOM', 'Analytename', 'Testname', 'Analyterange', 'Patientid'],
            required: false,
        });
        include.push({
            model: this.Models.Analytemaster, attributes: ['AnalyteuomId', 'Listofvalue', 'Formula', 'Code', 'Name'],
            as: 'Analyte', required: false,
            include: [
                {
                    model: this.Models.Analyterefmaster, attributes: ['Refvalue', 'GenderId', 'Agefrom', 'Ageto',
                        'Activefrom', 'Activeto', 'MinValue', 'MaxValue'],
                    required: false
                }
            ]
        });
        order.push(['AssetId', 'ASC']);
        order.push(['DisplayNo', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetLISImages(req: BaseRequest): Promise<any> {
        console.log(req);
        return null;
    }

    public async GetLISRequest(req: BaseRequest): Promise<any> {
        console.log(req);
        return null;
    }

    public async UpdateLISRequest(req: BaseRequest): Promise<Boolean> {
        console.log(req);
        return true;
    }

    public async DeleteLISResults(req: BaseRequest): Promise<Boolean> {
        console.log(req);
        return true;
    }

    public GetModel(): SStatic.Model<LISInterfaceResultInstance, LISInterfaceResultAttributes> {
        return this.Models.LISInterfaceResults;
    }
}
