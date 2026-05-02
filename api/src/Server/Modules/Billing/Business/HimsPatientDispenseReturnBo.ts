import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDispenseReturnInstance, PatientDispenseReturnAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Billing/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import * as ipbo from '../../IPManagement/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { PatientDispenseReturnFilters, PatientDispenseReturnDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';
import * as _ from 'lodash';

export class PatientDispenseReturnBo extends BaseBo<PatientDispenseReturnInstance, PatientDispenseReturnAttributes> {
    public async AddPatientDispenseReturn(req: BaseRequest): Promise<number> {
        /* let seqidentifier = SequenceKeys.DispenseReturnStore; */
        if (req.Data.Header.DispenseReturnStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseReturnStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.DispenseReturnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
                    }
                } else {
                    req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
                }
            } else {
                req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
            }
            */
            req.Data.Header.DispenseReturnDateTime = new Date();
            req.Data.Header.ApprovedDateTime = new Date();
        } else if (req.Data.Header.DispenseReturnStatusId === 1) {
            req.Data.Header.DispenseReturnDateTime = new Date();
        }
        if (req.Data.Header && req.Data.Header.PatientStockReturnId &&
            req.Data.Header.PatientStockReturnId > 0) {
            if (await this.IsReceiveExist(req) <= -1) throw { message: 'Medicine Already Received' };
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientDispenseReturnDetailsBo, this.Request);
            let PatientDispenseReturnId = result.dataValues.Id;
            await detailBO.ManagePatientDispenseReturnDetails(PatientDispenseReturnId, req.Data.Details);

            if (req.Data.Header.DispenseReturnStatusId === 2) {
                let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(20, PatientDispenseReturnId, req.Data);
                } catch (ex) {
                    // throw { message: 'Issue in Return' };
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }

                // let stockmovementBO = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(20, PatientDispenseReturnId, req.Data);

                if (req.Data.Header.DispenseReturnTypeId === 1) {
                    let patientstockretBO = BoFactory.GetBo(ipbo.PatientStockReturnsBo, this.Request);
                    await patientstockretBO.ManagePatientStockReturn(PatientDispenseReturnId, req.Data);
                }

                let patientreturnBO = BoFactory.GetBo(bo.PatientReturnsBo, this.Request);
                let patientReturnId = await patientreturnBO.AddPatientDispenseReturn(PatientDispenseReturnId, req);

                let patientbillBO = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                await patientbillBO.AddPatientDispenseReturnBill(PatientDispenseReturnId, patientReturnId, req);
            }

            let seqidentifier = SequenceKeys.DispenseReturnStore;
            let dispretIdentifier: any = null;
            if (req.Data.Header.DispenseReturnStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    if (req.Data.Header.StoreSubTypeId === 2) {
                        if (req.Data.Header.SequenceOptionId === 2) {
                            let StoreMasterId = req.Data.Header.StoreMasterId;
                            seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseReturnStore, StoreMasterId);
                            dispretIdentifier = this.getSequenceIdentifier(seqidentifier);
                        } else {
                            dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                        }
                    } else {
                        dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                    }
                } else {
                    dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                }
            }

            if (dispretIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, patientdispenseReturnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = patientdispenseReturnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PatientDispenseReturnId);
                };

                this.deferSequenceKey(PatientDispenseReturnId, 'DispenseReturnNumber', dispretIdentifier, [afterO().UpdateMovementInfo]);
            }

            return PatientDispenseReturnId;
        }

        return 0;
    }

    public async UpdatePatientDispenseReturn(req: BaseRequest): Promise<boolean> {
        /* let seqidentifier = SequenceKeys.DispenseReturnStore; */
        if (req.Data.Header.DispenseReturnStatusId === 2) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                if (req.Data.Header.StoreSubTypeId === 2) {
                    if (req.Data.Header.SequenceOptionId === 2) {
                        seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseReturnStore, req.Data.Header.StoreMasterId);
                        req.Data.Header.DispenseReturnNumber = await Sequence.Next(seqidentifier);
                    } else {
                        req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
                    }
                } else {
                    req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
                }
            } else {
                req.Data.Header.DispenseReturnNumber = await Sequence.Next(SequenceKeys.PatientDispenseReturnNumberId);
            }
            */
            req.Data.Header.DispenseReturnDateTime = new Date();
            req.Data.Header.ApprovedDateTime = new Date();
        } else if (req.Data.Header.DispenseReturnStatusId === 1) {
            req.Data.Header.DispenseReturnDateTime = new Date();
        }

        let result = await this.Update(req.Data.Header);
        let PatientDispenseReturnId = req.Data.Header.Id;
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PatientDispenseReturnDetailsBo, this.Request);
            await detailBO.ManagePatientDispenseReturnDetails(PatientDispenseReturnId, req.Data.Details);

            if (req.Data.Header.DispenseReturnStatusId === 2) {
                // let stockmovementBO = BoFactory.GetBo(invbo.StockMovementBo, this.Request);
                // await stockmovementBO.ManageStockMovements(19, PatientDispenseReturnId, req.Data);

                let stockitemBO = BoFactory.GetBo(invbo.StockItemBo, this.Request);
                try {
                    await stockitemBO.ManageStockItems(20, PatientDispenseReturnId, req.Data);
                } catch (ex) {
                    let errorMessages: any = [];
                    _.forEach(ex.message, (item: any) => { errorMessages.push(item.ItemMasterId + ':' + item.name); });
                    throw { message: 'Error in Returning ' + errorMessages.join('$,$') };
                }

                if (req.Data.Header.DispenseReturnTypeId === 1) {
                    let patientstockretBO = BoFactory.GetBo(ipbo.PatientStockReturnsBo, this.Request);
                    await patientstockretBO.ManagePatientStockReturn(PatientDispenseReturnId, req.Data);
                }
                let patientreturnBO = BoFactory.GetBo(bo.PatientReturnsBo, this.Request);
                let patientReturnId = await patientreturnBO.AddPatientDispenseReturn(PatientDispenseReturnId, req);

                let patientbillBO = BoFactory.GetBo(bo.PatientBillsBo, this.Request);
                await patientbillBO.AddPatientDispenseReturnBill(PatientDispenseReturnId, patientReturnId, req);
            }

            let seqidentifier = SequenceKeys.DispenseReturnStore;
            let dispretIdentifier: any = null;
            if (req.Data.Header.DispenseReturnStatusId === 2) {
                if (req.Data.Header.StoreTypeId === 1) {
                    if (req.Data.Header.StoreSubTypeId === 2) {
                        if (req.Data.Header.SequenceOptionId === 2) {
                            let StoreMasterId = req.Data.Header.StoreMasterId;
                            seqidentifier = this.getStoreSequenceIdentifier(SequenceKeys.DispenseReturnStore, StoreMasterId);
                            dispretIdentifier = this.getSequenceIdentifier(seqidentifier);
                        } else {
                            dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                        }
                    } else {
                        dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                    }
                } else {
                    dispretIdentifier = this.getSequenceIdentifier(SequenceKeys.PatientDispenseReturnNumberId);
                }
            }

            if (dispretIdentifier) {
                const afterO: any = () => {
                    return ((bo, request, patientdispenseReturnId) => {
                        return {
                            UpdateMovementInfo: async (code: string) => {
                                request.Data.Header.TransactionId = patientdispenseReturnId;
                                req.Data.Header.TransactionNumber = code;
                                await bo.UpdateMovementInfo(request);
                            }
                        };
                    })(this, req, PatientDispenseReturnId);
                };

                this.deferSequenceKey(PatientDispenseReturnId, 'DispenseReturnNumber', dispretIdentifier, [afterO().UpdateMovementInfo]);
            }

            return PatientDispenseReturnId;
        }

        return result;
    }

    public async GetPatientDispenseReturnById(req: BaseRequest): Promise<PatientDispenseReturnAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDispenseReturns(apiReq?: ApiRequest<PatientDispenseReturnFilters>):
        Promise<ApiResponse<PatientDispenseReturnAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('DispenseReturnStatus'));
        //include.push(this.GetReference('DispenseReturnType'));
        //include.push(this.GetReference('DispenseReturnPriority'));
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ReceivedStore', required: false });
        include.push({ model: this.Models.PatientStockReturns, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName', 'UserName'], as: 'ReturnReceivedUser', required: false,
            include: [this.GetReference('Title')]
        });
        /*
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
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
        */
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseReturnFilters.Id:
                        where['PatientDispenseReturnId'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.DispenseReturnNumber:
                        where['DispenseReturnNumber'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.DispenseReturnStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['DispenseReturnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientDispenseReturnFilters.ReturnReceivedDateTime:
                        where['ReturnReceivedDateTime'] = { '$between': param.Value || '' };
                        break;
                    case PatientDispenseReturnFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.PatientReturnNumber:
                        where['PatientReturnNumber'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.PatientName:
                        (patientWhere as any)['$or'] = [{ 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'LastName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'MRN': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientDispenseReturnFilters.From:
                        where['DispenseReturnDateTime'] = where['DispenseReturnDateTime'] || {};
                        (where['DispenseReturnDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.To:
                        where['DispenseReturnDateTime'] = where['DispenseReturnDateTime'] || {};
                        (where['DispenseReturnDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.DispenseReturnDateTime:
                        where['DispenseReturnDateTime'] = param.Value;
                        break;
                    case PatientDispenseReturnFilters.PatientStockReturnId:
                        where['PatientStockReturnId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientDispenseReturnDetails,
            required: true,
            include: [
                { model: this.Models.ItemMaster, required: false, include: [this.GetReference('ScheduleType')] },
                { model: this.Models.StockItem, required: false },
                { model: this.Models.StockSerialItem, required: false },
                { model: this.Models.PatientStockReturnDetails, required: false }
            ]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientDispenseReturn(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPatientDispenseReturn(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDispenseReturnFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientDispenseReturns(apiReq);
        let PatientDispenseReturns = data.Data[0];

        // 2. Get all licenses (or just active & history)
        let licenses: any = {};
        // if(PatientBills)
        //     licenses = PatientBills.StoreMaster;
        function formatDateOnly(date: Date) {
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
        }

        const billDateOnly = formatDateOnly(PatientDispenseReturns.DispenseReturnDateTime);
        let storemasterdetailBo = BoFactory.GetBo(invbo.StoreMasterDetailBo, this.Request);
        licenses = await storemasterdetailBo.Find({

            attributes: ['LicenseNo', 'ActiveFrom', 'ActiveTo', 'StoreMasterId'],
            where: {
                ActiveFrom: { [SStatic.Op.lte]: billDateOnly },
                activeTo: { [SStatic.Op.gte]: billDateOnly },
                StoreMasterId: PatientDispenseReturns.StoreMasterId
            }
        });
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: PatientDispenseReturns.EncounterId }]
        };
        let encBO = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encBO.GetEncounters(encReq);
        let encInfo = encounterData.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientDispenseReturnDetailFilters.PatientDispenseReturnId, Value: PatientDispenseReturns.Id }]
        };
        let PatientDispenseReturnDetailBo = BoFactory.GetBo(bo.PatientDispenseReturnDetailsBo, this.Request);
        let PatientDispenseReturnDetailData = await PatientDispenseReturnDetailBo.GetPatientDispenseReturnDetails(Req);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientDispenseReturns.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PatientDispenseReturns.FacilityId, PatientDispenseReturns.StoreMasterId);
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
            PatientDispenseReturn: PatientDispenseReturns,
            Encounter: encInfo,
            PatientDispenseReturnDetail: PatientDispenseReturnDetailData.Data,
            Preferences: printPreferencesData
        };
        return await Report.Generate('patientdispensereturn', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<PatientDispenseReturnInstance, PatientDispenseReturnAttributes> {
        return this.Models.PatientDispenseReturn;
    }

    public async IsReceiveExist(req: any): Promise<number> {
        // let encounterDate = new Date();
        // let FromDate = encounterDate.setSeconds(encounterDate.getSeconds() - 30);
        // let ToDate = encounterDate.setSeconds(encounterDate.getSeconds() + 30);
        // let frmDate = moment(FromDate);
        // let todate = moment(ToDate);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: PatientDispenseReturnFilters.PatientStockReturnId, Value: req.Data.Header.PatientStockReturnId },
                { Key: PatientDispenseReturnFilters.DispenseReturnStatusId, Value: req.Data.Header.DispenseReturnStatusId },
                { Key: PatientDispenseReturnFilters.StoreMasterId, Value: req.Data.Header.StoreMasterId },
                { Key: PatientDispenseReturnFilters.FacilityId, Value: req.Data.Header.FacilityId }
            ]
        };
        let data = await this.GetPatientDispenseReturns(apiReq);
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
