import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientBillLockInstance, PatientBillLockAttributes } from '../Model/Interface/Index';
import {
    PatientBillLockFilters, PatientBillSummaryFilters,
    PatientBillSplitDetailsFilters
} from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as bo from '../../Billing/Business/Index';

export class PatientBillLockBo extends BaseBo<PatientBillLockInstance, PatientBillLockAttributes> implements IOptionProvider {
    public async AddPatientBillLock(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.IsBillLock = req.Data.LockStatusId === 1 ? true : false;
        EncounterInfo.Id = req.Data.EncounterId;
        // if (req.Data.LockStatusId === 1 && req.Data.GuarantorTypeId === 6) {
        //     await this.UpdateZeroAmountforFreeVisit(req.Data.EncounterId);
        // }
        await encounterbo.Update(EncounterInfo);
        return result.dataValues.Id;
    }

    public async UpdateZeroAmountforFreeVisit(EncounterId: number): Promise<boolean> {
        let billsummarybo = BoFactory.GetBo(bo.PatientBillSummaryBo, this.Request);
        let billsplitBo = BoFactory.GetBo(bo.PatientBillSplitDetailsBo, this.Request);
        let billSummaryApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000000, PageNumber: 1 },
            Params: [{ Key: PatientBillSummaryFilters.EncounterId, Value: EncounterId }]
        };
        let SummaryData = await billsummarybo.GetPatientBillSummarys(billSummaryApiReq);
        if (SummaryData && SummaryData.Data &&
            SummaryData.Data.length) {
            for (let i = 0, len = SummaryData.Data.length; i < len; i++) {
                let PatientSummary = SummaryData.Data[i];
                let PatientSummaryId: any = PatientSummary.Id;
                let SummaryActualAmount = PatientSummary.ActualAmount;
                let apiReq = {
                    Id: 0,
                    PageContext: { PageSize: 1000000, PageNumber: 1 },
                    Params: [
                        { Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: PatientSummaryId }
                    ]
                };
                let SplitDetailsData = await billsplitBo.GetPatientBillSplitDetails(apiReq);
                if (SplitDetailsData && SplitDetailsData.Data &&
                    SplitDetailsData.Data.length) {
                    for (let k = 0, splitlen = SplitDetailsData.Data.length; k < splitlen; k++) {
                        let splitdetail = SplitDetailsData.Data[k];
                        let patientsplitdetailreq: any = {
                            Id: splitdetail.Id,
                        };
                        if (splitdetail.ItemAmount > 0) patientsplitdetailreq.FreeItemAmount = splitdetail.ItemAmount;
                        if (splitdetail.ItemDiscount > 0) patientsplitdetailreq.FreeItemDiscount = splitdetail.ItemDiscount;
                        if (splitdetail.SplitItemAmount > 0) patientsplitdetailreq.FreeSplitItemAmount = splitdetail.SplitItemAmount;
                        if (splitdetail.SplitItemDiscount > 0) patientsplitdetailreq.FreeSplitItemDiscount = splitdetail.SplitItemDiscount;
                        patientsplitdetailreq.ItemAmount = 0;
                        patientsplitdetailreq.ItemDiscount = 0;
                        patientsplitdetailreq.SplitItemAmount = 0;
                        patientsplitdetailreq.SplitItemDiscount = 0;
                        await billsplitBo.Update(patientsplitdetailreq);
                    }
                }
                let patientsummaryreq: any = {
                    Id: PatientSummaryId,
                    IsFreePatient: true,
                };
                if (SummaryActualAmount > 0) patientsummaryreq.FreeActualAmount = SummaryActualAmount;
                patientsummaryreq.ActualAmount = 0;
                await billsummarybo.Update(patientsummaryreq);
            }
        }

        return true;
    }

    public async UpdatePatientBillLock(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.IsBillLock = req.Data.LockStatusId === 1 ? true : false;
        EncounterInfo.Id = req.Data.EncounterId;
        if (req.Data.LockStatusId === 1 && req.Data.GuarantorTypeId === 6) {
            await this.UpdateZeroAmountforFreeVisit(req.Data.EncounterId);
        }
        await encounterbo.Update(EncounterInfo);

        return result;
    }

    public async GetPatientBillLockById(req: BaseRequest): Promise<PatientBillLockAttributes> {
        let include: Array<IncludeOptions> = [];
        // include.push({
        //     model: this.Models.Guarantor,
        //     include: [{
        //         model: this.Models.GuarantorAgreement,
        //         required: false
        //     }],
        //     required: false
        // });
        // include.push({
        //     model: this.Models.PromotionalScheme, attributes: ['Id', 'PromotionSchemeName', 'PromotionSchemeCode'],
        //     required: false,
        //     include: [
        //         {
        //             model: this.Models.PromotionalSchemeDetail,
        //             required: false,
        //         },
        //     ]
        // });
        include.push(this.GetReference('LockStatus'));
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetPatientBillLocks(apiReq?: ApiRequest<PatientBillLockFilters>): Promise<ApiResponse<PatientBillLockAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'LockedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'UnLockedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('LockType'));
        include.push(this.GetReference('LockStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillLockFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillLockFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillLockFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillLockFilters.LockStatusId:
                        where['LockStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientBillLock(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetPatientBillLockByEncounterId(req: BaseRequest): Promise<PatientBillLockAttributes> {
        let PatientBillLockId: number = -1;
        let PatientBillLock: any = {};
        let PatientBillLockInstance: any = await this.Find({
            where: {
                EncounterId: req.Data.EncounterId,
                LockStatusId: 1,
            },
            attributes: ['Id']
        });
        if (PatientBillLockInstance) {
            let patientBillLock = this.GetAttribute(PatientBillLockInstance);
            PatientBillLockId = patientBillLock.Id;
        }
        if (PatientBillLockId > 0) {
            return await this.GetPatientBillLockById({ Id: PatientBillLockId });
        } else {
            PatientBillLock = { Id: PatientBillLockId };
            return PatientBillLock;
        }
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientBillLockFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientBillLocks(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientBillLockInstance, PatientBillLockAttributes> {
        return this.Models.PatientBillLock;
    }
}
