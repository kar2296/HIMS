import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo, Template } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseOrderInstance, PurchaseOrderAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { PurchaseOrderFilters, PurchaseOrderDetailFilters, VendorContactFilters, GrnFilters, GrnDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { unlinkSync } from 'fs';
import { readFileSync } from 'fs';

export class PurchaseOrderBo extends BaseBo<PurchaseOrderInstance, PurchaseOrderAttributes> {
    public async AddPurchaseOrder(req: BaseRequest): Promise<boolean | any> {
        if (req.Data.Header.PoStatusId === 2 && !req.Data.Header.PoNumber) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PoNumber = await Sequence.Next(SequenceKeys.MDPurchaseOrderId);
            } else {
                req.Data.Header.PoNumber = await Sequence.Next(SequenceKeys.NMDPurchaseOrderId);
            }
            */
            req.Data.Header.PoDate = new Date();
            req.Data.Header.RequestedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.PoStatusId === 1) {
            req.Data.Header.PoDate = new Date();
            req.Data.Header.RequestedDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (!result) {
            return false;
        }
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseOrderDetailBo, this.Request);
            let PurchaseOrderId = result.dataValues.Id;
            await detailBO.ManagePurchaseOrderDetails(PurchaseOrderId, req.Data.Details);

            let poIdentifier: any = null;
            if (req.Data.Header.PoStatusId === 2 && !req.Data.Header.PoNumber) {
                if (req.Data.Header.IsGeneralPo === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);

                }
                if (req.Data.Header.IsGeneralPo === false) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.GeneralPurchaseOrderId, req.Data.Header.FacilityId);

                }
                if (req.Data.Header.IsConsignment === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);
                }
                if (req.Data.Header.IsConsignment === false) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId, req.Data.Header.FacilityId);
                }
            }
            if (req.Data.Header.PoStatusId === 3 && !req.Data.Header.PoNumber) {
                if (req.Data.Header.IsGeneralPo === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);

                }
                if (req.Data.Header.IsConsignment === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);
                }
                if (req.Data.Header.IsConsignment === false) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId, req.Data.Header.FacilityId);
                }
            }
            /*
            if (req.Data.Header.PoStatusId === 2 && poIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, purchaseOrderId) => {
                        return {
                            sendPurchaseOrderFaciltySMS: async (code: string) => {
                                request.Data.PoNumber = code;
                                await bo.sendPurchaseOrderFaciltySMS(request);
                            }
                        };
                    })(this, req, PurchaseOrderId);
                };
                this.deferSequenceKey(PurchaseOrderId, 'PoNumber', poIdentifier, [afterO().sendPurchaseOrderFaciltySMS]);
            }
            */
            if (poIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, purchaseOrderId) => {
                        return {
                            processEmail: async (code: string) => {
                                request.Data.Id = purchaseOrderId;
                                request.Data.PoNumber = code;
                                request.Data.VendorName = request.Data.Header.VendorName;
                                request.Data.Email = request.Data.Header.EmailAddress;
                                request.Data.FacilityMail = request.Data.Header.FacilityMail;
                                request.Data.userName = request.Data.Header.Email;
                                request.Data.password = request.Data.Header.Password;
                                await bo.ProcessEmail(request);
                            },
                            sendPurchaseOrderFaciltySMS: async (code: string) => {
                                request.Data.PoNumber = code;
                                await bo.sendPurchaseOrderFaciltySMS(request);
                            }
                        };
                    })(this, req, PurchaseOrderId);
                };

                this.deferSequenceKey(PurchaseOrderId, 'PoNumber', poIdentifier,
                    [
                        afterO().processEmail,
                        afterO().sendPurchaseOrderFaciltySMS
                    ]);
            }

            return PurchaseOrderId;
        }

        return true;
    }
    public async UploadAttachment(req: BaseRequest): Promise<boolean> {
        if (req.Data.UploadedFile === 'Attachment') {
            let Attachment = this.Request.file;
            if (Attachment) {
                let filepath: string = Attachment.path;
                req.Data.Attachment = filepath;
            }
        }
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetViewAttachment(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.Attachment);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }
    public async UpdatePurchaseOrder(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.Attachment = file.path;
        }
        if (req.Data.Header.PoStatusId === 2 && !req.Data.Header.PoNumber) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PoNumber = await Sequence.Next(SequenceKeys.MDPurchaseOrderId);
            } else {
                req.Data.Header.PoNumber = await Sequence.Next(SequenceKeys.NMDPurchaseOrderId);
            }
            */
            if (req.Data.Header.AmendedBy > 0) {
                req.Data.Header.AmendedDate = new Date();
            } else {
                req.Data.Header.PoDate = new Date();
                req.Data.Header.RequestedDate = new Date();
                req.Data.Header.ApprovedDate = new Date();
            }
        } else if (req.Data.Header.PoStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseOrderDetailBo, this.Request);
            let PurchaseOrderId = req.Data.Header.Id;
            await detailBO.ManagePurchaseOrderDetails(PurchaseOrderId, req.Data.Details);

            let poIdentifier: any = null;
            if (req.Data.Header.PoStatusId === 2 && !req.Data.Header.PoNumber) {
                // if (req.Data.Header.IsGeneralPo === true) {
                //     poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId,
                //         req.Data.Header.FacilityId
                //     );
                // } else {
                //     poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId,
                //         req.Data.Header.FacilityId
                //     );
                // }
                if (req.Data.Header.IsGeneralPo === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);

                }
                if (req.Data.Header.IsConsignment === true) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);
                }
                if (req.Data.Header.IsConsignment === false) {
                    // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                    poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId, req.Data.Header.FacilityId);
                }
            } else {
                if (req.Data.Header.PoStatusId === 3 && !req.Data.Header.PoNumber) {
                    // if (req.Data.Header.IsGeneralPo === true) {
                    //     poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId,
                    //         req.Data.Header.FacilityId
                    //     );
                    // } else {
                    //     poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId,
                    //         req.Data.Header.FacilityId
                    //     );
                    // }
                    if (req.Data.Header.IsGeneralPo === true) {
                        // poIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDPurchaseOrderId);
                        poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);

                    }
                    if (req.Data.Header.IsConsignment === true) {
                        // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                        poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseOrderId, req.Data.Header.FacilityId);
                    }
                    if (req.Data.Header.IsConsignment === false) {
                        // poIdentifier = this.getSequenceIdentifier(SequenceKeys.MDPurchaseOrderId);
                        poIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseOrderId, req.Data.Header.FacilityId);
                    }
                }
            }

            if (poIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, purchaseOrderId) => {
                        return {
                            processEmail: async (code: string) => {
                                request.Data.Id = purchaseOrderId;
                                request.Data.PoNumber = code;
                                request.Data.VendorName = request.Data.Header.VendorName;
                                request.Data.Email = request.Data.Header.EmailAddress;
                                request.Data.FacilityMail = request.Data.Header.FacilityMail;
                                request.Data.userName = request.Data.Header.Email;
                                request.Data.password = request.Data.Header.Password;
                                await bo.ProcessEmail(request);
                            },
                            sendPurchaseOrderFaciltySMS: async (code: string) => {
                                request.Data.PoNumber = code;
                                await bo.sendPurchaseOrderFaciltySMS(request);
                            }
                        };
                    })(this, req, PurchaseOrderId);
                };

                this.deferSequenceKey(PurchaseOrderId, 'PoNumber', poIdentifier,
                    [
                        afterO().processEmail,
                        afterO().sendPurchaseOrderFaciltySMS
                    ]);
            }

            return PurchaseOrderId;
        }

        return result;
    }

    public async ManagePurchaseOrder(GrnId: number, request: any): Promise<any> {

        let purchaseorder = await this.GetPurchaseOrderById({ Id: request.Header.PurchaseOrderId });
        let pobo = BoFactory.GetBo(invbo.PurchaseOrderDetailBo, this.Request);
        let popiReq: any = {
            Params: [
                { Key: PurchaseOrderDetailFilters.PurchaseOrderId, Value: request.Header.PurchaseOrderId },
            ]
        };
        let podata = await pobo.GetPurchaseOrderDetails(popiReq);
        let orderedTotal: number = 0;
        if (podata && podata.Data && podata.Data.length > 0) {
            for (var i = 0; i < podata.Data.length; i++) {
                orderedTotal = orderedTotal + podata.Data[i].PoQuantity;
            }
        }
        let grnheader = [];
        let grnbo = BoFactory.GetBo(invbo.GrnBo, this.Request);
        let grnapiReq: any = {
            Params: [
                { Key: GrnFilters.PoNumber, Value: request.Header.PoNumber },
            ]
        };
        let grndata = await grnbo.GetGrns(grnapiReq);
        if (grndata && grndata.Data && grndata.Data.length > 0) {
            for (var x = 0; x < grndata.Data.length; x++) {
                let grnheaderinfo = grndata.Data[x];
                grnheader.push(grnheaderinfo.Id);
            }
        }
        let grndetailbo = BoFactory.GetBo(invbo.GrnDetailBo, this.Request);
        let apiReq: any = {
            Params: [
                { Key: GrnDetailFilters.GrnIds, Value: grnheader },
            ]
        };
        let grndetailinfo = await grndetailbo.GetGrnDetails(apiReq);

        let purchasedTotal: number = 0;
        if (grndetailinfo && grndetailinfo.Data && grndetailinfo.Data.length > 0) {
            for (var y = 0; y < grndetailinfo.Data.length; y++) {
                const oneQty: any = grndetailinfo.Data[y].GrnQuantity;
                purchasedTotal = purchasedTotal + parseFloat(oneQty);
            }
        }
        // if (purchasedTotal === orderedTotal) {
        purchaseorder.PoStatusId = request.Header.PoStatusId;
        await this.Update(purchaseorder);
        // }
        let purchaseorderdetailBO = BoFactory.GetBo(bo.PurchaseOrderDetailBo, this.Request);
        await purchaseorderdetailBO.ManagePurchaseOrderItemDetails(GrnId, request);
    }

    public async GetPurchaseOrderById(req: BaseRequest): Promise<PurchaseOrderAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'RequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'AuthorizedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient, attributes: ['TitleId', 'FirstName', 'LastName', 'MRN', 'Age'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.VendorMaster, attributes: ['VendorCode', 'VendorName'], required: false,
        });
        // include.push({
        //     model: this.Models.Encounter, attributes: ['VisitIdentifier'], required: false,
        // });
        include.push({
            model: this.Models.StoreMaster, as: 'StoreMaster', required: false,
        });
        include.push({
            model: this.Models.Encounter,
            required: false,
            include: [
                {
                    model: this.Models.WardMaster, attributes: ['WardName'], required: false,
                },
                {
                    model: this.Models.WardRoomMaster, attributes: ['Id', 'RoomNo', 'Description'], required: false,
                },
                {
                    model: this.Models.WardRoomBedMaster, attributes: ['BedNo', 'Description', 'ServiceRateCategoryId'], required: false,
                },
                {
                    model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'Qualification',
                        'PhotoPath', 'SignPath'], required: false,
                    include: [this.GetReference('Title')]
                }, {
                    model: this.Models.EncounterDoctor, required: false,
                    attributes: ['DoctorId', 'DoctorName', 'DepartmentId', 'StartDate', 'EndDate',
                        'EncounterDoctorStatus', 'IsPrimary'],
                    include: [{ model: this.Models.Department, attributes: ['DepartmentName'], required: false },
                    this.GetReference('ConsultationStatus')]
                }, {
                    model: this.Models.Guarantor, attributes: ['GuarantorName'],
                    required: false
                }]
        });
        include.push({
            model: this.Models.Grn, attributes: ['GrnNumber'], required: false,
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);

        /*
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
        */
    }

    public async GetPurchaseOrderByIdWithoutDetails(req: BaseRequest): Promise<PurchaseOrderAttributes> {
        let result = await this.GetById(req.Id, { attributes: ['Id', 'PoNumber', 'PoStatusId'] });
        return this.GetAttribute(result);
    }

    public async GetItemFile(req: BaseRequest, res: any): Promise<any> {
        let result = await res.download(req.Data.Attachment);
        return result;
    }

    public async GetPurchaseOrders(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqItemSearch: boolean = false;
        let ItemWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        include.push(this.GetReference('PoType'));
        include.push(this.GetReference('PaymentTerms'));
        include.push(this.GetReference('PoStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Facility, as: 'FromFacility', required: false });
        include.push({ model: this.Models.Facility, as: 'ToFacility', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.VendorMaster, required: false,
            include: [this.GetReference('PaymentTerms'),
            {
                model: this.Models.VendorContact, attributes: ['AddressLine1', 'AddressLine2', 'PinCodeId', 'CityId',
                    'StateId', 'DistrictId', 'CountryId', 'Area'], required: false,
                include: [{ model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false, }
                    , { model: this.Models.CityMaster, attributes: ['CityName'], required: false, },
                { model: this.Models.StateMaster, attributes: ['StateName'], required: false, },
                { model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false, },
                { model: this.Models.CountryMaster, attributes: ['CountryName'], required: false, }]
            }]
        });
        //include.push({ model: this.Models.PurchaseOrderDetail, attributes: ['ItemName', 'ItemCode'], required: false });
        include.push({
            model: this.Models.User, as: 'RequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName', 'Signature', 'SignPath'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'AuthorizedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CancelledUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['PatientId', 'FirstName', 'LastName', 'TitleId', 'MRN'
            ],
            required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter,
            attributes: ['EncounterId', 'VisitIdentifier'],
            required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseOrderFilters.Id:
                        where['PurchaseOrderId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoNumber:
                        where['PoNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case PurchaseOrderFilters.PoTypeId:
                        where['PoTypeId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PoStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PurchaseOrderFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.DeliveryStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoDate:
                        where['PoDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseOrderFilters.From:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$gte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.To:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$lte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FromFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.AuthorizedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.Itemmaster:
                        ItemWhere['ItemMasterId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    case PurchaseOrderFilters.PoStatus:
                        where['PoStatusId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.IsGeneralPo:
                        where['IsGeneralPo'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PurchaseOrderDetail,
            required: isReqItemSearch,
            where: ItemWhere,
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetPurchaseOrderList(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isReqItemSearch: boolean = false;
        let ItemWhere: WhereOptions<any> = {};
        let order: Array<any> = [];
        include.push(this.GetReference('PoType'));
        include.push(this.GetReference('PoStatus'));
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'AuthorizedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.VendorMaster, attributes: ['Id', 'VendorName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseOrderFilters.Id:
                        where['PurchaseOrderId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoNumber:
                        where['PoNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case PurchaseOrderFilters.PoTypeId:
                        where['PoTypeId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PoStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PurchaseOrderFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.DeliveryStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoDate:
                        where['PoDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseOrderFilters.From:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$gte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.To:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$lte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FromFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.AuthorizedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.IsConsignment:
                        where['IsConsignment'] = param.Value;
                        break;
                    case PurchaseOrderFilters.Itemmaster:
                        ItemWhere['ItemMasterId'] = param.Value;
                        isReqItemSearch = true;
                        include.push({
                            model: this.Models.PurchaseOrderDetail,
                            attributes: ['Id', 'ItemMasterId'],
                            required: isReqItemSearch,
                            where: ItemWhere
                        });
                        break;
                    case PurchaseOrderFilters.IsGeneralPo:
                        where['IsGeneralPo'] = param.Value;
                        break;
                    case PurchaseOrderFilters.DcNumber:
                        where['DcNumber'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetSelectedPurchaseOrder(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<ApiResponse<PurchaseOrderAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let storemasterId = -1;
        include.push(this.GetReference('PoType'));
        include.push(this.GetReference('PoStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Facility, as: 'FromFacility', required: false });
        include.push({ model: this.Models.Facility, as: 'ToFacility', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.VendorMaster, attributes: ['PaymentTermsId', 'VendorName'], required: false,
            include: [this.GetReference('PaymentTerms'),
            {
                model: this.Models.VendorContact, attributes: ['AddressLine1', 'AddressLine2', 'PinCodeId', 'CityId',
                    'StateId', 'DistrictId', 'CountryId', 'Area'], required: false,
                include: [{ model: this.Models.PincodeMaster, attributes: ['Pincode'], required: false, }
                    , { model: this.Models.CityMaster, attributes: ['CityName'], required: false, },
                { model: this.Models.StateMaster, attributes: ['StateName'], required: false, },
                { model: this.Models.DistrictMaster, attributes: ['DistrictName'], required: false, },
                { model: this.Models.CountryMaster, attributes: ['CountryName'], required: false, }]
            }]
        });
        include.push({
            model: this.Models.User, as: 'RequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'AuthorizedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CancelledUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseOrderFilters.Id:
                        where['PurchaseOrderId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoNumber:
                        where['PoNumber'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoTypeId:
                        where['PoTypeId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PoStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PurchaseOrderFilters.StoreMasterId:
                        storemasterId = param.Value;
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.DeliveryStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.PoDate:
                        where['PoDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseOrderFilters.From:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$gte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.To:
                        where['PoDate'] = where['PoDate'] || {};
                        (where['PoDate'] as any)['$lte'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToStoreMasterId:
                        where['DeliveryStoreMasterId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FromFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ToFacility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseOrderFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.AuthorizedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PurchaseOrderFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PurchaseOrderDetail,
            required: false,
            include: [
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                { model: this.Models.UomMaster, as: 'BaseUom', required: false },
                { model: this.Models.GstMaster, as: 'GstMaster', required: false },
                { model: this.Models.GstMaster, as: 'InGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'CGstMaster', required: false },
                { model: this.Models.GstMaster, as: 'SGstMaster', required: false },
                { model: this.Models.ItemVendorMap, as: 'VendorItem', required: false },
                { model: this.Models.VendorMaster, required: false },
                { model: this.Models.StoreMaster, as: 'RequestedStore', required: false },
                { model: this.Models.StoreMaster, as: 'DeliveryStore', required: false },
                {
                    model: this.Models.ItemMaster,
                    required: true,
                    include: [
                        {
                            model: this.Models.StockItem,
                            required: false,
                            attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                            where: { 'StoreMasterId': storemasterId }
                        }
                    ]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePurchaseOrder(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPurchaseOrder(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PurchaseOrderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPurchaseOrders(apiReq);
        let PurchaseOrders = data.Data[0];

        let licenses: any = {};
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PurchaseOrders.PoDate);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PurchaseOrders.StoreMasterId
            }
        });
        let LandCost = PurchaseOrders.TotalNetAmount - ((PurchaseOrders.OtherCharges + PurchaseOrders.OtherChargesGstAmount) || 0);
        let vendorBo = BoFactory.GetBo(bo.VendorMasterBo, this.Request);
        let vendorData = await vendorBo.GetVendorMasterById({ Id: PurchaseOrders.VendorMasterId });
        let VendorContactBo = BoFactory.GetBo(bo.VendorContactBo, this.Request);
        let VendorContactReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: VendorContactFilters.VendorMasterId, Value: PurchaseOrders.VendorMasterId }]
        };
        let VendorContactData: any = await VendorContactBo.GetVendorContacts(VendorContactReq);
        let VendorContact = VendorContactData.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PurchaseOrderDetailFilters.PurchaseOrderId, Value: PurchaseOrders.Id }]
        };
        let PurchaseOrderDetailBo = BoFactory.GetBo(bo.PurchaseOrderDetailBo, this.Request);
        let PurchaseOrderDetailData = await PurchaseOrderDetailBo.GetPurchaseOrderDetails(Req);
        let PurchaseOrderDetails: any = [];
        PurchaseOrderDetailData.Data.forEach((Detail: any) => {
            var PurchaseOrderDetail = Detail;
            PurchaseOrderDetail.Amt = Detail.NetAmount - (Detail.PoQuantity * Detail.GstAmount);
            PurchaseOrderDetail.MrPrice = (Detail.MrPrice).toFixed(2);
            PurchaseOrderDetail.UomPrice = (Detail.UomPrice).toFixed(2);
            PurchaseOrderDetail.UomCostPrice = (Detail.UomCostPrice).toFixed(2);
            PurchaseOrderDetail.NetAmount = (Detail.NetAmount).toFixed(2);
            PurchaseOrderDetail.CgstTax = Detail.PoQuantity * Detail.CGstAmount;
            PurchaseOrderDetail.SgstTax = Detail.PoQuantity * Detail.SGstAmount;
            PurchaseOrderDetail.TotalMRP = Detail.PoQuantity * Detail.UomMrPrice;
            PurchaseOrderDetail.TotalGST = Detail.PoQuantity * (Detail.GstAmount).toFixed(2);
            PurchaseOrderDetail.Profitpercent = ((Detail.ProfitAmount / Detail.NetAmount) * 100).toFixed(3);
            PurchaseOrderDetails.push(PurchaseOrderDetail);
        });
        let totallineitem = PurchaseOrderDetails.length;
        console.log(totallineitem, 'totallineitem');
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PurchaseOrders.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PurchaseOrders.FacilityId, PurchaseOrders.StoreMasterId);
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
            PurchaseOrder: PurchaseOrders,
            Vendor: vendorData,
            LandCost: LandCost,
            VendorContact: VendorContact,
            PurchaseOrderDetail: PurchaseOrderDetails,
            Preferences: printPreferencesData,
            Flags: flags,
            isconsignmentpurchase: req.Data.isconsignmentpurchaseprint,
            TOTLineItme: totallineitem
        };
        let pdfOption: any = null;
        let key = 'purchaseorder';
        if (info.isconsignmentpurchase === 1) {
            key = 'consignmentpurchase';
        }
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (info.Flags.header === 0) {
            pdfOptionJSON = await Report.GetPdfOptionWoh(key);
        }
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '0.7in',
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
    public async PrintPurchaseOrderReport(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<any> {
        let data = await this.GetPurchaseOrders(apiReq);
        let PurchaseOrder = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let PoStatus = apiReq.Data.PoStatus;
        let PurchaseOrderData = data.Data[0];
        let TotalGrossAmt: number = 0;
        let TotalDisAmt: number = 0;
        let TotalGstAmt: number = 0;
        let TotalOtherAmt: number = 0;
        let TotalNetAmt: number = 0;
        for (var idx in PurchaseOrder) {
            var item = PurchaseOrder[idx];
            TotalGrossAmt += item.TotalGrossAmount;
            TotalDisAmt += item.TotalDiscountAmount;
            TotalGstAmt += item.TotalGstAmount;
            TotalOtherAmt += item.OtherCharges;
            TotalNetAmt += item.TotalNetAmount;

        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PurchaseOrderData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PurchaseOrderData.FacilityId, PurchaseOrderData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;

        let info = {
            PurchaseOrder: PurchaseOrder,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            TotalNetAmt: TotalNetAmt,
            PoStatus: PoStatus,
            TotalGrossAmt: TotalGrossAmt,
            TotalDisAmt: TotalDisAmt,
            TotalGstAmt: TotalGstAmt,
            TotalOtherAmt: TotalOtherAmt
        };
        let pdfOption: any = null;
        let key = 'purchaseorderreport';
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
    public async PrintPurchaseOrderList(apiReq?: ApiRequest<PurchaseOrderFilters>): Promise<any> {
        let data = await this.GetPurchaseOrderList(apiReq);
        let PoList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PoListData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PoListData.FacilityId);
        let info = {
            PoList: PoList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName
        };
        let pdfOption: any = null;
        let key = 'purchaseorderlist';
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
    public async DMPrintPurchaseOrder(req: BaseRequest): Promise<any> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseOrderFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPurchaseOrders(apiReq);
        let PurchaseOrders = data.Data[0];
        let vendorBo = BoFactory.GetBo(bo.VendorMasterBo, this.Request);
        let vendorData = await vendorBo.GetVendorMasterById({ Id: PurchaseOrders.VendorMasterId });
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseOrderDetailFilters.PurchaseOrderId, Value: PurchaseOrders.Id }]
        };
        let PurchaseOrderDetailBo = BoFactory.GetBo(bo.PurchaseOrderDetailBo, this.Request);
        let PurchaseOrderDetailData = await PurchaseOrderDetailBo.GetPurchaseOrderDetails(Req);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogoForDM(PurchaseOrders.FacilityId, PurchaseOrders.StoreMasterId);
        let PurchaseOrderDetails: any = [];
        PurchaseOrderDetailData.Data.forEach((Detail: any) => {
            var PurchaseOrderDetail = Detail;
            PurchaseOrderDetail.Amt = Detail.NetAmount - (Detail.PoQuantity * Detail.GstAmount);
            PurchaseOrderDetail.CgstTax = Detail.PoQuantity * Detail.CGstAmount;
            PurchaseOrderDetail.SgstTax = Detail.PoQuantity * Detail.SGstAmount;
            PurchaseOrderDetail.TotalMRP = Detail.PoQuantity * Detail.UomMrPrice;
            PurchaseOrderDetails.push(PurchaseOrderDetail);
        });
        let info = {
            PurchaseOrder: PurchaseOrders,
            Vendor: vendorData,
            PurchaseOrderDetail: PurchaseOrderDetails,
            PrintData: printStoreData
        };
        return info;
    }

    public GetModel(): SStatic.Model<PurchaseOrderInstance, PurchaseOrderAttributes> {
        return this.Models.PurchaseOrder;
    }
    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let purchaseorderCount = await this.Items.count({
            where: {
                'Status': 1,
                'PoStatusId': { '$in': [2, 3] },
                // 'ItemmasterId': req.Data.itemid,
                // 'StoremasterId': req.Data.storeid
            }
        });
        return {
            'purchaseorderCount': purchaseorderCount
        };
    }

    public async sendPurchaseOrderFaciltySMS(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PoStatusId === 2) {
            let facilityBO = BoFactory.GetBo(userbo.FacilityBo, this.Request);
            let facilityData = await facilityBO.GetFacilityById({ Id: req.Data.Header.FacilityId });
            if (facilityData) {
                if (facilityData.Mobile) {
                    let smsProvider = this.GetSmsProvider();
                    let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
                    let smsTemplateInfo = await eventTemplateBO.GetTemplateInfo('PurchaseOrder', 'ApprovedPOtoFacilty', 1);
                    if (smsTemplateInfo) {
                        let vPoNumber = '';
                        if (req.Data.PoNumber) vPoNumber = req.Data.PoNumber;
                        let vVendorName = '';
                        if (req.Data.Header.VendorName) vVendorName = req.Data.Header.VendorName;
                        let vTotalAmount = '';
                        if (req.Data.Header.TotalNetAmount) vTotalAmount = req.Data.Header.TotalNetAmount;
                        let smsmodel = {
                            numbers: [facilityData.Mobile],
                            message: Template.Compile(smsTemplateInfo.TemplateContent,
                                {
                                    ponumber: vPoNumber,
                                    vendorname: vVendorName,
                                    totalAmount: vTotalAmount,
                                })
                        };
                        if (smsProvider) {
                            let SMSStatus = await smsProvider.send(smsmodel);
                            let eventDashboardOutboundBo = BoFactory.GetBo(userbo.EventDashboardBo, this.Request);
                            await eventDashboardOutboundBo.ManageSMSOutBound(SMSStatus, smsmodel.message + ' To : ' + facilityData.Mobile);
                        }
                    }
                }
            }
        }
        return true;
    }

    private async ProcessEmail(req: any) {
        if (req.Data.Email) {
            let eventTemplateBO = BoFactory.GetBo(userbo.EventTemplateBo, this.Request);
            let mailTemplateInfo = await eventTemplateBO.GetTemplateInfo('PurchaseOrder', 'PurchaseOrderRaiseMail', 2);
            const mailData = {
                purchaseorderid: req.Data.Id,
                ponumber: req.Data.PoNumber,
                vendorname: req.Data.VendorName,
                facilityname: this.Session.FacilityName,
                username: this.Session.UserName
            };

            let mailCredentials = {};
            if (req.Data.userName && req.Data.password) {
                mailCredentials = {
                    userName: req.Data.userName,
                    password: req.Data.password
                };
            }

            if (mailTemplateInfo) {
                const mailSubject = Template.Compile(mailTemplateInfo.EmailSubject, mailData);
                const mailBody = Template.Compile(mailTemplateInfo.TemplateContent, mailData);

                let poattachment = await this.PrintPurchaseOrder({ Id: req.Data.Id });

                if (mailCredentials) {
                    if (req.Data.FacilityMail) {
                        let mailProvider = this.GetPOMailProvider(mailCredentials);
                        await mailProvider.send({
                            to: req.Data.Email,
                            cc: req.Data.FacilityMail,
                            subject: mailSubject,
                            html: mailBody,
                            attachments: [{ path: poattachment.filename }]
                        });
                    }
                    if (!req.Data.FacilityMail) {
                        let mailProvider = this.GetPOMailProvider(mailCredentials);
                        await mailProvider.send({
                            to: req.Data.Email,
                            subject: mailSubject,
                            html: mailBody,
                            attachments: [{ path: poattachment.filename }]
                        });
                    }
                }
                unlinkSync(poattachment.filename);
            }
        }
    }
}
