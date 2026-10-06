import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { OpticalGrnInstance, OpticalGrnAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
// import * as vendorbo from '../../Pharmacy/Business/Index';
import { OpticalGrnFilters, OpticalGrnDetailFilters, VendorContactFilters/*, OpticalGrnDetailFilters */ } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { join } from 'path';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';

export class OpticalGrnBo extends BaseBo<OpticalGrnInstance, OpticalGrnAttributes> {
    public async AddOpticalGrn(req: BaseRequest): Promise<number> {
        await this.InvoiceCheck(req);
        if (req.Data.Header.OpticalGrnStatusId === 2 && req.Data.Header.OpticalGrnNumber === null) {
            req.Data.Header.OpticalGrnDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.OpticalGrnStatusId === 1 && req.Data.Header.OpticalGrnNumber === null) {
            req.Data.Header.OpticalGrnDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.OpticalGrnDetailBo, this.Request);
            let OpticalGrnId = result.dataValues.Id;
            await detailBO.ManageOpticalGrnDetails(OpticalGrnId, req.Data, req.Data.Details);

            if (req.Data.Header.OpticalGrnStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.OpticalStockItemBo, this.Request);
                await stockitemBO.ManageOpticalStockItems(3, OpticalGrnId, req.Data);

                let stockmovementBO = BoFactory.GetBo(bo.OpticalStockMovementBo, this.Request);
                await stockmovementBO.ManageOpticalStockMovements(3, OpticalGrnId, req.Data);

                /*
                let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
                await itemmasterBO.ManageMasterItemInternalPrice(req.Data);
                */

                /*
                let itemstoreBO = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                await itemstoreBO.ManageItemStoreMapsAfterGrn(req.Data.Header.StoreMasterId, req.Data);
                */

                /*
                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                await itemvendorBO.ManageItemVendorMapsAfterGrn(req.Data.Header.VendorMasterId, req.Data);
                */

                /*
                if (req.Data.Header.PurchaseOrderId > 0 && req.Data.Header.PoNumber !== null) {
                    let purchaseorderBO = BoFactory.GetBo(bo.PurchaseOrderBo, this.Request);
                    await purchaseorderBO.ManagePurchaseOrder(GrnId, req.Data);
                }
                */
            }

            let grnIdentifier: any = null;
            if (req.Data.Header.OpticalGrnStatusId === 2) {
                grnIdentifier = this.getSequenceIdentifier(SequenceKeys.OpticalGoodsReceiptNoteId);
            }

            if (grnIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, opticalgrnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = opticalgrnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, OpticalGrnId);
                };

                this.deferSequenceKey(OpticalGrnId, 'OpticalGrnNumber', grnIdentifier, [afterO().UpdateMovementInfo]);
            }

            return OpticalGrnId;
        }

        return 0;
    }

    public async UpdateOpticalGrn(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async InvoiceCheck(req: BaseRequest): Promise<boolean> {
        let grninfo = req.Data.Header;

        if (grninfo.OpticalGrnStatusId === 2) {
            let grnInvoiceNo: number = await this.GetInvoiceNoByOptions({
                where: {
                    VendorMasterId: grninfo.VendorMasterId,
                    InvoiceNumber: grninfo.InvoiceNumber,
                    OpticalGrnStatusId: { '$in': [2, 3, 4] }
                },
                attributes: ['Id']
            });
            if (grnInvoiceNo > 0) {
                throw { code: 'VENDOR_INVOICE_EXIST' };
            }
        }
        return true;
    }

    public async GetInvoiceNoByOptions(foption: SStatic.FindOptions<any>): Promise<number> {
        let invoiceGrnId: number = -1;
        let grnInstance: any = await this.Find(foption);
        if (grnInstance) {
            let invoicegrn = this.GetAttribute(grnInstance);
            invoiceGrnId = invoicegrn.Id;
        }
        return invoiceGrnId;
    }

    public async GetOpticalGrnById(req: BaseRequest): Promise<OpticalGrnAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetOpticalGrns(apiReq?: ApiRequest<OpticalGrnFilters>): Promise<ApiResponse<OpticalGrnAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let itemWhere: WhereOptions<any> = {};
        let isReqItemSearch: boolean = false;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push(this.GetReference('OpticalGrnType'));
        include.push(this.GetReference('OpticalGrnStatus'));
        include.push({ model: this.Models.Facility, required: false });
        //include.push({ model: this.Models.PurchaseOrder, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case OpticalGrnFilters.Id:
                        where['OpticalGrnId'] = param.Value;
                        break;
                    case OpticalGrnFilters.OpticalGrnNumber:
                        where['OpticalGrnNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OpticalGrnFilters.OpticalGrnTypeId:
                        where['OpticalGrnTypeId'] = param.Value;
                        break;
                    case OpticalGrnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case OpticalGrnFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case OpticalGrnFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case OpticalGrnFilters.InvoiceNumber:
                        where['InvoiceNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OpticalGrnFilters.OpticalGrnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['OpticalGrnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case OpticalGrnFilters.OpticalPoNumber:
                        where['OpticalPoNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OpticalGrnFilters.OpticalGpNumber:
                        where['OpticalGpNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case OpticalGrnFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case OpticalGrnFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case OpticalGrnFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case OpticalGrnFilters.OpticalGrnDate:
                        where['OpticalOpticalGrnDate'] = { '$between': param.Value || '' };
                        break;
                    case OpticalGrnFilters.From:
                        where['OpticalGrnDate'] = where['OpticalGrnDate'] || {};
                        (where['OpticalGrnDate'] as any)['$gte'] = param.Value;
                        break;
                    case OpticalGrnFilters.To:
                        where['OpticalGrnDate'] = where['OpticalGrnDate'] || {};
                        (where['OpticalGrnDate'] as any)['$lte'] = param.Value;
                        break;
                    case OpticalGrnFilters.OpticalItemMasterId:
                        itemWhere['OpticalItemMasterId'] = param.Value;
                        isReqItemSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.OpticalGrnDetail,
            required: isReqItemSearch,
            where: itemWhere,
            include: [
                //{ model: this.Models.UomMaster, as: 'PurchaseUom', required: false }
            ]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteOpticalGrn(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<OpticalGrnInstance, OpticalGrnAttributes> {
        return this.Models.OpticalGrn;
    }
    public async Print1Grn(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OpticalGrnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetOpticalGrns(apiReq);
        let Grns = data.Data[0];
        let VendorBo = BoFactory.GetBo(invbo.VendorMasterBo, this.Request);
        let VendorData = await VendorBo.GetVendorMasterById({ Id: Grns.VendorMasterId });
        let VendorContactBo = BoFactory.GetBo(invbo.VendorContactBo, this.Request);
        let VendorContactReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: VendorContactFilters.VendorMasterId, Value: Grns.VendorMasterId }]
        };
        let VendorContactData: any = await VendorContactBo.GetVendorContacts(VendorContactReq);
        let VendorContact = VendorContactData.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: OpticalGrnDetailFilters.OpticalGrnId, Value: Grns.Id }]
        };
        let GrnDetailBo = BoFactory.GetBo(bo.OpticalGrnDetailBo, this.Request);
        let GrnDetailData: any = await GrnDetailBo.GetOpticalGrnDetails(Req);
        let GrnDetails: any = [];
        GrnDetailData.Data.forEach((Detail: any) => {
            var GrnDetail = Detail;
            GrnDetail.Amt = Detail.NetAmount - (Detail.GrnQuantity * Detail.CGstAmount + Detail.GrnQuantity * Detail.SGstAmount);
            GrnDetail.CgstTax = Detail.GrnQuantity * Detail.CGstAmount;
            GrnDetail.SgstTax = Detail.GrnQuantity * Detail.SGstAmount;
            GrnDetail.TotalMRP = Detail.GrnQuantity * Detail.UomMRP;
            GrnDetail.Dis = Detail.GrnQuantity * Detail.UomDiscountAmount;
            GrnDetails.push(GrnDetail);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Grns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(Grns.FacilityId, Grns.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.printheader = printStoreData.printheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            Grn: Grns,
            GrnDetailDetail: GrnDetails,
            Vendor: VendorData,
            VendorContact: VendorContact,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'opticalGrn';
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
            base: 'file://' + join(__dirname, '/../../Templates/assets/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.OpticalStockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }
}
