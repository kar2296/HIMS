import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { StockConsumptionInstance, StockConsumptionAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { StockConsumptionFilters, StockConsumptionDetailFilters, ItemStoreFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';
import * as _ from 'lodash';

export class StockConsumptionBo extends BaseBo<StockConsumptionInstance, StockConsumptionAttributes> {

    public async AddStockConsumption(req: BaseRequest): Promise<number> {
        if (req.Data.Header.ConsumptionStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.StockConsumptionNumber = await Sequence.Next(SequenceKeys.MDStockConsumption);
            } else {
                req.Data.Header.StockConsumptionNumber = await Sequence.Next(SequenceKeys.NMDStockConsumption);
            }
            */
            req.Data.Header.ConsumptionDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.ConsumptionStatusId === 1) {
            req.Data.Header.ConsumptionDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockConsumptionDetailBo, this.Request);
            let StockConsumptionId = result.dataValues.Id;
            await detailBO.ManageStockConsumptionDetails(StockConsumptionId, req.Data.Details);

            if (req.Data.Details) {
                for (let sdx in req.Data.Details) {
                    let storemap = req.Data.Details[sdx];
                    let MasterId = storemap.ItemMasterId;
                    let storeuserReq = {
                        Id: 0,
                        PageContext: { PageSize: 100, PageNumber: 1 },
                        Params: [{ Key: ItemStoreFilters.ItemMasterId, Value: MasterId },
                        { Key: ItemStoreFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId }]
                    };
                    let itemstoremapbo = BoFactory.GetBo(bo.ItemStoreMapBo, this.Request);
                    let itemStoreMaps = await itemstoremapbo.GetItemStoreMaps(storeuserReq);
                    if (itemStoreMaps.Data.length === 0) {
                        let itemstoreData: any = {
                            Data: {
                                ItemMasterId: MasterId,
                                StoreMasterId: req.Data.Header.StoreMasterId,
                                ItemCode: req.Data.Details.ItemCode,
                                ItemName: req.Data.Details.ItemName,
                                FacilityId: req.Data.Header.FacilityId,
                                IsBillable: 1,
                                Status: 1,
                            }
                        };
                        console.log('itemstoreDataitemstoreDataitemstoreDataitemstoreData', itemstoreData);
                        await itemstoremapbo.AddItemStoreMap(itemstoreData);
                    }
                }
            }

            if (req.Data.Header.ConsumptionStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(13, StockConsumptionId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }
                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(13, StockConsumptionId, req.Data);
            }

            let scIdentifier: any = null;
            if (req.Data.Header.ConsumptionStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    scIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockConsumption);
                } else {
                    scIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockConsumption);
                }
            }

            if (scIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockConsumptionId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = stockConsumptionId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, StockConsumptionId);
                };

                this.deferSequenceKey(StockConsumptionId, 'StockConsumptionNumber', scIdentifier, [afterO().UpdateMovementInfo]);
            }

            return StockConsumptionId;
        }

        return 0;
    }

    public async UpdateStockConsumption(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.ConsumptionStatusId === 2) {
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.StockConsumptionNumber = await Sequence.Next(SequenceKeys.MDStockConsumption);
            } else {
                req.Data.Header.StockConsumptionNumber = await Sequence.Next(SequenceKeys.NMDStockConsumption);
            }
            req.Data.Header.ConsumptionDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.ConsumptionStatusId === 3) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.StockConsumptionDetailBo, this.Request);
            let StockConsumptionId = req.Data.Header.Id;
            await detailBO.ManageStockConsumptionDetails(StockConsumptionId, req.Data.Details);

            if (req.Data.Header.ConsumptionStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(bo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(13, StockConsumptionId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Stock Changes Happened for ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(bo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(13, StockConsumptionId, req.Data);
            }

            let scIdentifier: any = null;
            if (req.Data.Header.ConsumptionStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    scIdentifier = this.getSequenceIdentifier(SequenceKeys.MDStockConsumption);
                } else {
                    scIdentifier = this.getSequenceIdentifier(SequenceKeys.NMDStockConsumption);
                }
            }

            if (scIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, stockConsumptionId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = stockConsumptionId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, StockConsumptionId);
                };

                this.deferSequenceKey(StockConsumptionId, 'StockConsumptionNumber', scIdentifier, [afterO().UpdateMovementInfo]);
            }

            return StockConsumptionId;
        }

        return result;
    }

    public async GetStockConsumptionById(req: BaseRequest): Promise<StockConsumptionAttributes> {
        let include: Array<IncludeOptions> = [];
        // include.push({
        //     model: this.Models.Encounter,
        //     attributes: ['Id', 'EncounterTypeId', 'IsBillLock'],
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ConsumedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.StockConsumptionDetail, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CancelledUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetStockConsumptions(apiReq?: ApiRequest<StockConsumptionFilters>): Promise<ApiResponse<StockConsumptionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        let order: Array<any> = [];
        include.push(this.GetReference('ConsumptionType'));
        include.push(this.GetReference('ConsumptionStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.StoreMaster, as: 'StoreMaster', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ConsumedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.StockConsumptionDetail, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'CancelledUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case StockConsumptionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case StockConsumptionFilters.StockConsumptionNumber:
                        where['StockConsumptionNumber'] = param.Value;
                        break;
                    case StockConsumptionFilters.ConsumptionTypeId:
                        where['ConsumptionTypeId'] = param.Value;
                        break;
                    case StockConsumptionFilters.ConsumptionStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ConsumptionStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case StockConsumptionFilters.ConsumptionDate:
                        where['ConsumptionDate'] = { '$between': param.Value };
                        break;
                    case StockConsumptionFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case StockConsumptionFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case StockConsumptionFilters.From:
                        where['ConsumptionDate'] = where['ConsumptionDate'] || {};
                        (where['ConsumptionDate'] as any)['$gte'] = param.Value;
                        break;
                    case StockConsumptionFilters.To:
                        where['ConsumptionDate'] = where['ConsumptionDate'] || {};
                        (where['ConsumptionDate'] as any)['$lte'] = param.Value + ' 23:59:59';
                        break;
                    case StockConsumptionFilters.PatientName:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName : { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'DOB', 'Age', 'GenderId',
                'AddressLine1', 'Area', 'City', 'State', 'Pincode', 'Country', 'Mobile'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteStockConsumption(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintStockConsumption(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockConsumptionFilters.Id, Value: req.Id }]
        };
        let data = await this.GetStockConsumptions(apiReq);
        let StockConsumptions = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: StockConsumptionDetailFilters.StockConsumptionId, Value: req.Id }]
        };
        let StockConsumptionDetailBo = BoFactory.GetBo(bo.StockConsumptionDetailBo, this.Request);
        let StockConsumptionDetailData = await StockConsumptionDetailBo.GetStockConsumptionDetails(Req);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(StockConsumptions.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(StockConsumptions.FacilityId, StockConsumptions.StoreMasterId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            StockConsumptions: StockConsumptions,
            StockConsumptionDetail: StockConsumptionDetailData.Data,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'stockconsumption';
        let pdfOptionJSON = await Report.GetPdfOption(key);
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

    public GetModel(): SStatic.Model<StockConsumptionInstance, StockConsumptionAttributes> {
        return this.Models.StockConsumption;
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
