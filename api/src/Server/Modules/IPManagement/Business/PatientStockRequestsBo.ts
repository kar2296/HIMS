import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientStockRequestsInstance, PatientStockRequestsAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../IPManagement/Business/Index';
import * as pbo from '../../EMR/Business/Index';
import { PatientStockRequestsFilters, PatientStockRequestDetailsFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
//import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { ItemMasterFilters } from '../../Pharmacy/Common/Filters.e';
import { join } from 'path';
import {
    EncounterFilters
} from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';

export class PatientStockRequestsBo extends BaseBo<PatientStockRequestsInstance, PatientStockRequestsAttributes> {

    public async AddPatientStockRequests(req: BaseRequest): Promise<number> {
        if (req.Data.Header.PatientRequestStatusId === 2) {
            req.Data.Header.PatientRequestNumber = await Sequence.Next(SequenceKeys.PatientRequestNumberId);

            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            await prescriptionBO.CreatePrescription(req);

            for (let i = 0, len = req.Data.Details.length; i < len; i++) {
                if (req.Data.Details[i].Id > 0) {
                    if (req.Data.Details[i].DrugId > 0) {
                        req.Data.Details[i].PrescriptionDetailId = req.Data.Details[i].Id;
                        req.Data.Details[i].Id = 0;
                    }
                }
            }
        }

        let result = await this.Save(req.Data.Header);
        let PatientStockRequestsId = result.dataValues.Id;

        let detailBO = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);
        await detailBO.ManagePatientStockRequestDetails(PatientStockRequestsId, req.Data.Details);
        return PatientStockRequestsId;
    }

    public async UpdatePatientStockRequests(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.Id > 0 && req.Data.Header.PatientRequestStatusId === 2) {
            req.Data.Header.PatientRequestNumber = await Sequence.Next(SequenceKeys.PatientRequestNumberId);

            let PatientStockRequestId = req.Data.Header.Id;
            req.Data.Header.Id = 0;
            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            await prescriptionBO.CreatePrescription(req);

            for (let i = 0, len = req.Data.Details.length; i < len; i++) {
                if (req.Data.Details[i].Id > 0) {
                    if (req.Data.Details[i].DrugId > 0) {
                        req.Data.Details[i].PrescriptionDetailId = req.Data.Details[i].Id;
                        req.Data.Details[i].Id = req.Data.Details[i].TempId;
                    }
                }
            }

            req.Data.Header.Id = PatientStockRequestId;
        } else if (req.Data.Header.Id > 0 && req.Data.Header.PatientRequestStatusId === 6) {
            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            await prescriptionBO.CancelPrescription(req);
        }

        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);

        let PatientStockRequestsId = req.Data.Header.Id;
        await detailBO.ManagePatientStockRequestDetails(PatientStockRequestsId, req.Data.Details);
        return result;
    }

    public async ManagePatientStockRequest(PatientDispenseId: number, request: any): Promise<any> {
        let patientstockreq = await this.GetPatientStockRequestsById({ Id: request.Header.PatientStockRequestId });
        patientstockreq.PatientRequestStatusId = request.Header.PatientRequestStatusId;
        patientstockreq.DispenseDateTime = request.Header.DispenseDateTime;
        patientstockreq.DispensedBy = request.Header.DispensedBy;
        patientstockreq.Rev = request.Header.PatientStockRequestRev;
        await this.Update(patientstockreq);

        let PSRDBo = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);
        await PSRDBo.ManagePatientStockRequestDetailsAfterDispense(PatientDispenseId, request);

        let patientprescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
        await patientprescriptionBO.ManagePatientPrescription(PatientDispenseId, request);
    }

    public async GetPatientStockRequestsById(req: BaseRequest): Promise<PatientStockRequestsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPendingIndents(req: BaseRequest): Promise<any> {
        let patStockReqDetailBO = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageNumber: 1, PageSize: 100 },
            Params: [{ Key: PatientStockRequestDetailsFilters.PatientStockRequestId, Value: req.Id }]
        };
        let indents: any = await patStockReqDetailBO.GetPatientStockRequestDetails(apiReq);
        let PatientStockRequests = indents.Data[0].PatientStockRequests;
        let PharmacyItems: any = [];
        await Promise.all(indents.Data.map((IndentItem: any): Promise<void> => {
            return (async (requesteditem): Promise<void> => {
                let PatientStockRequestDetailId = requesteditem.Id;
                let requestedQuantity = requesteditem.RequestedQuantity;
                let pharmacyItemReq = {
                    Id: 0,
                    PageContext: { PageNumber: 1, PageSize: 100 },
                    Params: [{ Key: ItemMasterFilters.Id, Value: requesteditem.ItemMasterId },
                    { Key: ItemMasterFilters.StoreMasterId, Value: PatientStockRequests.ToStoreId }]
                };
                let itemmasterBO = BoFactory.GetBo(invbo.ItemMasterBo, this.Request);
                let ItemMasterData = await itemmasterBO.GetPrescribedItems(pharmacyItemReq);
                ItemMasterData.Data[0].StorageConditionId = PatientStockRequestDetailId;
                ItemMasterData.Data[0].Min = requestedQuantity;
                ItemMasterData.Data[0].Max = requestedQuantity;
                PharmacyItems.push(ItemMasterData.Data[0]);
            })(IndentItem);
        }));
        return PharmacyItems;
    }

    public async GetPatientStockRequestsList(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let storemasterId = -1;
        let guarantorsearchid = -1;
        /*
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        */
        include.push(this.GetReference('PatientRequestStatus'));
        include.push(this.GetReference('PatientRequestType'));
        include.push(this.GetReference('PatientRequestPriority'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false
        }),
            include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DispensedUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockRequestsFilters.Id:
                        where['PatientStockRequestId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestNumber:
                        (where as any)[Op.or] = [{ PatientRequestNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientStockRequestsFilters.PatientRequestStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PatientRequestStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientStockRequestsFilters.PatientRequestDate:
                        where['PatientRequestDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientStockRequestsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestPriorityId:
                        where['PatientRequestPriorityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestTypeId:
                        where['PatientRequestTypeId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ToStoreId:
                        storemasterId = param.Value;
                        where['ToStoreId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Patientname:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientStockRequestsFilters.RequestedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ApprovedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.From:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        (where['PatientRequestDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.To:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        // (where['PatientRequestDateTime'] as any)['$lte'] = param.Value + ' 23:59:59';
                        (where['PatientRequestDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Guarantor:
                        guarantorsearchid = param.Value;
                        /*
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ItemMasterId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        */
                        break;
                    case PatientStockRequestsFilters.PatientRequestStatusId:
                        where['PatientRequestStatusId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.IsCash:
                        where['IsCash'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientStockRequestDetails,
            required: true,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        this.GetReference('ScheduleType'),
                        { model: this.Models.UomMaster, as: 'SaleUom', required: false },
                        { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                        { model: this.Models.UomMaster, as: 'BaseUom', required: false },
                        { model: this.Models.DrugMaster, required: false },
                        {
                            model: this.Models.GuarantorSupplementary,
                            required: false,
                            attributes: ['Id', 'ItemMasterId'],
                            where: { 'GuarantorId': guarantorsearchid },
                            as: 'Supplementary'
                        },
                        {
                            model: this.Models.StockItem,
                            required: false,
                            /*
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            */
                            where: { 'StoreMasterId': storemasterId },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    /*
                                    attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                                    */
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: new Date() } }
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        // include.push({
        //     model: this.Models.Encounter,
        //     attributes: ['Id', 'EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn',
        //         'AdmissionStatusId', 'EncounterStatusId', 'IsBillLock', 'GuarantorId'],
        //     required: false,
        //     include: [{
        //         model: this.Models.Guarantor, required: false
        //     }]
        //     // required: isReqPatientSearch,
        //     // where: patientWhere
        // });
        order.push(['PatientRequestDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientStockRequests(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let storemasterId = -1;
        let guarantorsearchid = -1;
        /*
        let GuarantorId_ = 1000;
        let guarantorBO = BoFactory.GetBo(generalMasterBO.GuarantorBo, this.Request);
        await guarantorBO.GetCurrentGuarantorId().then(function (result) {
            GuarantorId_ = result;
        });
        */
        include.push(this.GetReference('PatientRequestStatus'));
        include.push(this.GetReference('PatientRequestType'));
        include.push(this.GetReference('PatientRequestPriority'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({
            model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false
        }),
            include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CancelledUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DispensedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockRequestsFilters.Id:
                        where['PatientStockRequestId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestNumber:
                        (where as any)[Op.or] = [{ PatientRequestNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientStockRequestsFilters.PatientRequestStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PatientRequestStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientStockRequestsFilters.PatientRequestDate:
                        where['PatientRequestDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientStockRequestsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestPriorityId:
                        where['PatientRequestPriorityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestTypeId:
                        where['PatientRequestTypeId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ToStoreId:
                        storemasterId = param.Value;
                        where['ToStoreId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Patientname:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientStockRequestsFilters.RequestedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ApprovedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.From:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        (where['PatientRequestDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.To:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        (where['PatientRequestDateTime'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case PatientStockRequestsFilters.Guarantor:
                        guarantorsearchid = param.Value;
                        /*
                        if (param.Value !== GuarantorId_) {
                            include.push({
                                model: this.Models.GuarantorSupplementary,
                                attributes: ['Id', 'ItemMasterId'],
                                required: false,
                                where: {
                                    'GuarantorId': param.Value
                                },
                                as: 'Supplementary'
                            });
                        }
                        */
                        break;
                    case PatientStockRequestsFilters.PatientRequestStatusId:
                        where['PatientRequestStatusId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.IsCash:
                        where['IsCash'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientStockRequestDetails,
            required: true,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        this.GetReference('ScheduleType'),
                        { model: this.Models.UomMaster, as: 'SaleUom', required: false },
                        { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                        { model: this.Models.UomMaster, as: 'BaseUom', required: false },
                        { model: this.Models.DrugMaster, required: false },
                        {
                            model: this.Models.GuarantorSupplementary,
                            required: false,
                            attributes: ['Id', 'ItemMasterId'],
                            where: { 'GuarantorId': guarantorsearchid },
                            as: 'Supplementary'
                        },
                        {
                            model: this.Models.StockItem,
                            required: false,
                            /*
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            */
                            where: { 'StoreMasterId': storemasterId },
                            include: [
                                {
                                    model: this.Models.StockSerialItem,
                                    required: false,
                                    /*
                                    attributes: ['Id', 'StockItemId', 'StoreMasterId', 'ItemMasterId', 'BatchId',
                                        'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId',
                                        'InGstPercentage', 'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                                    */
                                    where: { 'Quantity': { $gt: 0 }, 'ExpiryDate': { $gt: new Date() } }
                                }
                            ]
                        }
                    ]
                }
            ]
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
            attributes: ['Id', 'EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn',
                'AdmissionStatusId', 'EncounterStatusId', 'IsBillLock', 'GuarantorId'],
            required: false,
            include: [{
                model: this.Models.Guarantor, required: false
            }]
            // required: isReqPatientSearch,
            // where: patientWhere
        });
        order.push(['PatientRequestDateTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientWorkLists(apiReq?: ApiRequest<PatientStockRequestsFilters>)
        : Promise<ApiResponse<PatientStockRequestsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let guarantorWhere: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let guarantorsearchid: boolean = false;

        include.push(this.GetReference('PatientRequestStatus'));
        include.push(this.GetReference('PatientRequestType'));
        include.push(this.GetReference('PatientRequestPriority'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', attributes: ['Id', 'StoreName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockRequestsFilters.Id:
                        where['PatientStockRequestId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestNumber:
                        (where as any)[Op.or] = [{ PatientRequestNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientStockRequestsFilters.PatientRequestStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PatientRequestStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientStockRequestsFilters.PatientRequestDate:
                        where['PatientRequestDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientStockRequestsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestPriorityId:
                        where['PatientRequestPriorityId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestTypeId:
                        where['PatientRequestTypeId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ToStoreId:
                        where['ToStoreId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.BedId:
                        where['BedId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Patientname:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientStockRequestsFilters.RequestedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ApprovedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.PatientRequestDateTime:
                        where['PatientRequestDateTime'] = { '$between': param.Value };
                        break;
                    case PatientStockRequestsFilters.From:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        (where['PatientRequestDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.To:
                        where['PatientRequestDateTime'] = where['PatientRequestDateTime'] || {};
                        (where['PatientRequestDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.FromCreatedAt:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$gte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.ToCreatedAt:
                        where['CreatedAt'] = where['CreatedAt'] || {};
                        (where['CreatedAt'] as any)['$lte'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.IsCash:
                        where['IsCash'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.Guarantor:
                        guarantorsearchid = true;
                        guarantorWhere['GuarantorId'] = param.Value;
                        break;
                    case PatientStockRequestsFilters.GuarantorTypeId:
                        guarantorsearchid = true;
                        guarantorWhere['GuarantorTypeId'] = param.Value;
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
            attributes: ['VisitIdentifier', 'GuarantorTypeId', 'GuarantorId'],
            include: [
                this.GetReference('GuarantorType'),
                { model: this.Models.Guarantor, attributes: ['GuarantorName'], required: false }
            ],
            required: guarantorsearchid,
            where: guarantorWhere,
        });
        order.push(['PatientRequestDateTime', 'DESC']);
        // apiReq.Attributes = ['Id', 'PatientId', 'DoctorId', 'ToStoreId', '', '', '', ''];
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async CompletePatientStockRequest(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PrescriptionId > 0) {
            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            await prescriptionBO.CompletePrescription(req);
        }

        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async RejectPatientStockRequest(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PrescriptionId > 0) {
            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            await prescriptionBO.RejectPrescription(req);
        }

        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async PrintPatientStockRequest(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientStockRequestsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientStockRequestsList(apiReq);
        let PatientStockRequests = data.Data[0];
        let EncId = PatientStockRequests.EncounterId;
        let PatientStockRequestDetailsBo = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);
        let StockRequestdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientStockRequestDetailsFilters.PatientStockRequestId, Value: req.Id }]
        };
        let PatientStockRequestDetailsData = await PatientStockRequestDetailsBo.GetPatientStockRequestDetails(StockRequestdetailReq);
        let PatientStockRequestDetails = PatientStockRequestDetailsData.Data;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientStockRequests.FacilityId);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: EncId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let info = {
            PatientStockRequests: PatientStockRequests,
            PatientStockRequestDetails: PatientStockRequestDetails,
            Preferences: printPreferencesData,
            Encounter: Encounter

        };
        let pdfOption: any = null;
        let key = 'patientrequest';
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

    public async PrintPatientStockReceive(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientStockRequestsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientStockRequests(apiReq);
        let PatientStockRequests = data.Data[0];
        let PatientStockRequestDetailsBo = BoFactory.GetBo(bo.PatientStockRequestDetailsBo, this.Request);
        let StockRequestdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientStockRequestDetailsFilters.PatientStockRequestId, Value: req.Id }]
        };
        let PatientStockRequestDetailsData = await PatientStockRequestDetailsBo.GetPatientStockRequestDetails(StockRequestdetailReq);
        let PatientStockRequestDetails = PatientStockRequestDetailsData.Data;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientStockRequests.FacilityId);
        let info = {
            PatientStockRequests: PatientStockRequests,
            PatientStockRequestDetails: PatientStockRequestDetails,
            Preferences: printPreferencesData

        };
        let pdfOption: any = null;
        let key = 'patientreceive';
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

    public async DeletePatientStockRequests(req: BaseRequest): Promise<Boolean> {
        if (req.Data.Header.PrescriptionId > 0) {
            let prescriptionBO = BoFactory.GetBo(pbo.PrescriptionBo, this.Request);
            //await prescriptionBO.CancelPrescription(req);
            await prescriptionBO.DeletePatientPrescription(req);
        }

        return await this.MarkAsDelete(req.Data.Header.Id);
    }

    public async GetOtDashboardInfo(req: BaseRequest): Promise<any> {
        let MedicineRequestCount = await this.Items.count({
            where: {
                'Status': 1,
                'PatientRequestStatusId': { '$in': [2, 3] }
            }
        });
        return {
            'MedicineRequestCount': MedicineRequestCount,
        };
    }
    public async PrintPatientMedicineReport(apiReq?: ApiRequest<PatientStockRequestsFilters>): Promise<any> {
        let data = await this.GetPatientStockRequests(apiReq);
        let PatientMedicineIndent = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let WardName = apiReq.Data.WardName;
        let Status = apiReq.Data.Status;
        let PatientMedicineIndentData = data.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientMedicineIndentData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientMedicineIndentData.FacilityId, PatientMedicineIndentData.ToStoreId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientMedicineIndent: PatientMedicineIndent,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            WardName: WardName,
            Status: Status,

        };
        let pdfOption: any = null;
        let key = 'patientmedicineindentreport';
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
    public GetModel(): SStatic.Model<PatientStockRequestsInstance, PatientStockRequestsAttributes> {
        return this.Models.PatientStockRequests;
    }

}
