import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDispenseInstance, PatientDispenseAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';
import { PatientDispenseFilters, PatientDispenseDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class PatientDispenseBo extends BaseBo<PatientDispenseInstance, PatientDispenseAttributes> {

    public async AddPatientDispense(req: BaseRequest): Promise<number> {
        /* let seqidentifier = SequenceKeys.DispenseStore; */
        if (req.Data.Header.DispenseStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.DispenseNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
                    }
                } else {
                    req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
                }
            } else {
                req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
            }
            */
            req.Data.Header.DispenseDateTime = new Date();
            req.Data.Header.ApprovedDateTime = new Date();
        } else if (req.Data.Header.DispenseStatusId === 1) {
            req.Data.Header.DispenseDateTime = new Date();
        }
        if (req.Data.Header && req.Data.Header.PatientStockRequestId > 0) {
            let disp_exist = await this.IsDispenseExist(req);
            if (disp_exist <= -1) throw { message: 'Medicine Already Dispensed' };
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientDispenseDetailsBo, this.Request);
            let PatientDispenseId = result.dataValues.Id;
            await detailBO.ManagePatientDispenseDetails(PatientDispenseId, req.Data.Details);

            if (req.Data.Header.DispenseStatusId === 2) {
                let ActualDispensedItems = [];
                ActualDispensedItems = req.Data.Details;
                req.Data.Details = [];
                for (let i = 0, len = ActualDispensedItems.length; i < len; i++) {
                    if (ActualDispensedItems[i].DispensedQuantity > 0) {
                        req.Data.Details.push(ActualDispensedItems[i]);
                    }
                }

                let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(19, PatientDispenseId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Dispense ' + errorMessages.join('$,$') };
                }

                // let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                // await stockitemBO.ManageStockItems(19, PatientDispenseId, req.Data);

                // let stockmovementBO = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(19, PatientDispenseId, req.Data);

                if (req.Data.Header.DispenseTypeId === 1) {
                    let patientstockreqBO = BoFactory.GetBo(ipbo.PatientStockRequestsBo, this.Request);
                    await patientstockreqBO.ManagePatientStockRequest(PatientDispenseId, req.Data);
                }

                let patientbillBO = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                await patientbillBO.AddPatientDispenseBill(PatientDispenseId, req);
            }

            let seqidentifier = SequenceKeys.DispenseStore;
            let dispenseIdentifier: any = null;
            if (req.Data.Header.DispenseStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    if (req.Data.Header.StoreSubTypeId === 2) {
                        if (req.Data.Header.SequenceOptionId === 2) {
                            seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseStore, req.Data.Header.StoreMasterId);
                            dispenseIdentifier = this.getSequenceIdentifier(seqidentifier);
                        } else {
                            dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                        }
                    } else {
                        dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                    }
                } else {
                    dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                }
            }

            if (dispenseIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, patientDispenseId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = patientDispenseId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PatientDispenseId);
                };

                this.deferSequenceKey(PatientDispenseId, 'DispenseNumber', dispenseIdentifier, [afterO().UpdateMovementInfo]);
            }

            return PatientDispenseId;
        }

        return 0;
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let PatDispense: any = {};
        let dispenseamountInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('SUM', this.Dal.col('TotalNetAmount')), 'DispenseAmount'],
            ],
            where: {
                DispenseDateTime: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                FacilityId: req.Data.FacilityId,
            },
        });
        if (dispenseamountInstance) {
            let bill: any = this.GetAttribute(dispenseamountInstance);
            PatDispense['DispenseAmount'] = bill['DispenseAmount'];
        }
        return PatDispense;
    }
    public async UpdatePatientDispense(req: BaseRequest): Promise<boolean> {
        /* let seqidentifier = SequenceKeys.DispenseStore; */
        if (req.Data.Header.DispenseStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.DispenseNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
                    }
                } else {
                    req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
                }
            } else {
                req.Data.Header.DispenseNumber = await Sequence.Next(SequenceKeys.PatientDispenseNumberId);
            }
            */
            req.Data.Header.DispenseDateTime = new Date();
            req.Data.Header.ApprovedDateTime = new Date();
        } else if (req.Data.Header.DispenseStatusId === 1) {
            req.Data.Header.DispenseDateTime = new Date();
        }

        let result = await this.Update(req.Data.Header);
        let PatientDispenseId = req.Data.Header.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientDispenseDetailsBo, this.Request);
            await detailBO.ManagePatientDispenseDetails(PatientDispenseId, req.Data.Details);

            if (req.Data.Header.DispenseStatusId === 2) {
                let ActualDispensedItems = [];
                ActualDispensedItems = req.Data.Details;
                req.Data.Details = [];
                for (let i = 0, len = ActualDispensedItems.length; i < len; i++) {
                    if (ActualDispensedItems[i].DispensedQuantity > 0) {
                        req.Data.Details.push(ActualDispensedItems[i]);
                    }
                }

                let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(19, PatientDispenseId, req.Data);
                } catch (ex) {
                    // throw { message: 'Issue in Dispense Return' };
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Dispense ' + errorMessages.join('$,$') };
                }

                // let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                // await stockitemBO.ManageStockItems(19, PatientDispenseId, req.Data);

                // let stockmovementBO = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(19, PatientDispenseId, req.Data);

                if (req.Data.Header.DispenseTypeId === 1) {
                    let patientstockreqBO = BoFactory.GetBo(ipbo.PatientStockRequestsBo, this.Request);
                    await patientstockreqBO.ManagePatientStockRequest(PatientDispenseId, req.Data);
                }

                let patientbillBO = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                await patientbillBO.AddPatientDispenseBill(PatientDispenseId, req);
            }

            let seqidentifier = SequenceKeys.DispenseStore;
            let dispenseIdentifier: any = null;
            if (req.Data.Header.DispenseStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    if (req.Data.Header.StoreSubTypeId === 2) {
                        if (req.Data.Header.SequenceOptionId === 2) {
                            seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseStore, req.Data.Header.StoreMasterId);
                            dispenseIdentifier = this.getSequenceIdentifier(seqidentifier);
                        } else {
                            dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                        }
                    } else {
                        dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                    }
                } else {
                    dispenseIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseNumberId);
                }
            }

            if (dispenseIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, patientDispenseId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = patientDispenseId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PatientDispenseId);
                };

                this.deferSequenceKey(PatientDispenseId, 'DispenseNumber', dispenseIdentifier, [afterO().UpdateMovementInfo]);
            }

            return PatientDispenseId;
        }

        return result;
    }

    public async GetPatientDispenseById(req: BaseRequest): Promise<PatientDispenseAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDispenses(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<ApiResponse<PatientDispenseAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let storemasterId: -1;
        include.push(this.GetReference('DispenseStatus'));

        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'GuarantorId'], required: false,
            include: [{ model: this.Models.Guarantor, required: false }]
        });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName', 'GstNumber'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'DispenseStore', required: false });
        include.push({ model: this.Models.SurgeryEntry, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'DispensedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.PatientStockRequests,
            required: false,
            include: [{
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'RequestedUser',
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ]
            },
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseFilters.Id:
                        where['PatientDispenseId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseTypeId:
                        where['DispenseTypeId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DispenseStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDispenseFilters.DispenseDate:
                        where['DispenseDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDispenseFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientRequestNumber:
                        where['PatientRequestNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientDispenseFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientDispenseFilters.From:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDispenseFilters.To:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDispenseFilters.RequestedBy:
                        where['RequestedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispensedBy:
                        where['DispensedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientMRN:
                        where['PatientMRN'] = param.Value;
                        break;
                    case PatientDispenseFilters.OTIdentifier:
                        where['OTIdentifier'] = param.Value;
                        break;
                    case PatientDispenseFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientDispenseDetails,
            required: true,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        this.GetReference('ScheduleType'),
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
                },
                {
                    model: this.Models.StockItem,
                    required: false
                },
                {
                    model: this.Models.StockSerialItem,
                    required: false
                }
            ]
        });


        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'DOB', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientDispensesForprint(apiReq?: ApiRequest<PatientDispenseFilters>):
        Promise<ApiResponse<PatientDispenseAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let storemasterId: -1;
        include.push(this.GetReference('DispenseStatus'));

        // include.push({
        //     model: this.Models.Encounter, attributes: ['VisitIdentifier', 'GuarantorId'], required: false,
        //     include: [{ model: this.Models.Guarantor, required: false }]
        // });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName', 'GstNumber'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'DispenseStore', required: false });
        // include.push({ model: this.Models.SurgeryEntry, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'DispensedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.PatientStockRequests,
            required: false,
            include: [{
                model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'RequestedUser',
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ]
            },
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseFilters.Id:
                        where['PatientDispenseId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseTypeId:
                        where['DispenseTypeId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DispenseStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDispenseFilters.DispenseDate:
                        where['DispenseDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDispenseFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientRequestNumber:
                        where['PatientRequestNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientDispenseFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientDispenseFilters.From:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDispenseFilters.To:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDispenseFilters.RequestedBy:
                        where['RequestedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispensedBy:
                        where['DispensedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientMRN:
                        where['PatientMRN'] = param.Value;
                        break;
                    case PatientDispenseFilters.OTIdentifier:
                        where['OTIdentifier'] = param.Value;
                        break;
                    case PatientDispenseFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.OTRegisterId:
                        where['OTRegisterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientDispenseDetails,
            required: true,
            include: [
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        this.GetReference('ScheduleType'),
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
                },
                {
                    model: this.Models.StockItem,
                    required: false
                },
                {
                    model: this.Models.StockSerialItem,
                    required: false
                }
            ]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'DOB', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }
    public async GetPatientDispensedListWithoutDetails(apiReq?: ApiRequest<PatientDispenseFilters>):
        Promise<ApiResponse<PatientDispenseAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        // let itemWhere: WhereOptions<any> = {};
        // let isReqItemSearch: boolean = false;
        include.push(this.GetReference('DispenseStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName', 'GstNumber'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'DispenseStore', attributes: ['Id', 'StoreName'], required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'DispensedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseFilters.Id:
                        where['PatientDispenseId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseTypeId:
                        where['DispenseTypeId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DispenseStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDispenseFilters.DispenseDate:
                        where['DispenseDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDispenseFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientRequestNumber:
                        where['PatientRequestNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientStockRequestId:
                        where['PatientStockRequestId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientDispenseFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientDispenseFilters.From:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDispenseFilters.To:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDispenseFilters.RequestedBy:
                        where['RequestedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispensedBy:
                        where['DispensedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatus:
                        where['DispenseStatusId'] = param.Value;
                        break;
                    // case PatientDispenseFilters.ItemMasterId:
                    //     itemWhere['ItemMasterId'] = param.Value;
                    //     isReqItemSearch = true;
                    //     break;
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
        // include.push({
        //     model: this.Models.PatientDispenseDetails,
        //     attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName'],
        //     required: isReqItemSearch,
        //     where: itemWhere,
        //     //include: [this.GetReference('Title'), this.GetReference('Gender')]
        // });
        apiReq.Attributes = ['Id', 'PatientRequestNumber', 'DispenseNumber', 'DispenseDateTime', 'DispensedBy',
            'DispensedValue', 'TotalNetAmount', 'DispenseStatusId',
            'OrganizationId', 'FacilityId',
            'DepartmentId', 'StoreMasterId',
            'PatientId', 'PatientTypeId',
            'WardId', 'RoomId', 'BedId'];
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPatientDispensedList(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<ApiResponse<PatientDispenseAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let itemWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        include.push(this.GetReference('DispenseStatus'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName', 'GstNumber'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'DispenseStore', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'DispensedUser', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseFilters.Id:
                        where['PatientDispenseId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseTypeId:
                        where['DispenseTypeId'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DispenseStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDispenseFilters.DispenseDate:
                        where['DispenseDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDispenseFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientRequestNumber:
                        where['PatientRequestNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientDispenseFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientDispenseFilters.From:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDispenseFilters.To:
                        where['DispenseDateTime'] = where['DispenseDateTime'] || {};
                        (where['DispenseDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDispenseFilters.RequestedBy:
                        where['RequestedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispensedBy:
                        where['DispensedBy'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseNumber:
                        where['DispenseNumber'] = param.Value;
                        break;
                    case PatientDispenseFilters.DispenseStatus:
                        where['DispenseStatusId'] = param.Value;
                        break;
                    case PatientDispenseFilters.ItemMasterId:
                        itemWhere['ItemMasterId'] = param.Value;
                        isReqItemSearch = true;
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
            model: this.Models.PatientDispenseDetails,
            attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName'],
            required: isReqItemSearch,
            where: itemWhere,
            //include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientDispense(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientDispense(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDispenseFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientDispensesForprint(apiReq);
        let PatientDispense = data.Data[0];
        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PatientDispense.DispenseDateTime);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PatientDispense.StoreMasterId
            }
        });
        let PatientDispenseDetailsBo = BoFactory.GetBo(bo.PatientDispenseDetailsBo, this.Request);
        let PatientDispensedetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientDispenseDetailFilters.PatientDispenseId, Value: req.Id }]
        };
        let PatientDispenseDetailsData = await PatientDispenseDetailsBo.GetPatientDispenseDetails(PatientDispensedetailReq);
        let PatientDispenseDetails: any = [];
        PatientDispenseDetailsData.Data.forEach((Detail: any) => {
            var PatientDispenseDetail = Detail;
            PatientDispenseDetail.Amt = Detail.NetAmount - (Detail.CGstAmount + Detail.SGstAmount);
            PatientDispenseDetails.push(PatientDispenseDetail);
        });
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDispense.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientDispense.FacilityId, PatientDispense.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        if (licenses) {
            console.log('License Details');
            console.log(licenses);
            if (printPreferencesData.pharmacyprintheader) {
                console.log('printPreferencesData');
                console.log(printPreferencesData.pharmacyprintheader);

                let html = printPreferencesData.pharmacyprintheader;

                // Replace only the text inside the <div class="address1 tst1">
                html = html.replace(/(<div[^>]*class="address1 tst1"[^>]*>)(.*?)(<\/div>)/i,
                    '$1DL : ' + licenses.LicenseNo
                );
                printPreferencesData.pharmacyprintheader = html;
            }
        }
        let info = {
            PatientDispense: PatientDispense,
            PatientDispenseDetails: PatientDispenseDetails,
            WithoutTax: PatientDispense.TotalGrossAmount - PatientDispense.TotalGstAmount,
            Preferences: printPreferencesData

        };
        let pdfOption: any = null;
        let key = 'dispenseworklist';
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

    public GetModel(): SStatic.Model<PatientDispenseInstance, PatientDispenseAttributes> {
        return this.Models.PatientDispense;
    }
    public async PrintPatientIPDispensesReport(apiReq?: ApiRequest<PatientDispenseFilters>): Promise<any> {
        let data = await this.GetPatientDispenses(apiReq);
        let PatientDispenses = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let StoreName = apiReq.Data.StoreName;
        let WardName = apiReq.Data.WardName;
        let Status = apiReq.Data.Status;
        let PatientDispensesData = data.Data[0];
        let TotalAmount: number = 0;
        for (let idx in PatientDispenses) {
            let item = PatientDispenses[idx];
            TotalAmount += item.TotalGrossAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDispensesData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientDispensesData.FacilityId, PatientDispensesData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientDispenses: PatientDispenses,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            WardName: WardName,
            Status: Status,
            TotalAmount: TotalAmount,


        };
        let pdfOption: any = null;
        let key = 'patientipdispensedreport';
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
    public async IsDispenseExist(req: any): Promise<number> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientDispenseFilters.PatientStockRequestId, Value: req.Data.Header.PatientStockRequestId },
                { Key: PatientDispenseFilters.DispenseStatusId, Value: req.Data.Header.DispenseStatusId },
                { Key: PatientDispenseFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
                { Key: PatientDispenseFilters.FacilityId, Value: req.Data.Header.FacilityId },

            ]
        };
        let data = await this.GetPatientDispensedListWithoutDetails(apiReq);
        if (data.Data && data.Data.length > 0) {
            return (data.Data.length * -1);
        }
        return 1;
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }
}
