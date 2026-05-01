import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as MasterBo from './Index';
import * as EncBO from '../../Visit/Business/Index';
import * as PatBo from '../../Registration/Business/Index';
import * as PatEMRBo from '../../EMR/Business/Index';
import * as GeneralBO from '../../GeneralMaster/Business/Index';
import * as InPatientBO from '../../IPManagement/Business/Index';
import { WardMasterInstance, WardMasterAttributes } from '../Model/Interface/Index';
import { WardMasterFilters, WardUserMapFilters, WardRoomBedMasterFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientFilters } from '../../Registration/Common/Filters.e';
import { PatientAllergyFilters } from '../../EMR/Common/Filters.e';
import { PatientAlertFilters } from '../../GeneralMaster/Common/Filters.e';
import { BedTransferFilters } from '../../IPManagement/Common/Filters.e';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';

export class WardMasterBo extends BaseBo<WardMasterInstance, WardMasterAttributes> implements IOptionProvider {
    public async AddWardMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateWardMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetWardMasterById(req: BaseRequest): Promise<WardMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetWardMasters(apiReq?: ApiRequest<WardMasterFilters>): Promise<ApiResponse<WardMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];

        let attributes: any = {};
        attributes['include'] = [];

        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push({ model: this.Models.LocationMaster, attributes: ['LocationName'], required: false });
        include.push(this.GetReference('Block'));
        include.push(this.GetReference('WardType'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case WardMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case WardMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case WardMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case WardMasterFilters.WardName:
                        (where as any)[Op.or] = [{ WardName: { [Op.like]: (param.Value || '') + '%' } },
                        { Code: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case WardMasterFilters.WardTypeId:
                        where['WardTypeId'] = param.Value;
                        break;
                    case WardMasterFilters.WardMasterTypeId:
                        where['WardMasterTypeId'] = param.Value;
                        break;
                    case WardMasterFilters.LocationId:
                        where['LocationId'] = param.Value;
                        break;
                    case WardMasterFilters.IsDashBoard:
                        let totalBedQry = this.GetSelectQuery(this.Models.WardRoomBedMaster, {
                            attributes: [this.Dal.fn('COUNT', this.Dal.col('BedId'))],
                            where: [this.Dal.literal('`WardRoomBedMaster`.`WardId` = `WardMaster`.`WardId`'),
                            {
                                'Status': 1
                            }]
                        }, 'BedsCount');
                        attributes.include.push(totalBedQry);
                        let availableBedQry = this.GetSelectQuery(this.Models.WardRoomBedMaster, {
                            attributes: [this.Dal.fn('COUNT', this.Dal.col('BedId'))],
                            where: [this.Dal.literal('`WardRoomBedMaster`.`WardId` = `WardMaster`.`WardId`'),
                            {
                                'Status': 1,
                                'BedStatusId': 1
                            }]
                        }, 'AvailableBeds');
                        attributes.include.push(availableBedQry);
                        let occupiedBedQry = this.GetSelectQuery(this.Models.WardRoomBedMaster, {
                            attributes: [this.Dal.fn('COUNT', this.Dal.col('BedId'))],
                            where: [this.Dal.literal('`WardRoomBedMaster`.`WardId` = `WardMaster`.`WardId`'),
                            {
                                'Status': 1,
                                'BedStatusId': 2
                            }]
                        }, 'OccupiedBeds');
                        attributes.include.push(occupiedBedQry);
                        let otherBedQry = this.GetSelectQuery(this.Models.WardRoomBedMaster, {
                            attributes: [this.Dal.fn('COUNT', this.Dal.col('BedId'))],
                            where: [this.Dal.literal('`WardRoomBedMaster`.`WardId` = `WardMaster`.`WardId`'),
                            {
                                'Status': 1,
                                'BedStatusId': 3
                            }]
                        }, 'OtherBeds');
                        attributes.include.push(otherBedQry);
                        break;
                    case WardMasterFilters.IsTempWard:
                        where['IsTempWard'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetWardBeds(apiReq?: ApiRequest<WardUserMapFilters>): Promise<any> {
        let baseRequest: any = apiReq.Data;

        let WardUserBo = BoFactory.GetBo(MasterBo.WardUserMapBo, this.Request);
        let WardBedBo = BoFactory.GetBo(MasterBo.WardRoomBedMasterBo, this.Request);
        let EncounterBo = BoFactory.GetBo(EncBO.EncounterBo, this.Request);
        let PatientBo = BoFactory.GetBo(PatBo.PatientBo, this.Request);
        let PatientAllergyBo = BoFactory.GetBo(PatEMRBo.PatientAllergyBo, this.Request);
        let PatientAlertBo = BoFactory.GetBo(GeneralBO.PatientAlertBo, this.Request);
        let BedTransferBo = BoFactory.GetBo(InPatientBO.BedTransferBo, this.Request);
        let BedOccupancyHistoryBo = BoFactory.GetBo(InPatientBO.BedOccupancyHistoryBo, this.Request);

        let WardUserMapData = await WardUserBo.GetWardUserMaps(apiReq);
        let WardDetails: any = [];
        await Promise.all(WardUserMapData.Data.map((WardUserDetail): Promise<void> => {
            return (async (Ward): Promise<void> => {
                var WardData: any = await this.GetWardMasterById({ Id: Ward.WardId });
                let bedReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: WardRoomBedMasterFilters.WardId, Value: Ward.WardId },
                        { Key: WardRoomBedMasterFilters.IsActive, Value: true }
                    ]
                };
                let WardBedData = await WardBedBo.GetWardRoomBedMasters(bedReq);
                let BedData: any = [];
                await Promise.all(WardBedData.Data.map((BedDetail): Promise<void> => {
                    return (async (Bed): Promise<void> => {
                        let bed: any = Bed;
                        let Encounter: any = {};
                        let Patient: any = {};
                        if (Bed.BedStatusId === 2) {
                            let encounterWhere: any = {
                                BedId: Bed.Id,
                                EncounterTypeId: { '$in': [2, 3] },
                                AdmissionStatusId: { '$in': [2, 3, 4, 5] }
                            };
                            if (baseRequest['AdmissionDate'] !== '')
                                encounterWhere['AdmissionDate'] = baseRequest['AdmissionDate'];
                            if (baseRequest['DoctorId'] !== -1)
                                encounterWhere['DoctorId'] = baseRequest['DoctorId'];
                            if (baseRequest['AdmissionStatusId'] !== -1)
                                encounterWhere['AdmissionStatusId'] = baseRequest['AdmissionStatusId'];
                            if (baseRequest['AdmissionRequestTypeId'] !== -1)
                                encounterWhere['AdmissionRequestTypeId'] = baseRequest['AdmissionRequestTypeId'];

                            let EncounterId = await EncounterBo.GetEncounterIdByOptions({
                                where: encounterWhere,
                                attributes: ['Id']
                            });
                            if (EncounterId > 0) {
                                let EncounterApiReq = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [{ Key: EncounterFilters.Id, Value: EncounterId }]
                                };
                                let Encounters = await EncounterBo.GetEncounters(EncounterApiReq);
                                Encounter = Encounters.Data[0];
                                let PatientApiReq = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [{ Key: PatientFilters.Id, Value: Encounter.PatientId }]
                                };
                                if (baseRequest['PatientNameMRN'] !== '')
                                    PatientApiReq.Params.push({ Key: PatientFilters.Name, Value: baseRequest['PatientNameMRN'] });
                                let Patients = await PatientBo.GetPatients(PatientApiReq);
                                Patient = Patients.Data[0];

                                let PatientAllergyApiReq = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [{ Key: PatientAllergyFilters.PatientId, Value: Patient.Id }]
                                };
                                let PatientAllergies = await PatientAllergyBo.GetPatientAllergys(PatientAllergyApiReq);

                                let PatientAlertApiReq = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [{ Key: PatientAlertFilters.PatientId, Value: Patient.Id }]
                                };
                                let PatientAlerts = await PatientAlertBo.GetPatientAlerts(PatientAlertApiReq);

                                let BedOccupancyHistoryId = await BedOccupancyHistoryBo.GetDoubleOccupancyHistory({
                                    where: {
                                        BedId: Bed.Id,
                                        IsDoubleOccupancy: true,
                                        OccupancyStatusId: 1
                                    },
                                    attributes: ['Id']
                                });

                                Patient['IsAllergy'] = PatientAllergies.Data.length > 0;
                                Patient['IsNBM'] = false; //TODO : PatientNBM
                                Patient['IsBillProcess'] = Encounter.IsBillLock;
                                Patient['IsDoubleOccupancy'] = (BedOccupancyHistoryId > 0);// TODO: BedOccupany Changes
                                Patient['IsPatientAlert'] = PatientAlerts.Data.length > 0;
                            } else {
                                let BedOccupancyHistoryId = await BedOccupancyHistoryBo.GetDoubleOccupancyHistory({
                                    where: {
                                        BedId: Bed.Id,
                                        IsDoubleOccupancy: true
                                    },
                                    attributes: ['Id']
                                });
                                if (BedOccupancyHistoryId > 0) {
                                    bed['IsAttender'] = true;
                                    let OccupancyHistory = await BedOccupancyHistoryBo.GetBedOccupancyHistoryById(
                                        { Id: BedOccupancyHistoryId });
                                    let EncounterApiReq = {
                                        Id: 0,
                                        PageContext: { PageSize: 50, PageNumber: 1 },
                                        Params: [{ Key: EncounterFilters.Id, Value: OccupancyHistory.EncounterId }]
                                    };
                                    let Encounters = await EncounterBo.GetEncounters(EncounterApiReq);
                                    Encounter = Encounters.Data[0];

                                    let PatientApiReq = {
                                        Id: 0,
                                        PageContext: { PageSize: 50, PageNumber: 1 },
                                        Params: [{ Key: PatientFilters.Id, Value: OccupancyHistory.PatientId }]
                                    };
                                    let Patients = await PatientBo.GetPatients(PatientApiReq);
                                    Patient = Patients.Data[0];
                                    Patient['IsDoubleOccupancy'] = true;
                                }
                            }
                        }
                        if (Bed.BedStatusId !== 2) {
                            let bedTransferId = await BedTransferBo.GetExistBedTransferRequest({
                                where: {
                                    ToBedId: Bed.Id,
                                    RequestedStatusId: { '$in': [1, 2] }
                                },
                                attributes: ['Id']
                            });
                            if (bedTransferId > 0) {
                                let BedTransferApiReq = {
                                    Id: 0,
                                    PageContext: { PageSize: 50, PageNumber: 1 },
                                    Params: [{ Key: BedTransferFilters.Id, Value: bedTransferId }]
                                };
                                let BedTransferInfo = await BedTransferBo.GetBedTransfers(BedTransferApiReq);
                                if (BedTransferInfo.Data.length > 0) {
                                    let BedTransfer = BedTransferInfo.Data[0];
                                    bed.BedStatusId = 3;
                                    if (BedTransfer.EncounterId > 0) {
                                        let EncounterApiReq = {
                                            Id: 0,
                                            PageContext: { PageSize: 50, PageNumber: 1 },
                                            Params: [{ Key: EncounterFilters.Id, Value: BedTransfer.EncounterId }]
                                        };
                                        // let Encounters = await EncounterBo.GetEncounters(EncounterApiReq);
                                        let Encounters = await EncounterBo.GetMinEncounters(EncounterApiReq);
                                        Encounter = Encounters.Data[0];
                                        let PatientApiReq = {
                                            Id: 0,
                                            PageContext: { PageSize: 50, PageNumber: 1 },
                                            Params: [{ Key: PatientFilters.Id, Value: Encounter.PatientId }]
                                        };
                                        let Patients = await PatientBo.GetPatients(PatientApiReq);
                                        Patient = Patients.Data[0];

                                        let PatientAllergyApiReq = {
                                            Id: 0,
                                            PageContext: { PageSize: 50, PageNumber: 1 },
                                            Params: [{ Key: PatientAllergyFilters.PatientId, Value: Patient.Id }]
                                        };
                                        let PatientAllergies = await PatientAllergyBo.GetPatientAllergys(PatientAllergyApiReq);

                                        let PatientAlertApiReq = {
                                            Id: 0,
                                            PageContext: { PageSize: 50, PageNumber: 1 },
                                            Params: [{ Key: PatientAlertFilters.PatientId, Value: Patient.Id }]
                                        };
                                        let PatientAlerts = await PatientAlertBo.GetPatientAlerts(PatientAlertApiReq);

                                        Patient['IsAllergy'] = PatientAllergies.Data.length > 0;
                                        Patient['IsNBM'] = false; //TODO : PatientNBM
                                        Patient['IsBillProcess'] = Encounter.IsBillLock;
                                        Patient['IsDoubleOccupancy'] = false;// TODO: BedOccupany Changes
                                        Patient['IsPatientAlert'] = PatientAlerts.Data.length > 0;
                                    }
                                }
                            }
                        }
                        bed['Encounter'] = Encounter;
                        bed['Patient'] = Patient;
                        BedData.push(bed);
                    })(BedDetail);
                }));
                WardData['BedData'] = BedData;
                WardDetails.push(WardData);
            })(WardUserDetail);
        }));
        return { Data: WardDetails };
    }

    public async DeleteWardMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<WardMasterInstance, WardMasterAttributes> {
        return this.Models.WardMaster;
    }

    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let OTBedManagementCount = await this.Items.count({
            where: {
                'Status': 1,
                'WardMasterTypeId': { '$in': [3] },
                //'AdmissionStatusId': { '$in': [2] },
            }
        });
        return {
            'OTBedManagementCount': OTBedManagementCount,
        };
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<WardMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['WardName', 'Text'], 'DepartmentId', 'GenderId'];
        let val = await this.GetWardMasters(apiReq);
        return { [key]: val.Data };
    }

    public async GetWardInfoDashBoard(req: BaseRequest): Promise<any> {
        let wardApiReq: any = {
            Id: 0,
            Params: [{ Key: WardMasterFilters.IsDashBoard, Value: 'true' },
            { Key: WardMasterFilters.FacilityId, Value: req.Data.FacilityId }],
            PageContext: { PageSize: 1000, PageNumber: 1 }
        };
        return await this.GetWardMasters(wardApiReq);
    }
    public async PrintIPOccupanyWardReport(req: BaseRequest): Promise<any> {
        // let data = await this.GetFacilityDashboardOptions(apiReq);
        // let FacilityDashboard = data.Data;
        let FacilityId = req.Data.FacilityId;

        let WardData: any = [];
        let wardtotal: any = [];
        let WardDataInfo: Array<any> = [];

        let Wards = req;
        WardData = await this.GetWardInfoDashBoard(Wards);
        WardDataInfo = WardData.Data;
        wardtotal = { BedsCount: 0, OccupiedBeds: 0, AvailableBeds: 0, OtherBeds: 0 };


        WardDataInfo.forEach((val, idx) => {
            wardtotal.BedsCount += parseInt(val.BedsCount);
            wardtotal.OccupiedBeds += parseInt(val.OccupiedBeds);
            wardtotal.AvailableBeds += parseInt(val.AvailableBeds);
            wardtotal.OtherBeds += parseInt(val.OtherBeds);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let info = {
            WardDataInfo: WardDataInfo,
            wardtotal: wardtotal,
            Preferences: printPreferencesData,
        };
        let pdfOption: any = null;
        let key = 'ipoccupancybyward';
        pdfOption = {
            format: 'A4',
            orientation: 'landscape',
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
}
