import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientGuarantorInstance, PatientGuarantorAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../GeneralMaster/Business/Index';
import { PatientGuarantorFilters } from '../Common/Filters.e';
import * as encounterBO from '../../Visit/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import { GuarantorFilters } from '../../GeneralMaster/Common/Filters.e';

export class PatientGuarantorBo extends BaseBo<PatientGuarantorInstance, PatientGuarantorAttributes> implements IOptionProvider {
    public async AddPatientGuarantor(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        let PatientGuarantorId = result.dataValues.Id;
        await this.UpdateGuarantortoEncounter(PatientGuarantorId, req);
        return PatientGuarantorId;
    }

    public async UpdatePatientGuarantor(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        await this.UpdateGuarantortoEncounter(req.Data.Id, req);
        return result;
    }

    public async UpdateEncGuarantor(req: BaseRequest, EncId: number): Promise<boolean> {
        let result = false;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: req.Data.PatientId },
            { Key: PatientGuarantorFilters.Id, Value: req.Data.PatientGuarantorId }]
        };
        let resguardata = await this.GetPatientGuarantors(apiReq);
        if (resguardata.Data.length > 0) {
            let patGuar: any = resguardata.Data[0];
            let gupdate: any = {
                Id: patGuar.Id,
                EncounterId: EncId
            };
            await this.Update(gupdate);
        }
        return result;
    }

    public async UpdateGuarantortoEncounter(PatientGuarantorId: number, req: BaseRequest): Promise<boolean> {
        let EncounterBo = BoFactory.GetBo(encounterBO.EncounterBo, this.Request);
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        let wardroombedmasterBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);

        if (req.Data && req.Data.PatientId) {
            let guarantor = await guarantorBO.GetGuarantorById({ Id: req.Data.GuarantorId });
            let EncounterReq = {
                Id: 0,
                PageContext: { PageSize: 1, PageNumber: 1 },
                Params: [{ Key: EncounterFilters.Id, Value: req.Data.EncounterId }]
            };
            let Encounterdata = await EncounterBo.GetEncounters(EncounterReq);
            if (Encounterdata && Encounterdata.Data && Encounterdata.Data.length > 0 &&
                guarantor && guarantor.ServiceRateCategoryId) {
                let EncounterInfo = Encounterdata.Data[0];
                let EncounterTypeId = EncounterInfo.EncounterTypeId;
                if (EncounterTypeId === 1 || EncounterTypeId === 4) { // OP
                    let OPEncounterInfo: any = {
                        Id: EncounterInfo.Id,
                        GuarantorId: req.Data.GuarantorId,
                        GuarantorTypeId: req.Data.GuarantorTypeId,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        EligibleAmount: req.Data.EligibleAmount,
                        CreditLimit: req.Data.CreditLimit,
                        TpaId: req.Data.TpaId,
                        GuarantorLetterNo: req.Data.GuarantorLetterNo,
                    };
                    await EncounterBo.Update(OPEncounterInfo);
                } else if (EncounterTypeId === 2) { // IP
                    let IPEncounterInfo: any = {
                        Id: EncounterInfo.Id,
                        GuarantorId: req.Data.GuarantorId,
                        GuarantorTypeId: req.Data.GuarantorTypeId,
                        EligibleAmount: req.Data.EligibleAmount,
                        CreditLimit: req.Data.CreditLimit,
                        TpaId: req.Data.TpaId,
                        GuarantorLetterNo: req.Data.GuarantorLetterNo,
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId, // Default Bed Tariff
                    };
                    if (!req.Data.IsWardInsTariff) {
                        if (!guarantor.IsIPBedTariff) {
                            IPEncounterInfo.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                        } else {
                            if (EncounterInfo.BedId) {
                                let BedTariff = await wardroombedmasterBo.GetWardRoomBedMasterById({ Id: EncounterInfo.BedId });
                                if (BedTariff.ServiceRateCategoryId)
                                    IPEncounterInfo.ServiceRateCategoryId = BedTariff.ServiceRateCategoryId;
                            }
                        }
                    }
                    await EncounterBo.Update(IPEncounterInfo);
                }
            }
        }

        return true;
    }

    public async GetPatientGuarantorById(req: BaseRequest): Promise<PatientGuarantorAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Guarantor,
            required: false,
            include: [{ model: this.Models.GuarantorCustomer, required: false }]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async ManagePatientforGuarantorInfo(patientId: number,
        GuarantorTypeId: number, GuarantorId: number, TpaId: number,
        GuarantorName: string,
        EncounterId: number): Promise<number> {
        let res: number;
        let listReq: any = {};
        listReq = {
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: patientId },
            { Key: PatientGuarantorFilters.GuarantorId, Value: GuarantorId },
            { Key: PatientGuarantorFilters.EncounterId, Value: EncounterId }
            ]
        };
        let listRes = await this.GetPatientGuarantors(listReq);
        if (listRes.Data.length > 0) {
            let PatGuarantorData = listRes.Data[0];
            let patientSelfGuarantor: any = {};
            patientSelfGuarantor.Id = PatGuarantorData.Id;
            patientSelfGuarantor.PatientId = patientId;
            patientSelfGuarantor.GuarantorId = GuarantorId;
            patientSelfGuarantor.TpaId = TpaId;
            patientSelfGuarantor.EncounterId = EncounterId;
            patientSelfGuarantor.GuarantorName = GuarantorName;
            patientSelfGuarantor.GuarantorTypeId = GuarantorTypeId;
            patientSelfGuarantor.ActiveStatusId = 2; //2-Active
            patientSelfGuarantor.Rank = 1;
            await this.Update(patientSelfGuarantor);
        }

        if (listRes.Data.length === 0) {
            let patientSelfGuarantor: any = {};
            patientSelfGuarantor.Id = 0;
            patientSelfGuarantor.PatientId = patientId;
            patientSelfGuarantor.EncounterId = EncounterId;
            patientSelfGuarantor.GuarantorId = GuarantorId;
            patientSelfGuarantor.GuarantorName = GuarantorName;
            patientSelfGuarantor.GuarantorTypeId = GuarantorTypeId;
            patientSelfGuarantor.ActiveStatusId = 2; //2-Active
            patientSelfGuarantor.Rank = 1;
            let result = await this.Save(patientSelfGuarantor);
            res = result.dataValues.Id;

        }
        return res;
    }

    public async ManagePatientforGuarantorInfowEnc(patientId: number,
        GuarantorTypeId: number, GuarantorId: number, TpaId: number,
        GuarantorName: string, EncId: number,): Promise<number> {
        let res: number;
        let listReq: any = {};
        listReq = {
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: patientId },
            { Key: PatientGuarantorFilters.GuarantorId, Value: GuarantorId },
            { Key: PatientGuarantorFilters.EncounterId, Value: EncId }
            ]
        };
        let listRes = await this.GetPatientGuarantors(listReq);
        if (listRes.Data.length > 0) {
            let PatGuarantorData = listRes.Data[0];
            let patientSelfGuarantor: any = {};
            patientSelfGuarantor.Id = PatGuarantorData.Id;
            patientSelfGuarantor.PatientId = patientId;
            patientSelfGuarantor.EncounterId = EncId;
            patientSelfGuarantor.GuarantorId = GuarantorId;
            patientSelfGuarantor.TpaId = TpaId;
            patientSelfGuarantor.GuarantorName = GuarantorName;
            patientSelfGuarantor.GuarantorTypeId = GuarantorTypeId;
            patientSelfGuarantor.ActiveStatusId = 2; //2-Active
            patientSelfGuarantor.Rank = 1;
            await this.Update(patientSelfGuarantor);
        }

        if (listRes.Data.length === 0) {
            let patientSelfGuarantor: any = {};
            patientSelfGuarantor.Id = 0;
            patientSelfGuarantor.PatientId = patientId;
            patientSelfGuarantor.GuarantorId = GuarantorId;
            patientSelfGuarantor.EncounterId = EncId;
            patientSelfGuarantor.GuarantorName = GuarantorName;
            patientSelfGuarantor.GuarantorTypeId = GuarantorTypeId;
            patientSelfGuarantor.ActiveStatusId = 2; //2-Active
            patientSelfGuarantor.Rank = 1;
            let result = await this.Save(patientSelfGuarantor);
            res = result.dataValues.Id;
        }
        return res;
    }

    public async ManagePatientSelfGuarantor(patientId: number): Promise<number> {
        let res: number;
        let listReq: any = {};
        listReq = {
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: patientId },
            { Key: PatientGuarantorFilters.GuarantorTypeId, Value: 1 }]
        };
        let listRes = await this.GetPatientGuarantors(listReq);
        if (listRes.Data.length === 1) {
            res = listRes.Data[0].Id;
        }
        if (listRes.Data.length === 0) {
            let guarantorBO = BoFactory.GetBo(bo.GuarantorBo, this.Request);
            // let selfGuarantorRec = await guarantorBO.GetSelfGuarantor();
            let guReq: any = {};
            guReq = {
                Params: [{ Key: GuarantorFilters.FacilityId, Value: -1 },
                { Key: GuarantorFilters.GuarantorTypeId, Value: 1 }]
            };
            let selfGuarantorRec = await guarantorBO.GetGuarantors(guReq);

            // let patientSelfGuarantor: any = {};
            // patientSelfGuarantor.Id = 0;
            // patientSelfGuarantor.PatientId = patientId;
            // patientSelfGuarantor.GuarantorId = selfGuarantorRec.Id;
            // patientSelfGuarantor.GuarantorName = selfGuarantorRec.GuarantorName;
            // patientSelfGuarantor.GuarantorTypeId = selfGuarantorRec.GuarantorTypeId;
            // patientSelfGuarantor.ActiveStatusId = 2; //2-Active
            // patientSelfGuarantor.Rank = 1;
            // let result = await this.Save(patientSelfGuarantor);
            // res = result.dataValues.Id;
            if (selfGuarantorRec) {
                let patientSelfGuarantor: any = {};
                patientSelfGuarantor.Id = 0;
                patientSelfGuarantor.PatientId = patientId;
                patientSelfGuarantor.GuarantorId = selfGuarantorRec.Data[0].Id;
                patientSelfGuarantor.GuarantorName = selfGuarantorRec.Data[0].GuarantorName;
                patientSelfGuarantor.GuarantorTypeId = selfGuarantorRec.Data[0].GuarantorTypeId;
                patientSelfGuarantor.ActiveStatusId = 2; //2-Active
                patientSelfGuarantor.Rank = 1;
                let result = await this.Save(patientSelfGuarantor);
                res = result.dataValues.Id;
            }
        }
        return res;
    }

    public async ManagePatientFreeGuarantor(patientId: number): Promise<number> {
        let res: number;
        let listReq: any = {};
        listReq = {
            Params: [{ Key: PatientGuarantorFilters.PatientId, Value: patientId },
            { Key: PatientGuarantorFilters.GuarantorTypeId, Value: 6 }]
        };
        let listRes = await this.GetPatientGuarantors(listReq);
        if (listRes.Data.length === 1) {
            res = listRes.Data[0].Id;
        }
        if (listRes.Data.length === 0) {
            let guarantorBO = BoFactory.GetBo(bo.GuarantorBo, this.Request);
            let freeGuarantorRec = await guarantorBO.GetFreeGuarantor();
            let patientFreeGuarantor: any = {};
            patientFreeGuarantor.Id = 0;
            patientFreeGuarantor.PatientId = patientId;
            patientFreeGuarantor.GuarantorId = freeGuarantorRec.Id;
            patientFreeGuarantor.GuarantorName = freeGuarantorRec.GuarantorName;
            patientFreeGuarantor.GuarantorTypeId = freeGuarantorRec.GuarantorTypeId;
            patientFreeGuarantor.ActiveStatusId = 2; //2-Active
            patientFreeGuarantor.Rank = 1;
            let result = await this.Save(patientFreeGuarantor);
            res = result.dataValues.Id;
        }
        return res;
    }

    public async GetPatientGuarantors(apiReq?: ApiRequest<PatientGuarantorFilters>): Promise<ApiResponse<PatientGuarantorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push({ model: this.Models.Guarantor, attributes: ['ServiceRateCategoryId'], required: false });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age',
                'GenderId', 'DOB'],
            required: false,
            include: [this.GetReference('Title')]
        });
        include.push(this.GetReference('Tpa'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientGuarantorFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientGuarantorFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PatientGuarantorFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientGuarantorFilters.Guarantor:
                        (where as any)['$or'] = [{ 'GuarantorName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case PatientGuarantorFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientGuarantorFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    case PatientGuarantorFilters.Rank:
                        where['Rank'] = param.Value;
                        break;
                    case PatientGuarantorFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        /*let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, include: include,
            attributes: apiReq.Attributes, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);*/
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientGuarantorFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || [
            'Id', ['GuarantorName', 'Text'], 'GuarantorName', 'Rank', 'GuarantorId', 'GuarantorTypeId',
            'GuarantorCustomerId', 'PolicyNo', 'PolicyName', 'GuarantorLetterNo', 'GuarantorLetterDate',
            'GuarantorApprovalNo', 'CreditLimit', 'NooFVisitFree'
        ];
        let val = await this.GetPatientGuarantors(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientGuarantorInstance, PatientGuarantorAttributes> {
        return this.Models.PatientGuarantor;
    }
}
