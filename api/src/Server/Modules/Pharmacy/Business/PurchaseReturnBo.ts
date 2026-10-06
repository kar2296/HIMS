import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseReturnInstance, PurchaseReturnAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { PurchaseReturnFilters, PurchaseReturnDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as _ from 'lodash';


export class PurchaseReturnBo extends BaseBo<PurchaseReturnInstance, PurchaseReturnAttributes> {
    public async AddPurchaseReturn(req: BaseRequest): Promise<number> {
        if (req.Data.Header.PrnStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PrnNumber = await Sequence.Next(SequenceKeys.MDPurchaseReturn);
            } else {
                req.Data.Header.PrnNumber = await Sequence.Next(SequenceKeys.NMDPurchaseReturn);
            }
            */
            req.Data.Header.PrnDate = new Date();
            req.Data.Header.ReturnedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.PrnStatusId === 1) {
            req.Data.Header.PrnDate = new Date();
            req.Data.Header.ReturnedDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseReturnDetailBo, this.Request);
            let PurchaseReturnId = result.dataValues.Id;
            await detailBO.ManagePurchaseReturnDetails(PurchaseReturnId, req.Data, req.Data.Details);

            if (req.Data.Header.PrnStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(5, PurchaseReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Return ' + errorMessages.join('$,$') };
                }
                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(5, PurchaseReturnId, req.Data);
                /*
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                await stockitemBO.ManageItemStockAfterPurchaseReturns(5, PurchaseReturnId, req.Data);
                */
                if (req.Data.Header.PrnTypeId === 2 && req.Data.Header.GrnId > 0) {
                    let grnBO = BoFactory.GetBo(bo.GrnBo, this.Request);
                    await grnBO.ManageGrnOnPurchseReturn(PurchaseReturnId, req.Data);
                }
            }

            let prnIdentifier: any = null;
            if (req.Data.Header.PrnStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    prnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseReturn,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                } else {
                    prnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseReturn,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                }
            }

            if (prnIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, purchaseReturnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = purchaseReturnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PurchaseReturnId);
                };

                this.deferSequenceKey(PurchaseReturnId, 'PrnNumber', prnIdentifier, [afterO().UpdateMovementInfo]);
            }

            if (req.Data.Header.VendorMasterId > 0) {
                let vendorBo = BoFactory.GetBo(invbo.VendorMasterBo, this.Request);
                let VendorInfo = await vendorBo.GetVendorMasterById({ Id: req.Data.Header.VendorMasterId });
                let paymentRequest: any = {
                    Data: {
                        Id: VendorInfo.Id,
                        ReturnedAmount: req.Data.Header.TotalNetAmount,
                        OutStandingAmount: (VendorInfo.OutStandingAmount) - (req.Data.Header.TotalNetAmount),

                    }
                };
                await vendorBo.UpdateVendorMasters(paymentRequest);
            }

            return PurchaseReturnId;
        }

        return 0;
    }

    public async UpdatePurchaseReturn(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PrnStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PrnNumber = await Sequence.Next(SequenceKeys.MDPurchaseReturn);
            } else {
                req.Data.Header.PrnNumber = await Sequence.Next(SequenceKeys.NMDPurchaseReturn);
            }
            */
            req.Data.Header.PrnDate = new Date();
            req.Data.Header.ReturnedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.PrnStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseReturnDetailBo, this.Request);
            let PurchaseReturnId = req.Data.Header.Id;
            await detailBO.ManagePurchaseReturnDetails(PurchaseReturnId, req.Data, req.Data.Details);

            if (req.Data.Header.PrnStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(5, PurchaseReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Return ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(5, PurchaseReturnId, req.Data);
                /*
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                await stockitemBO.ManageItemStockAfterPurchaseReturns(5, PurchaseReturnId, req.Data);
                */
                if (req.Data.Header.PrnTypeId === 2 && req.Data.Header.GrnId > 0) {
                    let grnBO = BoFactory.GetBo(bo.GrnBo, this.Request);
                    await grnBO.ManageGrnOnPurchseReturn(PurchaseReturnId, req.Data);
                }
            }

            let prnIdentifier: any = null;
            if (req.Data.Header.PrnStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    prnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseReturn,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                } else {
                    prnIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseReturn,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                }
            }

            if (prnIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, purchaseReturnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = purchaseReturnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PurchaseReturnId);
                };

                this.deferSequenceKey(PurchaseReturnId, 'PrnNumber', prnIdentifier, [afterO().UpdateMovementInfo]);
            }

            return PurchaseReturnId;

        }

        return result;
    }

    public async ManagePurchaseReturnTallyApprove(req: BaseRequest): Promise<boolean> {
        let details: PurchaseReturnAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async GetPurchaseReturnById(req: BaseRequest): Promise<PurchaseReturnAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPurchaseReturns(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<ApiResponse<PurchaseReturnAttributes[]>> {
        let where: WhereOptions<any> = {};
        //let GRNWhere: WhereOptions<any>= {};
        //let ReturnWhere: WhereOptions<any>= {};
        //let isReqGRNSearch, isReqReturnSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('PrnStatus'));
        include.push(this.GetReference('PrnType'));
        include.push(this.GetReference('ReturnReason'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.PurchaseOrder, required: false });
        include.push({ model: this.Models.Grn, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({
            model: this.Models.PurchaseReturnDetail,
            required: true,
            include: [
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                { model: this.Models.StockItem, required: false },
                { model: this.Models.StockSerialItem, required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseReturnFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PurchaseReturnFilters.PrnNumber:
                        where['PrnNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case PurchaseReturnFilters.PrnTypeId:
                        where['PrnTypeId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.PrnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PrnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PurchaseReturnFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.PrnDate:
                        where['PrnDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseReturnFilters.From:
                        where['PrnDate'] = where['PrnDate'] || {};
                        (where['PrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case PurchaseReturnFilters.To:
                        where['PrnDate'] = where['PrnDate'] || {};
                        (where['PrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case PurchaseReturnFilters.GrnId:
                        where['GrnId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.GrnNumber:
                        where['GrnNumber'] = param.Value;
                        //GRNWhere['GrnNumber'] = param.Value;
                        //isReqGRNSearch = true;
                        break;
                    case PurchaseReturnFilters.ReturnedBy:
                        where['ReturnedBy'] = param.Value;
                        break;
                    case PurchaseReturnFilters.ReturnReasonId:
                        where['ReturnReasonId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.InvoiceNumber:
                        where['InvoiceNumber'] = param.Value;
                        //GRNWhere['InvoiceNumber'] = param.Value;
                        break;
                    case PurchaseReturnFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PurchaseReturnFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        //ReturnWhere['ItemMasterId'] = param.Value;
                        break;
                    case PurchaseReturnFilters.TallyApprovedStatusId:
                        where['TallyApprovedStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        /*
        include.push({
            model: this.Models.PurchaseReturnDetail,
            required: isReqReturnSearch,
            where: ReturnWhere,
            include: [
                { model: this.Models.UomMaster, as: 'PurchaseUom', required: false },
                { model: this.Models.StockItem, required: false },
                { model: this.Models.StockSerialItem, required: false }
            ]
        });
        include.push({
            model: this.Models.Grn,
            required: isReqGRNSearch,
            where: GRNWhere,
        });
        */
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePurchaseReturn(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetSupplierPurchaseReturn(req: BaseRequest): Promise<any> {
        let PrnResult: any = [];
        // PrnResult['DisplayOrder'] = 2;
        if (req.Data.VendorMasterId > 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['PrnDate', 'PrnNumber',
                    'TotalNetAmount', 'VendorMasterId'],
                where: {
                    PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PrnStatusId: { '$in': [2, 3, 4] },
                    PrnTypeId: 1,
                    VendorMasterId: { '$eq': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let GrnNumber: string = '';
                let TotalNetAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.PrnDate;
                    GrnNumber = bills.PrnNumber;
                    TotalNetAmount = bills.TotalNetAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'GrnNumber': GrnNumber,
                        'TotalReturnAmount': TotalNetAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    PrnResult.push(info);
                }

            }
        } else if (req.Data.VendorMasterId === 0) {
            let InvoiceAmtInstance: any = await this.FindAll({
                attributes: ['PrnDate', 'PrnNumber',
                    'TotalNetAmount', 'VendorMasterId'],
                where: {
                    PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                    PrnStatusId: { '$in': [2, 3, 4] },
                    PrnTypeId: 1,
                    VendorMasterId: { '$gt': req.Data.VendorMasterId },
                    FacilityId: req.Data.FacilityId,
                },
            });
            if (InvoiceAmtInstance) {
                let GrnDate: string = '';
                let GrnNumber: string = '';
                let TotalNetAmount: number = 0;
                let VendorMasterId: number = 0;
                for (let i in InvoiceAmtInstance) {
                    let bills: any = InvoiceAmtInstance[i];
                    GrnDate = bills.PrnDate;
                    GrnNumber = bills.PrnNumber;
                    TotalNetAmount = bills.TotalNetAmount;
                    VendorMasterId = bills.VendorMasterId;
                    let info = {
                        'GrnDate': GrnDate,
                        'GrnNumber': GrnNumber,
                        'TotalReturnAmount': TotalNetAmount,
                        'VendorMasterId': VendorMasterId,
                    };
                    PrnResult.push(info);
                }

            }
        }
        return PrnResult;
    }
    public async SupplierReturn(req: BaseRequest): Promise<any> {
        let VendorGroup: { [id: number]: any[] } = {};
        let VendorGroupJoin: any = {
            model: this.Models.VendorMaster, as: 'VendorMaster',
            attributes: ['VendorName'],
            required: true,
        };
        let storeId: any;
        if (req.Data.StoreMasterId > 0) {
            storeId = req.Data.StoreMasterId;
        } else {
            storeId = { '$gt': 0 };
        }
        let InvoiceAmtInstance: any = await this.FindAll({
            attributes: ['TotalReturnAmount', 'VendorMasterId'],
            where: {
                PrnDate: { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                PrnStatusId: { '$in': [2, 3, 4] },
                VendorMasterId: { '$gt': 0 },
                FacilityId: req.Data.FacilityId,
                StoreMasterId: storeId,
            },
            include: [VendorGroupJoin]
        });
        if (InvoiceAmtInstance) {
            let groupbills = _.groupBy(InvoiceAmtInstance, 'VendorMasterId');
            for (let i in groupbills) {
                let groupedBills = groupbills[i];
                let VendorMasterId: number = 0;
                let TotalReturnAmount: number = 0;
                let VendorName: string = '';
                for (let i = 0; i < groupedBills.length; i++) {
                    let bills: any = groupedBills[i];
                    TotalReturnAmount += bills.TotalReturnAmount;
                    VendorMasterId = bills.VendorMasterId;
                    VendorName = bills.VendorMaster.VendorName;
                    VendorGroup[VendorMasterId] = VendorGroup[VendorMasterId] || [];
                }
                let info = {
                    'TotalReturnAmount': TotalReturnAmount,
                    'VendorMasterId': VendorMasterId,
                    'VendorName': VendorName
                };
                VendorGroup[VendorMasterId].push(info);
            }
        }
        return VendorGroup;
    }


    public async PrintPurchaseReturn(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseReturnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPurchaseReturns(apiReq);
        let PurchaseReturns = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseReturnDetailFilters.PurchaseReturnId, Value: PurchaseReturns.Id }]
        };
        let PurchaseReturnDetailBo = BoFactory.GetBo(bo.PurchaseReturnDetailBo, this.Request);
        let PurchaseReturnDetailData = await PurchaseReturnDetailBo.GetPurchaseReturnDetails(Req);
        let PurchaseReturnDetails: any = [];
        PurchaseReturnDetailData.Data.forEach((Detail: any) => {
            var PurchaseReturnDetail = Detail;
            PurchaseReturnDetail.MrPrice = (Detail.MrPrice).toFixed(2);
            PurchaseReturnDetail.UomPrice = (Detail.UomPrice).toFixed(2);
            PurchaseReturnDetail.GstAmount = (Detail.GstAmount).toFixed(2);
            PurchaseReturnDetail.NetAmount = (Detail.NetAmount).toFixed(2);
            PurchaseReturnDetail.TotalMRP = Detail.PrnQuantity * Detail.MrPrice;
            PurchaseReturnDetails.push(PurchaseReturnDetail);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PurchaseReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PurchaseReturns.FacilityId, PurchaseReturns.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.pharmacyprintheader = printStoreData.printheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PurchaseReturn: PurchaseReturns,
            PurchaseReturnDetail: PurchaseReturnDetails,
            Preferences: printPreferencesData,
            Flags: flags
        };
        let pdfOption: any = null;
        let key = 'purchasereturn';
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
    public async PrintPurchaseReturnList(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<any> {
        let data = await this.GetPurchaseReturns(apiReq);
        let PrnList = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let PrnListData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PrnListData.FacilityId);
        let info = {
            PrnList: PrnList,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName
        };
        let pdfOption: any = null;
        let key = 'purchasereturnlist';
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
    public async PrintPurchaseReturnReport(apiReq?: ApiRequest<PurchaseReturnFilters>): Promise<any> {
        let data = await this.GetPurchaseReturns(apiReq);
        let PurchaseReturn = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let VendorName = apiReq.Data.VendorName;
        let StoreName = apiReq.Data.StoreName;
        let PurchaseReturnData = data.Data[0];
        let TotalGrossAmount: number = 0;
        let TotalDiscountAmount: number = 0;
        let TotalOtherAmount: number = 0;
        let TotalGstAmount: number = 0;
        let TotalNetAmount: number = 0;
        for (let idx in PurchaseReturn) {
            let item = PurchaseReturn[idx];
            TotalGrossAmount += item.TotalGrossAmount;
            TotalDiscountAmount += item.TotalDiscountAmount;
            TotalOtherAmount += item.OtherCharges;
            TotalGstAmount += item.TotalGstAmount;
            TotalNetAmount += item.TotalNetAmount;
        }
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PurchaseReturnData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PurchaseReturnData.FacilityId, PurchaseReturnData.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.pharmacyprintheader = printStoreData.printheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PurchaseReturn: PurchaseReturn,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            VendorName: VendorName,
            StoreName: StoreName,
            TotalGrossAmount: TotalGrossAmount,
            TotalOtherAmount: TotalOtherAmount,
            TotalDiscountAmount: TotalDiscountAmount,
            TotalGstAmount: TotalGstAmount,
            TotalNetAmount: TotalNetAmount
        };
        let pdfOption: any = null;
        let key = 'purchasereturnreport';
        pdfOption = {
            format: 'A4',
            orientation: 'Portrait',
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
    public GetModel(): SStatic.Model<PurchaseReturnInstance, PurchaseReturnAttributes> {
        return this.Models.PurchaseReturn;
    }
    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let purchasereturnCount = await this.Items.count({
            where: {
                'Status': 1,
                'PrnStatusId': { '$in': [2, 3, 4] },
            }
        });
        return {
            'purchasereturnCount': purchasereturnCount
        };
    }

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }
}
