import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockEntryInstance, StockEntryAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockEntryFilters, StockEntryDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class StockEntryBo extends BaseBo<StockEntryInstance, StockEntryAttributes> {

    public async AddStockEntry(req: BaseRequest): Promise<number> {
        if (req.Data.Header.StockEntryStatusId === 2 && req.Data.Header.StockEntryNumber === null) {
            /*
            if (req.Data.Header.StockEntryTypeId === 1) {
                req.Data.Header.StockEntryNumber = await Sequence.Next(SequenceKeys.MDOpeningStockId);
            } else {
                req.Data.Header.StockEntryNumber = await Sequence.Next(SequenceKeys.NMDOpeningStockId);
            }
            */
            req.Data.Header.StockEntryDate = new Date();
            req.Data.Header.EnteredDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
            req.Data.Header.ApprovedBy = this.Session.UserId;
        } else if (req.Data.Header.StockEntryStatusId === 1 && req.Data.Header.StockEntryNumber === null) {
            req.Data.Header.StockEntryDate = new Date();
            req.Data.Header.EnteredDate = new Date();
        }

        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockEntryDetailBo, this.Request);
            let StockEntryId = result.dataValues.Id;
            await detailBO.ManageStockEntryDetails(StockEntryId, req.Data, req.Data.Details);
            if (req.Data.Header.StockEntryStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(1, StockEntryId, req.Data);
                } catch (ex) {
                    // throw { message: 'Error in Adding Stock' };
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }
            }
            // if (req.Data.Header.StockEntryStatusId === 2) {
            //     let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
            //     await stockmovementBO.ManageStockMovements(1, StockEntryId, req.Data);
            // }

            // let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
            // await itemmasterBO.ManageMasterItemInternalPrice(req.Data);

            let entryIdentifier: any = null;
            if (req.Data.Header.StockEntryStatusId === 2 && req.Data.Header.StockEntryNumber === null) {
                if (req.Data.Header.StockEntryTypeId === 1) {
                    entryIdentifier = this.getSequenceIdentifier(SequenceKeys.MDOpeningStockId);
                } else {
                    entryIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDOpeningStockId);
                }
            }

            if (entryIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockEntryId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                try {
                                    request.Data.Header.TransactionId = stockEntryId;
                                    req.Data.Header.TransactionNumber = code;
                                    await bo.UpdateMovementInfo(request);
                                } catch (error) {
                                    console.error('Error in UpdateMovementInfo:', error);
                                    throw error;  // Handle the error as needed
                                }
                            }
                        };
                    })(this, req, StockEntryId);
                };

                // this.deferSequenceKey(StockEntryId, 'StockEntryNumber', entryIdentifier, [afterO().UpdateMovementInfo]);
                const handleDeferredExecution = async () => {
                    try {
                        // Assuming deferSequenceKey processes a list of functions
                        await this.deferSequenceKey(StockEntryId, 'StockEntryNumber', entryIdentifier, [afterO().UpdateMovementInfo]);
                    } catch (error) {
                        // console.error('Error in deferSequenceKey execution:', error);
                        // throw error;
                        throw { message: 'Unkonwn Issue.. Please try again' };
                    }
                };

                handleDeferredExecution();
            }

            return StockEntryId;
        }

        return 0;
    }

    public async UpdateStockEntry(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.StockEntryStatusId === 2 && req.Data.Header.StockEntryNumber === null) {
            /*
            if (req.Data.Header.StockEntryTypeId === 1) {
                req.Data.Header.StockEntryNumber = await Sequence.Next(SequenceKeys.MDOpeningStockId);
            } else {
                req.Data.Header.StockEntryNumber = await Sequence.Next(SequenceKeys.NMDOpeningStockId);
            }
            */
            req.Data.Header.StockEntryDate = new Date();
            req.Data.Header.EnteredDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
            req.Data.Header.ApprovedBy = this.Session.UserId;
        } else if (req.Data.Header.StockEntryStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }

        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockEntryDetailBo, this.Request);
            let StockEntryId = req.Data.Header.Id;
            await detailBO.ManageStockEntryDetails(StockEntryId, req.Data, req.Data.Details);
            if (req.Data.Header.StockEntryStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(1, StockEntryId, req.Data);
                } catch (ex) {
                    // throw { message: 'Error in Adding Stock' };
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }
            }
            // if (req.Data.Header.StockEntryStatusId === 2) {
            //     let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
            //     await stockmovementBO.ManageStockMovements(1, StockEntryId, req.Data);
            // }

            // let itemmasterBO = BoFactory.GetBo(bo.ItemMasterBo, this.Request);
            // await itemmasterBO.ManageMasterItemInternalPrice(req.Data);

            let entryIdentifier: any = null;
            if (req.Data.Header.StockEntryStatusId === 2 && req.Data.Header.StockEntryNumber === null) {
                if (req.Data.Header.StockEntryTypeId === 1) {
                    entryIdentifier = this.getSequenceIdentifier(SequenceKeys.MDOpeningStockId);
                } else {
                    entryIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDOpeningStockId);
                }
            }

            if (entryIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockEntryId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                try {
                                    request.Data.Header.TransactionId = stockEntryId;
                                    req.Data.Header.TransactionNumber = code;
                                    await bo.UpdateMovementInfo(request);
                                } catch (error) {
                                    console.error('Error in UpdateMovementInfo:', error);
                                    throw error;  // Handle the error as needed
                                }
                            }
                        };
                    })(this, req, StockEntryId);
                };

                // this.deferSequenceKey(StockEntryId, 'StockEntryNumber', entryIdentifier, [afterO().UpdateMovementInfo]);
                const handleDeferredExecution = async () => {
                    try {
                        // Assuming deferSequenceKey processes a list of functions
                        await this.deferSequenceKey(StockEntryId, 'StockEntryNumber', entryIdentifier, [afterO().UpdateMovementInfo]);
                    } catch (error) {
                        // console.error('Error in deferSequenceKey execution:', error);
                        // throw error;
                        throw { message: 'Unkonwn Issue.. Please try again' };
                    }
                };

                handleDeferredExecution();
            }

            return StockEntryId;
        }

        return result;
    }

    public async GetStockEntryById(req: BaseRequest): Promise<StockEntryAttributes> {
        let include: Array<IncludeOptions> = [];
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
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'EnterBy', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetStockEntrys(apiReq?: ApiRequest<StockEntryFilters>): Promise<ApiResponse<StockEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('StockEntryType'));
        include.push(this.GetReference('StockEntryStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.StoreMaster, required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
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
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'EnterBy', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockEntryFilters.Id:
                        where['StockEntryId'] = param.Value;
                        break;
                    case StockEntryFilters.StockEntryNumber:
                        where['StockEntryNumber'] = param.Value;
                        break;
                    case StockEntryFilters.StockEntryTypeId:
                        where['StockEntryTypeId'] = param.Value;
                        break;
                    case StockEntryFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockEntryFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockEntryFilters.StockEntryStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['StockEntryStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockEntryFilters.StockEntryDate:
                        where['StockEntryDate'] = { '$between': param.Value || '' };
                        break;
                    case StockEntryFilters.From:
                        where['StockEntryDate'] = where['StockEntryDate'] || {};
                        (where['StockEntryDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockEntryFilters.To:
                        where['StockEntryDate'] = where['StockEntryDate'] || {};
                        (where['StockEntryDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockEntryFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case StockEntryFilters.AuthorizedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetToDayStockEntrys(apiReq?: ApiRequest<StockEntryFilters>): Promise<ApiResponse<StockEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.StockEntryDetail,
            required: false,
            include: [
                {
                    model: this.Models.ItemMaster,
                    as: 'ItemMaster',
                    required: false,
                    include: [
                        { model: this.Models.ProductType, required: false, attributes: ['ProductTypeCode', 'ProductTypeName'] }
                    ]
                }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockEntryFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockEntryFilters.StockEntryStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['StockEntryStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockEntryFilters.StockEntryDate:
                        where['StockEntryDate'] = { '$between': param.Value || '' };
                        break;
                    case StockEntryFilters.From:
                        where['StockEntryDate'] = where['StockEntryDate'] || {};
                        (where['StockEntryDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockEntryFilters.To:
                        where['StockEntryDate'] = where['StockEntryDate'] || {};
                        (where['StockEntryDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteStockEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintStockEntry(req: BaseRequest): Promise<FileInfo> {
        let flags = {
            header: (req.Data.withHeader) ? req.Data.withHeader : 0,
            woheader: (req.Data.withHeader) ? req.Data.withoutHeader : 0,
        };
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockEntryFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockEntrys(apiReq);
        let StockEntrys = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockEntryDetailFilters.StockEntryId, Value: StockEntrys.Id }]
        };
        let StockEntryDetailBo = BoFactory.GetBo(bo.StockEntryDetailBo, this.Request);
        let StockEntryDetailData = await StockEntryDetailBo.GetStockEntryDetails(Req);
        let StockEntryDetails: any = [];
        StockEntryDetailData.Data.forEach((Detail: any) => {
            var StockEntryDetail = Detail;
            StockEntryDetail.Amt = Detail.NetAmount - (Detail.EntryQuantity * Detail.CGstAmount + Detail.EntryQuantity * Detail.SGstAmount);
            StockEntryDetail.CgstTax = Detail.EntryQuantity * Detail.CGstAmount;
            StockEntryDetail.SgstTax = Detail.EntryQuantity * Detail.SGstAmount;
            StockEntryDetails.push(StockEntryDetail);
        });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockEntrys.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockEntrys.FacilityId, StockEntrys.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockEntry: StockEntrys,
            StockEntryDetail: StockEntryDetails,
            Preferences: printPreferencesData,
            Flags: flags
        };
        return await Report.Generate('Initialstockentry', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<StockEntryInstance, StockEntryAttributes> {
        return this.Models.StockEntry;
    }
    public async PrintOpeningStockReport(apiReq?: ApiRequest<StockEntryFilters>): Promise<any> {
        let data = await this.GetStockEntrys(apiReq);
        let OpeningStock = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let StoreName = apiReq.Data.StoreName;
        let OpeningStockData = data.Data[0];
        let TotalNetAmt: number = 0;
        for (var idx in OpeningStock) {
            var item = OpeningStock[idx];
            TotalNetAmt = TotalNetAmt + (item.TotalNetAmount);
        }
        // let StockAdjustmentBO = BoFactory.GetBo(inventoryBo.StockAdjustmentBo, this.Request);
        // let StockAdjustmentData = await StockAdjustmentBO.GetStockAdjustmentById({ Id: OpeningStockData.StockAdjustmentId });
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(bo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(OpeningStockData.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(OpeningStockData.FacilityId, OpeningStockData.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            OpeningStock: OpeningStock,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            StoreName: StoreName,
            TotalNetAmt: TotalNetAmt,
        };
        let pdfOption: any = null;
        let key = 'openingstockentryreport';
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

    private async UpdateMovementInfo(req: any) {
        let stockmovementBo = BoFactory.GetBo(bo.StockMovementBo, this.Request);
        let UpdateMovementTransactionNumber: any = { TransactionNumber: req.Data.Header.TransactionNumber };
        await stockmovementBo.Update(UpdateMovementTransactionNumber, {
            fields: ['TransactionNumber'],
            where: { TransactionId: req.Data.Header.TransactionId }
        });
    }
}
