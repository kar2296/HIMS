import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDispenseDetailsInstance, PatientDispenseDetailsAttributes } from '../Model/Interface/Index';
import { PatientDispenseDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';

export class PatientDispenseDetailsBo extends BaseBo<PatientDispenseDetailsInstance, PatientDispenseDetailsAttributes>  {
    public async AddPatientDispenseDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDispenseDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientDispenseDetails(PatientDispenseId: number, details: PatientDispenseDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientDispenseId = PatientDispenseId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    /*
    public async ManagePatientDispensedItemDetails(PatientDispenseId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePatientDispensedItem(PatientDispenseId, request, detail);
            })(item);
        }));
    }

    public async ManagePatientDispensedItem(PatientDispenseId: number, request: any, detail: any): Promise<void> {
        let PatientDispenseDetailId = detail.Id;
        if (PatientDispenseDetailId > 0) {
            let PatientDispenseDetailedItem = await this.GetPatientDispenseDetailsById({ Id: PatientDispenseDetailId });
            PatientDispenseDetailedItem.AcceptedQuantity = PatientDispenseDetailedItem.AcceptedQuantity + detail.AcceptedQuantity;
            PatientDispenseDetailedItem.TransitQuantity = 0;
            await this.Update(PatientDispenseDetailedItem);
        }
    }
    */

    public async GetPatientDispenseDetailsById(req: BaseRequest): Promise<PatientDispenseDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDispenseDetails(apiReq?: ApiRequest<PatientDispenseDetailFilters>):
        Promise<ApiResponse<PatientDispenseDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let PatWhere: WhereOptions<any> = {};
        let isReqSearch: boolean = false;
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDispenseDetailFilters.PatientDispenseId:
                        where['PatientDispenseId'] = param.Value;
                        break;
                    case PatientDispenseDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case PatientDispenseDetailFilters.DispenseDateTime:
                        PatWhere['DispenseDateTime'] = { '$between': param.Value || '' };
                        isReqSearch = true;
                        break;
                    case PatientDispenseDetailFilters.From:
                        PatWhere['DispenseDateTime'] = PatWhere['DispenseDateTime'] || {};
                        (PatWhere['DispenseDateTime'] as any)['$gte'] = param.Value;
                        isReqSearch = true;
                        break;
                    case PatientDispenseDetailFilters.To:
                        PatWhere['DispenseDateTime'] = PatWhere['DispenseDateTime'] || {};
                        (PatWhere['DispenseDateTime'] as any)['$lte'] = param.Value;
                        isReqSearch = true;
                        break;
                    case PatientDispenseDetailFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDispenseDetailFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PatientDispenseDetailFilters.WardId:
                        PatWhere['WardId'] = param.Value;
                        isReqSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientStockRequestDetails, required: false,
            include: [
                {
                    model: this.Models.PatientStockRequests,
                    as: 'PatientStockRequests',
                }
            ]
        });

        include.push({
            model: this.Models.PatientDispense,
            required: isReqSearch,
            where: PatWhere,
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
            { model: this.Models.StoreMaster, as: 'DispenseStore', required: false },
            { model: this.Models.WardMaster, attributes: ['WardName'], required: false },
            { model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false },
            {
                model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false
            },
            ]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDispenseDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientIPDispensesDetailsReport(apiReq?: ApiRequest<PatientDispenseDetailFilters>): Promise<any> {
        let data = await this.GetPatientDispenseDetails(apiReq);
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
            TotalAmount += item.GrossAmount;
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
        let key = 'patientipdispensedetailsreport';
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
    public GetModel(): SStatic.Model<PatientDispenseDetailsInstance, PatientDispenseDetailsAttributes> {
        return this.Models.PatientDispenseDetails;
    }

}
