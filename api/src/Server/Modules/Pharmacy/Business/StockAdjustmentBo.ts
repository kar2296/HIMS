import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockAdjustmentInstance, StockAdjustmentAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockAdjustmentFilters, StockAdjustmentDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as _ from 'lodash';

export class StockAdjustmentBo extends BaseBo<StockAdjustmentInstance, StockAdjustmentAttributes> {
    public async AddStockAdjustment(req: BaseRequest): Promise<number> {
        if (req.Data.Header.AdjustmentStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.StockAdjustmentNumber = await Sequence.Next(SequenceKeys.MDStockAdjustment);
            } else {
                req.Data.Header.StockAdjustmentNumber = await Sequence.Next(SequenceKeys.NMDStockAdjustment);
            }
            */
            req.Data.Header.AdjustedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.AdjustmentStatusId === 1) {
            req.Data.Header.AdjustedDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockAdjustmentDetailBo, this.Request);
            let StockAdjustmentId = result.dataValues.Id;
            await detailBO.ManageStockAdjustmentDetails(StockAdjustmentId, req.Data, req.Data.Details);

            if (req.Data.Header.AdjustmentStatusId >= 1) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(15, StockAdjustmentId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(15, StockAdjustmentId, req.Data);
            }
            let saIdentifier: any = null;
            if (req.Data.Header.AdjustmentStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    saIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockAdjustment);
                } else {
                    saIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockAdjustment);
                }
            }


            if (saIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockAdjustmentId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = stockAdjustmentId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, StockAdjustmentId);
                };

                this.deferSequenceKey(StockAdjustmentId, 'StockAdjustmentNumber', saIdentifier, [afterO().UpdateMovementInfo]);
            }

            return StockAdjustmentId;
        }

        return 0;
    }

    public async UpdateStockAdjustment(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.AdjustmentStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.StockAdjustmentNumber = await Sequence.Next(SequenceKeys.MDStockAdjustment);
            } else {
                req.Data.Header.StockAdjustmentNumber = await Sequence.Next(SequenceKeys.NMDStockAdjustment);
            }
            */
            req.Data.Header.AdjustedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.AdjustmentStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockAdjustmentDetailBo, this.Request);
            let StockAdjustmentId = req.Data.Header.Id;
            await detailBO.ManageStockAdjustmentDetails(StockAdjustmentId, req.Data, req.Data.Details);

            // let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
            // await stockitemBO.ManageStockItems(15, StockAdjustmentId, req.Data);

            // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
            // await stockmovementBO.ManageStockMovements(15, StockAdjustmentId, req.Data);

            let saIdentifier: any = null;
            if (req.Data.Header.AdjustmentStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    saIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockAdjustment);
                } else {
                    saIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockAdjustment);
                }
            }

            if (saIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockAdjustmentId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = stockAdjustmentId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, StockAdjustmentId);
                };

                this.deferSequenceKey(StockAdjustmentId, 'StockAdjustmentNumber', saIdentifier, [afterO().UpdateMovementInfo]);
            }

            return StockAdjustmentId;
        }

        return result;
    }

    public async GetStockAdjustmentById(req: BaseRequest): Promise<StockAdjustmentAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AdjustedUser', required: false,
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
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetStockAdjustments(apiReq?: ApiRequest<StockAdjustmentFilters>): Promise<ApiResponse<StockAdjustmentAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('AdjustmentStatus'));
        include.push(this.GetReference('AdjustmentType'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AdjustedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
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
            model: this.Models.StockAdjustmentDetail, required: false
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockAdjustmentFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockAdjustmentFilters.StockAdjustmentNumber:
                        where['StockAdjustmentNumber'] = param.Value;
                        break;
                    case StockAdjustmentFilters.AdjustmentTypeId:
                        where['AdjustmentTypeId'] = param.Value;
                        break;
                    case StockAdjustmentFilters.AdjustmentStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['AdjustmentStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockAdjustmentFilters.AdjustedDate:
                        where['AdjustedDate'] = { '$between': param.Value };
                        break;
                    case StockAdjustmentFilters.From:
                        where['AdjustedDate'] = where['AdjustedDate'] || {};
                        (where['AdjustedDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockAdjustmentFilters.To:
                        where['AdjustedDate'] = where['AdjustedDate'] || {};
                        (where['AdjustedDate'] as any)['$lte'] = param.Value;
                        break;
                    case StockAdjustmentFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockAdjustmentFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStockAdjustment(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintStockAdjustment(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockAdjustmentFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockAdjustments(apiReq);
        let StockAdjustments = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockAdjustmentDetailFilters.StockAdjustmentId, Value: req.Id }]
        };
        let StockAdjustmentDetailBo = BoFactory.GetBo(bo.StockAdjustmentDetailBo, this.Request);
        let StockAdjustmentDetailData = await StockAdjustmentDetailBo.GetStockAdjustmentDetails(Req);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockAdjustments.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockAdjustments.FacilityId, StockAdjustments.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.pharmacyprintheader = printStoreData.printheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockAdjustments: StockAdjustments,
            StockAdjustmentDetail: StockAdjustmentDetailData.Data,
            Preferences: printPreferencesData
        };
        return await Report.Generate('stockadjustment', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<StockAdjustmentInstance, StockAdjustmentAttributes> {
        return this.Models.StockAdjustment;
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
