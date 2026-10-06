import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as lisbo from '../../LIS/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LISInterfaceResultInstance, LISInterfaceResultAttributes } from '../Model/Interface/Index';
import { LISInterfaceResultsFilters } from '../Common/Filters.e';

export class LISInterfaceResultsBo extends BaseBo<LISInterfaceResultInstance, LISInterfaceResultAttributes> {

    public async AddLISResult(req: BaseRequest): Promise<Boolean> {
        if (req && req.Data) {
            await this.Save(req.Data);
        }
        return true;
    }

    public async UpdateLISResult(req: BaseRequest): Promise<Boolean> {
        if (req && req.Data) {
            let LISId = -1;
            let Approved = false;
            let Rejected = false;
            let ApprovedById = 0;
            let RejectedById = 0;
            let ApproveDt = new Date();
            let RejectedDt = new Date();
            for (let idx in req.Data) {
                LISId = req.Data[idx].LISId;
                if (req.Data[idx].Approved) {
                    Approved = true;
                    req.Data[idx].ApproveDt = new Date();
                    ApprovedById = req.Data[idx].ApprovedById;
                }
                if (req.Data[idx].Rejected) {
                    Rejected = true;
                    req.Data[idx].RejectedDt = new Date();
                    RejectedById = req.Data[idx].RejectedById;
                }
                await this.Update(req.Data[idx]);
                let patientWorkorderdetailsBo = BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request);
                await patientWorkorderdetailsBo.UpdateLISResult(req.Data[idx].AnalyteId,
                    req.Data[idx].Sampleid, req.Data[idx].FullResultValue);
            }
            let UpdateAPI: any = {
                Id: LISId,
                Approved: Approved,
                Rejected: Rejected,
                ApprovedById: ApprovedById,
                RejectedById: RejectedById,
                ApproveDt: ApproveDt,
                RejectedDt: RejectedDt,
            };
            req.Data = UpdateAPI;
            let lisInterfacePatientDetailsBo = BoFactory.GetBo(lisbo.LISInterfacePatientDetailsBo, this.Request);
            await lisInterfacePatientDetailsBo.UpdateLISPatientDetails(req);

        }
        return true;
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
                    case LISInterfaceResultsFilters.PatientName:
                        where['PatientName'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Code:
                        where['Code'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case LISInterfaceResultsFilters.LISId:
                        where['LISId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.MRNNo:
                        where['MRNNo'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Approved:
                        where['Approved'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.VisitType:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.FromDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.ToDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.VisitIdentifier:
                        (encounterWhere as any)[Op.or] = [{ VisitIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isencounterRequired = true;
                        break;
                    case LISInterfaceResultsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({ model: this.Models.LISInterfacePatientDetails, required: false });
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
                }]
        });
        order.push(['AssetId', 'ASC']);
        order.push(['DisplayNo', 'ASC']);
        return await this.FindAndCountAll(apiReq, {
            where: where, include: include,
            group: ['LISInterfaceResults.SampleId'],
            attributes: apiReq.Attributes
        });
    }

    public async GetLISResultsWithoutGroup(apiReq?: ApiRequest<LISInterfaceResultsFilters>):
        Promise<ApiResponse<LISInterfaceResultAttributes[]>> {
        let where: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let isencounterRequired: any = false;

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
                    case LISInterfaceResultsFilters.PatientName:
                        where['PatientName'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Code:
                        where['Code'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case LISInterfaceResultsFilters.LISId:
                        where['LISId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.MRNNo:
                        where['MRNNo'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.Approved:
                        where['Approved'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.WorkOrderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.VisitType:
                        encounterWhere['EncounterTypeId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.FromDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.ToDate:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.VisitIdentifier:
                        (encounterWhere as any)[Op.or] = [{ VisitIdentifier: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isencounterRequired = true;
                        break;
                    case LISInterfaceResultsFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case LISInterfaceResultsFilters.ResultValue:
                        where['ResultValue'] = {'$ne': 'NULL'};
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({ model: this.Models.LISInterfacePatientDetails, required: false });
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
                }]
        });
        order.push(['AssetId', 'ASC']);
        order.push(['DisplayNo', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include });
    }


    public async DeleteLISResults(req: BaseRequest): Promise<Boolean> {
        console.log(req);
        return true;
    }

    public GetModel(): SStatic.Model<LISInterfaceResultInstance, LISInterfaceResultAttributes> {
        return this.Models.LISInterfaceResults;
    }
}
