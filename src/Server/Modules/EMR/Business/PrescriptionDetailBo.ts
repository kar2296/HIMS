import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PrescriptionDetailInstance, PrescriptionDetailAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PrescriptionDetailFilters } from '../Common/Filters.e';
// import * as userbo from '../../SystemSettings/Business/Index';
// import { EncounterFilters } from '../../Visit/Common/Filters.e';
// import * as encbo from '../../Visit/Business/Index';
// import * as regbo from '../../Registration/Business/Index';
import * as bo from '../../EMR/Business/Index';
import * as _ from 'lodash';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class PrescriptionDetailBo extends BaseBo<PrescriptionDetailInstance, PrescriptionDetailAttributes>  {
    public async AddPrescriptionDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePrescriptionDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePrescriptionDetails(prescriptionId: number, patientId: number, encId: number, storeId: number,
        prescDate: Date, details: PrescriptionDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<any> => {
            return (async (detail): Promise<any> => {
                detail.Id = detail.Id || 0;
                detail.PrescriptionId = prescriptionId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let pdetail = await this.Save(detail);
                    let pdetaildata = pdetail.dataValues;
                    if (pdetaildata.Id > 0 && pdetaildata.IseMAR) {
                        let emarDetail: any = [];
                        let totalDays = 0;
                        if (pdetaildata.DurationPeriodId === 1) { //Days
                            totalDays = pdetaildata.Duration * 1;
                        } else if (pdetaildata.DurationPeriodId === 2) { //Weeks
                            totalDays = pdetaildata.Duration * 7;
                        } else if (pdetaildata.DurationPeriodId === 3) { //Months
                            totalDays = pdetaildata.Duration * 30;
                        }
                        for (let days = 1; days <= totalDays; days++) {
                            let prescribedDate: any;
                            let adminStatusId: number = 0;
                            if (days === 1) {
                                prescribedDate = prescDate;
                                adminStatusId = 3;
                            } else {
                                var date = new Date();
                                let add = days - 1;
                                date.setDate(date.getDate() + add);
                                prescribedDate = date;
                                adminStatusId = 4;
                            }
                            let totqty = (pdetaildata.Quantity) / (totalDays);
                            // for (let qty = totqty; qty > 0; qty--) {
                            if (totqty > 0 && pdetaildata.STAT) {
                                let pdetail: any = {
                                    Id: 0,
                                    PrescriptionId: pdetaildata.PrescriptionId,
                                    PrescriptionDetailId: pdetaildata.Id,
                                    PatientId: patientId,
                                    EncounterId: encId,
                                    StoreMasterId: storeId,
                                    DrugId: pdetaildata.DrugId,
                                    DrugCode: pdetaildata.DrugCode,
                                    DrugName: pdetaildata.DrugName,
                                    Dosage: pdetaildata.Dosage,
                                    Duration: pdetaildata.Duration,
                                    DurationPeriodId: pdetaildata.DurationPeriodId,
                                    STAT: pdetaildata.STAT,
                                    Morning: 0,
                                    Noon: 0,
                                    Night: 0,
                                    DrugInstructionId: pdetaildata.DrugInstructionId,
                                    Quantity: pdetaildata.Quantity,
                                    AdministeredQuantity: 0,
                                    AdministerStatusId: 2,
                                    AdministerInstructions: '',
                                    StartDate: prescribedDate,
                                };
                                emarDetail.push(pdetail);
                            }
                            if (totqty > 0 && pdetaildata.Morning) {
                                let pdetail: any = {
                                    Id: 0,
                                    PrescriptionId: pdetaildata.PrescriptionId,
                                    PrescriptionDetailId: pdetaildata.Id,
                                    PatientId: patientId,
                                    EncounterId: encId,
                                    StoreMasterId: storeId,
                                    DrugId: pdetaildata.DrugId,
                                    DrugCode: pdetaildata.DrugCode,
                                    DrugName: pdetaildata.DrugName,
                                    Dosage: pdetaildata.Dosage,
                                    Duration: pdetaildata.Duration,
                                    DurationPeriodId: pdetaildata.DurationPeriodId,
                                    STAT: false,
                                    Morning: pdetaildata.Morning,
                                    Noon: 0,
                                    Night: 0,
                                    DrugInstructionId: pdetaildata.DrugInstructionId,
                                    Quantity: pdetaildata.Quantity,
                                    AdministeredQuantity: 0,
                                    AdministerStatusId: adminStatusId,
                                    AdministerInstructions: '',
                                    StartDate: prescribedDate,
                                };
                                emarDetail.push(pdetail);
                            }
                            if (totqty > 0 && pdetaildata.Noon) {
                                let pdetail: any = {
                                    Id: 0,
                                    PrescriptionId: pdetaildata.PrescriptionId,
                                    PrescriptionDetailId: pdetaildata.Id,
                                    PatientId: patientId,
                                    EncounterId: encId,
                                    StoreMasterId: storeId,
                                    DrugId: pdetaildata.DrugId,
                                    DrugCode: pdetaildata.DrugCode,
                                    DrugName: pdetaildata.DrugName,
                                    Dosage: pdetaildata.Dosage,
                                    Duration: pdetaildata.Duration,
                                    DurationPeriodId: pdetaildata.DurationPeriodId,
                                    STAT: false,
                                    Morning: 0,
                                    Noon: pdetaildata.Noon,
                                    Night: 0,
                                    DrugInstructionId: pdetaildata.DrugInstructionId,
                                    Quantity: pdetaildata.Quantity,
                                    AdministeredQuantity: 0,
                                    AdministerStatusId: adminStatusId,
                                    AdministerInstructions: '',
                                    StartDate: prescribedDate,
                                };
                                emarDetail.push(pdetail);
                            }
                            if (totqty > 0 && pdetaildata.Night) {
                                let pdetail: any = {
                                    Id: 0,
                                    PrescriptionId: pdetaildata.PrescriptionId,
                                    PrescriptionDetailId: pdetaildata.Id,
                                    PatientId: patientId,
                                    EncounterId: encId,
                                    StoreMasterId: storeId,
                                    DrugId: pdetaildata.DrugId,
                                    DrugCode: pdetaildata.DrugCode,
                                    DrugName: pdetaildata.DrugName,
                                    Dosage: pdetaildata.Dosage,
                                    Duration: pdetaildata.Duration,
                                    DurationPeriodId: pdetaildata.DurationPeriodId,
                                    STAT: false,
                                    Morning: 0,
                                    Noon: 0,
                                    Night: pdetaildata.Night,
                                    DrugInstructionId: pdetaildata.DrugInstructionId,
                                    Quantity: pdetaildata.Quantity,
                                    AdministeredQuantity: 0,
                                    AdministerStatusId: adminStatusId,
                                    AdministerInstructions: '',
                                    StartDate: prescribedDate,
                                };
                                emarDetail.push(pdetail);
                            }
                            // }
                        }
                        let eMARBO = BoFactory.GetBo(bo.EmarBo, this.Request);
                        await eMARBO.ManageEmars(emarDetail);
                    }
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async ManageCancelPrescriptionDetails(prescriptionId: number,
        statusid: number, details: PrescriptionDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PrescriptionId = prescriptionId;
                detail.PrecriptionStatusId = statusid;
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

    public async CreatePrescriptionDetails(prescriptionId: number, details: PrescriptionDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PrescriptionId = prescriptionId;
                if (detail.Status === 2 && detail.Id !== 0 && detail.DrugId > 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0 && detail.DrugId > 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0 && detail.DrugId > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    /*
    public async ManagePrescriptionItemDetails(PatientBillId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePrescriptionItem(PatientBillId, request, detail);
            })(item);
        }));
    }

    public async ManagePrescriptionItem(PatientBillId: number, request: any, detail: any): Promise<void> {
        let PrescriptionDetailId = detail.PrescriptionDetailId;
        if (PrescriptionDetailId > 0) {
            let PrescriptionDetailedItem = await this.GetPrescriptionDetailById({ Id: PrescriptionDetailId });
            if (request.Header.PatientStockRequestId) {
                PrescriptionDetailedItem.DispensedQuantity = PrescriptionDetailedItem.DispensedQuantity + detail.DispensedQuantity;
            } else {
                PrescriptionDetailedItem.DispensedQuantity = PrescriptionDetailedItem.DispensedQuantity + detail.Quantity;
            }
            await this.Update(PrescriptionDetailedItem);
        }
    }
    */

    public async ManagePrescriptionItemDetails(PatientDispenseId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManagePrescriptionItem(PatientDispenseId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManagePrescriptionItem(PatientDispenseId: number, request: any, details: Array<any>): Promise<void> {
        let PrescriptionDetailId = details[0].PrescriptionDetailId;
        let IsAlternateIssued = details[0].IsAlternateIssued;
        if (PrescriptionDetailId > 0 && !IsAlternateIssued) {
            let PrescriptionDetailedItem = await this.GetPrescriptionDetailById({ Id: PrescriptionDetailId });
            var ItemDispensingQty = 0;
            if (request.Header.PatientStockRequestId) {
                ItemDispensingQty = _.sumBy(details, (detail: any) => detail.DispensedQuantity);
                PrescriptionDetailedItem.DispensedQuantity = PrescriptionDetailedItem.DispensedQuantity + ItemDispensingQty;
            } else {
                ItemDispensingQty = _.sumBy(details, (detail: any) => detail.Quantity);
                PrescriptionDetailedItem.DispensedQuantity = PrescriptionDetailedItem.DispensedQuantity + ItemDispensingQty;
            }
            await this.Update(PrescriptionDetailedItem);
        }
    }

    public async GetPrescriptionDetailById(req: BaseRequest): Promise<PrescriptionDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async IsDrugAssociated(drugId: number): Promise<boolean> {
        let prescriptionDetails = await this.FindAll({
            where: {
                DrugId: drugId
            }
        });
        if (prescriptionDetails && prescriptionDetails.length > 0) {
            return true;
        }
        return false;
    }

    public async GetPrescriptionDetails(apiReq?: ApiRequest<PrescriptionDetailFilters>):
        Promise<ApiResponse<PrescriptionDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let PrescribeWhere: WhereOptions<any> = {};
        let isReqPrescribeSearch: boolean = true;
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            as: 'CreatedUser',
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], required: false,
            as: 'UpdatedUser',
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Prescription,
            required: isReqPrescribeSearch,
            where: PrescribeWhere,
            include: [this.GetReference('PrecriptionStatus'), this.GetReference('PrescriptionPriority'),
            {
                model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
                include: [this.GetReference('Title')]
            }]
        });
        include.push({ model: this.Models.GenericMaster, attributes: ['GenericName'], required: false });
        include.push({ model: this.Models.DrugMaster, attributes: ['DrugName'], required: false });
        include.push({ model: this.Models.DrugFrequency, attributes: ['Name'], required: false });
        include.push(this.GetReference('DrugRoute'));
        include.push(this.GetReference('DurationPeriod'));
        include.push(this.GetReference('DrugInstruction'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PrescriptionDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PrescriptionDetailFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PrescriptionDetailFilters.PrescriptionId:
                        where['PrescriptionId'] = param.Value;
                        break;
                    case PrescriptionDetailFilters.PatientId:
                        PrescribeWhere['PatientId'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    case PrescriptionDetailFilters.EncounterId:
                        PrescribeWhere['EncounterId'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    case PrescriptionDetailFilters.PrecriptionStatusId:
                        where['PrecriptionStatusId'] = param.Value;
                        break;
                    case PrescriptionDetailFilters.ConsultationId:
                        PrescribeWhere['ConsultationId'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    case PrescriptionDetailFilters.From:
                        PrescribeWhere['PrescriptionDate'] = PrescribeWhere['PrescriptionDate'] || {};
                        (PrescribeWhere['PrescriptionDate'] as any)['$gte'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    case PrescriptionDetailFilters.To:
                        PrescribeWhere['PrescriptionDate'] = PrescribeWhere['PrescriptionDate'] || {};
                        (PrescribeWhere['PrescriptionDate'] as any)['$lte'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    case PrescriptionDetailFilters.DoctorId:
                        PrescribeWhere['DoctorId'] = param.Value;
                        isReqPrescribeSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    // public async PrintPrescription(req: BaseRequest): Promise<FileInfo> {
    //     let apiReq = {
    //         Id: 0,
    //         PageContext: { PageSize: 50, PageNumber: 1 },
    //         Params: [{ Key: PrescriptionDetailFilters.Id, Value: req.Id }]
    //     };
    //     let data = await this.GetPrescriptionDetails(apiReq);
    //     let prescription = data.Data[0];

    //     let presDetailBo = BoFactory.GetBo(bo.PrescriptionDetailBo);
    //     let apiPresDetReq = {
    //         Id: 0,
    //         PageContext: { PageSize: -1, PageNumber: 1 },
    //         Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: prescription.Id }]
    //     };
    //     let PrescriptionDetaildata1 = await presDetailBo.GetPrescriptionDetails(apiPresDetReq);

    //     let encounterBo = BoFactory.GetBo(encbo.EncounterBo);
    //     let encReq = {
    //         Id: 0,
    //         PageContext: { PageSize: 50, PageNumber: 1 },
    //         // Params: [{ Key: EncounterFilters.PatientId, Value: prescription.PatientId }]
    //     };
    //     let encounterData = await encounterBo.GetEncounters(encReq);
    //     let patientBo = BoFactory.GetBo(regbo.PatientBo);
    //     let UserBo = BoFactory.GetBo(userbo.UserBo);
    //     // let UserData = await UserBo.GetUserById({ Id: prescription.DoctorId });

    //     // let patientData = await patientBo.GetPatientById({ Id: prescription.PatientId });
    //     let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
    //     let printPreferencesData =
    //         await facilityPreferenceBO.GetFacilityPreferenceWithLogo(patientData.FacilityId);
    //     let info = {
    //         Patient: patientData,
    //         Prescription: prescription,
    //         PrescriptionDetails: PrescriptionDetaildata1.Data,
    //         Encounter: encounterData.Data[0],
    //         User: UserData,
    //         Preferences: printPreferencesData
    //     };
    //     return await Report.Generate('prescription', { header: {}, body: info });
    // }
    public async DeletePrescriptionDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPendingPrescriptionReport(apiReq?: ApiRequest<PrescriptionDetailFilters>): Promise<any> {
        let data = await this.GetPrescriptionDetails(apiReq);
        let pendingprescription = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityId = apiReq.Data.FacilityId;
        let DoctorName = apiReq.Data.DoctorName;
        // let StoreMasterId = apiReq.Data.StoreMasterId;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        // let printStoreData =
        //     await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, StoreMasterId);
        let info = {
            pendingprescription: pendingprescription,
            Preferences: printPreferencesData,
            // StorePreferences: printStoreData,
            FromDate: FromDate,
            ToDate: ToDate,
            DoctorName: DoctorName,

        };
        let pdfOption: any = null;
        let key = 'pendingprescriptionreport';
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

    public GetModel(): SStatic.Model<PrescriptionDetailInstance, PrescriptionDetailAttributes> {
        return this.Models.PrescriptionDetail;
    }

}
