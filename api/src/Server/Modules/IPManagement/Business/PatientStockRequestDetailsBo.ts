import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientStockRequestDetailsInstance, PatientStockRequestDetailsAttributes } from '../Model/Interface/Index';
import { PatientStockRequestDetailsFilters } from '../Common/Filters.e';
import * as _ from 'lodash';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
//import * as generalMasterBO from '../../GeneralMaster/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';

export class PatientStockRequestDetailsBo extends BaseBo<PatientStockRequestDetailsInstance, PatientStockRequestDetailsAttributes>  {
    public async AddPatientStockRequestDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientStockRequestDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientStockRequestDetails(PatientStockRequestId: number, details:
        PatientStockRequestDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            detail.PatientStockRequestId = PatientStockRequestId;
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

    /*
    public async ManagePatientStockRequestDetailsAfterDispense(PatientDispenseId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePatientStockRequestDetailAfterDispense(PatientDispenseId, request, detail);
            })(item);
        }));
    }

    public async ManagePatientStockRequestDetailAfterDispense(PatientDispenseId: number, request: any, detail: any): Promise<void> {
        let PatientStockRequestDetailId = detail.PatientStockRequestDetailId;
        if (PatientStockRequestDetailId > 0) {
            let PSRequestDetailedItem = await this.GetPatientStockRequestDetailsById({ Id: PatientStockRequestDetailId });
            PSRequestDetailedItem.DispensedQuantity = PSRequestDetailedItem.DispensedQuantity + detail.DispensedQuantity;
            PSRequestDetailedItem.Rev = detail.PatientStockRequestDetailRev;
            await this.Update(PSRequestDetailedItem);
        }
    }
    */

    public async ManagePatientStockRequestDetailsAfterDispense(PatientDispenseId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.ItemMasterId; });
        await Promise.all(Object.keys(itemDetails).map((itemId: any) => {
            return (async (im) => {
                await this.ManagePatientStockRequestDetailAfterDispense(PatientDispenseId, request, itemDetails[im]);
            })(itemId);
        }));
    }

    public async ManagePatientStockRequestDetailAfterDispense(PatientDispenseId: number, request: any, details: Array<any>): Promise<void> {
        let PatientStockRequestDetailId = details[0].PatientStockRequestDetailId;
        let IsAlternateIssued = details[0].IsAlternateIssued;
        if (PatientStockRequestDetailId > 0 && !IsAlternateIssued) {
            let PSRequestDetailedItem = await this.GetPatientStockRequestDetailsById({ Id: PatientStockRequestDetailId });
            var ItemDispensingQty = _.sumBy(details, (detail: any) => detail.DispensedQuantity);
            PSRequestDetailedItem.DispensedQuantity = PSRequestDetailedItem.DispensedQuantity + ItemDispensingQty;
            PSRequestDetailedItem.Rev = details[0].PatientStockRequestDetailRev;
            await this.Update(PSRequestDetailedItem);
        }
    }

    public async GetPatientStockRequestDetailsById(req: BaseRequest): Promise<PatientStockRequestDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientStockRequestDetails(apiReq?: ApiRequest<PatientStockRequestDetailsFilters>):
        Promise<ApiResponse<PatientStockRequestDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let PatstockWhere: WhereOptions<any> = {};
        let isReqstockSearch: boolean = false;
        let tostoreId = -1;
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'BaseUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockRequestDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientStockRequestDetailsFilters.PatientStockRequestId:
                        where['PatientStockRequestId'] = param.Value;
                        break;
                    case PatientStockRequestDetailsFilters.ItemId:
                        where['ItemId'] = param.Value;
                        break;
                    case PatientStockRequestDetailsFilters.ToStoreId:
                        PatstockWhere['ToStoreId'] = param.Value;
                        tostoreId = param.Value;
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PatientStockRequestDetailsFilters.PatientRequestDateTime:
                        PatstockWhere['PatientRequestDateTime'] = { '$between': param.Value || '' };
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.From:
                        PatstockWhere['PatientRequestDateTime'] = PatstockWhere['PatientRequestDateTime'] || {};
                        (PatstockWhere['PatientRequestDateTime'] as any)['$gte'] = param.Value;
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.To:
                        PatstockWhere['PatientRequestDateTime'] = PatstockWhere['PatientRequestDateTime'] || {};
                        (PatstockWhere['PatientRequestDateTime'] as any)['$lte'] = param.Value;
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.PatientRequestStatusId:
                        PatstockWhere['PatientRequestStatusId'] = param.Value;
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.Facility:
                        PatstockWhere['FacilityId'] = param.Value;
                        isReqstockSearch = true;
                        break;
                    case PatientStockRequestDetailsFilters.WardId:
                        PatstockWhere['WardId'] = param.Value;
                        isReqstockSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientStockRequests,
            as: 'PatientStockRequests',
            required: isReqstockSearch,
            where: PatstockWhere,
            include: [{
                model: this.Models.Encounter,
                attributes: ['Id', 'EncounterTypeId', 'VisitIdentifier', 'PatientId', 'PatientMrn',
                    'AdmissionStatusId', 'EncounterStatusId', 'IsBillLock'],
            }, {
                model: this.Models.Patient,
                include: [
                    this.GetReference('Title'), this.GetReference('Gender')
                ],

            },
            { model: this.Models.StoreMaster, as: 'ToStore', required: false },
            { model: this.Models.WardMaster, attributes: ['WardName'], required: false },
            { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false
            },
            ]
        });

        // include.push({
        //     model: this.Models.PatientStockRequests,
        //     as: 'PatientStockRequests',
        //     required: isReqstockSearch,
        //     where: PatstockWhere,
        //     include: [this.GetReference('Gender'), {
        //         model: this.Models.Patient,
        //         include: [
        //             this.GetReference('Title'), this.GetReference('Gender')
        //         ],
        //     }]
        // });

        include.push({
            model: this.Models.ItemMaster,
            required: true,
            include: [
                this.GetReference('ScheduleType'),
                { model: this.Models.GenericMaster, required: false },
                { model: this.Models.UomMaster, required: false },
                { model: this.Models.VendorMaster, as: 'Manufacturer', required: false, attributes: ['VendorCode', 'VendorName'] },
                {
                    model: this.Models.StockItem,
                    required: false,
                    attributes: ['Quantity'],
                    where: { 'StoreMasterId': tostoreId },
                    include: [
                        {
                            model: this.Models.StockSerialItem,
                            required: false,
                            attributes: ['Id', 'StockItemId', 'ItemMasterId', 'StoreMasterId', 'BatchId',
                                'Quantity', 'ExpiryDate', 'Ucp', 'Mrp', 'GstId', 'GstPercentage', 'InGstId', 'InGstPercentage',
                                'CGstId', 'CGstPercentage', 'SGstId', 'SGstPercentage'],
                            where: { 'Quantity': { $gt: 0 } }
                        }
                    ]
                }
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientStockRequestDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientIndentPendingReport(apiReq?: ApiRequest<PatientStockRequestDetailsFilters>): Promise<any> {
        let data = await this.GetPatientStockRequestDetails(apiReq);
        let PatientIndentPending = data.Data;
        let FromDate = apiReq.Data.FromDate;
        let ToDate = apiReq.Data.ToDate;
        let FacilityName = apiReq.Data.FacilityName;
        let FacilityId = apiReq.Data.FacilityId;
        let StoreName = apiReq.Data.StoreName;
        let ToStoreId = apiReq.Data.ToStoreId;
        let WardName = apiReq.Data.WardName;
        let Status = apiReq.Data.Status;
        // let PatientMedicineIndentData = data.Data[0];

        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(FacilityId, ToStoreId);
        if (printStoreData && printStoreData.pharmacyprintheader)
            printPreferencesData.pharmacyprintheader = printStoreData.pharmacyprintheader;
        if (printStoreData && printStoreData.pharmacyprintfooter)
            printPreferencesData.pharmacyprintfooter = printStoreData.pharmacyprintfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PatientIndentPending: PatientIndentPending,
            Preferences: printPreferencesData,
            FromDate: FromDate,
            ToDate: ToDate,
            FacilityName: FacilityName,
            StoreName: StoreName,
            WardName: WardName,
            Status: Status,

        };
        let pdfOption: any = null;
        let key = 'patientindentpendingreport';
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
    public GetModel(): SStatic.Model<PatientStockRequestDetailsInstance, PatientStockRequestDetailsAttributes> {
        return this.Models.PatientStockRequestDetails;
    }
    /*
    public async GetOptions(key: string, apiReq?: ApiRequest<PatientStockRequestDetailsFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', 'ItemId', 'ItemCode', ['ItemName', 'Text'], 'ItemName'];
        let val = await this.GetPatientStockRequestDetails(apiReq);
        return { [key]: val.Data };
    }
    */
}
