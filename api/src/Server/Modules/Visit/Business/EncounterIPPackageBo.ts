import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import {
    EncounterIPPackageInstance,
    EncounterIPPackageAttributes
} from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Visit/Business/Index';
import * as billingBo from '../../Billing/Business/Index';
import {
    EncounterIPPackageFilters,
    EncounterIPPackageDetailFilters,
    EncounterIPPackageServiceInclusionFilters,
    EncounterIPPackageServiceNonMedicalFilters
} from '../Common/Filters.e';
import {
    PatientBillPackageSummaryFilters,
    PatientPaymentDetailsFilters,
    PatientRefundFilters,
} from '../../Billing/Common/Filters.e';
import { PatientBillDetailsFilters, PatientBillsFilters } from '../../Billing/Common/Filters.e';
import {
    EncounterFilters
} from '../../Visit/Common/Filters.e';
import * as moment from 'moment';
import { join } from 'path';
import * as _ from 'lodash';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
export class EncounterIPPackageBo extends BaseBo<EncounterIPPackageInstance, EncounterIPPackageAttributes>  {

    public async AddEncounterIPPackage(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data.Header);
        let EncounterIPPackageId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);
        await detailBO.ManageEncounterIPPackageDetails(EncounterIPPackageId, req.Data.Details);

        let EncounterBo = BoFactory.GetBo(bo.EncounterBo, this.Request);
        let encounter = await EncounterBo.GetEncounterById({ Id: req.Data.Header.EncounterId });
        encounter.IsPackageAssigned = true;
        encounter.EncounterIPPackageId = EncounterIPPackageId;
        encounter.IPPackageId = req.Data.Header.IPPackageId;
        await EncounterBo.Update(encounter);
        return EncounterIPPackageId;
    }

    public async UpdateEncounterIPPackage(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);
        // let EncounterBo = BoFactory.GetBo(bo.EncounterBo, this.Request);
        let billDetailBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        // let encounter = await EncounterBo.GetEncounterById({ Id: req.Data.Header.EncounterId });
        let billDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Data.Header.EncounterId }]
        };
        let billDetails = await billDetailBo.GetPatientOTPharmacyBillDetails(billDetailsApiReq);
        await Promise.all(billDetails.Data.map((BillDetail): Promise<void> => {
            return (async (DetailItem): Promise<void> => {
                if (DetailItem.IsExclusionItem || DetailItem.IsInclusionItem) {
                    DetailItem.IsExclusionItem = false;
                    DetailItem.IsInclusionItem = false;
                }
                billDetailBo.Update(DetailItem);
            })(BillDetail);
        }));
        // let encounterIpPackagesApiReq = {
        //     Id: 0,
        //     PageContext: { PageSize: 10000, PageNumber: 1 },
        //     Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Data.Header.EncounterId },
        //     { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }]
        // };
        // let encounterIpPackages = await this.GetEncounterIPPackages(encounterIpPackagesApiReq);

        // encounter.IsPackageAssigned = false;
        // encounter.EncounterIPPackageId = 0;
        // encounter.IPPackageId = 0;
        // await EncounterBo.Update(encounter);
        return result;
    }

    public async UpdateEncounterIPPackageInfo(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetEncounterIPPackageById(req: BaseRequest): Promise<EncounterIPPackageAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEncounterIPPackages(apiReq?: ApiRequest<EncounterIPPackageFilters>):
        Promise<ApiResponse<EncounterIPPackageAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({
        //     model: this.Models.EncounterIPPackageDetail, required: false,
        //     include: [{ model: this.Models.EncounterIPPackageServiceInclusion, required: false },
        //     { model: this.Models.EncounterIPPackageServiceExclusion, required: false }]
        // });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
            include: [this.GetReference('GuarantorType')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceRateCategory,
            attributes: ['Id', 'ServiceRateCategory', 'Description'],
        });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterIPPackageFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.IPPackageCode:
                        where['IPPackageCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case EncounterIPPackageFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.GuarantorName:
                        where['GuarantorName'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetMinEncounterIPPackages(apiReq?: ApiRequest<EncounterIPPackageFilters>):
        Promise<ApiResponse<EncounterIPPackageAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push({
        //     model: this.Models.EncounterIPPackageDetail, required: false,
        //     include: [{ model: this.Models.EncounterIPPackageServiceInclusion, required: false },
        //     { model: this.Models.EncounterIPPackageServiceExclusion, required: false }]
        // });
        include.push({
            model: this.Models.Guarantor,
            attributes: ['Id', 'GuarantorId', 'GuarantorName', 'GuarantorTypeId', 'TpaId'],
            include: [this.GetReference('GuarantorType')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'SignPath'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceRateCategory,
            attributes: ['Id', 'ServiceRateCategory', 'Description'],
        });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterIPPackageFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.IPPackageCode:
                        where['IPPackageCode'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case EncounterIPPackageFilters.GuarantorTypeId:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.GuarantorName:
                        where['GuarantorName'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EncounterIPPackageFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteEncounterIPPackage(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async ManagePackageBillDetails(req: BaseRequest): Promise<any> {
        let patientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        let encounterIpPackageDetailBo = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);
        let inclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceInclusionBo, this.Request);
        let nonmedicalBo = BoFactory.GetBo(bo.EncounterIPPackageServiceNonMedicalBo, this.Request);
        let encounterIpPackagesApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id },
            { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }]
        };
        let encounterIpPackages = await this.GetMinEncounterIPPackages(encounterIpPackagesApiReq);
        let PackageItem = encounterIpPackages.Data[0];
        let billDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },]
        };
        let patientBillDetails = await patientBillDetailsBo.GetMinPatientBillDetails(billDetailsApiReq);
        let groupedBills = _.groupBy(patientBillDetails.Data, 'ServiceCategoryId');

        if (groupedBills) {
            let packDetailId: any = 0;
            let pdid = 0;
            for (let gdx in groupedBills) {
                let bills = groupedBills[gdx];
                if (bills.length === 1) {
                    for (let pbdx in bills) {
                        let billDetail = bills[pbdx];
                        let encounterIpPackageDetailsApiReq = {
                            Id: 0,
                            PageContext: { PageSize: 10000, PageNumber: 1 },
                            Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: PackageItem.Id },
                            { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: billDetail.ServiceCategoryId }]
                        };
                        let encounterIpPackageDetails = await encounterIpPackageDetailBo.
                            GetEncounterIPPackageDetails(encounterIpPackageDetailsApiReq);
                        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
                        let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: billDetail.ServiceCategoryId });

                        if (encounterIpPackageDetails.Data.length === 0) {
                            let actPatamt = 0;
                            if (billDetail.IsSupplementary) {
                                actPatamt = billDetail.PatNetAmount;
                            }
                            let encpacDetail: any = {
                                Id: 0,
                                EncounterIPPackageId: PackageItem.Id,
                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                ServiceCategoryCode: ServiceCategoryInfo.ServiceCategoryCode,
                                ServiceCategoryName: ServiceCategoryInfo.ServiceCategoryName,
                                ActualAmount: billDetail.NetAmount,
                                PackageAmount: billDetail.NetAmount,
                                ActualPatAmount: actPatamt,
                                ActiveStatusId: 2,
                                Status: 1
                            };
                            packDetailId = await encounterIpPackageDetailBo.Save(encpacDetail);
                            pdid = packDetailId.dataValues.Id;
                        }

                        if (encounterIpPackageDetails.Data.length > 0) {
                            for (let edx in encounterIpPackageDetails.Data) {
                                let edetail = encounterIpPackageDetails.Data[edx];
                                pdid = edetail.Id;
                            }
                        }
                        if (encounterIpPackageDetails.Data.length === 0) {
                            let inclusionDetailsApiReq = {
                                Id: 0,
                                PageContext: { PageSize: 10000, PageNumber: 1 },
                                Params: [
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.ServiceCategoryId,
                                        Value: billDetail.ServiceCategoryId
                                    },
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId,
                                        Value: pdid
                                    },
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.ActiveStatusId,
                                        Value: 2
                                    }]
                            };
                            let nonmedicalApiReq = {
                                Id: 0,
                                PageContext: { PageSize: 10000, PageNumber: 1 },
                                Params: [{
                                    Key: EncounterIPPackageServiceNonMedicalFilters.EncounterIPPackageDetailId,
                                    Value: pdid
                                },
                                {
                                    Key: EncounterIPPackageServiceNonMedicalFilters.ServiceCategoryId,
                                    Value: billDetail.ServiceCategoryId
                                },
                                {
                                    Key: EncounterIPPackageServiceNonMedicalFilters.ActiveStatusId,
                                    Value: 2
                                }]
                            };
                            let inclusionDetails = await inclusionBo.GetEncounterIPPackageServiceInclusions(inclusionDetailsApiReq);
                            let nonmedicalDetails = await nonmedicalBo.GetEncounterIPPackageServiceNonMedicals(nonmedicalApiReq);
                            if (!billDetail.IsSupplementary) {
                                if (inclusionDetails.Data.length > 0) {
                                    for (let indx in inclusionDetails.Data) {
                                        let incData = inclusionDetails.Data[indx];
                                        if (incData.ServiceItemId !== billDetail.ServiceId) {
                                            let inclData: any = {
                                                Id: 0,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(inclData);
                                            await inclusionBo.Save(inclData);
                                        } else if (incData.ServiceItemId === billDetail.ServiceId) {
                                            let inclData: any = {
                                                Id: incData.Id,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(inclData);
                                            await inclusionBo.Update(inclData);
                                        }
                                    }
                                } else {
                                    let inclData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: pdid,
                                        PatientbilldetId: billDetail.Id,
                                        ServiceCategoryId: billDetail.ServiceCategoryId,
                                        ServiceItemId: billDetail.ServiceId,
                                        ServiceItemName: billDetail.ServiceName,
                                        Quantity: billDetail.Quantity,
                                        Rate: billDetail.Rate,
                                        Amount: billDetail.Amount,
                                        TotalAmount: billDetail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    }; console.log(inclData);
                                    await inclusionBo.Save(inclData);
                                }
                                let billdetData: any = {
                                    Id: billDetail.Id,
                                    IsInclusionItem: true,
                                    IsExclusionItem: false
                                }; console.log(billdetData);
                                await patientBillDetailsBo.Update(billdetData);
                            }
                            if (billDetail.IsSupplementary) {
                                if (nonmedicalDetails.Data.length > 0) {
                                    for (let ndx in nonmedicalDetails.Data) {
                                        let nonmedData = nonmedicalDetails.Data[ndx];
                                        if (nonmedData.ServiceItemId !== billDetail.ServiceId) {
                                            let nmdata: any = {
                                                Id: 0,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(nmdata);
                                            await nonmedicalBo.Save(nmdata);
                                        } else if (nonmedData.ServiceItemId === billDetail.ServiceId) {
                                            let nmdata: any = {
                                                Id: nonmedData.Id,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(nmdata);
                                            await nonmedicalBo.Update(nmdata);
                                        }
                                    }
                                } else {
                                    let nonmedData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: pdid,
                                        PatientbilldetId: billDetail.Id,
                                        ServiceCategoryId: billDetail.ServiceCategoryId,
                                        ServiceItemId: billDetail.ServiceId,
                                        ServiceItemName: billDetail.ServiceName,
                                        Quantity: billDetail.Quantity,
                                        Rate: billDetail.Rate,
                                        Amount: billDetail.Amount,
                                        TotalAmount: billDetail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    }; console.log(nonmedData);
                                    await nonmedicalBo.Save(nonmedData);
                                }
                                let billdetData: any = {
                                    Id: billDetail.Id,
                                    IsExclusionItem: false,
                                    IsInclusionItem: false,
                                }; console.log(billdetData);
                                await patientBillDetailsBo.Update(billdetData);
                            }
                        }
                    }
                }
                if (bills.length > 1) {
                    let billDetail: any;
                    let Totactamt = 0;
                    let actPatamt = 0;
                    for (let pbdx in bills) {
                        billDetail = bills[pbdx];
                        Totactamt += billDetail.NetAmount;
                        if (billDetail.IsSupplementary) {
                            actPatamt += billDetail.PatNetAmount;
                        }
                    }
                    let encounterIpPackageDetailsApiReq = {
                        Id: 0,
                        PageContext: { PageSize: 10000, PageNumber: 1 },
                        Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: PackageItem.Id },
                        { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: billDetail.ServiceCategoryId }]
                    };
                    let encounterIpPackageDetails = await encounterIpPackageDetailBo.
                        GetEncounterIPPackageDetails(encounterIpPackageDetailsApiReq);
                    let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
                    let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: billDetail.ServiceCategoryId });
                    if (encounterIpPackageDetails.Data.length === 0) {
                        let encpacDetail: any = {
                            Id: 0,
                            EncounterIPPackageId: PackageItem.Id,
                            ServiceCategoryId: billDetail.ServiceCategoryId,
                            ServiceCategoryCode: ServiceCategoryInfo.ServiceCategoryCode,
                            ServiceCategoryName: ServiceCategoryInfo.ServiceCategoryName,
                            ActualAmount: Totactamt,
                            PackageAmount: Totactamt,
                            ActualPatAmount: actPatamt,
                            ActiveStatusId: 2,
                            Status: 1
                        };
                        packDetailId = await encounterIpPackageDetailBo.Save(encpacDetail);
                        pdid = packDetailId.dataValues.Id;
                    }
                    if (encounterIpPackageDetails.Data.length > 0) {
                        for (let edx in encounterIpPackageDetails.Data) {
                            let edetail = encounterIpPackageDetails.Data[edx];
                            pdid = edetail.Id;
                        }
                    }
                    if (encounterIpPackageDetails.Data.length === 0) {
                        for (let pbdx in bills) {
                            billDetail = bills[pbdx];
                            let inclusionDetailsApiReq = {
                                Id: 0,
                                PageContext: { PageSize: 10000, PageNumber: 1 },
                                Params: [
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.ServiceCategoryId,
                                        Value: billDetail.ServiceCategoryId
                                    },
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId,
                                        Value: pdid
                                    },
                                    {
                                        Key: EncounterIPPackageServiceInclusionFilters.ActiveStatusId,
                                        Value: 2
                                    }]
                            };
                            let nonmedicalApiReq = {
                                Id: 0,
                                PageContext: { PageSize: 10000, PageNumber: 1 },
                                Params: [{
                                    Key: EncounterIPPackageServiceNonMedicalFilters.EncounterIPPackageDetailId,
                                    Value: pdid
                                },
                                {
                                    Key: EncounterIPPackageServiceNonMedicalFilters.ServiceCategoryId,
                                    Value: billDetail.ServiceCategoryId
                                },
                                {
                                    Key: EncounterIPPackageServiceNonMedicalFilters.ActiveStatusId,
                                    Value: 2
                                }]
                            };
                            let inclusionDetails = await inclusionBo.GetEncounterIPPackageServiceInclusions(inclusionDetailsApiReq);
                            let nonmedicalDetails = await nonmedicalBo.GetEncounterIPPackageServiceNonMedicals(nonmedicalApiReq);
                            if (!billDetail.IsSupplementary) {
                                if (inclusionDetails.Data.length > 0) {
                                    for (let indx in inclusionDetails.Data) {
                                        let incData = inclusionDetails.Data[indx];
                                        if (incData.ServiceItemId !== billDetail.ServiceId) {
                                            let inclData: any = {
                                                Id: 0,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(inclData);
                                            await inclusionBo.Save(inclData);
                                        } else if (incData.ServiceItemId === billDetail.ServiceId) {
                                            let inclData: any = {
                                                Id: incData.Id,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(inclData);
                                            await inclusionBo.Update(inclData);
                                        }
                                    }
                                } else {
                                    let inclData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: pdid,
                                        PatientbilldetId: billDetail.Id,
                                        ServiceCategoryId: billDetail.ServiceCategoryId,
                                        ServiceItemId: billDetail.ServiceId,
                                        ServiceItemName: billDetail.ServiceName,
                                        Quantity: billDetail.Quantity,
                                        Rate: billDetail.Rate,
                                        Amount: billDetail.Amount,
                                        TotalAmount: billDetail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    }; console.log(inclData);
                                    await inclusionBo.Save(inclData);
                                }
                                let billdetData: any = {
                                    Id: billDetail.Id,
                                    IsInclusionItem: true,
                                    IsExclusionItem: false
                                }; console.log(billdetData);
                                await patientBillDetailsBo.Update(billdetData);
                            }
                            if (billDetail.IsSupplementary) {
                                if (nonmedicalDetails.Data.length > 0) {
                                    for (let ndx in nonmedicalDetails.Data) {
                                        let nonmedData = nonmedicalDetails.Data[ndx];
                                        if (nonmedData.ServiceItemId !== billDetail.ServiceId) {
                                            let nmdata: any = {
                                                Id: 0,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(nmdata);
                                            await nonmedicalBo.Save(nmdata);
                                        } else if (nonmedData.ServiceItemId === billDetail.ServiceId) {
                                            let nmdata: any = {
                                                Id: nonmedData.Id,
                                                EncounterIPPackageDetailId: pdid,
                                                PatientbilldetId: billDetail.Id,
                                                ServiceCategoryId: billDetail.ServiceCategoryId,
                                                ServiceItemId: billDetail.ServiceId,
                                                ServiceItemName: billDetail.ServiceName,
                                                Quantity: billDetail.Quantity,
                                                Rate: billDetail.Rate,
                                                Amount: billDetail.Amount,
                                                TotalAmount: billDetail.GrossAmount,
                                                ActiveStatusId: 2,
                                                Status: 1
                                            }; console.log(nmdata);
                                            await nonmedicalBo.Update(nmdata);
                                        }
                                    }
                                } else {
                                    let nonmedData: any = {
                                        Id: 0,
                                        EncounterIPPackageDetailId: pdid,
                                        PatientbilldetId: billDetail.Id,
                                        ServiceCategoryId: billDetail.ServiceCategoryId,
                                        ServiceItemId: billDetail.ServiceId,
                                        ServiceItemName: billDetail.ServiceName,
                                        Quantity: billDetail.Quantity,
                                        Rate: billDetail.Rate,
                                        Amount: billDetail.Amount,
                                        TotalAmount: billDetail.GrossAmount,
                                        ActiveStatusId: 2,
                                        Status: 1
                                    }; console.log(nonmedData);
                                    await nonmedicalBo.Save(nonmedData);
                                }
                                let billdetData: any = {
                                    Id: billDetail.Id,
                                    IsExclusionItem: false,
                                    IsInclusionItem: false,
                                }; console.log(billdetData);
                                await patientBillDetailsBo.Update(billdetData);
                            }
                            // let bdupdate: any = {
                            //     Id: billDetail.Id,
                            //     PackDetailId: packDetailId.dataValues.Id
                            // };
                            // await patientBillDetailsBo.Update(bdupdate);
                        }
                    }
                }
            }
        }

        return PackageItem.Id;
    }

    // public async ManagePackageBillInfo(req: BaseRequest): Promise<any> {
    //     let patientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
    //     let exclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceExclusionBo, this.Request);
    //     let inclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceInclusionBo, this.Request);
    //     let nonmedicalBo = BoFactory.GetBo(bo.EncounterIPPackageServiceNonMedicalBo, this.Request);
    //     let encounterIpPackageDetailBo = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);

    //     let encounterIpPackagesApiReq = {
    //         Id: 0,
    //         PageContext: { PageSize: 10000, PageNumber: 1 },
    //         Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id },
    //         { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }]
    //     };
    //     let encounterIpPackages = await this.GetMinEncounterIPPackages(encounterIpPackagesApiReq);
    //     // for (let packdx in encounterIpPackages.Data) {
    //     let PackageItem = encounterIpPackages.Data[0];
    //     let billDetailsApiReq = {
    //         Id: 0,
    //         PageContext: { PageSize: 10000, PageNumber: 1 },
    //         Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
    //         { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
    //         { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },
    //         ]
    //     };
    //     let patientBillDetails = await patientBillDetailsBo.GetMinPatientBillDetails(billDetailsApiReq);
    //     if (patientBillDetails.Data.length > 0) {
    //         // let DetIncAmt: number = 0;
    //         for (let pdx in patientBillDetails.Data) {
    //             let BillDetail = patientBillDetails.Data[pdx];
    //             // DetIncAmt += BillDetail.Amount;
    //             let encounterIpPackageDetailsApiReq = {
    //                 Id: 0,
    //                 PageContext: { PageSize: 10000, PageNumber: 1 },
    //                 Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: PackageItem.Id },
    //                 { Key: EncounterIPPackageDetailFilters.ServiceCategoryId, Value: BillDetail.ServiceCategoryId }]
    //             };
    //             let encounterIpPackageDetails = await encounterIpPackageDetailBo.
    //                 GetEncounterIPPackageDetails(encounterIpPackageDetailsApiReq);
    //             if (encounterIpPackageDetails.Data.length > 0) {
    //                 for (let pdedx in encounterIpPackageDetails.Data) {
    //                     let DetailItem = encounterIpPackageDetails.Data[pdedx];
    //                     let exclusionDetailsApiReq = {
    //                         Id: 0,
    //                         PageContext: { PageSize: 10000, PageNumber: 1 },
    //                         Params: [{
    //                             Key: EncounterIPPackageServiceExclusionFilters.EncounterIPPackageDetailId,
    //                             Value: DetailItem.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceExclusionFilters.ServiceCategoryId,
    //                             Value: DetailItem.ServiceCategoryId
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceExclusionFilters.PatientBillDetailId,
    //                             Value: BillDetail.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceExclusionFilters.ActiveStatusId,
    //                             Value: 2
    //                         }]
    //                     };
    //                     let inclusionDetailsApiReq = {
    //                         Id: 0,
    //                         PageContext: { PageSize: 10000, PageNumber: 1 },
    //                         Params: [{
    //                             Key: EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId,
    //                             Value: DetailItem.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceInclusionFilters.ServiceCategoryId,
    //                             Value: DetailItem.ServiceCategoryId
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceInclusionFilters.PatientBillDetailId,
    //                             Value: BillDetail.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceInclusionFilters.ActiveStatusId,
    //                             Value: 2
    //                         }]
    //                     };
    //                     let nonmedicalApiReq = {
    //                         Id: 0,
    //                         PageContext: { PageSize: 10000, PageNumber: 1 },
    //                         Params: [{
    //                             Key: EncounterIPPackageServiceNonMedicalFilters.EncounterIPPackageDetailId,
    //                             Value: DetailItem.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceNonMedicalFilters.ServiceCategoryId,
    //                             Value: DetailItem.ServiceCategoryId
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceNonMedicalFilters.PatientBillDetailId,
    //                             Value: BillDetail.Id
    //                         },
    //                         {
    //                             Key: EncounterIPPackageServiceNonMedicalFilters.ActiveStatusId,
    //                             Value: 2
    //                         }]
    //                     };
    //                     let exclusionDetails = await exclusionBo.GetEncounterIPPackageServiceExclusions(exclusionDetailsApiReq);
    //                     let inclusionDetails = await inclusionBo.GetEncounterIPPackageServiceInclusions(inclusionDetailsApiReq);
    //                     let nonmedicalDetails = await nonmedicalBo.GetEncounterIPPackageServiceNonMedicals(nonmedicalApiReq);
    //                     if (BillDetail.IsInclusionItem) {
    //                         if (PackageItem.IsUnlimitedServices) {
    //                             if (exclusionDetails.Data.length > 0) {
    //                                 for (let edx in exclusionDetails.Data) {
    //                                     let ExcData = exclusionDetails.Data[edx];
    //                                     if (ExcData.ServiceItemId === BillDetail.ServiceId) {
    //                                         let exclData: any = {
    //                                             Id: ExcData.Id,
    //                                             ActiveStatusId: 3,
    //                                             Status: 2
    //                                         }; console.log(exclData);
    //                                         await exclusionBo.Update(exclData);
    //                                     }
    //                                 }
    //                             }
    //                             if (nonmedicalDetails.Data.length > 0) {
    //                                 for (let ndx in nonmedicalDetails.Data) {
    //                                     let nonmedData = nonmedicalDetails.Data[ndx];
    //                                     if (nonmedData.ServiceItemId === BillDetail.ServiceId) {
    //                                         let exclData: any = {
    //                                             Id: nonmedData.Id,
    //                                             ActiveStatusId: 3,
    //                                             Status: 2
    //                                         }; console.log(exclData);
    //                                         await nonmedicalBo.Update(exclData);
    //                                     }
    //                                 }
    //                             }
    //                             if (inclusionDetails.Data.length > 0) {
    //                                 for (let indx in inclusionDetails.Data) {
    //                                     let incData = inclusionDetails.Data[indx];
    //                                     if (incData.ServiceItemId !== BillDetail.ServiceId) {
    //                                         let inclData: any = {
    //                                             Id: 0,
    //                                             EncounterIPPackageDetailId: DetailItem.Id,
    //                                             PatientBillDetailId: BillDetail.Id,
    //                                             ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                             ServiceItemId: BillDetail.ServiceId,
    //                                             ServiceItemName: BillDetail.ServiceName,
    //                                             Quantity: BillDetail.Quantity,
    //                                             Rate: BillDetail.Rate,
    //                                             Amount: BillDetail.Amount,
    //                                             TotalAmount: BillDetail.GrossAmount,
    //                                             ActiveStatusId: 2,
    //                                             Status: 1
    //                                         }; console.log(inclData);
    //                                         await inclusionBo.Save(inclData);
    //                                     } else if (incData.ServiceItemId === BillDetail.ServiceId) {
    //                                         let inclData: any = {
    //                                             Id: incData.Id,
    //                                             EncounterIPPackageDetailId: DetailItem.Id,
    //                                             PatientBillDetailId: BillDetail.Id,
    //                                             ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                             ServiceItemId: BillDetail.ServiceId,
    //                                             ServiceItemName: BillDetail.ServiceName,
    //                                             Quantity: BillDetail.Quantity,
    //                                             Rate: BillDetail.Rate,
    //                                             Amount: BillDetail.Amount,
    //                                             TotalAmount: BillDetail.GrossAmount,
    //                                             ActiveStatusId: 2,
    //                                             Status: 1
    //                                         }; console.log(inclData);
    //                                         await inclusionBo.Update(inclData);
    //                                     }
    //                                 }
    //                             } else {
    //                                 let inclData: any = {
    //                                     Id: 0,
    //                                     EncounterIPPackageDetailId: DetailItem.Id,
    //                                     PatientBillDetailId: BillDetail.Id,
    //                                     ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                     ServiceItemId: BillDetail.ServiceId,
    //                                     ServiceItemName: BillDetail.ServiceName,
    //                                     Quantity: BillDetail.Quantity,
    //                                     Rate: BillDetail.Rate,
    //                                     Amount: BillDetail.Amount,
    //                                     TotalAmount: BillDetail.GrossAmount,
    //                                     ActiveStatusId: 2,
    //                                     Status: 1
    //                                 }; console.log(inclData);
    //                                 await inclusionBo.Save(inclData);
    //                             }
    //                             let billdetData: any = {
    //                                 Id: BillDetail.Id,
    //                                 IsInclusionItem: true,
    //                                 IsExclusionItem: false
    //                             }; console.log(billdetData);
    //                             await patientBillDetailsBo.Update(billdetData);
    //                         }
    //                     } else if (BillDetail.IsExclusionItem) {
    //                         if (inclusionDetails.Data.length > 0) {
    //                             for (let indx in inclusionDetails.Data) {
    //                                 let incData = inclusionDetails.Data[indx];
    //                                 if (incData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let inclData: any = {
    //                                         Id: incData.Id,
    //                                         ActiveStatusId: 3,
    //                                         Status: 2
    //                                     }; console.log(inclData);
    //                                     await inclusionBo.Update(inclData);
    //                                 }
    //                             }
    //                         }
    //                         if (nonmedicalDetails.Data.length > 0) {
    //                             for (let ndx in nonmedicalDetails.Data) {
    //                                 let nonmedData = nonmedicalDetails.Data[ndx];
    //                                 if (nonmedData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let exclData: any = {
    //                                         Id: nonmedData.Id,
    //                                         ActiveStatusId: 3,
    //                                         Status: 2
    //                                     }; console.log(exclData);
    //                                     await nonmedicalBo.Update(exclData);
    //                                 }
    //                             }
    //                         }
    //                         if (exclusionDetails.Data.length > 0) {
    //                             for (let edx in exclusionDetails.Data) {
    //                                 let ExcData = exclusionDetails.Data[edx];
    //                                 if (ExcData.ServiceItemId !== BillDetail.ServiceId) {
    //                                     let exclData: any = {
    //                                         Id: 0,
    //                                         EncounterIPPackageDetailId: DetailItem.Id,
    //                                         PatientBillDetailId: BillDetail.Id,
    //                                         ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                         ServiceItemId: BillDetail.ServiceId,
    //                                         ServiceItemName: BillDetail.ServiceName,
    //                                         Quantity: BillDetail.Quantity,
    //                                         Rate: BillDetail.Rate,
    //                                         Amount: BillDetail.Amount,
    //                                         TotalAmount: BillDetail.GrossAmount,
    //                                         ActiveStatusId: 2,
    //                                         Status: 1
    //                                     }; console.log(exclData);
    //                                     await exclusionBo.Save(exclData);
    //                                 } else if (ExcData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let exclData: any = {
    //                                         Id: ExcData.Id,
    //                                         EncounterIPPackageDetailId: DetailItem.Id,
    //                                         PatientBillDetailId: BillDetail.Id,
    //                                         ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                         ServiceItemId: BillDetail.ServiceId,
    //                                         ServiceItemName: BillDetail.ServiceName,
    //                                         Quantity: BillDetail.Quantity,
    //                                         Rate: BillDetail.Rate,
    //                                         Amount: BillDetail.Amount,
    //                                         TotalAmount: BillDetail.GrossAmount,
    //                                         ActiveStatusId: 2,
    //                                         Status: 1
    //                                     };
    //                                     console.log(exclData);
    //                                     await exclusionBo.Update(exclData);
    //                                 }
    //                             }
    //                         } else {
    //                             let exclData: any = {
    //                                 Id: 0,
    //                                 EncounterIPPackageDetailId: DetailItem.Id,
    //                                 PatientBillDetailId: BillDetail.Id,
    //                                 ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                 ServiceItemId: BillDetail.ServiceId,
    //                                 ServiceItemName: BillDetail.ServiceName,
    //                                 Quantity: BillDetail.Quantity,
    //                                 Rate: BillDetail.Rate,
    //                                 Amount: BillDetail.Amount,
    //                                 TotalAmount: BillDetail.GrossAmount,
    //                                 ActiveStatusId: 2,
    //                                 Status: 1
    //                             }; console.log(exclData);
    //                             await exclusionBo.Save(exclData);
    //                         }
    //                         let billdetData: any = {
    //                             Id: BillDetail.Id,
    //                             IsExclusionItem: true,
    //                             IsInclusionItem: false,
    //                         }; console.log(billdetData);
    //                         await patientBillDetailsBo.Update(billdetData);
    //                     }
    //                     if (BillDetail.IsSupplementary) {
    //                         if (inclusionDetails.Data.length > 0) {
    //                             for (let indx in inclusionDetails.Data) {
    //                                 let incData = inclusionDetails.Data[indx];
    //                                 if (incData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let inclData: any = {
    //                                         Id: incData.Id,
    //                                         ActiveStatusId: 3,
    //                                         Status: 2
    //                                     }; console.log(inclData);
    //                                     await inclusionBo.Update(inclData);
    //                                 }
    //                             }
    //                         }
    //                         if (exclusionDetails.Data.length > 0) {
    //                             for (let edx in exclusionDetails.Data) {
    //                                 let ExcData = exclusionDetails.Data[edx];
    //                                 if (ExcData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let exclData: any = {
    //                                         Id: ExcData.Id,
    //                                         ActiveStatusId: 3,
    //                                         Status: 2
    //                                     }; console.log(exclData);
    //                                     await exclusionBo.Update(exclData);
    //                                 }
    //                             }
    //                         }
    //                         if (nonmedicalDetails.Data.length > 0) {
    //                             for (let ndx in nonmedicalDetails.Data) {
    //                                 let nonmedData = nonmedicalDetails.Data[ndx];
    //                                 if (nonmedData.ServiceItemId !== BillDetail.ServiceId) {
    //                                     let nonmedData: any = {
    //                                         Id: 0,
    //                                         EncounterIPPackageDetailId: DetailItem.Id,
    //                                         PatientBillDetailId: BillDetail.Id,
    //                                         ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                         ServiceItemId: BillDetail.ServiceId,
    //                                         ServiceItemName: BillDetail.ServiceName,
    //                                         Quantity: BillDetail.Quantity,
    //                                         Rate: BillDetail.Rate,
    //                                         Amount: BillDetail.Amount,
    //                                         TotalAmount: BillDetail.GrossAmount,
    //                                         ActiveStatusId: 2,
    //                                         Status: 1
    //                                     }; console.log(nonmedData);
    //                                     await nonmedicalBo.Save(nonmedData);
    //                                 } else if (nonmedData.ServiceItemId === BillDetail.ServiceId) {
    //                                     let nmdata: any = {
    //                                         Id: nonmedData.Id,
    //                                         EncounterIPPackageDetailId: DetailItem.Id,
    //                                         PatientBillDetailId: BillDetail.Id,
    //                                         ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                         ServiceItemId: BillDetail.ServiceId,
    //                                         ServiceItemName: BillDetail.ServiceName,
    //                                         Quantity: BillDetail.Quantity,
    //                                         Rate: BillDetail.Rate,
    //                                         Amount: BillDetail.Amount,
    //                                         TotalAmount: BillDetail.GrossAmount,
    //                                         ActiveStatusId: 2,
    //                                         Status: 1
    //                                     }; console.log(nmdata);
    //                                     await nonmedicalBo.Update(nmdata);
    //                                 }
    //                             }
    //                         } else {
    //                             let nonmedData: any = {
    //                                 Id: 0,
    //                                 EncounterIPPackageDetailId: DetailItem.Id,
    //                                 PatientBillDetailId: BillDetail.Id,
    //                                 ServiceCategoryId: DetailItem.ServiceCategoryId,
    //                                 ServiceItemId: BillDetail.ServiceId,
    //                                 ServiceItemName: BillDetail.ServiceName,
    //                                 Quantity: BillDetail.Quantity,
    //                                 Rate: BillDetail.Rate,
    //                                 Amount: BillDetail.Amount,
    //                                 TotalAmount: BillDetail.GrossAmount,
    //                                 ActiveStatusId: 2,
    //                                 Status: 1
    //                             }; console.log(nonmedData);
    //                             await nonmedicalBo.Save(nonmedData);
    //                         }
    //                         let billdetData: any = {
    //                             Id: BillDetail.Id,
    //                             IsExclusionItem: false,
    //                             IsInclusionItem: false,
    //                         }; console.log(billdetData);
    //                         await patientBillDetailsBo.Update(billdetData);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return await this.PopulatePackageBillSummary(req);
    // }

    public async ManagePackageBillInfo(req: BaseRequest): Promise<boolean> {
        let patientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        let encounterPackageApiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id },
            { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }]
        };
        let encounterPackages = await this.GetMinEncounterIPPackages(encounterPackageApiReq);
        let PackageItem = encounterPackages.Data[0];
        let billDetailsApiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },
            ]
        };
        let patientBillDetails = await patientBillDetailsBo.GetMinPatientBillDetails(billDetailsApiReq);
        // await Promise.all(encounterPackages.Data.map((encounterPackageItem): Promise<void> => {
        //     return (async (packageItem): Promise<void> => {
        //         let packageDetailApiReq = {
        //             Id: 0,
        //             PageContext: { PageSize: 1000, PageNumber: 1 },
        //             Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: packageItem.Id }]
        //         };
        //         let packageDetailBo = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);
        //         let packageDetails = await packageDetailBo.GetEncounterIPPackageDetails(packageDetailApiReq);
        //         await Promise.all(packageDetails.Data.map((packageDetailItem): Promise<void> => {
        //             return (async (detailItem): Promise<void> => {
        //                 let packageInclusionApiReq = {
        //                     Id: 0,
        //                     PageContext: { PageSize: 1000, PageNumber: 1 },
        //                     Params: [
        //                         {
        //                             Key: EncounterIPPackageServiceInclusionFilters.EncounterIPPackageDetailId,
        //                             Value: detailItem.Id
        //                         },
        //                         {
        //                             Key: EncounterIPPackageServiceInclusionFilters.ActiveStatusId,
        //                             Value: 2
        //                         },
        //                         {
        //                             Key: EncounterIPPackageServiceInclusionFilters.BillStatusId,
        //                             Value: 3
        //                         },
        //                     ]
        //                 };
        //                 let packageInclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceInclusionBo, this.Request);
        //                 let inclusionDetails = await packageInclusionBo.
        //                     GetEncounterIPPackageServiceInclusions(packageInclusionApiReq);
        //                 let packageExclusionApiReq = {
        //                     Id: 0,
        //                     PageContext: { PageSize: 1000, PageNumber: 1 },
        //                     Params: [
        //                         {
        //                             Key: EncounterIPPackageServiceExclusionFilters.EncounterIPPackageDetailId,
        //                             Value: detailItem.Id
        //                         },
        //                         {
        //                             Key: EncounterIPPackageServiceExclusionFilters.ActiveStatusId,
        //                             Value: 2
        //                         },
        //                         {
        //                             Key: EncounterIPPackageServiceExclusionFilters.BillStatusId,
        //                             Value: 3
        //                         }
        //                     ]
        //                 };
        //                 let packageExclusionBo = BoFactory.GetBo(bo.EncounterIPPackageServiceExclusionBo, this.Request);
        //                 let exclusionDetails = await packageExclusionBo.GetEncounterIPPackageServiceExclusions(packageExclusionApiReq);
        //                 let nonmedicalApiReq = {
        //                     Id: 0,
        //                     PageContext: { PageSize: 10000, PageNumber: 1 },
        //                     Params: [{
        //                         Key: EncounterIPPackageServiceNonMedicalFilters.EncounterIPPackageDetailId,
        //                         Value: detailItem.Id
        //                     },
        //                     {
        //                         Key: EncounterIPPackageServiceNonMedicalFilters.ActiveStatusId,
        //                         Value: 2
        //                     },
        //                     {
        //                         Key: EncounterIPPackageServiceNonMedicalFilters.BillStatusId,
        //                         Value: 3
        //                     }]
        //                 };
        //                 let nonmedicalBo = BoFactory.GetBo(bo.EncounterIPPackageServiceNonMedicalBo, this.Request);
        //                 let nonmedicalDetails = await nonmedicalBo.GetEncounterIPPackageServiceNonMedicals(nonmedicalApiReq);
        //                 let billDetail = PackageSummaryBillMap[detailItem.ServiceCategoryId];
        //                 if (!billDetail) {
        //                     PackageServiceCategoryIds.push(detailItem.ServiceCategoryId);
        //                     billDetail = {
        //                         Id: 0,
        //                         EncounterId: req.Id,
        //                         IPPackageId: encounterPackageItem.IPPackageId,
        //                         ServiceCategoryId: detailItem.ServiceCategoryId,
        //                         Details: [],
        //                         InclusionAmount: 0,
        //                         ExclusionAmount: 0,
        //                         ActualAmount: 0,
        //                         ActualPatAmount: 0,
        //                         PackageAmount: 0,
        //                         EncounterIPPackageId: encounterPackageItem.Id,
        //                     };
        //                     PackageSummaryBillMap[detailItem.ServiceCategoryId] = billDetail;
        //                 }
        //                 inclusionDetails.Data.forEach((inclusive) => {
        //                     billDetail.InclusionAmount = billDetail.InclusionAmount
        //                         + parseFloat(inclusive.Amount.toString());
        //                 });
        //                 exclusionDetails.Data.forEach((exclusive) => {
        //                     billDetail.ExclusionAmount = billDetail.ExclusionAmount
        //                         + parseFloat(exclusive.TotalAmount.toString());
        //                     billDetail.PackageAmount = 0;
        //                     billDetail.InclusionAmount = 0;
        //                 });
        //                 nonmedicalDetails.Data.forEach((nonmed) => {
        //                     billDetail.ActualPatAmount = billDetail.ActualPatAmount
        //                         + parseFloat(nonmed.TotalAmount.toString());
        //                     billDetail.PackageAmount = 0;
        //                     billDetail.InclusionAmount = 0;
        //                     billDetail.ExclusionAmount = 0;
        //                 });
        //                 billDetail.ActualAmount = billDetail.ActualAmount +
        //                     parseFloat(detailItem.ActualAmount.toString());
        //                 billDetail.PackageAmount = billDetail.PackageAmount +
        //                     parseFloat(detailItem.PackageAmount.toString());
        //                 // billDetail.InclusionAmount = (billDetail.InclusionAmount === 0
        //                 //     ? billDetail.PackageAmount
        //                 //     : billDetail.InclusionAmount);
        //             })(packageDetailItem);
        //         }));
        //     })(encounterPackageItem);
        // }));
        // PackageServiceCategoryIds.forEach((ServiceCategoryId) => {
        //     let summary = PackageSummaryBillMap[ServiceCategoryId];
        //     PackageSummaryBill.push(summary);
        // });
        let packageSummaryBo = BoFactory.GetBo(billingBo.PatientBillPackageSummaryBo, this.Request);
        let packageBillSummary: boolean = false;
        packageBillSummary = await packageSummaryBo.UpdateBillSummary(req, patientBillDetails, PackageItem);
        if (PackageItem.IsUnlimitedServices) {
            for (let pdx in patientBillDetails.Data) {
                let billdet = patientBillDetails.Data[pdx];
                if (!billdet.IsInclusionItem && !billdet.IsExclusionItem && !billdet.IsSupplementary) {
                    let detUpdate: any = {
                        Id: billdet.Id,
                        IsInclusionItem: true
                    };
                    await patientBillDetailsBo.Update(detUpdate);
                }
            }
        }
        return true;
    }

    public async PrintIPPatientPackageDetails(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withoutHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonmedical) ? req.Data.nonmedical : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.insuranceBill) ? req.Data.insuranceBill : 0,
            bothBill: (req.Data.bothBill) ? req.Data.bothBill : 0,
        };
        let isFinalized = req.Data.isFinalized;
        let clientCode = 'sdh';
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id },
            { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }]
        };
        let data = await this.GetEncounterIPPackages(apiReq);
        let EncounterIPPackages: any = [];
        let IPPackageIds: any = [];
        for (let pdx in data.Data) {
            let packInfo = data.Data[pdx];
            if (packInfo.IPPackageDescription === '') {
                packInfo.IPPackageDescription = null;
            }
            EncounterIPPackages.push(packInfo);
            IPPackageIds.push(packInfo.Id);
        }

        let EncPackageData = data.Data[0];
        let EncounterIPPackageDetailBo = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);
        let TotnonmedicAmt: number = 0;
        let encounterpackagedetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: EncPackageData.Id }]
        };
        let EncounterIPPackageDetailsData = await EncounterIPPackageDetailBo.GetEncounterIPPackageDetails(encounterpackagedetailReq);
        // console.log('****EncounterIPPackageDetailsData***',EncounterIPPackageDetailsData);
        let EncounterIPPackageDetails: any = [];
        let TotalActualAmount: number = 0;
        let TotalPackageAmount: number = 0;
        // let ServiceCategoryName:'';
        EncounterIPPackageDetailsData.Data.forEach((Detail: any) => {
            if (Detail.IPPackageDetailId === 0) {
                let PatientEncounterIPPackageDetail = Detail;
                TotalActualAmount += Detail.ActualAmount;
                TotalPackageAmount += Detail.PackageAmount;
                EncounterIPPackageDetails.push(PatientEncounterIPPackageDetail);
            }
        });
        let splitItemGrossAmt = 0;
        let patientbillpackagesummarybo = BoFactory.GetBo(billingBo.PatientBillPackageSummaryBo, this.Request);
        let patientbillpackagesummaryReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                // { Key: PatientBillPackageSummaryFilters.EncounterIPPackageId, Value: EncPackageData.Id }
                { Key: PatientBillPackageSummaryFilters.EncounterIPPackagees, Value: IPPackageIds }
            ]
        };
        let PatientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        let PatientBillPackageSummaryData = await patientbillpackagesummarybo.GetPatientBillPackageSummarys(patientbillpackagesummaryReq);
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        // let billSummaryBo = BoFactory.GetBo(billingBO.PatientBillSummaryBo, this.Request);
        let BillDetails: any = [];
        let NmdBillDetails: any = [];
        await Promise.all(PatientBillPackageSummaryData.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                let summaryTotal: number = 0;
                let splitDetails: any = [];
                let nonMedDetails: any = [];
                let TotalGrossAmount: number = 0;
                let TotalNetAmount: number = 0;
                // let RoundOffValue: number = 0;
                let TotalDiscount: number = 0;
                let NetVal: number = 0;
                let TotSupplmDisc: number = 0;
                let TotExcAmt: number = 0;
                splitItemGrossAmt += summary.ExclusionAmount;
                // let PatientBillSplitDetailsBo = BoFactory.GetBo(billingBo.PatientBillSplitDetailsBo, this.Request);
                // let splitReq = {
                //     Id: 0,
                //     PageContext: { PageSize: -1, PageNumber: 1 },
                //     Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: bill.Id }]
                // };
                // console.log('********req.Data.isSupplementary*******', req.Data.isSupplementary);
                // if (req.Data.isSupplementary)
                //     splitReq.Params.push({ Key: PatientBillSplitDetailsFilters.IsSupplementary, Value: req.Data.isSupplementary });
                // let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetPatientBillSplitDetails(splitReq);
                // await Promise.all(BillSplitDetailsData.Data.map((billItem): Promise<void> => {
                //     return (async (split): Promise<void> => {
                let billDetailReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillDetailsFilters.ServiceCategoryId, Value: bill.ServiceCategoryId },
                    { Key: PatientBillDetailsFilters.EncounterId, Value: bill.EncounterId },
                    { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
                    { Key: PatientBillDetailsFilters.Quantity, Value: '0' },
                    { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },]
                };
                let DetailData = await PatientBillDetailsBo.GetPatientBillDetails(billDetailReq);
                if (DetailData.Data.length > 0) {
                    for (let bdx in DetailData.Data) {
                        let BillDetail: any = DetailData.Data[bdx];
                        let discAmtSuppl: number = 0;
                        let discAmt: number = 0;
                        if (req.Data.isSupplementary) {
                            NetVal = BillDetail.PatNetAmount;
                        } else if (BillDetail.InsNetAmount > 0) {
                            NetVal = BillDetail.InsNetAmount;
                        } else {
                            NetVal = BillDetail.NetAmount;
                        }
                        if (req.Data.isSupplementary) {
                            if (BillDetail.IsSupplementary && BillDetail.DiscountAmount > 0) {
                                discAmtSuppl = BillDetail.DiscountAmount - (BillDetail.AgreementDiscountAmt || 0);
                            }
                            if (BillDetail.IsSupplementary && BillDetail.AgreementDiscountAmt > 0) {
                                discAmtSuppl = BillDetail.AgreementDiscountAmt || 0;
                            }
                        } else {
                            if (!BillDetail.IsSupplementary && BillDetail.DiscountAmount > 0) {
                                discAmt = BillDetail.DiscountAmount;
                            }
                            if (!BillDetail.IsSupplementary && BillDetail.AgreementDiscountAmt > 0) {
                                discAmt = BillDetail.AgreementDiscountAmt;
                            }
                        }
                        if (BillDetail.IsSupplementary) {
                            TotnonmedicAmt += BillDetail.NetAmount;
                        }
                        TotalGrossAmount += BillDetail.GrossAmount;
                        // TotalInsuranceAmount += BillDetail.InsuranceAmount;
                        // TotalPatientAmount += BillDetail.PatientAmount;
                        TotalDiscount += discAmt;
                        TotSupplmDisc += discAmtSuppl;
                        TotalNetAmount += BillDetail.GrossAmount - discAmt;

                        if (!BillDetail.IsSupplementary) {
                            if (BillDetail.IsExclusionItem) {
                                TotExcAmt += BillDetail.NetAmount;
                                summaryTotal += BillDetail.GrossAmount - discAmt;
                                splitDetails.push(BillDetail);
                            }
                        }
                        if (BillDetail.IsSupplementary) {
                            nonMedDetails.push(BillDetail);
                        }
                    }
                }
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                // let withpharmacysales: any = [];
                let orderbydatespldet = _.orderBy(splitDetails, ['ServiceId', 'BillDateTime']);
                // let roomGroups: any = {};
                // let serviceitemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                // await Promise.all(orderbydatespldet.map((orderbydatespldetItem: any): Promise<void> => {
                //     return (async (detail): Promise<void> => {
                //         if (detail.ServiceId > 0) {
                //             let bIsRoomCharge: boolean = false;
                //             let servReq = {
                //                 Id: 0,
                //                 PageContext: { PageSize: -1, PageNumber: 1 },
                //                 Params: [{ Key: 0, Value: detail.ServiceId }]
                //             };
                //             console.log('********7*******');
                //             let Servicedata = await serviceitemBo.GetServiceItems(servReq);
                //             if (Servicedata.Data.length > 0) {
                //                 let ServiceInfo: any = Servicedata.Data[0];
                //                 detail.IsDoctorDisplay = ServiceInfo.IsDoctorDisplay;
                //                 // if (ServiceInfo) {
                //                 //     if (ServiceInfo.IsBedCharge) {
                //                 //         bIsRoomCharge = true;
                //                 //         let dateformat = 'DD/MM/YYYY';
                //                 //         if (roomGroups[detail.ServiceId]) {
                //                 //             let billdt = moment(detail.BillDateTime).format(dateformat);
                //                 //             roomGroups[detail.ServiceId].BTDt = billdt;
                //                 //             roomGroups[detail.ServiceId].Quantity += detail.Quantity;
                //                 //             roomGroups[detail.ServiceId].Amount += detail.GrossAmount;
                //                 //             roomGroups[detail.ServiceId].DiscountAmount += detail.DiscountAmount;
                //                 //             roomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                //                 //             roomGroups[detail.ServiceId].NetAmount +=
                //                 //                 (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                //                 //         } else {
                //                 //             roomGroups[detail.ServiceId] = roomGroups[detail.ServiceId] || [];
                //                 //             let billdt1 = moment(detail.BillDateTime).format(dateformat);
                //                 //             roomGroups[detail.ServiceId].ServiceName = detail.ServiceName;
                //                 //             roomGroups[detail.ServiceId].BFDt = billdt1;
                //                 //             roomGroups[detail.ServiceId].BTDt = billdt1;
                //                 //             roomGroups[detail.ServiceId].User = detail.User;
                //                 //             roomGroups[detail.ServiceId].BillDateTime = detail.BillDateTime;
                //                 //             roomGroups[detail.ServiceId].Quantity = detail.Quantity;
                //                 //             roomGroups[detail.ServiceId].Rate = detail.Rate;
                //                 //             roomGroups[detail.ServiceId].Amount = detail.GrossAmount;
                //                 //             roomGroups[detail.ServiceId].DiscountAmount = detail.DiscountAmount;
                //                 //             roomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                //                 //             roomGroups[detail.ServiceId].NetAmount =
                //                 //                 (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                //                 //             roomGroups[detail.ServiceId].Id = detail.Id;
                //                 //             detail.Amount = detail.GrossAmount;
                //                 //             detail.NetAmount =
                //                 //                 detail.GrossAmount - (detail.DiscountAmount || 0)
                //  - (detail.AgreementDiscountAmt || 0);
                //                 //             withpharmacysales.push(detail);
                //                 //         }
                //                 //     }
                //                 // }
                //             }
                //             console.log('********8*******');
                //             if (!detail.IsDoctorDisplay && !bIsRoomCharge) {
                //                 detail.User = null;
                //                 detail.Amount = detail.GrossAmount;
                //                 detail.NetAmount =
                //                     detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                //                 withpharmacysales.push(detail);
                //             } else if (detail.IsDoctorDisplay && !bIsRoomCharge) {
                //                 detail.Amount = detail.GrossAmount;
                //                 detail.NetAmount =
                //                     detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                //                 withpharmacysales.push(detail);
                //             } else {
                //                 for (let indx in withpharmacysales) {
                //                     if (withpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                //                         withpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName;
                //                         withpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                //                         withpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                //                         withpharmacysales[indx].Amount = roomGroups[detail.ServiceId].Amount;
                //                         withpharmacysales[indx].DiscountAmount = roomGroups[detail.ServiceId].DiscountAmount;
                //                         withpharmacysales[indx].AgreementDiscountAmt = roomGroups[detail.ServiceId].AgreementDiscountAmt;
                //                         withpharmacysales[indx].NetAmount =
                //                             roomGroups[detail.ServiceId].NetAmount;
                //                     }
                //                 }
                //             }
                //         }
                //     })(orderbydatespldetItem);
                // }));
                console.log('********9*******');
                let nondrugdetails: any = [];
                for (let idx in orderbydatespldet) {
                    let drugitems = orderbydatespldet[idx];
                    // if (!drugitems.IsPharmacySale && !drugitems.IsPharmacyReturn) {
                    if (req.Data.IsSupplementary) {
                        drugitems.NetValue = drugitems.PatNetAmount;
                    } else if (drugitems.InsNetAmount > 0) {
                        drugitems.NetValue = drugitems.InsNetAmount;
                    } else {
                        drugitems.NetValue = drugitems.NetAmount;
                    }
                    nondrugdetails.push(drugitems);
                    // }
                }
                summary['SplitedValue'] = nondrugdetails;

                // let nmdwithpharmacysales: any = [];
                let nmdorderbydatespldet = _.orderBy(nonMedDetails, ['ServiceId', 'BillDateTime']);
                // let nmdroomGroups: any = {};
                // await Promise.all(nmdorderbydatespldet.map((nmdorderbydatespldetItem: any): Promise<void> => {
                //     return (async (detail): Promise<void> => {
                //         if (detail.ServiceId > 0) {
                //             let bIsRoomCharge: boolean = false;
                //             let servReq = {
                //                 Id: 0,
                //                 PageContext: { PageSize: -1, PageNumber: 1 },
                //                 Params: [{ Key: 0, Value: detail.ServiceId }]
                //             };
                //             console.log('********7*******');
                //             let Servicedata = await serviceitemBo.GetServiceItems(servReq);
                //             if (Servicedata.Data.length > 0) {
                //                 let ServiceInfo: any = Servicedata.Data[0];
                //                 detail.IsDoctorDisplay = ServiceInfo.IsDoctorDisplay;
                //                 if (ServiceInfo) {
                //                     if (ServiceInfo.IsBedCharge) {
                //                         bIsRoomCharge = true;
                //                         let dateformat = 'DD/MM/YYYY';
                //                         if (nmdroomGroups[detail.ServiceId]) {
                //                             let billdt = moment(detail.BillDateTime).format(dateformat);
                //                             nmdroomGroups[detail.ServiceId].BTDt = billdt;
                //                             nmdroomGroups[detail.ServiceId].Quantity += detail.Quantity;
                //                             nmdroomGroups[detail.ServiceId].Amount += detail.GrossAmount;
                //                             nmdroomGroups[detail.ServiceId].DiscountAmount += detail.DiscountAmount;
                //                             nmdroomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                //                             nmdroomGroups[detail.ServiceId].NetAmount +=
                //                                 (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                //                         } else {
                //                             nmdroomGroups[detail.ServiceId] = nmdroomGroups[detail.ServiceId] || [];
                //                             let billdt1 = moment(detail.BillDateTime).format(dateformat);
                //                             nmdroomGroups[detail.ServiceId].ServiceName = detail.ServiceName;
                //                             nmdroomGroups[detail.ServiceId].BFDt = billdt1;
                //                             nmdroomGroups[detail.ServiceId].BTDt = billdt1;
                //                             nmdroomGroups[detail.ServiceId].User = detail.User;
                //                             nmdroomGroups[detail.ServiceId].BillDateTime = detail.BillDateTime;
                //                             nmdroomGroups[detail.ServiceId].Quantity = detail.Quantity;
                //                             nmdroomGroups[detail.ServiceId].Rate = detail.Rate;
                //                             nmdroomGroups[detail.ServiceId].Amount = detail.GrossAmount;
                //                             nmdroomGroups[detail.ServiceId].DiscountAmount = detail.DiscountAmount;
                //                             nmdroomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                //                             nmdroomGroups[detail.ServiceId].NetAmount =
                //                                 (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                //                             nmdroomGroups[detail.ServiceId].Id = detail.Id;
                //                             detail.Amount = detail.GrossAmount;
                //                             detail.NetAmount =
                //                                 detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                //                             nmdwithpharmacysales.push(detail);
                //                         }
                //                     }
                //                 }
                //             }
                //             console.log('********8*******');
                //             if (!detail.IsDoctorDisplay && !bIsRoomCharge) {
                //                 detail.User = null;
                //                 detail.Amount = detail.GrossAmount;
                //                 detail.NetAmount =
                //                     detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                //                 nmdwithpharmacysales.push(detail);
                //             } else if (detail.IsDoctorDisplay && !bIsRoomCharge) {
                //                 detail.Amount = detail.GrossAmount;
                //                 detail.NetAmount =
                //                     detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                //                 nmdwithpharmacysales.push(detail);
                //             } else {
                //                 for (let indx in nmdwithpharmacysales) {
                //                     if (nmdwithpharmacysales[indx].Id === nmdroomGroups[detail.ServiceId].Id) {
                //                         nmdwithpharmacysales[indx].ServiceName = nmdroomGroups[detail.ServiceId].ServiceName;
                //                         nmdwithpharmacysales[indx].Quantity = nmdroomGroups[detail.ServiceId].Quantity;
                //                         nmdwithpharmacysales[indx].Rate = nmdroomGroups[detail.ServiceId].Rate;
                //                         nmdwithpharmacysales[indx].Amount = nmdroomGroups[detail.ServiceId].Amount;
                //                         nmdwithpharmacysales[indx].DiscountAmount = nmdroomGroups[detail.ServiceId].DiscountAmount;
                //                         nmdwithpharmacysales[indx].AgreementDiscountAmt =
                //                             nmdroomGroups[detail.ServiceId].AgreementDiscountAmt;
                //                         nmdwithpharmacysales[indx].NetAmount =
                //                             nmdroomGroups[detail.ServiceId].NetAmount;
                //                     }
                //                 }
                //             }
                //         }
                //     })(nmdorderbydatespldetItem);
                // }));
                console.log('********9*******');
                let nmdnondrugdetails: any = [];
                for (let idx in nmdorderbydatespldet) {
                    let drugitems = nmdorderbydatespldet[idx];
                    // if (!drugitems.IsPharmacySale && !drugitems.IsPharmacyReturn) {
                    if (req.Data.IsSupplementary) {
                        drugitems.NetValue = drugitems.PatNetAmount;
                    } else if (drugitems.InsNetAmount > 0) {
                        drugitems.NetValue = drugitems.InsNetAmount;
                    } else {
                        drugitems.NetValue = drugitems.NetAmount;
                    }
                    nmdnondrugdetails.push(drugitems);
                    // }
                }
                summary['NonMedSplitedValue'] = nmdnondrugdetails;
                summary['Amount'] = summaryTotal;
                summary['ExclusionAmount'] = TotExcAmt;
                summary['NonMedAmount'] = TotnonmedicAmt;

                if (splitDetails.length > 0) {
                    BillDetails.push(summary);
                }

                if (nonMedDetails.length > 0) {
                    NmdBillDetails.push(summary);
                }

                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                BillDetails.sort(custom_sort);
            })(splitItem);
        }));
        // let BillDetails = [];
        let billReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
            // { Key: PatientBillsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillsFilters.BillType, Value: 2 }
            ]
        };
        let PatientBillsBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(billReq);
        let patientBillData = PatientBillsData.Data[0];
        let DetailRate = 0;
        let DetailAmount = 0;
        let DetailGrossAmount = 0;
        let BillDiscAmt = 0;
        let MouDisc = 0;
        let Advance: number = 0;
        let DueCollect: number = 0;
        let DrugAdvAmount: number = 0;
        let PaidAmount: number = 0;
        let ReceiptDetails = [];
        let CoPayAmount: number = 0;
        let InsCreditApproved: number = 0;
        if (patientBillData) {
            CoPayAmount = patientBillData.CoPayAmount;
            InsCreditApproved = patientBillData.CreditApproved;
            BillDiscAmt = patientBillData.BillDiscount;
            MouDisc = patientBillData.AgreementDiscountAmt || 0;
        }
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
            { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
        };
        // console.log('********10*******');
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        for (let idx in PatientPaymentDetailsData.Data) {
            let ReceiptItem = PatientPaymentDetailsData.Data[idx];
            if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                PaidAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 1) {
                Advance += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 7) {
                DrugAdvAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 3)
                DueCollect += PatientPaymentDetailsData.Data[idx].AmountPaid;
            ReceiptDetails.push(ReceiptItem);
        }
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 },
            { Key: PatientRefundFilters.IsCashToCredit, Value: false }]
        };
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let RefundDetails = [];
        let PatientRefundBo = BoFactory.GetBo(billingBo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (var idx1 in PatientRefundData.Data) {
            var RefundItem = PatientRefundData.Data[idx1];
            if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            }
            if (PatientRefundData.Data[idx1].RefundTypeId === 1 || PatientRefundData.Data[idx1].RefundTypeId === 4)
                PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            RefundDetails.push(RefundItem);
        }
        let encounterReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: EncPackageData.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(bo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encounterReq);
        let Encounter = encounterData.Data[0];
        let TotalAmount: number = 0;
        let TotGrossAmount: number = 0;
        for (let edx in EncounterIPPackages) {
            let encPackage = EncounterIPPackages[edx];
            TotalAmount = TotalAmount + encPackage.PackageAmount;
        }
        let InsNetAmount: number = 0;

        // DetailAmount = DetailAmount + EncounterIPPackages.PackageAmount;
        // let TotGrossAmount = EncounterIPPackages.PackageAmount + BillDiscAmt + splitItemGrossAmt; changes made by Rajesh
        TotGrossAmount = TotalAmount + splitItemGrossAmt;
        let TotNetAmount: number = 0;
        if (Encounter.GuarantorTypeId === 1) {
            TotNetAmount = Math.round(TotGrossAmount - BillDiscAmt);
        }
        if (Encounter.GuarantorTypeId > 1) {
            TotNetAmount = Math.round(TotGrossAmount - BillDiscAmt) + TotnonmedicAmt;
        }
        if (Encounter.GuarantorTypeId > 1 && isFinalized) {
            InsNetAmount = Math.round(TotNetAmount - patientBillData.CreditApproved || 0);
        }
        let BalanceAmount: any;
        if (!isFinalized) {
            BalanceAmount = Math.round(TotNetAmount) - Math.round(PaidAmount);
        }
        if (isFinalized) {
            BalanceAmount = Math.round(patientBillData.OutStandingAmount);
        }
        let billNum: any;
        let billDate: any;
        if (!isFinalized) {
            billNum = '[PROVISIONAL BILL]';
            billDate = '[PROVISIONAL BILL]';
        }
        if (isFinalized) {
            billNum = patientBillData.BillNumber;
            billDate = patientBillData.BillDateTime;
        }
        let Header: any;
        if (req.Data.PrintCode && clientCode) {
            if (req.Data.PrintCode === clientCode) {
                if (!isFinalized) {
                    Header = 'Tax Invoice/Bill of Supply PROVISIONAL BILL';
                } else {
                    Header = 'Tax Invoice/Bill of Supply FINAL BILL';
                }
            } else {
                if (!isFinalized) {
                    Header = 'IP PACKAGE PROVISIONAL BILL';
                } else {
                    Header = 'IP PACKAGE FINAL BILL';
                }
            }
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            Encounter: Encounter,
            EncounterIPPackages: EncounterIPPackages,
            EncPackageData: EncPackageData,
            EncounterIPPackageDetails: EncounterIPPackageDetails,
            TotalActualAmount: TotalActualAmount,
            TotalPackageAmount: TotalPackageAmount,
            PatientPaymentDetails: ReceiptDetails,
            PatientRefund: PatientRefundData.Data,
            RefundAmount: RefundAmount,
            TotalAmount: TotalAmount,
            TotnonmedicAmt: TotnonmedicAmt,
            BalanceAmount: BalanceAmount,
            DueCollect: Math.round(DueCollect),
            PaidAmount: Math.round(PaidAmount),
            Advance: Math.round(Advance),
            DrugAdvAmount: Math.round(DrugAdvAmount),
            BillDetails: BillDetails,
            NmdBillDetails: NmdBillDetails,
            DetailRate: DetailRate,
            DetailAmount: DetailAmount,
            BillDiscAmt: BillDiscAmt,
            MouDisc: MouDisc,
            TotGrossAmount: TotGrossAmount,
            splitItemGrossAmt: splitItemGrossAmt,
            TotNetAmount: TotNetAmount,
            InsCreditApproved: InsCreditApproved,
            CoPayAmount: CoPayAmount,
            // PrintUser: PrintUser.Data[0],
            DetailGrossAmount: DetailGrossAmount,
            Preferences: printPreferencesData,
            Flags: flags,
            billNum: billNum,
            billDate: billDate,
            Header: Header,
            isFinalized: isFinalized,
            patientBillData: patientBillData,
            InsNetAmount: InsNetAmount
        };
        console.log('****BillDetails****', BillDetails);
        let key = 'inpatientpackagedetails';
        if (!isFinalized) {
            key = 'inpatientpackagedetails(i)';
        }

        if (info.Flags.bothBill) {
            key = 'inpatientfullpackagedetails';
        }
        if (req.Data.isGuarantor) {
            if (!isFinalized) {
                key = 'inpatientpackagedetailsGuarantor(i)';
            } else {
                key = 'inpatientpackagedetailsGuarantor';
            }
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (info.Flags.header === 0) {
            pdfOptionJSON = await Report.GetPdfOptionWoh(key);
        }
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintIPPatientInclusionPackageDetails(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
            payment: (req.Data.paymentDetail) ? req.Data.paymentDetail : 0,
            nonmedical: (req.Data.nonmedical) ? req.Data.nonmedical : 0,
            patientbill: (req.Data.patientBill) ? req.Data.patientBill : 0,
            insurancebill: (req.Data.patientBill) ? req.Data.insuranceBill : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageFilters.EncounterId, Value: req.Id },
            { Key: EncounterIPPackageFilters.ActiveStatusId, Value: 2 }
            ]
        };
        let data = await this.GetEncounterIPPackages(apiReq);
        let EncounterIPPackages: any = [];
        for (let pdx in data.Data) {
            let packInfo = data.Data[pdx];
            if (packInfo.IPPackageDescription === '') {
                packInfo.IPPackageDescription = null;
            }
            EncounterIPPackages.push(packInfo);
        }
        let enpacId = data.Data[0];
        let EncounterIPPackageDetailBo = BoFactory.GetBo(bo.EncounterIPPackageDetailBo, this.Request);

        let encounterpackagedetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterIPPackageDetailFilters.EncounterIPPackageId, Value: enpacId.Id }]
        };
        let EncounterIPPackageDetailsData = await EncounterIPPackageDetailBo.GetEncounterIPPackageDetails(encounterpackagedetailReq);
        // console.log('****EncounterIPPackageDetailsData***',EncounterIPPackageDetailsData);
        let EncounterIPPackageDetails: any = [];
        let TotalActualAmount: number = 0;
        let TotalPackageAmount: number = 0;
        // let ServiceCategoryName:'';
        EncounterIPPackageDetailsData.Data.forEach((Detail: any) => {
            if (Detail.IPPackageDetailId === 0) {
                let PatientEncounterIPPackageDetail = Detail;
                TotalActualAmount += Detail.ActualAmount;
                TotalPackageAmount += Detail.PackageAmount;
                // ServiceCategoryName = Detail.ServiceCategory.ServiceCategoryName;
                EncounterIPPackageDetails.push(PatientEncounterIPPackageDetail);
            }
        });
        // console.log('****EncounterIPPackageDetails***', EncounterIPPackageDetails);

        let patientbillpackagesummarybo = BoFactory.GetBo(billingBo.PatientBillPackageSummaryBo, this.Request);

        let patientbillpackagesummaryReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillPackageSummaryFilters.EncounterIPPackageId, Value: enpacId.Id }]
        };
        let PatientBillDetailsBo = BoFactory.GetBo(billingBo.PatientBillDetailsBo, this.Request);
        let PatientBillPackageSummaryData = await patientbillpackagesummarybo.GetPatientBillPackageSummarys(patientbillpackagesummaryReq);
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        // let billSummaryBo = BoFactory.GetBo(billingBO.PatientBillSummaryBo, this.Request);
        let BillDetails: any = [];
        let splitItemGrossAmt = 0;
        let splitExclusionAmt = 0;
        await Promise.all(PatientBillPackageSummaryData.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                let summaryTotal: number = 0;
                let splitDetails: any = [];
                let TotalGrossAmount: number = 0;
                let TotalNetAmount: number = 0;
                // let RoundOffValue: number = 0;
                let TotalDiscount: number = 0;
                let NetVal: number = 0;
                let TotSupplmDisc: number = 0;
                splitItemGrossAmt += summary.InclusionAmount;
                splitExclusionAmt += summary.ExclusionAmount;
                // let PatientBillSplitDetailsBo = BoFactory.GetBo(billingBo.PatientBillSplitDetailsBo, this.Request);
                // let splitReq = {
                //     Id: 0,
                //     PageContext: { PageSize: -1, PageNumber: 1 },
                //     Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: bill.Id }]
                // };
                // console.log('********req.Data.isSupplementary*******', req.Data.isSupplementary);
                // if (req.Data.isSupplementary)
                //     splitReq.Params.push({ Key: PatientBillSplitDetailsFilters.IsSupplementary, Value: req.Data.isSupplementary });
                // let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetPatientBillSplitDetails(splitReq);
                // await Promise.all(BillSplitDetailsData.Data.map((billItem): Promise<void> => {
                //     return (async (split): Promise<void> => {
                let billDetailReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillDetailsFilters.ServiceCategoryId, Value: bill.ServiceCategoryId },
                    { Key: PatientBillDetailsFilters.EncounterId, Value: bill.EncounterId },
                    { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
                    { Key: PatientBillDetailsFilters.Quantity, Value: '0' },
                    { Key: PatientBillDetailsFilters.IsTempIPBill, Value: true },]
                };
                let DetailData = await PatientBillDetailsBo.GetPatientBillDetails(billDetailReq);
                if (DetailData.Data.length > 0) {
                    for (let bdx in DetailData.Data) {
                        let BillDetail: any = DetailData.Data[bdx];
                        let discAmtSuppl: number = 0;
                        let discAmt: number = 0;
                        if (req.Data.isSupplementary) {
                            NetVal = BillDetail.PatNetAmount;
                        } else if (BillDetail.InsNetAmount > 0) {
                            NetVal = BillDetail.InsNetAmount;
                        } else {
                            NetVal = BillDetail.NetAmount;
                        }
                        if (req.Data.isSupplementary) {
                            if (BillDetail.IsSupplementary && BillDetail.DiscountAmount > 0) {
                                discAmtSuppl = BillDetail.DiscountAmount - (BillDetail.AgreementDiscountAmt || 0);
                            }
                            if (BillDetail.IsSupplementary && BillDetail.AgreementDiscountAmt > 0) {
                                discAmtSuppl = BillDetail.AgreementDiscountAmt || 0;
                            }
                        } else {
                            if (!BillDetail.IsSupplementary && BillDetail.DiscountAmount > 0) {
                                discAmt = BillDetail.DiscountAmount;
                            }
                            if (!BillDetail.IsSupplementary && BillDetail.AgreementDiscountAmt > 0) {
                                discAmt = BillDetail.AgreementDiscountAmt;
                            }
                        }
                        TotalGrossAmount += BillDetail.GrossAmount;
                        // TotalInsuranceAmount += BillDetail.InsuranceAmount;
                        // TotalPatientAmount += BillDetail.PatientAmount;
                        TotalDiscount += discAmt;
                        TotSupplmDisc += discAmtSuppl;
                        TotalNetAmount += BillDetail.GrossAmount - discAmt;
                        if (!req.Data.nonmedical) {
                            if (!BillDetail.IsSupplementary && BillDetail.IsInclusionItem) {
                                summaryTotal += BillDetail.GrossAmount - discAmt;
                            }
                        } else {
                            summaryTotal += BillDetail.GrossAmount - discAmt;
                        }
                        if (BillDetail.IsInclusionItem) {
                            splitDetails.push(BillDetail);
                        }
                    }
                }
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;
                let withpharmacysales: any = [];
                let orderbydatespldet = _.orderBy(splitDetails, ['ServiceId', 'BillDateTime']);
                let roomGroups: any = {};
                let serviceitemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                await Promise.all(orderbydatespldet.map((orderbydatespldetItem: any): Promise<void> => {
                    return (async (detail): Promise<void> => {
                        if (detail.ServiceId > 0) {
                            let bIsRoomCharge: boolean = false;
                            let servReq = {
                                Id: 0,
                                PageContext: { PageSize: -1, PageNumber: 1 },
                                Params: [{ Key: 0, Value: detail.ServiceId }]
                            };
                            console.log('********7*******');
                            let Servicedata = await serviceitemBo.GetServiceItems(servReq);
                            if (Servicedata.Data.length > 0) {
                                let ServiceInfo: any = Servicedata.Data[0];
                                detail.IsDoctorDisplay = ServiceInfo.IsDoctorDisplay;
                                if (ServiceInfo) {
                                    if (ServiceInfo.IsBedCharge) {
                                        bIsRoomCharge = true;
                                        let dateformat = 'DD/MM/YYYY';
                                        if (roomGroups[detail.ServiceId]) {
                                            let billdt = moment(detail.BillDateTime).format(dateformat);
                                            roomGroups[detail.ServiceId].BTDt = billdt;
                                            roomGroups[detail.ServiceId].Quantity = detail.Quantity;
                                            roomGroups[detail.ServiceId].Amount += detail.GrossAmount;
                                            roomGroups[detail.ServiceId].DiscountAmount += detail.DiscountAmount;
                                            roomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                                            roomGroups[detail.ServiceId].NetAmount +=
                                                (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                                        } else {
                                            roomGroups[detail.ServiceId] = roomGroups[detail.ServiceId] || [];
                                            let billdt1 = moment(detail.BillDateTime).format(dateformat);
                                            roomGroups[detail.ServiceId].ServiceName = detail.ServiceName;
                                            roomGroups[detail.ServiceId].BFDt = billdt1;
                                            roomGroups[detail.ServiceId].BTDt = billdt1;
                                            roomGroups[detail.ServiceId].User = detail.User;
                                            roomGroups[detail.ServiceId].BillDateTime = detail.BillDateTime;
                                            roomGroups[detail.ServiceId].Quantity = detail.Quantity;
                                            roomGroups[detail.ServiceId].Rate = detail.Rate;
                                            roomGroups[detail.ServiceId].Amount += detail.GrossAmount;
                                            roomGroups[detail.ServiceId].DiscountAmount += detail.DiscountAmount;
                                            roomGroups[detail.ServiceId].AgreementDiscountAmt += detail.AgreementDiscountAmt;
                                            roomGroups[detail.ServiceId].NetAmount +=
                                                (detail.GrossAmount - detail.DiscountAmount - (detail.AgreementDiscountAmt || 0));
                                            roomGroups[detail.ServiceId].Id = detail.Id;
                                            detail.Amount += detail.GrossAmount;
                                            detail.NetAmount +=
                                                detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                                            withpharmacysales.push(detail);
                                        }
                                    }
                                }
                            }
                            console.log('********8*******');
                            if (!detail.IsDoctorDisplay && !bIsRoomCharge) {
                                detail.User = null;
                                detail.Amount += detail.GrossAmount;
                                detail.NetAmount +=
                                    detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                                withpharmacysales.push(detail);
                            } else if (detail.IsDoctorDisplay && !bIsRoomCharge) {
                                detail.Amount += detail.GrossAmount;
                                detail.NetAmount +=
                                    detail.GrossAmount - (detail.DiscountAmount || 0) - (detail.AgreementDiscountAmt || 0);
                                withpharmacysales.push(detail);
                            } else {
                                for (let indx in withpharmacysales) {
                                    if (withpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                                        withpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName;
                                        withpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                                        withpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                                        withpharmacysales[indx].Amount += roomGroups[detail.ServiceId].Amount;
                                        withpharmacysales[indx].DiscountAmount += roomGroups[detail.ServiceId].DiscountAmount;
                                        withpharmacysales[indx].AgreementDiscountAmt += roomGroups[detail.ServiceId].AgreementDiscountAmt;
                                        withpharmacysales[indx].NetAmount +=
                                            roomGroups[detail.ServiceId].NetAmount;
                                    }
                                }
                            }
                        }
                    })(orderbydatespldetItem);
                }));
                console.log('********9*******');
                let nondrugdetails: any = [];
                for (let idx in withpharmacysales) {
                    let drugitems = withpharmacysales[idx];
                    // if (!drugitems.IsPharmacySale && !drugitems.IsPharmacyReturn) {
                    if (req.Data.IsSupplementary) {
                        drugitems.NetValue = drugitems.PatNetAmount;
                    } else if (drugitems.InsNetAmount > 0) {
                        drugitems.NetValue = drugitems.InsNetAmount;
                    } else {
                        drugitems.NetValue = drugitems.NetAmount;
                    }
                    nondrugdetails.push(drugitems);
                    // }
                }
                summary['SplitedValue'] = nondrugdetails;
                summary['Amount'] = summaryTotal;
                if (splitDetails.length > 0)
                    BillDetails.push(summary);


                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.ServiceCategory.DisplayOrder) - parseInt(b.ServiceCategory.DisplayOrder);
                };
                BillDetails.sort(custom_sort);
            })(splitItem);
        }));
        // let BillDetails = [];
        let billReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
            // { Key: PatientBillsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientBillsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillsFilters.BillType, Value: 2 }]
        };
        // console.log('********10*******');
        let PatientBillsBo = BoFactory.GetBo(billingBo.PatientBillsBo, this.Request);
        let PatientBillsData = await PatientBillsBo.GetPatientBills(billReq);
        let patientBillData = PatientBillsData.Data[0];
        // console.log('****PatientBillsData***',PatientBillsData.Data);
        let DetailRate = 0;
        let DetailAmount = 0;
        let DetailGrossAmount = 0;
        let BillDiscAmt = 0;
        let CoPayAmount: number = 0;
        let InsCreditApproved: number = 0;
        if (patientBillData) {
            CoPayAmount = patientBillData.CoPayAmount;
            InsCreditApproved = patientBillData.CreditApproved;
            BillDiscAmt = patientBillData.BillDiscount;
        }
        let DueCollect: number = 0;
        let PaidAmount: number = 0;
        let Advance: number = 0;
        let DrugAdvAmount: number = 0;
        let ReceiptDetails = [];
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.EncounterTypeId, Value: 2 },
            { Key: PatientPaymentDetailsFilters.IsPharmacyReceipt, Value: false },
            { Key: PatientPaymentDetailsFilters.IsConsolidatePay, Value: false },
            { Key: PatientPaymentDetailsFilters.StatusOfReceipts, Value: [1, 4] }]
        };
        // console.log('********10*******');
        let PatientPaymentDetailsBo = BoFactory.GetBo(billingBo.PatientPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        for (let idx in PatientPaymentDetailsData.Data) {
            let ReceiptItem = PatientPaymentDetailsData.Data[idx];
            if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                PaidAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 1) {
                Advance += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 7) {
                DrugAdvAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
            }
            if (PatientPaymentDetailsData.Data[idx].ReceiptTypeId === 3)
                DueCollect += PatientPaymentDetailsData.Data[idx].AmountPaid;
            ReceiptDetails.push(ReceiptItem);
        }
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.EncounterId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 },
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 },
            { Key: PatientRefundFilters.IsCashToCredit, Value: false }]
        };
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let RefundDetails = [];
        let PatientRefundBo = BoFactory.GetBo(billingBo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (var idx1 in PatientRefundData.Data) {
            var RefundItem = PatientRefundData.Data[idx1];
            if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            }
            if (PatientRefundData.Data[idx1].RefundTypeId === 1 || PatientRefundData.Data[idx1].RefundTypeId === 4)
                PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            RefundDetails.push(RefundItem);
        }
        let encounterReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: enpacId.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(bo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encounterReq);
        let Encounter = encounterData.Data[0];
        let TotalAmount: number = 0;
        let TotGrossAmount: number = 0;
        for (let edx in EncounterIPPackages) {
            let encPackage = EncounterIPPackages[edx];
            TotalAmount = TotalAmount + encPackage.PackageAmount;
        }
        TotGrossAmount = TotalAmount + splitExclusionAmt;
        // let TotalAmount = TotalPackageAmount + EncounterIPPackages.PackageAmount;
        // DetailAmount = DetailAmount + EncounterIPPackages.PackageAmount;
        // let TotGrossAmount = EncounterIPPackages.PackageAmount + BillDiscAmt + splitItemGrossAmt; changes made by Rajesh
        // let TotGrossAmount = EncounterIPPackages.PackageAmount;
        let TotNetAmount = Math.round(TotGrossAmount - BillDiscAmt);
        let BalanceAmount = TotNetAmount - PaidAmount;
        let TotInclusionAmount = splitItemGrossAmt;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            Encounter: Encounter,
            EncounterIPPackages: EncounterIPPackages,
            EncounterIPPackageDetails: EncounterIPPackageDetails,
            TotalActualAmount: TotalActualAmount,
            TotalPackageAmount: TotalPackageAmount,
            PatientPaymentDetails: ReceiptDetails,
            PatientRefund: PatientRefundData.Data,
            RefundAmount: RefundAmount,
            TotalAmount: TotalAmount,
            BalanceAmount: BalanceAmount,
            DueCollect: Math.round(DueCollect),
            PaidAmount: Math.round(PaidAmount),
            Advance: Math.round(Advance),
            DrugAdvAmount: Math.round(DrugAdvAmount),
            BillDetails: BillDetails,
            DetailRate: DetailRate,
            DetailAmount: DetailAmount,
            BillDiscAmt: BillDiscAmt,
            TotGrossAmount: TotGrossAmount,
            TotNetAmount: TotNetAmount,
            TotInclusionAmount: TotInclusionAmount,
            splitExclusionAmt: splitExclusionAmt,
            // PrintUser: PrintUser.Data[0],
            DetailGrossAmount: DetailGrossAmount,
            Preferences: printPreferencesData,
            Flags: flags,
            CoPayAmount: CoPayAmount,
            InsCreditApproved: InsCreditApproved
        };
        console.log('****BillDetails****', BillDetails);
        let key = 'inpatientinclusionpackagedetails';
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
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
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<EncounterIPPackageInstance, EncounterIPPackageAttributes> {
        return this.Models.EncounterIPPackage;
    }

}
