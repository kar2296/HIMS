import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientBillDetailsFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { PatientOrderFilters } from '../../EMR/Common/Filters.e';
import {
    OPModifyPatBillDetailsInstance,
    OPModifyPatBillDetailsAttributes
} from '../Model/Interface/Index';
import * as encbo from '../../Visit/Business/Index';
import * as appbo from '../../SystemSettings/Business/Index';
import * as orderBo from '../../EMR/Business/Index';
import { BoFactory } from '../../../Modules/Base/Business/Index';

export class OPModifyPatBillDetailsBo extends BaseBo<OPModifyPatBillDetailsInstance,
    OPModifyPatBillDetailsAttributes>  {
    public async AddPatientBillDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }
    public async ManagePatientBillDetails(PatientBillId: number, details: OPModifyPatBillDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientBillId = PatientBillId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) { // Copy from original bill
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                }
            })(DetailItem);
        }));
        return true;
    }


    public async GetPatientBillDetailsById(req: BaseRequest): Promise<OPModifyPatBillDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientInsuranceBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        // 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        include.push({
                            model: this.Models.OPModifyPatBills,
                            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                                'EncounterTypeId', 'EncounterId'],
                            required: true,
                            where: { 'BillTypeId': 3 }
                        });
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async GetPatientBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({
            model: this.Models.ServiceItem, attributes: ['ItemCode'], required: false,
            include: [{
                model: this.Models.ServiceItemPackageMap, required: false
            }]
        });
        include.push({ model: this.Models.ServiceCategory, attributes: ['ServiceCategoryName'], required: false });
        include.push(this.GetReference('PatientBillStatus'));
        include.push({ model: this.Models.OrderStatus, attributes: ['DisplayName'], required: false });
        include.push({
            model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false,
        });
        include.push({
            model: this.Models.ItemMaster, attributes: ['ItemName', 'ProductRegNo', 'SubCategoryId'], required: false,
            include: [
                this.GetReference('ScheduleType'),
                {
                    model: this.Models.VendorMaster, attributes: ['VendorName'], required: false,
                },
                {
                    model: this.Models.ProductType, attributes: ['ProductTypeCode', 'ProductTypeName'], required: false,
                }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'LicenseNo'], required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    // case PatientBillDetailsFilters.PatientBillStatus:          Please Add New Key Name and add the filter case.
                    //     billWhere['PatientBillStatusId'] = param.Value;        Dont Edit in Any Existing Cases.
                    //     isReqBillSearch = true;
                    //     break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.IsSupplementary:
                        (where as any)['$not'] = [{ 'IsSupplementary': !param.Value }];
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsTempIPBill:
                        billWhere['BillTypeId'] = 3;// 3 -> IP Intermediate Bill Type(Bill Modification Screen)
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PatientNameMrn:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': (param.Value || '') + '%' } },
                        { 'MiddleName': { '$like': (param.Value || '') + '%' } },
                        { 'LastName': { '$like': (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientId:
                        billWhere['PatientId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.ServiceId:
                        where['ServiceId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsExclusionItem:
                        where['IsExclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsInclusionItem:
                        where['IsInclusionItem'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.NotInPatientBillStatusIds:
                        where['PatientBillStatusId'] = { '$notIn': param.Value };
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.OPModifyPatBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['VisitIdentifier', 'AdmissionDate', 'DischargeDate'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                }
            ],
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyCredit:
                        where['IsPharmacyCredit'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.OPModifyPatBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn', 'AdmissionDate', 'DischargeDate',
                'EncounterStatusId', 'AdmissionStatusId', 'IsBillLock'],
            required: isReqEncounterSearch,
            include: [
                {
                    model: this.Models.PatientStockReturnDetails,
                    as: 'PatientStockReturnDetails',
                    required: false,
                    where: { 'ReturnStatusId': [2, 3] }
                }
            ]
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetPatientOTPharmacyBillDetails(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<OPModifyPatBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let encounterWhere: WhereOptions<any> = {};
        let isReqEncounterSearch: boolean = false;
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case PatientBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillId:
                        where['PatientBillId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PatientBillStatus:
                        where['PatientBillStatusId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceCategoryId:
                        where['ServiceCategoryId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.ServiceName:
                        where['ServiceName'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        break;
                    case PatientBillDetailsFilters.BillNumber:
                        billWhere['BillNumber'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.IsInvoicedDoctorShare:
                        where['IsInvoicedDoctorShare'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacySale:
                        where['IsPharmacySale'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.DoctorId:
                        where['DoctorId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.EncounterTypeId:
                        billWhere['EncounterTypeId'] = param.Value;
                        isReqBillSearch = true;
                        break;
                    case PatientBillDetailsFilters.DoctorShareAmount:
                        where['DoctorShare'] = { '$gt': param.Value };
                        break;
                    case PatientBillDetailsFilters.VisitIdentifier:
                        encounterWhere['VisitIdentifier'] = param.Value;
                        isReqEncounterSearch = true;
                        break;
                    case PatientBillDetailsFilters.PharmacySaleTypeId:
                        where['PharmacySaleTypeId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.PharmacyServiceCategoryId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ServiceCategoryId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientBillDetailsFilters.ServiceGroupId:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.IsPharmacyCredit:
                        where['IsPharmacyCredit'] = param.Value;
                        break;
                    case PatientBillDetailsFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.ItemMaster,
            required: false
        });
        include.push({
            model: this.Models.OPModifyPatBills,
            attributes: ['BillNumber', 'PatientName', 'DoctorName',
                'PatientOrderId', 'BillTypeId', 'BillDateTime', 'PatientId',
                'EncounterTypeId', 'EncounterId'],
            required: isReqBillSearch,
            where: billWhere,
            include: [{
                model: this.Models.Patient,
                where: patientWhere,
                attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                    'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                    'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
                required: isReqPatientSearch,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],
            }]
        });
        include.push({
            model: this.Models.Encounter,
            where: encounterWhere,
            attributes: ['EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn', 'AdmissionDate', 'DischargeDate',
                'EncounterStatusId', 'AdmissionStatusId', 'IsBillLock'],
            required: isReqEncounterSearch
        });
        order.push(['BillDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async GetPreviousOrders(apiReq?: ApiRequest<PatientBillDetailsFilters>):
        Promise<ApiResponse<any[]>> {
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let PreviousOrderDetails: any = [];
        let OrderBo = BoFactory.GetBo(orderBo.PatientOrderBo, this.Request);
        await Promise.all(PatientBillDetails.map((BillDetailItem): Promise<void> => {
            return (async (BillDetail: any): Promise<void> => {
                var item = BillDetail;
                if (BillDetail.PatientBill.BillTypeId !== 4) {
                    item.OrderNumber = '';
                    if (!BillDetail.IsPharmacySale && !BillDetail.IsPharmacyReturn && BillDetail.MasterTypeId > 0
                        && BillDetail.PatientBill && BillDetail.PatientBill.PatientOrderId) {
                        let OrderApiReq = {
                            Id: 0,
                            PageContext: {
                                PageSize: 10000,
                                PageNumber: 1
                            },
                            Params: [{ Key: PatientOrderFilters.Id, Value: BillDetail.PatientBill.PatientOrderId }]
                        };
                        let OrderDetails: any = await OrderBo.GetPatientOrders(OrderApiReq);
                        item.OrderNumber = OrderDetails.Data[0].OrderNumber;
                        item.OrderStatus = OrderDetails.Data[0].OrderStatus.DisplayName;
                    }
                    PreviousOrderDetails.push(item);
                }
            })(BillDetailItem);
        }));
        return PreviousOrderDetails;
    }

    public async PrintPatientBillDetails(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientBillDetailsFilters.EncounterId, Value: req.Id },
            { Key: PatientBillDetailsFilters.ServiceCategoryId, Value: req.Data.ServiceCategoryId },
            { Key: PatientBillDetailsFilters.PatientBillStatus, Value: 3 },
            { Key: PatientBillDetailsFilters.IsTempIPBill, Value: req.Data.IsTempIPBill }]
        };
        let data = await this.GetPatientBillDetails(apiReq);
        let PatientBillDetails = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let ServiceName: string = req.Data.ServiceName;
        let GrossAmount: number = 0;
        let DiscountAmount: number = 0;
        let NetAmount: number = 0;
        for (var idx in PatientBillDetails) {
            var item = PatientBillDetails[idx];
            GrossAmount += item.GrossAmount;
            DiscountAmount += item.DiscountAmount;
            NetAmount += item.GrossAmount - item.DiscountAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(appbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            PatientBillDetails: PatientBillDetails,
            Encounter: Encounter,
            ServiceName: ServiceName,
            GrossAmount: GrossAmount,
            DiscountAmount: DiscountAmount,
            NetAmount: NetAmount,
            Preferences: printPreferencesData
        };
        return await Report.Generate('breakup', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<OPModifyPatBillDetailsInstance, OPModifyPatBillDetailsAttributes> {
        return this.Models.OPModifyPatBillDetails;
    }


}
