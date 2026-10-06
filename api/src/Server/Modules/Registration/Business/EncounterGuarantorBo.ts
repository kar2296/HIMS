import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterGuarantorInstance, EncounterGuarantorAttributes } from '../Model/Interface/Index';
import { EncounterGuarantorFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../GeneralMaster/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encounterBO from '../../Visit/Business/Index';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';

export class EncounterGuarantorBo extends BaseBo<EncounterGuarantorInstance, EncounterGuarantorAttributes>  {
    public async AddEncounterGuarantor(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEncounterGuarantor(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        await this.UpdateGuarantortoEncounter(req.Data.Id, req);
        return result;
    }

    public async UpdateGuarantortoEncounter(EncGuarantorId: number, req: BaseRequest): Promise<boolean> {
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
                        ServiceRateCategoryId: guarantor.ServiceRateCategoryId,
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
                    if (!guarantor.IsIPBedTariff) {
                        IPEncounterInfo.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                    } else {
                        if (EncounterInfo.BedId) {
                            let BedTariff = await wardroombedmasterBo.GetWardRoomBedMasterById({ Id: EncounterInfo.BedId });
                            if (BedTariff.ServiceRateCategoryId)
                                IPEncounterInfo.ServiceRateCategoryId = BedTariff.ServiceRateCategoryId;
                        }
                    }
                    await EncounterBo.Update(IPEncounterInfo);
                }
            }
        }

        return true;
    }

    public async GetEncounterGuarantorById(req: BaseRequest): Promise<EncounterGuarantorAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageEncounterGuarantor(req: BaseRequest): Promise<any> {
        let res: number;
        let appointment = req.Data;

        let patientGuarantorBo = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
        let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: appointment.PatientGuarantorId });

        if (patientGuarantorData) {
            let guarantorBO = BoFactory.GetBo(bo.GuarantorBo);
            let guarantor = await guarantorBO.GetGuarantorById({ Id: patientGuarantorData.GuarantorId });

            //check if exists
            req.Data.GuarantorId = guarantor.Id;
            let encounterGuarantorId = await this.GetEncounterGuarantorIdByFilter(req);
            if (encounterGuarantorId === -1) {
                let encounterGuarantor: any = {};
                encounterGuarantor.Id = 0;
                encounterGuarantor.PatientId = appointment.PatientId;
                encounterGuarantor.EncounterId = appointment.EncounterId;
                encounterGuarantor.FacilityId = appointment.FacilityId;
                encounterGuarantor.PatientGuarantorId = appointment.PatientGuarantorId;
                encounterGuarantor.GuarantorCustomerId = patientGuarantorData.GuarantorCustomerId;
                encounterGuarantor.PolicyNo = patientGuarantorData.PolicyNo;
                encounterGuarantor.PolicyName = patientGuarantorData.PolicyName;
                encounterGuarantor.ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                encounterGuarantor.GuarantorId = guarantor.Id;
                encounterGuarantor.GuarantorName = guarantor.GuarantorName;
                encounterGuarantor.GuarantorTypeId = guarantor.GuarantorTypeId;
                encounterGuarantor.ActiveStatusId = 2;
                encounterGuarantor.Rank = 1;

                //update Rank for other encounter guarantors
                let previousGuarantor: any = { Id: 0, Rank: 999 };
                await this.Models.EncounterGuarantor.update(previousGuarantor, {
                    fields: ['Rank'],
                    where: {
                        PatientId: appointment.PatientId,
                        EncounterId: appointment.EncounterId,
                        Rank: 1
                    }
                });
                if (req.Data['IsIPReq']) {
                    let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                    let EncounterInfo: any = {
                        Data: {
                            Id: appointment.EncounterId,
                            GuarantorId: patientGuarantorData.Id,
                            GuarantorTypeId: patientGuarantorData.GuarantorTypeId
                        }
                    };
                    await EncounterBo.UpdateEncounter(EncounterInfo);
                }
                let result = await this.Save(encounterGuarantor);
                res = result.dataValues.Id;
            } else if (encounterGuarantorId > 0) {
                let encounterGuarantor: any = {
                    Data: {
                        Id: encounterGuarantorId,
                        PatientId: appointment.PatientId,
                        EncounterId: appointment.EncounterId,
                        FacilityId: appointment.FacilityId,
                        PatientGuarantorId: appointment.PatientGuarantorId,
                        GuarantorCustomerId: patientGuarantorData.GuarantorCustomerId,
                        PolicyNo: patientGuarantorData.PolicyNo,
                        PolicyName: patientGuarantorData.PolicyName,
                        ServiceRateCategoryId: guarantor.ServiceRateCategoryId,
                        GuarantorId: guarantor.Id,
                        GuarantorName: guarantor.GuarantorName,
                        GuarantorTypeId: guarantor.GuarantorTypeId,
                        ActiveStatusId: 2,
                        Rank: 1,
                    }
                };

                let res = await this.UpdateEncounterGuarantor(encounterGuarantor);
                return res;
                // let previousGuarantor: any = { Id: encounterGuarantor.Id, Rank: 999 };
                // await this.Models.EncounterGuarantor.update(previousGuarantor, {
                //     fields: ['Rank'],
                //     where: {
                //         Id: encounterGuarantorId,
                //         PatientId: appointment.PatientId,
                //         EncounterId: appointment.EncounterId,
                //         Rank: 1
                //     }
                // });
            } else if (req.Data['IsIPReq']) {
                let EncounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
                let EncounterInfo: any = {
                    Data: {
                        Id: appointment.EncounterId,
                        GuarantorId: patientGuarantorData.Id,
                        GuarantorTypeId: patientGuarantorData.GuarantorTypeId
                    }
                };
                await EncounterBo.UpdateEncounter(EncounterInfo);
            }
        }

        return res;
    }

    public async GetEncounterGuarantorIdByFilter(req: BaseRequest): Promise<number> {
        let encounterGuarantorId: number = -1;
        let filterInfo = req.Data;
        let encounterGuarantorInstance: any = await this.Find({
            where: {
                PatientId: filterInfo.PatientId,
                EncounterId: filterInfo.EncounterId,
                GuarantorId: filterInfo.GuarantorId
            },
            attributes: ['Id']
        });
        if (encounterGuarantorInstance) {
            let encounterGuarantor = this.GetAttribute(encounterGuarantorInstance);
            encounterGuarantorId = encounterGuarantor.Id;
        }
        return encounterGuarantorId;
    }


    public async GetEncounterGuarantors(apiReq?: ApiRequest<EncounterGuarantorFilters>):
        Promise<ApiResponse<EncounterGuarantorAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('Tpa'));
        include.push({ model: this.Models.Encounter, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterGuarantorFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.Guarantor:
                        where['$or'] = [{ 'GuarantorName': { '$like': (param.Value || '') + '%' } } as any];
                        break;
                    case EncounterGuarantorFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.Rank:
                        where['Rank'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterGuarantorFilters.GuarantorId:
                        where['GuarantorId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEncounterGuarantor(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<EncounterGuarantorInstance, EncounterGuarantorAttributes> {
        return this.Models.EncounterGuarantor;
    }

}
