import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as emrbo from '../../EMR/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as billingBO from '../../Billing/Business/Index';
import * as inventoryBO from '../../Pharmacy/Business/Index';
import { PharmacyModifyPatBillsInstance, PharmacyModifyPatBillsAttributes } from '../Model/Interface/Index';
import {
    PatientBillsFilters, PatientBillDetailsFilters, PatientReturnsFilters,
    PatientPaymentDetailsFilters, PatientRefundFilters, PatientBillSummaryFilters,
    PatientBillSplitDetailsFilters
} from '../Common/Filters.e';
import { ItemMasterFilters } from '../../Pharmacy/Common/Filters.e';
import {
    EncounterFilters
} from '../../Visit/Common/Filters.e';
import { SurgeryEntryFilters } from '../../OtManagement/Common/Filters.e';
import {
    PatientOrderDetailFilters,
    PrescriptionDetailFilters
} from '../../EMR/Common/Filters.e';
import {
    ServiceItemFilters,
    ServiceItemAliasFilters
} from '../../ClinicalMaster/Common/Filters.e';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import * as moment from 'moment';
import * as generalBO from '../../General/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { join } from 'path';
import * as _ from 'lodash';
import * as invbo from '../../Pharmacy/Business/Index';
import * as otmbo from '../../OtManagement/Business/Index';
import { ReferenceValueFilters } from '../../SystemSettings/Common/Filters.e';
import { UserAttributes } from '../../SystemSettings/Model/Interface/Index';
import { PatientAttributes } from '../../Registration/Model/Interface/Index';
import * as StoreBo from '../../Pharmacy/Business/Index';
import {
    StoreMasterFilters
} from '../../Pharmacy/Common/Filters.e';

export class PharmacyModifyPatBillsBo extends BaseBo<PharmacyModifyPatBillsInstance,
    PharmacyModifyPatBillsAttributes>  {
    public async AddPatientBills(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data); // Copy from original bill
        return result.dataValues.Id;
    }

    public async getPatientName(patientData: PatientAttributes): Promise<string> {
        let vPatientName = '';
        if (patientData) {
            if (patientData.FirstName) vPatientName += patientData.FirstName;
            if (patientData.LastName) vPatientName += ' ' + patientData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patientData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName)
                vPatientName = vTitleName + '.' + vPatientName;
        }
        return vPatientName;
    }
    public async getBillType(patientbillData: PharmacyModifyPatBillsAttributes): Promise<string> {
        let vbillType = '';
        let apiReqBillType = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'BillType' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: patientbillData.BillTypeId }
            ]
        };
        let refbilltypeinfo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
        let billtypeData = await refbilltypeinfo.GetReferenceValues(apiReqBillType);
        if (billtypeData.Data) {
            if (billtypeData.Data.length > 0) {
                if (billtypeData.Data[0].Description)
                    vbillType = billtypeData.Data[0].Description;
            }
        }
        return vbillType;
    }
    public async setAliasName(req: BaseRequest): Promise<any> {
        for (let i = 0; i < req.Data.Details.length; i++) {
            try {
                let AliasId: any = null;
                let AliasName: any = null;
                let patGuarantorBo = BoFactory.GetBo(regbo.PatientGuarantorBo, this.Request);
                let servItmAliasBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemAliasBo, this.Request);
                let patguarantordata: any = null;
                patguarantordata = await
                    patGuarantorBo.GetPatientGuarantorById({ Id: req.Data.Header.GuarantorId });
                let apiServAliasReq = {
                    Id: 0,
                    Params: [
                        { Key: ServiceItemAliasFilters.ServiceItemId, Value: req.Data.Details[i].ServiceId },
                        { Key: ServiceItemAliasFilters.ExternalProviderId, Value: patguarantordata.GuarantorId }
                    ],
                    PageContext: { PageSize: -1, PageNumber: 1 }
                };
                let seritmaliasdata = await servItmAliasBo.GetServiceItemAliass(apiServAliasReq);
                if (seritmaliasdata.Data && seritmaliasdata.Data.length > 0) {
                    AliasId = seritmaliasdata.Data[0].AliasId;
                    AliasName = seritmaliasdata.Data[0].AliasName;
                }
                req.Data.Details[i].AliasId = AliasId;
                req.Data.Details[i].AliasName = AliasName;
            } catch (ex) { console.log(ex); }
        }
    }

    public async GetFindPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let guarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let storemasterId: -1;
        let order: Array<any> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['LicenseNo', 'TinNo'], required: false,
        });

        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ChecklistStatus'));
        include.push(this.GetReference('EncounterType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrivateDue', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'],
            required: false,
            include: [
                this.GetReference('AdmissionStatus')
            ],
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillsFilters.PatBillDt:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillsFilters.PatBillNr:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientBillsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientBillStatusId': 1 }];
                        break;
                    case PatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientBillsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Guarantor:
                        guarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.MultiGuarantorType:
                        guarantorWhere['GuarantorTypeId'] = { '$notIn': param.Value };
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillTypeIdInQ:
                        where['BillTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsDoctorShare:
                        break;
                    case PatientBillsFilters.IsPharmacyBill:
                        where['IsPharmacyBill'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleType:
                        where['PharmacySaleTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientBillsFilters.ChecklistStatusId:
                        where['ChecklistStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PrivateDueId:
                        where['PrivateDueId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: isGuarantorRequired,
            where: guarantorWhere
        });
        order.push(['PatientBillId', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let detailswhere: WhereOptions<any> = {};
        let isPatientDetailsRequired: any = false;
        let guarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let storemasterId: -1;
        let order: Array<any> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['LicenseNo', 'TinNo'], required: false,
        });

        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ChecklistStatus'));
        include.push(this.GetReference('EncounterType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrivateDue', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'], required: false,
            include: [
                this.GetReference('AdmissionStatus')
            ]
        });

        include.push({ model: this.Models.PharmacyModifyPatPaymentDetails, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillsFilters.PatBillDt:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillsFilters.PatBillNr:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientBillsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientBillStatusId': 1 }];
                        break;
                    case PatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientBillsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Guarantor:
                        guarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.MultiGuarantorType:
                        guarantorWhere['GuarantorTypeId'] = { '$notIn': param.Value };
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillTypeIdInQ:
                        where['BillTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsDoctorShare:
                        detailswhere['DoctorShare'] = { '$gt': param.Value };
                        isPatientDetailsRequired = true;
                        break;
                    case PatientBillsFilters.IsPharmacyBill:
                        where['IsPharmacyBill'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleType:
                        where['PharmacySaleTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientBillsFilters.ChecklistStatusId:
                        where['ChecklistStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PrivateDueId:
                        where['PrivateDueId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PharmacyModifyPatBillDetails,
            required: isPatientDetailsRequired,
            where: detailswhere,
            include: [{
                model: this.Models.ItemMaster,
                required: false,
                include: [
                    {
                        model: this.Models.StockItem,
                        required: false,
                        attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                        where: { 'StoreMasterId': storemasterId },
                        include: [
                            {
                                model: this.Models.StockSerialItem,
                                required: false,
                                attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                    'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                    'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                                where: { 'Quantity': { $gt: 0 } }
                            }
                        ]
                    }
                ]
            }]
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: isGuarantorRequired,
            where: guarantorWhere
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetFindPatientPharmacyBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let guarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let storemasterId: -1;
        let order: Array<any> = [];
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['LicenseNo', 'TinNo'], required: false,
        });

        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ChecklistStatus'));
        include.push(this.GetReference('EncounterType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrivateDue', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
        });
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'], required: false,
            include: [
                this.GetReference('AdmissionStatus')
            ]
        });

        include.push({ model: this.Models.PharmacyModifyPatPaymentDetails, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillsFilters.PatBillDt:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillsFilters.PatBillNr:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientBillsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientBillStatusId': 1 }];
                        break;
                    case PatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientBillsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Guarantor:
                        guarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.MultiGuarantorType:
                        guarantorWhere['GuarantorTypeId'] = { '$notIn': param.Value };
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillTypeIdInQ:
                        where['BillTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsPharmacyBill:
                        where['IsPharmacyBill'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleType:
                        where['PharmacySaleTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientBillsFilters.ChecklistStatusId:
                        where['ChecklistStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PrivateDueId:
                        where['PrivateDueId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: isGuarantorRequired,
            where: guarantorWhere
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientBillsById(req: BaseRequest): Promise<PharmacyModifyPatBillsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        let detailswhere: WhereOptions<any> = {};
        let isPatientDetailsRequired: any = false;
        let isPatientPaymentDetailsRequired: any = false;
        let paymentwhere: WhereOptions<any> = {};
        let guarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let admissionWhere: WhereOptions<any> = {};
        let isadmissionRequired: any = false;
        let storemasterId: -1;
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, required: false,
        });

        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ChecklistStatus'));
        include.push(this.GetReference('EncounterType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier', 'ReferrerId'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender'),
                { model: this.Models.Referral, attributes: ['ReferralCode', 'ReferralName'], required: false }
            ],
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'Qualification',
                'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrivateDue', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.Guarantor, as: 'GuarantorMaster', attributes: ['Code', 'GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
        });
        // include.push({ model: this.Models.Encounter,
        //attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillsFilters.PatBillDt:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillsFilters.PatBillNr:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientBillsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientBillStatusId': 1 }]; /*{ 'BillNumber': { '$is': null } } */
                        break;
                    case PatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientBillsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Guarantor:
                        guarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.MultiGuarantorType:
                        guarantorWhere['GuarantorTypeId'] = { '$notIn': param.Value };
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.ExcludeEncounterType://$notIn
                        where['EncounterTypeId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillsFilters.BillTypeIdInQ:
                        where['BillTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsDoctorShare:
                        detailswhere['DoctorShare'] = { '$gt': param.Value };
                        isPatientDetailsRequired = true;
                        break;
                    case PatientBillsFilters.IsPharmacyBill:
                        where['IsPharmacyBill'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleType:
                        where['PharmacySaleTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientBillsFilters.ChecklistStatusId:
                        where['ChecklistStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PrivateDueId:
                        where['PrivateDueId'] = param.Value;
                        break;
                    case PatientBillsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.BillingType:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['BillTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillsFilters.ScheduleTypeId:
                        detailswhere['ScheduleTypeId'] = param.Value;
                        isPatientDetailsRequired = true;
                        break;
                    case PatientBillsFilters.From:
                        admissionWhere['AdmissionDate'] = admissionWhere['AdmissionDate'] || {};
                        (admissionWhere['AdmissionDate'] as any)['$gte'] = param.Value;
                        isadmissionRequired = true;
                        break;
                    case PatientBillsFilters.To:
                        admissionWhere['AdmissionDate'] = admissionWhere['AdmissionDate'] || {};
                        (admissionWhere['AdmissionDate'] as any)['$lte'] = param.Value;
                        isadmissionRequired = true;
                        break;
                    case PatientBillsFilters.AdmissionDate:
                        admissionWhere['AdmissionDate'] = { '$between': param.Value || '' };
                        isadmissionRequired = true;
                        break;
                    case PatientBillsFilters.OTRegisterId:
                        detailswhere['OTRegisterId'] = param.Value;
                        isPatientDetailsRequired = true;
                        break;
                    case PatientBillsFilters.IsRegCumBill:
                        where['IsRegCumBill'] = param.Value;
                        break;
                    case PatientBillsFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case PatientBillsFilters.PaymentTypeId:
                        paymentwhere['PaymentTypeId'] = param.Value;
                        isPatientPaymentDetailsRequired = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PharmacyModifyPatPaymentDetails,
            required: isPatientPaymentDetailsRequired,
            where: paymentwhere,
            include: [
                this.GetReference('ReceiptStatus')
            ]
        });
        include.push({
            model: this.Models.PharmacyModifyPatBillDetails,
            required: isPatientDetailsRequired,
            where: detailswhere,
            include: [
                { model: this.Models.ServiceCategory, required: false, attributes: ['ServiceCategoryCode', 'ServiceCategoryName'] },
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        { model: this.Models.DrugMaster, required: false },
                        {
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity', 'Rev'],
                            where: { 'StoreMasterId': storemasterId },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage', 'Rev'],
                                    where: { 'Quantity': { $gt: 0 } }
                                }
                            ]
                        }
                    ]
                }]
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: isGuarantorRequired,
            where: guarantorWhere
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'],
            include: [
                this.GetReference('AdmissionStatus')
            ],
            required: isadmissionRequired,
            where: admissionWhere
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetFindPatientBills(apiReq?: ApiRequest<PatientBillsFilters>):
        Promise<ApiResponse<PharmacyModifyPatBillsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let guarantorWhere: WhereOptions<any> = {};
        let isGuarantorRequired: any = false;
        let storemasterId: -1;
        include.push({
            model: this.Models.Department, attributes: ['DepartmentName'], required: false,
        });
        include.push({
            model: this.Models.Facility, attributes: ['GstNumber'], required: false,
        });
        include.push({
            model: this.Models.StoreMaster, attributes: ['LicenseNo', 'TinNo'], required: false,
        });

        include.push(this.GetReference('BillPriority'));
        include.push(this.GetReference('PatientBillStatus'));
        include.push(this.GetReference('GuarantorType'));
        include.push(this.GetReference('Title'));
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ChecklistStatus'));
        include.push(this.GetReference('EncounterType'));
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrivateDue', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.PatientGuarantor, as: 'PatientGuarantor', attributes: ['GuarantorName'], required: false,
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Updateduser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
            include: [{ model: this.Models.RoomTypeMaster, attributes: ['RoomTypeName'], required: false }]
        });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
            include: [{ model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false }]
        });
        include.push({
            model: this.Models.WardMaster, as: 'WardMaster', attributes: ['WardName'], required: false,
        });
        include.push({ model: this.Models.Encounter, attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'], required: false });

        include.push({ model: this.Models.PharmacyModifyPatPaymentDetails, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientBillsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillsFilters.PatBillDt:
                        where['BillDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientBillsFilters.PatBillNr:
                        where['BillNumber'] = { '$like': '%' + ('' || param.Value || '') };
                        break;
                    case PatientBillsFilters.PatId:
                        (where as any)['$and'] = [{ 'PatientId': param.Value },
                        { 'PatientBillStatusId': 1 }]; /*{ 'BillNumber': { '$is': null } } */
                        break;
                    case PatientBillsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillPriority:
                        where['BillPriorityId'] = param.Value;
                        break;
                    case PatientBillsFilters.BillType:
                        where['BillTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Doctor:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientBillsFilters.GuarantorType:
                        where['GuarantorTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.Guarantor:
                        guarantorWhere['GuarantorId'] = param.Value;
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.MultiGuarantorType:
                        guarantorWhere['GuarantorTypeId'] = { '$notIn': param.Value };
                        isGuarantorRequired = true;
                        break;
                    case PatientBillsFilters.IsOutStanding:
                        where['OutStandingAmount'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.OnlyPID:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientBillsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.Mobile:
                        patientQryJoin['where'] = { 'Mobile': param.Value };
                        patientQryJoin['required'] = true;
                        break;
                    case PatientBillsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PatientName:
                        where['PatientName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case PatientBillsFilters.EncounterTypeId:
                        where['EncounterTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.ExcludeEncounterType://$notIn
                        where['EncounterTypeId'] = { '$notIn': param.Value };
                        break;
                    case PatientBillsFilters.BillTypeIdInQ:
                        where['BillTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsDoctorShare:
                        break;
                    case PatientBillsFilters.IsPharmacyBill:
                        where['IsPharmacyBill'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillsFilters.PharmacySaleType:
                        where['PharmacySaleTypeId'] = { '$in': param.Value };
                        break;
                    case PatientBillsFilters.IsClaimed:
                        where['IsClaimed'] = param.Value;
                        break;
                    case PatientBillsFilters.ChecklistStatusId:
                        where['ChecklistStatusId'] = param.Value;
                        break;
                    case PatientBillsFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillsFilters.PrivateDueId:
                        where['PrivateDueId'] = param.Value;
                        break;
                    case PatientBillsFilters.IsConsolidatePay:
                        where['IsConsolidatePay'] = { '$gt': '0' };
                        break;
                    case PatientBillsFilters.BillingType:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['BillTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillsFilters.ScheduleTypeId:
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push(patientQryJoin);
        include.push({
            model: this.Models.PatientGuarantor,
            as: 'Guarantor',
            attributes: ['GuarantorName', 'GuarantorId'],
            required: isGuarantorRequired,
            where: guarantorWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientBills(req: BaseRequest): Promise<Boolean> {
        let DetailBo = BoFactory.GetBo(billingBO.PharmacyModifyPatBillDetailsBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: req.Id }]
        };
        let PatientBillDeta = await DetailBo.GetPatientBillDetails(apiReq);
        PatientBillDeta.Data.forEach((detail) => {
            detail.Status = 2;
        });
        await DetailBo.ManagePatientBillDetails(req.Id, PatientBillDeta.Data);
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        BillDetailsData.Data.sort(function (a, b) {
            return a.Id - b.Id;
        });
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalCgst += Detail.CGstPercentage;
            TotalSgst += Detail.SGstPercentage;
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Data.EncId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientBills.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let storeReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: StoreMasterFilters.Id, Value: PatientBills.StoreMasterId }]
        };
        let storeBo = BoFactory.GetBo(StoreBo.StoreMasterBo, this.Request);
        let storeData = await storeBo.GetStoreMasters(storeReq);
        let Store = storeData.Data[0];

        let info = {
            Encounter: Encounter,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            BillDetails: BillDetails,
            NetAmount: (PatientBills.BillAmount - PatientBills.BillDiscount) + PatientBills.RoundOffValue,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            WithoutTax: PatientBills.BillAmount - PatientBills.GSTAmount,
            Preferences: printPreferencesData,
            StoreData: Store
        };

        let key = 'pharmacybill';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.PharmacySaleTypeId === 4) {
            key = 'directpharmacybill';
        }
        if (info.PatientBills.IsPharmacyBill === true
            && info.PatientBills.IsPaidFully === false
            && info.PatientBills.OutStandingAmount > 0) {
            key = 'pharmacycreditbill';
        }
        if (req.Data.isprint) {
            key = 'pharmacysmall';
            PrintTypeId = 1;
        }
        if (info.StoreData.ISSeparatePayCounter === true) {
            key = 'pharmacycontactlensbill';
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
        // // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintIPPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalCgst += Detail.CGstPercentage;
            TotalSgst += Detail.SGstPercentage;
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientBills.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Encounter: Encounter,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            BillDetails: BillDetails,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            WithoutTax: PatientBills.BillAmount - PatientBills.GSTAmount,
            Preferences: printPreferencesData
        };

        let key = 'ippharmacy';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.PharmacySaleTypeId === 4) {
            key = 'directpharmacybill';
        }
        if (req.Data.isprint) {
            key = 'ippharmacy';
            PrintTypeId = 1;

        }
        let pdfOption: any = null;
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
        // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintDMIPPharmacyBills(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalCgst += Detail.CGstPercentage;
            TotalSgst += Detail.SGstPercentage;
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PatientBills.FacilityId, PatientBills.StoreMasterId);
        let info = {
            Encounter: Encounter,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            BillDetails: BillDetails,
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            WithoutTax: PatientBills.BillAmount - PatientBills.GSTAmount,
            Preferences: printPreferencesData,
            PrintData: printStoreData
        };
        return info;
    }

    public async PrintOPPharmacyBillsforIP(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: req.Data.BillType },
                { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }
            ]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills: any = data.Data;
        let SaleDetails: any = [];
        let ReturnDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        let RetTotalCgst: number = 0;
        let RetTotalSgst: number = 0;
        //let TotalAmount: number = 0;
        let DispenceAmount: number = 0;
        let ReturnAmount: number = 0;
        PatientBills.forEach((detail: any) => {
            let OldBillnumber: any = null;
            let BillNumber: any = detail.BillNumber;
            detail.PatientBillDetails.forEach((Detail: any) => {
                let PatientBillDetail = Detail;
                PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
                TotalCgst += Detail.CGstPercentage;
                TotalSgst += Detail.SGstPercentage;
                PatientBillDetail.Headerinfo = 0;
                if (PatientBillDetail.IsPharmacySale) {
                    DispenceAmount += Detail.Amount;
                    if (OldBillnumber !== BillNumber) {
                        PatientBillDetail.Headerinfo = 1;
                        PatientBillDetail.BillNumber = BillNumber;
                        OldBillnumber = BillNumber;
                    }
                    SaleDetails.push(PatientBillDetail);
                }
            });
        });

        let PatientReturnsBo = BoFactory.GetBo(bo.PatientReturnsBo, this.Request);
        let retapiReq: any = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientReturnsFilters.EncounterId, Value: req.Id },
                { Key: PatientReturnsFilters.ReturnType, Value: [1, 2, 3, 4] },
                { Key: PatientReturnsFilters.PatientReturnStatus, Value: 3 }
            ]
        };

        let retdata = await PatientReturnsBo.GetPatientReturns(retapiReq);
        let PatientRetBills: any = retdata.Data;
        PatientRetBills.forEach((detail: any) => {
            let OldReturnNumber: any = null;
            let ReturnNumber: any = detail.ReturnNumber;
            let BillNumber: any = detail.BillNumber;
            detail.PatientReturnDetails.forEach((Detail: any) => {
                let PatientReturnDetails = Detail;
                PatientReturnDetails.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
                RetTotalCgst += Detail.CGstPercentage;
                RetTotalSgst += Detail.SGstPercentage;
                ReturnAmount += Detail.Amount;
                PatientReturnDetails.Headerinfo = 0;
                if (OldReturnNumber !== ReturnNumber) {
                    PatientReturnDetails.Headerinfo = 1;
                    PatientReturnDetails.BillNumber = BillNumber;
                    PatientReturnDetails.ReturnNumber = ReturnNumber;
                    OldReturnNumber = ReturnNumber;
                }
                PatientReturnDetails.BillDateTime = Detail.ReturnDateTime;
                ReturnDetails.push(PatientReturnDetails);
            });
        });

        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter: any = encounterData.Data[0];
        let patientData = Encounter.Patient;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Encounter.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Encounter: Encounter,
            Patient: patientData,
            PatientBills: PatientBills,
            SaleDetails: SaleDetails,
            ReturnDetails: ReturnDetails,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            RetTotalCgst: RetTotalCgst,
            RetTotalSgst: RetTotalSgst,
            TotalAmount: DispenceAmount - ReturnAmount,
            DispenceAmount: DispenceAmount,
            ReturnAmount: ReturnAmount,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'opbillingpharmacyforip';
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, },
            null, pdfOption);
        // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintOPConsolidate(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: [1, 4, 5] },
                { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }
            ]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills: any = data.Data;
        let SaleDetails: any = [];
        let ReturnDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        let RetTotalCgst: number = 0;
        let RetTotalSgst: number = 0;
        //let TotalAmount: number = 0;
        let DispenceAmount: number = 0;
        let ReturnAmount: number = 0;
        PatientBills.forEach((detail: any) => {
            let OldBillnumber: any = null;
            let BillNumber: any = detail.BillNumber;
            detail.PatientBillDetails.forEach((Detail: any) => {
                let PatientBillDetail = Detail;
                PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
                TotalCgst += Detail.CGstPercentage;
                TotalSgst += Detail.SGstPercentage;
                PatientBillDetail.Headerinfo = 0;
                DispenceAmount += Detail.Amount;
                if (OldBillnumber !== BillNumber) {
                    PatientBillDetail.Headerinfo = 1;
                    PatientBillDetail.BillNumber = BillNumber;
                    OldBillnumber = BillNumber;
                }
                SaleDetails.push(PatientBillDetail);
            });
        });

        let PatientReturnsBo = BoFactory.GetBo(bo.PatientReturnsBo, this.Request);
        let retapiReq: any = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientReturnsFilters.EncounterId, Value: req.Id },
                { Key: PatientReturnsFilters.ReturnType, Value: [1, 2, 3, 4] },
                { Key: PatientReturnsFilters.PatientReturnStatus, Value: 3 }
            ]
        };

        let retdata = await PatientReturnsBo.GetPatientReturns(retapiReq);
        let PatientRetBills: any = retdata.Data;
        PatientRetBills.forEach((detail: any) => {
            let OldReturnNumber: any = null;
            let ReturnNumber: any = detail.ReturnNumber;
            let BillNumber: any = detail.BillNumber;
            detail.PatientReturnDetails.forEach((Detail: any) => {
                let PatientReturnDetails = Detail;
                PatientReturnDetails.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
                RetTotalCgst += Detail.CGstPercentage;
                RetTotalSgst += Detail.SGstPercentage;
                ReturnAmount += Detail.Amount;
                PatientReturnDetails.Headerinfo = 0;
                if (OldReturnNumber !== ReturnNumber) {
                    PatientReturnDetails.Headerinfo = 1;
                    PatientReturnDetails.BillNumber = BillNumber;
                    PatientReturnDetails.ReturnNumber = ReturnNumber;
                    OldReturnNumber = ReturnNumber;
                }
                PatientReturnDetails.BillDateTime = Detail.ReturnDateTime;
                ReturnDetails.push(PatientReturnDetails);
            });
        });

        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter: any = encounterData.Data[0];
        let patientData = Encounter.Patient;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Encounter.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Encounter: Encounter,
            Patient: patientData,
            PatientBills: PatientBills,
            SaleDetails: SaleDetails,
            ReturnDetails: ReturnDetails,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            RetTotalCgst: RetTotalCgst,
            RetTotalSgst: RetTotalSgst,
            TotalAmount: DispenceAmount - ReturnAmount,
            DispenceAmount: DispenceAmount,
            ReturnAmount: ReturnAmount,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'opconsolidatedprint';
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, },
            null, pdfOption);
    }

    public async PrintIPBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: 3 },
                { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }
            ]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills: any = data.Data;
        let SaleDetails: any = [];
        let ReturnDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        //let TotalAmount: number = 0;
        let DispenceAmount: number = 0;
        let ReturnAmount: number = 0;
        PatientBills.forEach((detail: any) => {
            detail.PatientBillDetails.forEach((Detail: any) => {
                let PatientBillDetail = Detail;
                PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
                TotalCgst += Detail.CGstPercentage;
                TotalSgst += Detail.SGstPercentage;
                if (PatientBillDetail.IsPharmacySale) {
                    DispenceAmount += Detail.Amount;
                    SaleDetails.push(PatientBillDetail);
                    /*
                    if (PatientBillDetail.ReturnedQuantity > 0) {
                        TotalAmount += DispenceAmount - TotalReturnAmount;
                        TotalReturnAmount += Detail.ReturnedQuantity * Detail.Rate;
                        PatientBillDetail.ReturnAmount = Detail.ReturnedQuantity * Detail.Rate;
                        ReturnDetails.push(PatientBillDetail);
                    }
                    */
                }
                if (PatientBillDetail.IsPharmacyReturn) {
                    ReturnAmount += Detail.Amount;
                    ReturnDetails.push(PatientBillDetail);
                }
            });
        });

        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter: any = encounterData.Data[0];
        let patientData = Encounter.Patient;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Encounter.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        //Preferences: printPreferencesData
        let info = {
            Encounter: Encounter,
            Patient: patientData,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            SaleDetails: SaleDetails,
            ReturnDetails: ReturnDetails,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            TotalAmount: DispenceAmount + ReturnAmount,
            DispenceAmount: DispenceAmount,
            ReturnAmount: ReturnAmount,
            Preferences: printPreferencesData
            //TotalReturnAmount: TotalReturnAmount,
        };
        let pdfOption: any = null;
        let key = 'ipbillingpharmacy';
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, },
            null, pdfOption);
        // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintOTBillingPharmacyBills(req: BaseRequest): Promise<FileInfo> {
        let SurgeryEntriesBo = BoFactory.GetBo(otmbo.SurgeryEntryBo, this.Request);

        let OTapiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: SurgeryEntryFilters.Id, Value: req.Id }]
        };
        let OTRegisterData = await SurgeryEntriesBo.GetSurgeryEntrys(OTapiReq);

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientBillDetailsFilters.EncounterId, Value: OTRegisterData.Data[0].EncounterId },
                { Key: PatientBillDetailsFilters.OTRegisterId, Value: req.Id },
                { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }
            ]
        };
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let data = await PatientBillDetailsBo.GetPatientBillDetails(apiReq);
        let OTRegisterDetails: any = OTRegisterData.Data[0];
        let PatientBills: any = [];
        let PatientBillDetails: any = data.Data;
        let PatientPaymentDetails: any = [];
        let SaleDetails: any = [];
        let ReturnDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        let DispenceAmount: number = 0;
        let ReturnAmount: number = 0;
        PatientBillDetails.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalCgst += Detail.CGstPercentage;
            TotalSgst += Detail.SGstPercentage;
            if (PatientBillDetail.IsPharmacySale) {
                DispenceAmount += Detail.Amount;
                SaleDetails.push(PatientBillDetail);
            }
            if (PatientBillDetail.IsPharmacyReturn) {
                ReturnAmount += Detail.Amount;
                ReturnDetails.push(PatientBillDetail);
            }
        });

        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: OTRegisterDetails.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter: any = encounterData.Data[0];
        let info = {
            OtRegister: OTRegisterDetails,
            Encounter: Encounter,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetails,
            SaleDetails: SaleDetails,
            ReturnDetails: ReturnDetails,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            TotalAmount: DispenceAmount + ReturnAmount,
            DispenceAmount: DispenceAmount,
            ReturnAmount: ReturnAmount
        };
        let pdfOption: any = null;
        let key = 'otbillingpharmacy';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.7in',
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

        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintPatientBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        PatientBills.OutStandingAmount = PatientBills.OutStandingAmount - PatientBills.CNAmount;
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientBills.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);

        //Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        //Preferences: printPreferencesData

        let info = {
            PatientBills: PatientBills,
            BillDetails: BillDetails,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            PatientRefund: PatientRefundData.Data,
            Encounter: encounterData.Data[0],
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            Preferences: printPreferencesData
        };

        let key = 'outpatientbill';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.BillTypeId === 5) {
            key = 'dgbilling';
            if (info.PatientBills.PatientBillStatusId === 2) {
                Watermark = 'CANCELLED';
                PrintTypeId = 2;
            }
        }
        if (info.PatientBills.BillTypeId === 1
            && info.PatientBills.IsPaidFully === false && info.PatientBills.OutStandingAmount > 0) {
            key = 'outpatientcreditbill';
        }
        let pdfOption: any = null;
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
        // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintPatientBillsByPatient(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.PatId, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientBills.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);

        //Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        //Preferences: printPreferencesData

        let info = {
            PatientBills: PatientBills,
            BillDetails: BillDetails,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            PatientRefund: PatientRefundData.Data,
            Encounter: encounterData.Data[0],
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            Preferences: printPreferencesData
        };

        let key = 'outpatientbill';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.BillTypeId === 5) {
            key = 'dgbilling';
            if (info.PatientBills.PatientBillStatusId === 2) {
                Watermark = 'CANCELLED';
                PrintTypeId = 2;
            }
        }
        let pdfOption: any = null;
        // let reportKey = 'ippharmacyjson';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '1in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
        // return await Report.Generate(key, { header: {}, body: info });
        // let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        // return await ephBO.PrintReport(key
        //     , { header: {}, body: info }
        //     , {
        //         ObjectId: req.Id
        //         , ObjectTypeId: 4 /*Order*/
        //         , Reason: req.Data ? req.Data.Reason : null
        //         , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
        //         , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
        //     });
    }

    public async PrintPatientBillsWithoutHeader(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientBills.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);

        //Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        //Preferences: printPreferencesData

        let info = {
            PatientBills: PatientBills,
            BillDetails: BillDetails,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            PatientRefund: PatientRefundData.Data,
            Encounter: encounterData.Data[0],
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            Preferences: printPreferencesData
        };

        let key = 'outpatientbillwithoutheader';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.BillTypeId === 5) {
            key = 'dgbilling';
            if (info.PatientBills.PatientBillStatusId === 2) {
                Watermark = 'CANCELLED';
                PrintTypeId = 2;
            }
        }
        // if (info.PatientBills.BillTypeId === 4) {
        //     key = 'pharmacybill';
        //     if (info.PatientBills.PharmacySaleTypeId === 4) {
        //         key = 'directpharmacybill';
        //     }
        //     if (req.Data.isprint) {
        //         key = 'pharmacysmall';
        //         PrintTypeId = 1;
        //         pdfOption = {
        //             format: 'A4',
        //             orientation: 'portrait',
        //             border: '0',
        //             header: {
        //                 height: '0.40in',
        //                 contents: '',
        //             },
        //             footer: {
        //                 height: '0in',
        //                 contents: {
        //                     first: '',
        //                     default: '',
        //                     last: '',
        //                 },
        //             },
        //             type: 'pdf',
        //             base: 'file://' + join(__dirname, '/../../Templates/assets/')
        //         };
        //     }
        // }
        // return await Report.Generate(key, { header: {}, body: info });
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport(key
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }

    public async Printopcreditbill(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientBills.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);

        //Get print preferences
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        //Preferences: printPreferencesData

        let info = {
            PatientBills: PatientBills,
            BillDetails: BillDetails,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            PatientRefund: PatientRefundData.Data,
            Encounter: encounterData.Data[0],
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            Preferences: printPreferencesData
        };

        let key = 'outpatientcreditbill';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        if (info.PatientBills.BillTypeId === 5) {
            key = 'dgbilling';
            if (info.PatientBills.PatientBillStatusId === 2) {
                Watermark = 'CANCELLED';
                PrintTypeId = 2;
            }
        }
        // if (info.PatientBills.BillTypeId === 4) {
        //     key = 'pharmacybill';
        //     if (info.PatientBills.PharmacySaleTypeId === 4) {
        //         key = 'directpharmacybill';
        //     }
        //     if (req.Data.isprint) {
        //         key = 'pharmacysmall';
        //         PrintTypeId = 1;
        //         pdfOption = {
        //             format: 'A4',
        //             orientation: 'portrait',
        //             border: '0',
        //             header: {
        //                 height: '0.40in',
        //                 contents: '',
        //             },
        //             footer: {
        //                 height: '0in',
        //                 contents: {
        //                     first: '',
        //                     default: '',
        //                     last: '',
        //                 },
        //             },
        //             type: 'pdf',
        //             base: 'file://' + join(__dirname, '/../../Templates/assets/')
        //         };
        //     }
        // }
        // return await Report.Generate(key, { header: {}, body: info });
        let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
        return await ephBO.PrintReport(key
            , { header: {}, body: info }
            , {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            });
    }

    public async GetTitle(TitleId: number): Promise<string> {
        let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
        let vTitleName = '';
        let apiReqTitle = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [
                { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: TitleId }
            ]
        };
        let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
        if (TitleData.Data) {
            if (TitleData.Data.length > 0) {
                if (TitleData.Data[0].Description)
                    vTitleName = TitleData.Data[0].Description;
            }
        }
        return vTitleName;
    }

    public async getUserName(UserData: UserAttributes): Promise<string> {
        let vDocName = '';
        if (UserData) {
            if (UserData.FirstName) vDocName += UserData.FirstName;
            if (UserData.LastName) vDocName += ' ' + UserData.LastName;
            let apiReqTitle = {
                Id: 0,
                PageContext: { PageSize: 50, PageNumber: 1 },
                Params: [
                    { Key: ReferenceValueFilters.ReferenceGroupCode, Value: 'Title' },
                    { Key: ReferenceValueFilters.ReferenceValueCodeId, Value: UserData.TitleId }
                ]
            };
            let vTitleName = '';
            let refTitleBo = BoFactory.GetBo(userbo.ReferenceValueBo, this.Request);
            let TitleData = await refTitleBo.GetReferenceValues(apiReqTitle);
            if (TitleData.Data) {
                if (TitleData.Data.length > 0) {
                    if (TitleData.Data[0].Description)
                        vTitleName = TitleData.Data[0].Description;
                }
            }
            if (vTitleName)
                vDocName = vTitleName + '.' + vDocName;
        }
        return vDocName;
    }

    public async GetPendingOrders(Req: BaseRequest): Promise<any> {
        let PendingOrderDetailBo = BoFactory.GetBo(emrbo.PatientOrderDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 1000 },
            Params: [{ Key: PatientOrderDetailFilters.PatientOrderId, Value: Req.Id }]
        };
        let PendingOrders = await PendingOrderDetailBo.GetPatientOrderDetails(apiReq);
        let ServiceItems: any = [];
        await Promise.all(PendingOrders.Data.map((pendingitem): Promise<void> => {
            return (async (testitem): Promise<void> => {
                let serviceItemReq = {
                    Id: 0,
                    PageContext: { PageNumber: 1, PageSize: 1000 },
                    Params: [{ Key: ServiceItemFilters.MasterItemId, Value: testitem.TestId }]
                };
                let clinicalBO = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                let ClinicalData = await clinicalBO.GetServiceItems(serviceItemReq);
                ServiceItems.push(ClinicalData.Data[0]);
            })(pendingitem);
        }));
        return ServiceItems;
    }

    public async GetPendingPrescriptions(req: BaseRequest): Promise<any> {
        let PrescriptionDetailBo = BoFactory.GetBo(emrbo.PrescriptionDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 1000 },
            Params: [{ Key: PrescriptionDetailFilters.PrescriptionId, Value: req.Id }]
        };
        let Prescriptions = await PrescriptionDetailBo.GetPrescriptionDetails(apiReq);
        let PharmacyItems: any = [];
        await Promise.all(Prescriptions.Data.map((prescriptionitem): Promise<void> => {
            return (async (prescribeditem): Promise<void> => {
                let pharmacyItemReq = {
                    Id: 0,
                    PageContext: { PageNumber: 1, PageSize: 1000 },
                    Params: [{ Key: ItemMasterFilters.DrugId, Value: prescribeditem.DrugId }]
                };
                let itemmasterBO = BoFactory.GetBo(inventoryBO.ItemMasterBo, this.Request);
                let ItemMasterData = await itemmasterBO.GetItemMasters(pharmacyItemReq);
                PharmacyItems.push(ItemMasterData.Data[0]);
            })(prescriptionitem);
        }));
        return PharmacyItems;
    }


    public async PrintInpatientBills(req: BaseRequest): Promise<FileInfo> {

        let isFinalized: boolean = req.Data.isFinalized;
        let PatientBills: any = {};
        if (isFinalized) {
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: 2 }, { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }]
            };
            let data = await this.GetPatientBills(apiReq);
            PatientBills = data.Data[0];
        }
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Encounter.PatientId });
        let TotalGrossAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDiscount: number = 0;
        let BillDetails: any = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillSummaryFilters.EncounterId, Value: req.Id }]
        };
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let billSummaryBo = BoFactory.GetBo(billingBO.PatientBillSummaryBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientBillSummary = await billSummaryBo.GetPatientBillSummarys(apiReq);

        await Promise.all(PatientBillSummary.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                let summaryTotal: number = 0;
                let splitDetails: any = [];
                let PatientBillSplitDetailsBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
                let splitReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: bill.Id }]
                };
                if (req.Data.isSupplementary)
                    splitReq.Params.push({ Key: PatientBillSplitDetailsFilters.IsSupplementary, Value: req.Data.isSupplementary });
                let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetPatientBillSplitDetails(splitReq);
                await Promise.all(BillSplitDetailsData.Data.map((billItem): Promise<void> => {
                    return (async (split): Promise<void> => {
                        let billDetailReq = {
                            Id: 0,
                            PageContext: { PageSize: -1, PageNumber: 1 },
                            Params: [{ Key: PatientBillDetailsFilters.Id, Value: split.PatientBillDetailId },
                            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }]
                        };
                        let DetailData = await PatientBillDetailsBo.GetPatientBillDetails(billDetailReq);
                        if (DetailData.Data.length > 0) {
                            let BillDetail: any = DetailData.Data[0];
                            TotalGrossAmount += BillDetail.GrossAmount;
                            TotalDiscount += BillDetail.DiscountAmount;
                            TotalNetAmount += BillDetail.GrossAmount - BillDetail.DiscountAmount;
                            summaryTotal += BillDetail.GrossAmount - BillDetail.DiscountAmount;
                            splitDetails.push(BillDetail);
                        }
                    })(billItem);
                }));
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;

                //let withoutpharmacysales: any = [];
                let withpharmacysales: any = [];
                let orderbydatespldet = _.orderBy(splitDetails, ['ServiceId', 'BillDateTime']);
                let roomGroups: any = {};
                let serviceitemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                await Promise.all(orderbydatespldet.map((orderbydatespldetItem: any): Promise<void> => {
                    return (async (detail): Promise<void> => {
                        //console.log(detail);
                        if (detail.ServiceId > 0) {
                            let bIsRoomCharge: boolean = false;
                            let servReq = {
                                Id: 0,
                                PageContext: { PageSize: -1, PageNumber: 1 },
                                Params: [{ Key: 0, Value: detail.ServiceId }]
                            };
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
                                            roomGroups[detail.ServiceId].Quantity += detail.Quantity;
                                            roomGroups[detail.ServiceId].Amount += detail.Amount;
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
                                            roomGroups[detail.ServiceId].Amount = detail.Amount;
                                            roomGroups[detail.ServiceId].Id = detail.Id;
                                            //withoutpharmacysales.push(detail);
                                            withpharmacysales.push(detail);
                                        }
                                    }
                                }
                            }
                            //if (!detail.IsDoctorDisplay && !bIsRoomCharge && !detail.IsPharmacySale && !detail.IsPharmacyReturn) {
                            if (!detail.IsDoctorDisplay && !bIsRoomCharge) {
                                //console.log('normal');
                                detail.User = null;
                                //withoutpharmacysales.push(detail);
                                withpharmacysales.push(detail);
                            } else if (detail.IsDoctorDisplay && !bIsRoomCharge) {
                                //else if (detail.IsDoctorDisplay && !bIsRoomCharge && !detail.IsPharmacySale && !detail.IsPharmacyReturn) {
                                //console.log('only dr');
                                //withoutpharmacysales.push(detail);
                                withpharmacysales.push(detail);
                                //console.log(withoutpharmacysales);
                            } else { // Room Charges
                                //console.log('only Room');
                                /*
                                for (let indx in withoutpharmacysales) {
                                    if (withoutpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                                        withoutpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName + ' (' +
                                            roomGroups[detail.ServiceId].BFDt + ' - ' + roomGroups[detail.ServiceId].BTDt + ' )';
                                        withoutpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                                        withoutpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                                        withoutpharmacysales[indx].Amount = roomGroups[detail.ServiceId].Amount;
                                    }
                                }
                                */
                                for (let indx in withpharmacysales) {
                                    if (withpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                                        withpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName;
                                        withpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                                        withpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                                        withpharmacysales[indx].Amount = roomGroups[detail.ServiceId].Amount;
                                    }
                                }
                            }
                        }
                    })(orderbydatespldetItem);
                }));


                //summary['SplitedValue'] = splitDetails;
                //summary['SplitedValue'] = withoutpharmacysales;
                summary['SplitedValue'] = withpharmacysales;
                summary['Amount'] = summaryTotal;
                if (splitDetails.length > 0)
                    BillDetails.push(summary);


                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                BillDetails.sort(custom_sort);
            })(splitItem);
        }));

        // let billdetailReq = {
        //     Id: 0,
        //     PageContext: { PageSize: -1, PageNumber: 1 },
        //     Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
        //     { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }]
        // };
        //
        // let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        // for (let idx in BillDetailsData.Data) {
        //     let BillItem = BillDetailsData.Data[idx];
        //     TotalGrossAmount += BillDetailsData.Data[idx].GrossAmount;
        //     TotalNetAmount += BillDetailsData.Data[idx].GrossAmount - BillDetailsData.Data[idx].DiscountAmount;
        //     TotalDiscount += BillDetailsData.Data[idx].DiscountAmount;
        //     BillDetails.push(BillItem);
        // }
        let DueCollect: number = 0;
        let PaidAmount: number = 0;
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
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        for (let idx in PatientPaymentDetailsData.Data) {
            let ReceiptItem = PatientPaymentDetailsData.Data[idx];
            if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                PaidAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
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
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 }]
        };
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let RefundDetails = [];
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (var idx1 in PatientRefundData.Data) {
            var RefundItem = PatientRefundData.Data[idx1];
            if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            }
            if (PatientRefundData.Data[idx1].RefundTypeId === 1)
                PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            RefundDetails.push(RefundItem);
        }
        let UserReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: req.Data.PrintUser }]
        };
        let UsersBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let PrintUser = await UsersBo.GetUsers(UserReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Encounter.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientBills: PatientBills,
            Encounter: Encounter,
            Patient: patientData,
            BillDetails: BillDetails,
            PatientPaymentDetails: ReceiptDetails,
            TotalGrossAmount: TotalGrossAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDiscount: TotalDiscount,
            DueCollect: DueCollect,
            PaidAmount: PaidAmount,
            NetAmount: (PatientBills.BillAmount + PatientBills.RoundOffValue) - PatientBills.BillDiscount,
            BalanceAmount: (TotalNetAmount - PaidAmount) + PartialRefundAmount,
            currentdate: new Date(),
            PrintUser: PrintUser.Data[0],
            PatientRefund: PatientRefundData.Data,
            RefundAmount: RefundAmount,
            PartialRefundAmount: PartialRefundAmount,
            Preferences: printPreferencesData
        };
        let key = 'InpatientBillDetail(i)';
        let pdfOption: any = null;
        {
            if (isFinalized) {
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientBillDetail';
                }
            }
            if (req.Data.isGuarantor) {
                key = 'InpatientbillDetailsGuarantor(i)';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientbillDetailsGuarantor';
                }
            }
            if (req.Data.isSupplementary) {
                key = 'Supplementry';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2
                    && info.BillDetails.IsSupplementary === true) {
                    key = 'Supplementry';
                }
            }
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '2in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async PrintDailyInpatientBills(req: BaseRequest): Promise<FileInfo> {
        let isFinalized: boolean = req.Data.isFinalized;
        let PatientBills: any = {};
        if (isFinalized) {
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [{ Key: PatientBillsFilters.EncounterId, Value: req.Id },
                { Key: PatientBillsFilters.BillType, Value: 2 }, { Key: PatientBillsFilters.PatientBillStatus, Value: 3 }]
            };
            let data = await this.GetPatientBills(apiReq);
            PatientBills = data.Data[0];
        }
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: Encounter.PatientId });
        let TotalGrossAmount: number = 0;
        let TotalNetAmount: number = 0;
        let TotalDiscount: number = 0;
        let BillDetails: any = [];
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillSummaryFilters.EncounterId, Value: req.Id }]
        };
        let servicecategoryBo = BoFactory.GetBo(clinicalmasterBO.ServiceCategoryBo, this.Request);
        let billSummaryBo = BoFactory.GetBo(billingBO.PatientBillSummaryBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientBillSummary = await billSummaryBo.GetPatientBillSummarys(apiReq);
        await Promise.all(PatientBillSummary.Data.map((splitItem): Promise<void> => {
            return (async (bill): Promise<void> => {
                let summary: any = bill;
                let summaryTotal: number = 0;
                let splitDetails: any = [];
                let PatientBillSplitDetailsBo = BoFactory.GetBo(billingBO.PatientBillSplitDetailsBo, this.Request);
                let splitReq = {
                    Id: 0,
                    PageContext: { PageSize: -1, PageNumber: 1 },
                    Params: [{ Key: PatientBillSplitDetailsFilters.PatientBillSummaryId, Value: bill.Id }]
                };
                if (req.Data.isSupplementary)
                    splitReq.Params.push({ Key: PatientBillSplitDetailsFilters.IsSupplementary, Value: req.Data.isSupplementary });
                let BillSplitDetailsData = await PatientBillSplitDetailsBo.GetPatientBillSplitDetails(splitReq);
                await Promise.all(BillSplitDetailsData.Data.map((billItem): Promise<void> => {
                    return (async (split): Promise<void> => {
                        let billDetailReq = {
                            Id: 0,
                            PageContext: { PageSize: -1, PageNumber: 1 },
                            Params: [{ Key: PatientBillDetailsFilters.Id, Value: split.PatientBillDetailId },
                            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }]
                        };
                        let DetailData = await PatientBillDetailsBo.GetPatientBillDetails(billDetailReq);
                        if (DetailData.Data.length > 0) {
                            let BillDetail: any = DetailData.Data[0];
                            TotalGrossAmount += BillDetail.GrossAmount;
                            TotalDiscount += BillDetail.DiscountAmount;
                            TotalNetAmount += BillDetail.GrossAmount - BillDetail.DiscountAmount;
                            summaryTotal += BillDetail.GrossAmount - BillDetail.DiscountAmount;
                            splitDetails.push(BillDetail);
                        }
                    })(billItem);
                }));
                let ServiceCategoryInfo = await servicecategoryBo.GetServiceCategoryById({ Id: bill.ServiceCategoryId });
                summary.ServiceName = ServiceCategoryInfo.ServiceCategoryName;

                //let withoutpharmacysales: any = [];
                let withpharmacysales: any = [];
                let orderbydatespldet = _.orderBy(splitDetails, ['ServiceId', 'BillDateTime']);
                let roomGroups: any = {};
                let serviceitemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                await Promise.all(orderbydatespldet.map((orderbydatespldetItem: any): Promise<void> => {
                    return (async (detail): Promise<void> => {
                        //console.log(detail);
                        if (detail.ServiceId > 0) {
                            let bIsRoomCharge: boolean = false;
                            let servReq = {
                                Id: 0,
                                PageContext: { PageSize: -1, PageNumber: 1 },
                                Params: [{ Key: 0, Value: detail.ServiceId }]
                            };
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
                                            roomGroups[detail.ServiceId].Quantity += detail.Quantity;
                                            roomGroups[detail.ServiceId].Amount += detail.Amount;
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
                                            roomGroups[detail.ServiceId].Amount = detail.Amount;
                                            roomGroups[detail.ServiceId].Id = detail.Id;
                                            //withoutpharmacysales.push(detail);
                                            withpharmacysales.push(detail);
                                        }
                                    }
                                }
                            }
                            //if (!detail.IsDoctorDisplay && !bIsRoomCharge && !detail.IsPharmacySale && !detail.IsPharmacyReturn) {
                            if (!detail.IsDoctorDisplay && !bIsRoomCharge) {
                                //console.log('normal');
                                detail.User = null;
                                //withoutpharmacysales.push(detail);
                                withpharmacysales.push(detail);
                            } else if (detail.IsDoctorDisplay && !bIsRoomCharge) {
                                //else if (detail.IsDoctorDisplay && !bIsRoomCharge && !detail.IsPharmacySale && !detail.IsPharmacyReturn) {
                                //console.log('only dr');
                                //withoutpharmacysales.push(detail);
                                withpharmacysales.push(detail);
                                //console.log(withoutpharmacysales);
                            } else { // Room Charges
                                //console.log('only Room');
                                /*
                                for (let indx in withoutpharmacysales) {
                                    if (withoutpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                                        withoutpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName + ' (' +
                                            roomGroups[detail.ServiceId].BFDt + ' - ' + roomGroups[detail.ServiceId].BTDt + ' )';
                                        withoutpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                                        withoutpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                                        withoutpharmacysales[indx].Amount = roomGroups[detail.ServiceId].Amount;
                                    }
                                }
                                */
                                for (let indx in withpharmacysales) {
                                    if (withpharmacysales[indx].Id === roomGroups[detail.ServiceId].Id) {
                                        withpharmacysales[indx].ServiceName = roomGroups[detail.ServiceId].ServiceName;
                                        withpharmacysales[indx].Quantity = roomGroups[detail.ServiceId].Quantity;
                                        withpharmacysales[indx].Rate = roomGroups[detail.ServiceId].Rate;
                                        withpharmacysales[indx].Amount = roomGroups[detail.ServiceId].Amount;
                                    }
                                }
                            }
                        }
                    })(orderbydatespldetItem);
                }));
                //summary['SplitedValue'] = splitDetails;
                //summary['SplitedValue'] = withoutpharmacysales;
                summary['SplitedValue'] = withpharmacysales;
                summary['Amount'] = summaryTotal;
                if (splitDetails.length > 0)
                    BillDetails.push(summary);

                let custom_sort = function (a: any, b: any) {
                    return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
                };
                BillDetails.sort(custom_sort);
            })(splitItem);
        }));

        // let billdetailReq = {
        //     Id: 0,
        //     PageContext: { PageSize: -1, PageNumber: 1 },
        //     Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
        //     { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 }]
        // };
        //
        // let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        // for (let idx in BillDetailsData.Data) {
        //     let BillItem = BillDetailsData.Data[idx];
        //     TotalGrossAmount += BillDetailsData.Data[idx].GrossAmount;
        //     TotalNetAmount += BillDetailsData.Data[idx].GrossAmount - BillDetailsData.Data[idx].DiscountAmount;
        //     TotalDiscount += BillDetailsData.Data[idx].DiscountAmount;
        //     BillDetails.push(BillItem);
        // }
        let DueCollect: number = 0;
        let PaidAmount: number = 0;
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
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        for (let idx in PatientPaymentDetailsData.Data) {
            let ReceiptItem = PatientPaymentDetailsData.Data[idx];
            if (PatientPaymentDetailsData.Data[idx].ReceiptStatusId === 1) {
                PaidAmount += PatientPaymentDetailsData.Data[idx].AmountPaid;
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
            { Key: PatientRefundFilters.EncounterTypeId, Value: 2 }]
        };
        let RefundAmount: number = 0;
        let PartialRefundAmount: number = 0;
        let RefundDetails = [];
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);
        for (var idx1 in PatientRefundData.Data) {
            var RefundItem = PatientRefundData.Data[idx1];
            if (PatientRefundData.Data[idx1].RefundStatusId === 1) {
                RefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            }
            if (PatientRefundData.Data[idx1].RefundTypeId === 1)
                PartialRefundAmount += PatientRefundData.Data[idx1].RefundAmount;
            RefundDetails.push(RefundItem);
        }
        let UserReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: req.Data.PrintUser }]
        };
        let UsersBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let PrintUser = await UsersBo.GetUsers(UserReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Encounter.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientBills: PatientBills,
            Encounter: Encounter,
            Patient: patientData,
            BillDetails: BillDetails,
            PatientPaymentDetails: ReceiptDetails,
            TotalGrossAmount: TotalGrossAmount,
            TotalNetAmount: TotalNetAmount,
            TotalDiscount: TotalDiscount,
            DueCollect: DueCollect,
            PaidAmount: PaidAmount,
            NetAmount: (PatientBills.BillAmount + PatientBills.RoundOffValue) - PatientBills.BillDiscount,
            BalanceAmount: (TotalNetAmount - PaidAmount) + PartialRefundAmount,
            currentdate: new Date(),
            PrintUser: PrintUser.Data[0],
            PatientRefund: PatientRefundData.Data,
            RefundAmount: RefundAmount,
            PartialRefundAmount: PartialRefundAmount,
            Preferences: printPreferencesData
        };
        let key = 'dailywisebreakup';
        let pdfOption: any = null;
        {
            if (isFinalized) {
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientBillDetail';
                }
            }
            if (req.Data.isGuarantor) {
                key = 'InpatientbillDetailsGuarantor(i)';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2) {
                    key = 'InpatientbillDetailsGuarantor';
                }
            }
            if (req.Data.isSupplementary) {
                key = 'Supplementry';
                if (info.PatientBills.BillTypeId && info.PatientBills.BillTypeId === 2
                    && info.BillDetails.IsSupplementary === true) {
                    key = 'Supplementry';
                }
            }
            pdfOption = {
                format: 'A4',
                orientation: 'portrait',
                border: '0',
                header: {
                    height: '2in',
                    contents: '',
                },
                footer: {
                    height: '1in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public async isRoomCharges(x: any): Promise<boolean> {
        let res = false;
        let serviceitemBo = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
        let ServiceInfo = await serviceitemBo.GetServiceItemById({ Id: x.ServiceId });
        if (ServiceInfo && ServiceInfo.IsBedCharge) {
            console.log(x.ServiceId + ' ' + x.ServiceCode + ' ' + x.ServiceName + ' ' + ServiceInfo.IsBedCharge);
            res = true;
        }

        return res;
    }

    public async DMPrintPatientBills(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientRefundBo = BoFactory.GetBo(bo.PatientRefundBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientBills.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            BillDetails.push(PatientBillDetail);
        });
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let refundReq = {
            Id: 0,
            PageContext: { PageSize: 1000, PageNumber: 1 },
            Params: [{ Key: PatientRefundFilters.PatientBillId, Value: req.Id },
            { Key: PatientRefundFilters.RefundStatus, Value: 1 }]
        };
        let PatientRefundData = await PatientRefundBo.GetPatientRefund(refundReq);

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PatientBills.FacilityId, PatientBills.StoreMasterId);
        //Preferences: printPreferencesData
        let info = {
            PatientBills: PatientBills,
            BillDetails: BillDetails,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            PatientRefund: PatientRefundData.Data[0],
            Encounter: encounterData.Data[0],
            NetAmount: PatientBills.BillAmount - PatientBills.BillDiscount,
            NetAmountInWords: await this.AmountInWord(PatientBills.BillAmount - PatientBills.BillDiscount),
            Preferences: printPreferencesData,
            PrintData: printStoreData
        };
        return info;
    }

    public async AmountInWord(amt: number): Promise<string> {
        let amount: number = amt;
        let lang = 'enIndian';
        let writtenNumber = require('written-number');
        let stramt = amount.toFixed(2);
        let ActualAmts = stramt.split('.');
        let writtenNumber1 = '';
        let writtenNumber2 = '';
        if (ActualAmts.length > 0) {
            let damt1: number = +ActualAmts[0];
            writtenNumber1 = writtenNumber(damt1, { lang: lang });
        }
        if (ActualAmts.length > 1) {
            let damt2 = +ActualAmts[1];
            writtenNumber2 = writtenNumber(damt2, { lang: lang });
        }
        return writtenNumber1 + ' and ' + writtenNumber2 + ' Paise';
    }

    public async GetLastBillInfo(req: BaseRequest): Promise<any> {
        let BillInfo = await this.Find({
            where: {
                BillTypeId: 4,
                BillDateTime: { '$between': [req.Data.FromDate, req.Data.ToDate] }
            },
            order: [['Id', 'DESC']],
        });
        return BillInfo;
    }

    public GetModel(): SStatic.Model<PharmacyModifyPatBillsInstance, PharmacyModifyPatBillsAttributes> {
        return this.Models.PharmacyModifyPatBills;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let result: any = [];
        result.push({ Key: 'IP Pharmacy Due', Value: await this.IPPharmacyPaymentDetails(req) });
        return result;
    }

    public async GetOPDDashBoardInfo(req: BaseRequest): Promise<any> {
        let OPBillCount = await this.Items.count({
            where: {
                'Status': 1,
                'BillTypeId': 1,
                'PatientBillStatusId': 3,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        let DGBillCount = await this.Items.count({
            where: {
                'Status': 1,
                'BillTypeId': 5,
                'PatientBillStatusId': 3,
                'CreatedAt': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return {
            'OPBillCount': OPBillCount,
            'DGBillCount': DGBillCount
        };
    }

    public async PrintconsumerBills(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientBills(apiReq);
        let PatientBills = data.Data[0];
        let PatientBillDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatBillDetailsBo, this.Request);
        let billdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.PatientBillId, Value: PatientBills.Id }]
        };
        let BillDetailsData = await PatientBillDetailsBo.GetPatientBillDetails(billdetailReq);
        let BillDetails: any = [];
        let TotalCgst: number = 0;
        let TotalSgst: number = 0;
        BillDetailsData.Data.sort(function (a, b) {
            return a.Id - b.Id;
        });
        let BillDetailsAmt = 0;
        let RetAmt = 0;
        let RetCgst = 0;
        let RetSgst = 0;
        BillDetailsData.Data.forEach((Detail: any) => {
            let PatientBillDetail = Detail;
            if (PatientBillDetail.ReturnedQuantity > 0) {
                PatientBillDetail.Quantity -= PatientBillDetail.ReturnedQuantity;
                RetAmt += PatientBillDetail.Rate * PatientBillDetail.ReturnedQuantity;
                RetCgst += PatientBillDetail.UnitCGstAmount * PatientBillDetail.ReturnedQuantity;
                RetSgst += PatientBillDetail.UnitSGstAmount * PatientBillDetail.ReturnedQuantity;
                PatientBillDetail.GSTAmount = PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity;
                PatientBillDetail.Amount = PatientBillDetail.Rate * PatientBillDetail.Quantity;
                PatientBillDetail.NetAmountBeforeGST = PatientBillDetail.Amount - PatientBillDetail.GSTAmount;
            }
            BillDetailsAmt += PatientBillDetail.Amount;
            PatientBillDetail.Amt = Detail.InGstAmount - (Detail.CGstAmount + Detail.SGstAmount);
            TotalCgst += Detail.CGstPercentage;
            TotalSgst += Detail.SGstPercentage;
            BillDetails.push(PatientBillDetail);
        });
        if (BillDetailsAmt === 0) {
            PatientBills.BillAmount = 0;
            PatientBills.RoundOffValue = 0;
            PatientBills.BillDiscount = 0;
            PatientBills.GSTAmount = 0;
            PatientBills.PaidAmount = 0;
        } else {
            PatientBills.BillAmount -= RetAmt;
            //PatientBills.BillDiscount = 0;
            PatientBills.PaidAmount -= RetAmt;
            PatientBills.CGstAmount -= RetCgst;
            PatientBills.SGstAmount -= RetSgst;
        }
        let detailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientPaymentDetailsFilters.PatientBillId, Value: req.Id },
            { Key: PatientPaymentDetailsFilters.ReceiptStatus, Value: 1 }]
        };
        let PatientPaymentDetailsBo = BoFactory.GetBo(bo.PharmacyModifyPatPaymentDetailsBo, this.Request);
        let PatientPaymentDetailsData = await PatientPaymentDetailsBo.GetPatientPaymentDetails(detailReq);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientBills.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientBills.FacilityId, PatientBills.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Encounter: Encounter,
            PatientBills: PatientBills,
            PatientPaymentDetails: PatientPaymentDetailsData.Data,
            BillDetails: BillDetails,
            NetAmount: (PatientBills.BillAmount - PatientBills.BillDiscount) + PatientBills.RoundOffValue,
            TotalCgst: TotalCgst,
            TotalSgst: TotalSgst,
            WithoutTax: PatientBills.BillAmount - PatientBills.GSTAmount,
            Preferences: printPreferencesData
        };

        let key = 'consumerbill';
        let Watermark = '';
        let PrintTypeId: number;
        if (info.PatientBills.PatientBillStatusId === 2) {
            Watermark = 'CANCELLED';
            PrintTypeId = 2;
        }
        let pdfOption: any = null;
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                //format: 'A5',
                height: '5.8in',        // allowed units: mm, cm, in, px 5.8 x 8.3 in
                width: '8.3in',            // allowed units: mm, cm, in, px Width x Height (inch)
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1in',
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
            let printInfo = {
                ObjectId: req.Id
                , ObjectTypeId: 4 /*Order*/
                , Reason: req.Data ? req.Data.Reason : null
                , Watermark: Watermark  /* Provide watermark, if needed other than DUPLICATE */
                , PrintTypeId: PrintTypeId /* Provide 2, if needed watermark all time i.e., CONFIDENTIAL */
            };
            let ephBO = BoFactory.GetBo(generalBO.EntityPrintHistoryBo, this.Request);
            let entityPrintHistoryData = await ephBO.ManagePrintHistory(printInfo);
            if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
                Watermark = Watermark || 'DUPLICATE';
            }
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
            // console.log(pdfOption);
        }
        return await Report.Generate(key, { header: {}, body: info, watermark: Watermark },
            null, pdfOption);
    }

    private async IPPharmacyPaymentDetails(req: BaseRequest): Promise<any> {
        let OPBillResult: any = {};
        OPBillResult['DisplayOrder'] = 100;
        let ipbillamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('BillAmount')), 'TotalAmountPaid'],
            ],
            where: {
                BillTypeId: 3,
                IsPharmacyBill: 1,
                PharmacySaleTypeId: { '$gt': 0 },
                BillDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate }
            }
        });
        if (ipbillamountInstance) {
            let bill: any = this.GetAttribute(ipbillamountInstance);
            OPBillResult['BillAmount'] = bill['TotalAmountPaid'];
        }

        OPBillResult['CashAmount'] = '0.00';
        OPBillResult['CardAmount'] = '0.00';
        OPBillResult['OtherAmount'] = '0.00';

        return OPBillResult;
    }

}
