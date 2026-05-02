import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BedOccupancyHistoryInstance, BedOccupancyHistoryAttributes } from '../Model/Interface/Index';
import { BedOccupancyHistoryFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as encounterBO from '../../Visit/Business/Index';
import * as billBO from '../../Billing/Business/Index';
import { PatientBillDetailsFilters } from '../../Billing/Common/Filters.e';
import * as clinicalMasterBo from '../../ClinicalMaster/Business/Index';
import * as moment from 'moment';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import * as _ from 'lodash';

export class BedOccupancyHistoryBo extends BaseBo<BedOccupancyHistoryInstance, BedOccupancyHistoryAttributes> {
    public async AddBedOccupancyHistory(req: BaseRequest): Promise<number> {
        if (!req.Data.TransactionIdentifier && req.Data.OccupancyStatusId === 3)
            req.Data.TransactionIdentifier = await Sequence.Next(SequenceKeys.BedOccupancyTranscationId);

        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateBedOccupancyHistory(req: BaseRequest): Promise<boolean> {
        if (!req.Data.TransactionIdentifier && req.Data.OccupancyStatusId === 3)
            req.Data.TransactionIdentifier = await Sequence.Next(SequenceKeys.BedOccupancyTranscationId);

        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageBedOccupancyUpDownTariff(req: BaseRequest): Promise<any> {
        let result = await this.Update(req.Data);
        let billdetBO = BoFactory.GetBo(billBO.PatientBillDetailsBo, this.Request);
        let pbillBO = BoFactory.GetBo(billBO.PatientBillsBo, this.Request);
        let serviceItemTariffBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemTariffDetailBo, this.Request);
        let serviceItemBo = BoFactory.GetBo(clinicalMasterBo.ServiceItemBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: PatientBillDetailsFilters.FromDate, Value: req.Data.BillingStartDate },
                { Key: PatientBillDetailsFilters.ToDate, Value: req.Data.BillingEndDate },
                { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
                { Key: PatientBillDetailsFilters.IsPharmacySale, Value: false },
                { Key: PatientBillDetailsFilters.IsPharmacyReturn, Value: false }
            ]
        };
        let PatBilldetails = await billdetBO.GetPatientBillDetails(apiReq);
        if (PatBilldetails.Data.length > 0) {
            for (let pdx in PatBilldetails.Data) {
                let billDetailData = PatBilldetails.Data[pdx];
                let ServiceInfo = await serviceItemBo.GetServiceItemById({ Id: billDetailData.ServiceId });
                let serviceTariffApiReq = {
                    Id: 0,
                    PageContext: { PageSize: 50, PageNumber: 1 },
                    Params: [
                        { Key: 2, Value: ServiceInfo.Id },
                        { Key: 3, Value: req.Data.ServiceRateCategoryId }
                    ]
                };
                let serviceItemInfo = await serviceItemTariffBo.GetServiceItemTariffDetails(serviceTariffApiReq);
                let tariffrateupdate = serviceItemInfo.Data[0];
                let totBillamt: any = 0;
                if (tariffrateupdate) {
                    let billdetUpdate: any = {
                        Id: billDetailData.Id,
                        Rate: tariffrateupdate.Rate,
                        Amount: tariffrateupdate.Rate,
                        GrossAmount: Number(tariffrateupdate.Rate) * Number(billDetailData.Quantity),
                        NetAmount: Number(tariffrateupdate.Rate) * Number(billDetailData.Quantity) -
                            (billDetailData.DiscountAmount || 0),
                        ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                    };
                    totBillamt = totBillamt + tariffrateupdate.Rate;
                    await billdetBO.Update(billdetUpdate);
                    let BillInfo = await pbillBO.GetPatientBillsById({ Id: billDetailData.PatientBillId });
                    let billUpdate: any = {
                        Data: {
                            Id: BillInfo.Id,
                            BillAmount: totBillamt,
                            ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                        }

                    };
                    await pbillBO.UpdatePatientBillsFromBedOccupancy(billUpdate);
                }
            }
        }
        return result;
    }

    public async GetBedOccupancyHistoryById(req: BaseRequest): Promise<BedOccupancyHistoryAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetBedOccupancyHistorys(apiReq?: ApiRequest<BedOccupancyHistoryFilters>):
        Promise<ApiResponse<BedOccupancyHistoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let encounterWhere: WhereOptions<any> = {};
        let isReqPatientSearch, isReqEncSearch: boolean = false;
        // include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.ServiceRateCategory, attributes: ['ServiceRateCategory'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Created', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case BedOccupancyHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.OccupancyStatus:
                        where['OccupancyStatusId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.IsPrimaryBed:
                        where['IsPrimaryBed'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.AdmissionStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            encounterWhere['AdmissionStatusId'] = { '$in': paramArr };
                            // encounterWhere['IsLatest'] = true;
                        }
                        // encounterWhere['AdmissionStatusId'] = param.Value;
                        isReqEncSearch = true;
                        break;
                    case BedOccupancyHistoryFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case BedOccupancyHistoryFilters.GuarantorId:
                        encounterWhere['GuarantorId'] = param.Value;
                        isReqEncSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push({
            model: this.Models.Encounter,
            required: isReqEncSearch,
            where: encounterWhere,
            include: [
                this.GetReference('AdmissionStatus'),
                { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false },
                { model: this.Models.Department, attributes: ['DepartmentName'], required: false }
            ],
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteBedOccupancyHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ReOccupyBed(req: BaseRequest): Promise<Boolean> {
        let bedoccupancy = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.BedId },
                { Key: BedOccupancyHistoryFilters.IsPrimaryBed, Value: true }
            ]
        };
        let data = await this.GetBedOccupancyHistorys(apiReq);
        bedoccupancy = data.Data || [];
        if (bedoccupancy.length > 0) {
            await this.ReAssignBed(req.Data.EncounterId, bedoccupancy);
        }

        return true;
    }

    public async OccupancyCount(req: BaseRequest): Promise<any> {
        let WardGroup: { [id: number]: any[] } = {};
        let WardGroupJoin: any = {
            model: this.Models.WardMaster,
            required: true,
        };
        let occupancyInstance: any = await this.FindAll({
            attributes: ['OccupancyStatusId', 'WardId'],
            where: {
                AdmissionDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
                OccupancyStatusId: { '$eq': 1 }
            },
            include: [WardGroupJoin]
        });
        if (occupancyInstance) {
            let groupbills = _.groupBy(occupancyInstance, 'WardId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let OccupancyCount: number = 0;
                let WardId: number = 0;
                let WardName: string = '';
                OccupancyCount = groupedBills.length;
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    WardId = bills.WardId;
                    WardName = bills.WardMaster.WardName;
                    WardGroup[WardId] = WardGroup[WardId] || [];
                }
                let info = {
                    'WardId': WardId,
                    'WardName': WardName,
                    'OccupancyCount': OccupancyCount
                };
                WardGroup[WardId].push(info);
            }
        }


        return WardGroup;
    }

    public async ReAssignBed(EncounterId: number, details: BedOccupancyHistoryAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.DischargeDate = null;
                detail.OccupancyStatusId = 1;
                detail.AdmitStatusId = 2;
                detail.BillingEndDate = null;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async EncReOccupyBed(req: BaseRequest): Promise<Boolean> {
        let bedoccupancy = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.Id },
                { Key: BedOccupancyHistoryFilters.BedId, Value: req.Data.BedId },
                { Key: BedOccupancyHistoryFilters.IsPrimaryBed, Value: true }
            ]
        };
        let data = await this.GetBedOccupancyHistorys(apiReq);
        bedoccupancy = data.Data || [];
        if (bedoccupancy.length > 0) {
            await this.EncReAssignBed(req.Data.Id, bedoccupancy);
        }

        return true;
    }

    public async EncReAssignBed(EncounterId: number, details: BedOccupancyHistoryAttributes[]):
        Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.DischargeDate = null;
                detail.OccupancyStatusId = 2;
                detail.AdmitStatusId = 7;
                detail.BillingEndDate = null;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageBedTransferOccupancyHistory(req: BaseRequest): Promise<boolean> {
        await this.ManageBedOccupancyBillInfo(req);
        return true;
    }

    public async ManageBedOccupancyHistory(req: BaseRequest): Promise<boolean> {

        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
        let BedOccupancyInfo: any = {
            Data: {
                EncounterId: req.Data.EncounterId,
                PatientId: req.Data.PatientId,
                LocationId: req.Data.LocationId,
                WardId: req.Data.WardId,
                DoctorId: req.Data.DoctorId,
                DepartmentId: req.Data.DepartmentId,
                FacilityId: req.Data.FacilityId,
                RoomId: req.Data.RoomId,
                BedId: req.Data.BedId,
                AdmissionDate: req.Data.AdmissionDate,
                DischargeDate: req.Data.DischargeDate,
                OccupancyStatusId: req.Data.OccupancyStatusId,
                ServiceRateCategoryId: req.Data.ServiceRateCategoryId,
                AdmitStatusId: req.Data.AdmitStatusId,
                IsPrimaryBed: req.Data.IsPrimaryBed,
                BillingStartDate: req.Data.BillingStartDate,
                BillingEndDate: !req.Data.BillingEndDate ? null : req.Data.BillingEndDate,
                PatientBillId: req.Data.PatientBillId,
                Id: !req.Data.Id ? 0 : req.Data.Id,
                IsDoubleOccupancy: req.Data.IsDoubleOccupancy
            }
        };
        if (req.Data.OccupancyStatusId === 1) {
            let bedRequest: any = {
                Data: {
                    Id: req.Data.BedId,
                    BedStatusId: 2
                }
            };
            await BedBo.UpdateBedMaster(bedRequest);
        } else {
            let bedRequest: any = {
                Data: {
                    Id: req.Data.BedId,
                    BedStatusId: 1
                }
            };
            await BedBo.UpdateBedMaster(bedRequest);
        }
        if (BedOccupancyInfo.Data.Id > 0) {
            await this.UpdateBedOccupancyHistory(BedOccupancyInfo);
        } else {
            let OccupancyId = await this.AddBedOccupancyHistory(BedOccupancyInfo);
            if (req.Data.PatientBillId && req.Data.PatientBillId > 0) {
                let patientbillBO = BoFactory.GetBo(billBO.PatientBillsBo, this.Request);
                let BillInfo = await patientbillBO.GetPatientBillsById({ Id: req.Data.PatientBillId });
                if (!BillInfo.TransferEncounterId || BillInfo.TransferEncounterId === 0) {
                    let billUpdate: any = {
                        Data: {
                            Id: req.Data.PatientBillId,
                            TransferEncounterId: OccupancyId
                        }
                    };
                    await patientbillBO.UpdatePatientBillsFromBedOccupancy(billUpdate);
                }
            }
        }
        return true;
    }

    public GetModel(): SStatic.Model<BedOccupancyHistoryInstance, BedOccupancyHistoryAttributes> {
        return this.Models.BedOccupancyHistory;
    }

    public async GetDoubleOccupancyHistory(foption: SStatic.FindOptions<any>): Promise<number> {
        let HistoryId: number = -1;
        let OccupancyHistoryInstance: any = await this.Find(foption);
        if (OccupancyHistoryInstance) {
            let occupancyHistory = this.GetAttribute(OccupancyHistoryInstance);
            HistoryId = occupancyHistory.Id;
        } return HistoryId;
    }
    public async PrintBedOccupancyHistorys(apiReq?: ApiRequest<BedOccupancyHistoryFilters>): Promise<any> {
        let data = await this.GetBedOccupancyHistorys(apiReq);
        let BedDetails = data.Data;
        let WardName = apiReq.Data.WardName;
        let GuarantorName = apiReq.Data.GuarantorName;
        let AdmissionStatus = apiReq.Data.AdmissionStatus;
        let DoctorName = apiReq.Data.DoctorName;
        let BedDetailsData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(BedDetailsData.FacilityId);
        let info = {
            BedDetails: BedDetails,
            Preferences: printPreferencesData,
            WardName: WardName,
            GuarantorName: GuarantorName,
            AdmissionStatus: AdmissionStatus,
            DoctorName: DoctorName
        };
        let pdfOption: any = null;
        let key = 'bedoccupancyhistory';
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
    public async DischargeAttenderBed(req: BaseRequest): Promise<Boolean> {
        let EncounterBo = BoFactory.GetBo(encounterBO.EncounterBo, this.Request);
        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
        let Roombo = BoFactory.GetBo(generalMasterBO.WardRoomMasterBo, this.Request);

        let iRoomRentInHourly = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.roomrentinhourly) {
            try {
                iRoomRentInHourly = parseInt(facilityPreferencesData.roomrentinhourly);
            } catch (ex) { iRoomRentInHourly = 0; }
        }

        let EncounterInfo = await EncounterBo.GetEncounterById({ Id: req.Data.EncounterId });
        let IsInsuranceTraiff: boolean = false;
        let ServiceRateCategoryId: number = 0;
        ServiceRateCategoryId = EncounterInfo.ServiceRateCategoryId;
        if (EncounterInfo.GuarantorId > 0) {
            // let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
            // let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: EncounterInfo.GuarantorId });
            // if (patientGuarantorData) {
            let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
            let GuarantorId_ = 1000;
            await guarantorBO.GetCurrentGuarantorId().then(function (result) {
                GuarantorId_ = result;
            });
            let guarantor = await guarantorBO.GetGuarantorById({ Id: EncounterInfo.GuarantorId });
            if (guarantor.Id !== GuarantorId_) {
                IsInsuranceTraiff = true;
                ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
            }
            // }
        }
        let OccupancyApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
            { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 },
            { Key: BedOccupancyHistoryFilters.IsPrimaryBed, Value: 'false' }]
        };
        let OccupancyHistoryDetails = await this.GetBedOccupancyHistorys(OccupancyApiReq);
        if (OccupancyHistoryDetails.Data.length > 0) {
            let OccupancyHistory = OccupancyHistoryDetails.Data[0];
            let StartDate: any = OccupancyHistory.BillingStartDate;
            let EndDate: any = OccupancyHistory.BillingEndDate === null ? new Date() : OccupancyHistory.BillingEndDate;

            OccupancyHistory.BillingEndDate = EndDate;
            OccupancyHistory.DischargeDate = new Date();//Date of Patient Transfered or Discharged
            OccupancyHistory.OccupancyStatusId = 2; // Patient transferred or discharged status
            OccupancyHistory.IsPrimaryBed = false; // Update the Primary as Transferred bed

            let OccupancyData: any = { Data: OccupancyHistory };
            await this.ManageBedOccupancyHistory(OccupancyData);//Update the Bed Occupancy History
            let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });

            let RoomInfo = await Roombo.GetWardRoomMasterById({ Id: OccupancyHistory.RoomId });
            let iRoomRentGraceMins = RoomInfo.GracePeriod;
            if (!iRoomRentGraceMins) iRoomRentGraceMins = 0;

            if (iRoomRentGraceMins > 0) { // add grace minutes...
                StartDate = moment(StartDate).add(iRoomRentGraceMins, 'minutes');
            }

            ////let days = moment(EndDate).diff(moment(StartDate), 'days');
            let days = 0;
            try {
                let hours = moment(EndDate).diff(moment(StartDate), 'hours');
                if (hours >= 0 && hours < 3
                    && moment(EndDate).isSameOrAfter(moment(StartDate))) {
                    // days = (iRoomRentInHourly > 0) ? 0.5 : 1;
                    days = (iRoomRentInHourly > 0) ? 1 : 1; //done on 6/5/24
                } else if (hours >= 3) {
                    days = hours / 24;
                    days = parseFloat(days.toFixed(1));
                    if (iRoomRentInHourly > 0) {
                        let vnoofdays = days.toFixed(1);
                        let vaynoofdays = vnoofdays.split('.');
                        if (vaynoofdays.length > 0) {
                            if (vaynoofdays[0]) {
                                days = parseInt(vaynoofdays[0]);
                            }
                        }
                        if (vaynoofdays.length > 1) {
                            if (vaynoofdays[1]) {
                                if (parseInt(vaynoofdays[1]) >= 5) {
                                    days++;
                                } else {
                                    // days += 0.5;//done on 6/5/24
                                    days += 1;
                                }
                            }
                        }
                    }
                    days = (iRoomRentInHourly > 0) ? days : Math.ceil(days); // No of days calculation check....
                }
            } catch (ex) { console.log('Error old room transfer charge calculation  : ' + ex); }

            if (days > 0) {
                let BillReq: any = {
                    Data: {
                        NoofDays: days > 0 ? days : 1,
                        RoomId: OccupancyHistory.RoomId,
                        DoctorId: req.Data.DoctorId,
                        DepartmentId: req.Data.DepartmentId,
                        PatientId: req.Data.PatientId,
                        FacilityId: OccupancyHistory.FacilityId,
                        GuarantorId: EncounterInfo.GuarantorId,
                        //GuarantorTypeId: EncounterInfo.GuarantorTypeId,
                        ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId,
                        EncounterId: req.Data.EncounterId,
                        IsPrimaryBed: OccupancyHistory.IsPrimaryBed,
                        IsDoubleOccupancy: req.Data.IsDoubleOccupancy
                    }
                };
                if (!EncounterInfo.IsBillLock)
                    await EncounterBo.ManageEncounterBillInfo(BillReq);
            }
            let PrimaryOccupancyApiReq = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
                { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 },
                { Key: BedOccupancyHistoryFilters.IsPrimaryBed, Value: true }]
            };
            let PrimaryOccupancyHistoryDetails = await this.GetBedOccupancyHistorys(PrimaryOccupancyApiReq);
            if (PrimaryOccupancyHistoryDetails.Data.length > 0) {
                let OccupancyHistory = PrimaryOccupancyHistoryDetails.Data[0];
                OccupancyHistory.IsDoubleOccupancy = false;
                let OccupancyData: any = { Data: OccupancyHistory };
                await this.ManageBedOccupancyHistory(OccupancyData);//Update the Bed Occupancy History
            }

            return true;
        } else {
            return false;
        }
    }

    // private async ManageBedStatus(req: BaseRequest): Promise<boolean> {
    //     let bedTransfer: any = req.Data;

    //     let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
    //     if (bedTransfer.FromBedId && bedTransfer.FromBedId > 0) {
    //         if (!bedTransfer.IsDoubleOccupancy) {
    //             let bedRequest: any = {
    //                 Data: {
    //                     Id: bedTransfer.FromBedId,
    //                     BedStatusId: 1 // TODO : Update status as House Keeping and raise request for House Keeping
    //                 }
    //             };
    //             await BedBo.UpdateBedMaster(bedRequest);
    //         }
    //     }

    //     if (bedTransfer.ToBedId && bedTransfer.ToBedId > 0) {
    //         let bedRequest: any = {
    //             Data: {
    //                 Id: bedTransfer.ToBedId,
    //                 BedStatusId: 2
    //             }
    //         };
    //         await BedBo.UpdateBedMaster(bedRequest);
    //     }

    //     return true;
    // }

    private async ManageBedOccupancyBillInfo(req: BaseRequest): Promise<boolean> {
        let EncounterBo = BoFactory.GetBo(encounterBO.EncounterBo, this.Request);
        let BedBo = BoFactory.GetBo(generalMasterBO.WardRoomBedMasterBo, this.Request);
        let Roombo = BoFactory.GetBo(generalMasterBO.WardRoomMasterBo, this.Request);

        let iRoomRentInHourly = 0;
        let facilityprebo = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let facilityPreferencesData =
            await facilityprebo.GetPrintPreferences('billing', null, this.Session.FacilityId);
        if (facilityPreferencesData && facilityPreferencesData.roomrentinhourly) {
            try {
                iRoomRentInHourly = parseInt(facilityPreferencesData.roomrentinhourly);
            } catch (ex) { iRoomRentInHourly = 0; }
        }

        let EncounterInfo = await EncounterBo.GetEncounterById({ Id: req.Data.EncounterId });
        let ServiceRateCategoryId: number = 0;
        ServiceRateCategoryId = EncounterInfo.ServiceRateCategoryId;
        let IsInsuranceTraiff: boolean = false;
        let IsAlreadyDouble: boolean = false;
        if (EncounterInfo.GuarantorId > 0) {
            // let patientGuarantorBo = BoFactory.GetBo(regBo.PatientGuarantorBo, this.Request);
            // let patientGuarantorData = await patientGuarantorBo.GetPatientGuarantorById({ Id: EncounterInfo.GuarantorId });
            // if (patientGuarantorData) {
            let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
            let GuarantorId_ = 1000;
            GuarantorId_ = await guarantorBO.GetCurrentGuarantorId();
            let guarantor = await guarantorBO.GetGuarantorById({ Id: EncounterInfo.GuarantorId });
            if (guarantor.Id !== GuarantorId_) {
                if (!guarantor.IsIPBedTariff) {
                    IsInsuranceTraiff = true;
                    ServiceRateCategoryId = guarantor.ServiceRateCategoryId;
                }
                // }
            }
        }

        let OccupancyApiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: BedOccupancyHistoryFilters.EncounterId, Value: req.Data.EncounterId },
            { Key: BedOccupancyHistoryFilters.OccupancyStatus, Value: 1 }]
        };

        let OccupancyHistoryDetails = await this.GetBedOccupancyHistorys(OccupancyApiReq);
        let ispatientTransfer = false;
        if (OccupancyHistoryDetails.Data.length > 0) {
            ispatientTransfer = true;
        }
        let OldPatientBillId = -1;
        let OldServiceRateCategoryId = -1;
        let oldFacilityId = -1;
        for (let ioccuhis = 0, lenoccuhis = OccupancyHistoryDetails.Data.length;
            ioccuhis < lenoccuhis; ioccuhis++) {
            let OccupancyHistory = OccupancyHistoryDetails.Data[ioccuhis];
            let StartDate: any = OccupancyHistory.BillingStartDate;
            let EndDate: any = OccupancyHistory.BillingEndDate === null ? new Date() : OccupancyHistory.BillingEndDate;

            OccupancyHistory.BillingEndDate = EndDate;//Date of Patient Transfered or Discharged
            if (OccupancyHistory.IsPrimaryBed) {
                OccupancyHistory.DischargeDate = new Date();//Date of Patient Transfered or Discharged
                OccupancyHistory.OccupancyStatusId = 2; // Patient transferred or discharged status
                OccupancyHistory.IsPrimaryBed = false; // Update the Primary as Transferred bed
            }
            if (req.Data.IsDoubleOccupancy && OccupancyHistory.IsDoubleOccupancy) {
                IsAlreadyDouble = true;
                if (OccupancyHistory.IsPrimaryBed) {
                    OccupancyHistory.DischargeDate = new Date();//Date of Patient Transfered or Discharged
                    OccupancyHistory.OccupancyStatusId = 2; // Patient transferred or discharged status
                    OccupancyHistory.IsPrimaryBed = false; // Update the Primary as Transferred bed
                }
            }
            if (!req.Data.IsDoubleOccupancy) {
                OccupancyHistory.DischargeDate = new Date();//Date of Patient Transfered or Discharged
                OccupancyHistory.OccupancyStatusId = 2; // Patient transferred or discharged status
                OccupancyHistory.IsPrimaryBed = false; // Update the Primary as Transferred bed
            }

            let PatientBillId = -1;
            let BedInfo = await BedBo.GetWardRoomBedMasterById({ Id: OccupancyHistory.BedId });
            let RoomInfo = await Roombo.GetWardRoomMasterById({ Id: OccupancyHistory.RoomId });
            let iRoomRentGraceMins = RoomInfo.GracePeriod;
            if (!iRoomRentGraceMins) iRoomRentGraceMins = 0;

            if (iRoomRentGraceMins > 0) { // add grace minutes...
                StartDate = moment(StartDate).add(iRoomRentGraceMins, 'minutes');
            }


            /////let days = moment(EndDate).diff(moment(StartDate), 'days');
            console.log('***********Start Date**********');
            console.log(moment(StartDate));
            console.log(moment(EndDate));
            console.log('***********End Date**********');
            let days = 0;
            try {
                let hours = moment(EndDate).diff(moment(StartDate), 'hours');
                if (hours >= 0 && hours < 3
                    && moment(EndDate).isSameOrAfter(moment(StartDate))) {
                    // days = (iRoomRentInHourly > 0) ? 0.5 : 1;//done on 6/5/24
                    days = (iRoomRentInHourly > 0) ? 1 : 1;
                } else if (hours >= 3) {
                    days = hours / 24;
                    days = parseFloat(days.toFixed(1));
                    if (iRoomRentInHourly > 0) {
                        let vnoofdays = days.toFixed(1);
                        let vaynoofdays = vnoofdays.split('.');
                        if (vaynoofdays.length > 0) {
                            if (vaynoofdays[0]) {
                                days = parseInt(vaynoofdays[0]);
                            }
                        }
                        if (vaynoofdays.length > 1) {
                            if (vaynoofdays[1]) {
                                if (parseInt(vaynoofdays[1]) >= 5) {
                                    days++;
                                } else {
                                    // days += 0.5;
                                    days += 1;//done on 20/4/24
                                }
                            }
                        }
                    }
                    days = (iRoomRentInHourly > 0) ? days : Math.ceil(days); // No of days calculation check....
                }
            } catch (ex) { console.log('Error old room transfer charge calculation  : ' + ex); }

            oldFacilityId = OccupancyHistory.FacilityId;

            if (OccupancyHistory.PatientBillId)
                OldPatientBillId = OccupancyHistory.PatientBillId;

            OldServiceRateCategoryId = IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId;
            if (days > 0) {
                let BillReq: any = {
                    Data: {
                        NoofDays: days > 0 ? days : 1,
                        PatientBillId: OldPatientBillId,
                        RoomId: OccupancyHistory.RoomId,
                        DoctorId: req.Data.DoctorId,
                        DepartmentId: req.Data.DepartmentId,
                        PatientId: req.Data.PatientId,
                        FacilityId: OccupancyHistory.FacilityId,
                        GuarantorId: EncounterInfo.GuarantorId,
                        ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : BedInfo.ServiceRateCategoryId,
                        EncounterId: req.Data.EncounterId,
                        IsPrimaryBed: OccupancyHistory.IsPrimaryBed,
                        IsDoubleOccupancy: req.Data.IsDoubleOccupancy,
                        IsPatientTransfer: ispatientTransfer
                    }
                };
                if (!EncounterInfo.IsBillLock)
                    PatientBillId = await EncounterBo.ManageBedChargesBillInfo(BillReq);
            }
            if (!OccupancyHistory.PatientBillId ||
                OccupancyHistory.PatientBillId < 0) {
                OccupancyHistory.PatientBillId = PatientBillId;
            }
            let OccupancyData: any = { Data: OccupancyHistory };
            await this.ManageBedOccupancyHistory(OccupancyData);//Update the Bed Occupancy History

        }

        let iToRoomRentGraceMins = 0;
        if (req.Data.ToRoomId > 0) {
            let ToRoomInfo = await Roombo.GetWardRoomMasterById({ Id: req.Data.ToRoomId });
            iToRoomRentGraceMins = ToRoomInfo.GracePeriod;
        }
        let NewServiceRateCategoryId = IsInsuranceTraiff ? ServiceRateCategoryId : req.Data.ToServiceRateCategoryId;
        let NewPatientBillId = -1;
        if (NewServiceRateCategoryId !== OldServiceRateCategoryId) {
            let BillReq: any = {
                Data: {
                    NoofDays: (iToRoomRentGraceMins > 0) ? 0 : (iRoomRentInHourly > 0) ? 0.5 : 1,
                    RoomId: req.Data.ToRoomId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: oldFacilityId,
                    GuarantorId: EncounterInfo.GuarantorId,
                    ServiceRateCategoryId: NewServiceRateCategoryId,
                    OldServiceRateCategoryId: NewServiceRateCategoryId,
                    EncounterId: req.Data.EncounterId,
                    IsPrimaryBed: true,
                    IsDoubleOccupancy: req.Data.IsDoubleOccupancy,
                    IsPatientTransfer: ispatientTransfer,
                    fromBedTransfer: (req.Data.fromBedTransfer)? req.Data.fromBedTransfer: 0
                }
            };
            if (!EncounterInfo.IsBillLock)
                NewPatientBillId = await EncounterBo.ManageBedChargesBillInfo(BillReq);
        } else {
            // NewPatientBillId = OldPatientBillId;//commented by jothi on 20/4/24
            let BillReq: any = { //included on 20/4/24
                Data: {
                    NoofDays: (iToRoomRentGraceMins > 0) ? 0 : (iRoomRentInHourly > 0) ? 0.5 : 1,
                    RoomId: req.Data.ToRoomId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: oldFacilityId,
                    GuarantorId: EncounterInfo.GuarantorId,
                    ServiceRateCategoryId: NewServiceRateCategoryId,
                    OldServiceRateCategoryId: NewServiceRateCategoryId,
                    EncounterId: req.Data.EncounterId,
                    IsPrimaryBed: true,
                    IsDoubleOccupancy: req.Data.IsDoubleOccupancy,
                    IsPatientTransfer: ispatientTransfer,
                    fromBedTransfer: (req.Data.fromBedTransfer)? req.Data.fromBedTransfer: 0
                }
            };
            if (!EncounterInfo.IsBillLock)
                NewPatientBillId = await EncounterBo.ManageBedChargesBillInfo(BillReq);
        }

        //New Occupancy Histroy
        let toBedOccupancyHistory: any = {
            Data: {
                PatientBillId: NewPatientBillId,
                EncounterId: EncounterInfo.Id,
                PatientId: req.Data.PatientId,
                LocationId: req.Data.ToLocationId,
                WardId: req.Data.ToWardId,
                DoctorId: req.Data.DoctorId,
                DepartmentId: req.Data.DepartmentId,
                RoomId: req.Data.ToRoomId,
                BedId: req.Data.ToBedId,
                FacilityId: req.Data.ToFacilityId,
                AdmissionDate: new Date(),
                ServiceRateCategoryId: NewServiceRateCategoryId,
                AdmitStatusId: EncounterInfo.AdmissionStatusId,
                OccupancyStatusId: 1,
                IsPrimaryBed: true,
                IsDoubleOccupancy: req.Data.IsDoubleOccupancy,
                //////BillingStartDate: !req.Data.TransferDate ? new Date() : req.Data.TransferDate,
                BillingStartDate: new Date(),
            }
        };
        await this.ManageBedOccupancyHistory(toBedOccupancyHistory); // Add transferred bed in Bed Occupancy history


        //Add Double Occupancy Bed Info
        if (req.Data.IsDoubleOccupancy && !IsAlreadyDouble) {
            let DoubleOccBedInfo = await BedBo.GetWardRoomBedMasterById({ Id: req.Data.FromBedId });
            let BedDoubleOccupancyHistory: any = {
                Data: {
                    EncounterId: EncounterInfo.Id,
                    PatientId: req.Data.PatientId,
                    LocationId: req.Data.FromLocationId,
                    WardId: req.Data.FromWardId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    RoomId: req.Data.FromRoomId,
                    BedId: req.Data.FromBedId,
                    AdmissionDate: new Date(),
                    ServiceRateCategoryId: ServiceRateCategoryId,
                    AdmitStatusId: EncounterInfo.AdmissionStatusId,
                    OccupancyStatusId: 1,
                    IsPrimaryBed: false,
                    IsDoubleOccupancy: req.Data.IsDoubleOccupancy,
                    BillingStartDate: new Date(),
                }
            };

            let iFrmRoomRentGraceMins = 0;
            if (req.Data.FromRoomId > 0) {
                let FrmRoomInfo = await Roombo.GetWardRoomMasterById({ Id: req.Data.FromRoomId });
                iFrmRoomRentGraceMins = FrmRoomInfo.GracePeriod;
            }

            let DbPatientBillId = -1;
            let DoubleOccBillReq: any = {
                Data: {
                    NoofDays: (iFrmRoomRentGraceMins > 0) ? 0 : (iRoomRentInHourly > 0) ? 0.5 : 1,
                    RoomId: req.Data.FromRoomId,
                    DoctorId: req.Data.DoctorId,
                    DepartmentId: req.Data.DepartmentId,
                    PatientId: req.Data.PatientId,
                    FacilityId: DoubleOccBedInfo.FacilityId,
                    GuarantorId: EncounterInfo.GuarantorId,
                    ServiceRateCategoryId: IsInsuranceTraiff ? ServiceRateCategoryId : DoubleOccBedInfo.ServiceRateCategoryId,
                    EncounterId: req.Data.EncounterId,
                    IsPrimaryBed: false,
                    IsDoubleOccupancy: true
                }
            };
            if (!EncounterInfo.IsBillLock)
                DbPatientBillId = await EncounterBo.ManageEncounterBillInfo(DoubleOccBillReq);
            if (!BedDoubleOccupancyHistory.Data.PatientBillId ||
                BedDoubleOccupancyHistory.Data.PatientBillId < 0) {
                BedDoubleOccupancyHistory.Data.PatientBillId = DbPatientBillId;
            }
            await this.ManageBedOccupancyHistory(BedDoubleOccupancyHistory); // Add transferred bed in Bed Occupancy history

        }

        //Update Latest Bed Information
        EncounterInfo.LocationId = req.Data.ToLocationId;
        EncounterInfo.WardId = req.Data.ToWardId;
        EncounterInfo.RoomId = req.Data.ToRoomId;
        EncounterInfo.BedId = req.Data.ToBedId;
        EncounterInfo.ServiceRateCategoryId = IsInsuranceTraiff ? ServiceRateCategoryId : req.Data.ToServiceRateCategoryId;
        let updatedEncounterInfo: any = { Data: EncounterInfo };
        await EncounterBo.UpdateEncounter(updatedEncounterInfo);

        return true;
    }

}
