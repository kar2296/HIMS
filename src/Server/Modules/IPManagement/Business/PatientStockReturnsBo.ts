import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientStockReturnsInstance, PatientStockReturnsAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../IPManagement/Business/Index';
import { PatientStockReturnsFilters, PatientStockReturnDetailsFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class PatientStockReturnsBo extends BaseBo<PatientStockReturnsInstance, PatientStockReturnsAttributes>  {

    public async AddPatientStockReturns(req: BaseRequest): Promise<number> {
        if (req.Data.Header.PatientReturnStatusId === 2)
            req.Data.Header.PatientReturnNumber = await Sequence.Next(SequenceKeys.PatientReturnNumberId);
        let result = await this.Save(req.Data.Header);
        let PatientStockReturnId = result.dataValues.Id;
        let detailBO = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        await detailBO.ManagePatientStockReturnDetails(PatientStockReturnId, req.Data.Details);
        return PatientStockReturnId;
    }

    public async UpdatePatientStockReturns(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.Id > 0 && req.Data.Header.PatientReturnStatusId === 2)
            req.Data.Header.PatientReturnNumber = await Sequence.Next(SequenceKeys.PatientReturnNumberId);
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        let PatientStockReturnId = req.Data.Header.Id;
        await detailBO.ManagePatientStockReturnDetails(PatientStockReturnId, req.Data.Details);
        return result;
    }

    public async ManagePatientStockReturn(PatientDispenseReturnId: number, request: any): Promise<any> {
        let patientstockret = await this.GetPatientStockReturnsById({ Id: request.Header.PatientStockReturnId });
        patientstockret.PatientReturnStatusId = request.Header.PatientReturnStatusId;
        await this.Update(patientstockret);

        let PSRDBo = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        await PSRDBo.ManagePatientStockReturnDetailsAfterReceive(PatientDispenseReturnId, request);
    }

    public async GetPatientStockReturnsById(req: BaseRequest): Promise<PatientStockReturnsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientStockReturns(apiReq?: ApiRequest<PatientStockReturnsFilters>)
        : Promise<ApiResponse<PatientStockReturnsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let patientWhere: WhereOptions<any> = {};
        let isReqPatientSearch: boolean = false;
        include.push(this.GetReference('PatientReturnStatus'));
        include.push(this.GetReference('PatientReturnType'));
        include.push(this.GetReference('PatientReturnPriority'));
        include.push({
            model: this.Models.Encounter, attributes: ['VisitIdentifier', 'GuarantorId'],
            include: [{ model: this.Models.Guarantor, required: false }], required: false,
        });
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.WardMaster, attributes: ['WardName'], required: false });
        include.push({ model: this.Models.WardRoomMaster, attributes: ['RoomNo'], required: false });
        include.push({ model: this.Models.WardRoomBedMaster, attributes: ['BedNo'], required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CreatedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ReturnedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'Doctor', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientStockReturnsFilters.Id:
                        where['PatientStockReturnId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.PatientReturnNumber:
                        (where as any)[Op.or] = [{ PatientReturnNumber: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case PatientStockReturnsFilters.PatientReturnStatus:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PatientReturnStatusId'] = { '$in': paramArr };
                        }
                        break;
                    case PatientStockReturnsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.PatientReturnPriorityId:
                        where['PatientReturnPriorityId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.ToStoreId:
                        where['ToStoreId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.WardId:
                        where['WardId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.RoomId:
                        where['RoomId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.Patientname:
                        (patientWhere as any)[Op.or] = [{ FirstName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { LastName: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { MRN: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        isReqPatientSearch = true;
                        break;
                    case PatientStockReturnsFilters.RequestedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.ApprovedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.From:
                        where['PatientReturnDateTime'] = where['PatientReturnDateTime'] || {};
                        (where['PatientReturnDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.To:
                        where['PatientReturnDateTime'] = where['PatientReturnDateTime'] || {};
                        (where['PatientReturnDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientStockReturnsFilters.PatientReturnDateTime:
                        where['PatientReturnDateTime'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.PatientStockReturnDetails,
            required: true,
            include: [
                /*
                {
                    model: this.Models.PatientBillDetails,
                    required: false,
                    where: {
                        'StoreMasterId': { $gt: 0 },
                        'ServiceGroupId': 27,
                        'PatientBillStatusId': 3,
                        'StockItemId': { $gt: 0 },
                        'StockSerialItemId': { $gt: 0 },
                        'IsPharmacyCredit': 1
                    }
                },
                */
                {
                    model: this.Models.ItemMaster,
                    required: false,
                    include: [
                        { model: this.Models.VendorMaster, required: false },
                        this.GetReference('ScheduleType')
                    ]
                },
                { model: this.Models.StockItem, required: false },
                { model: this.Models.StockSerialItem, required: false }
            ]
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId'],
            required: isReqPatientSearch,
            where: patientWhere,
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientStockReturns(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async RejectPatientStockReturns(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data.Header);

        let detailBO = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        let PatientStockReturnId = req.Data.Header.Id;

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 10000, PageNumber: 1 },
            Params: [{ Key: PatientStockReturnDetailsFilters.PatientStockReturnId, Value: PatientStockReturnId }]
        };
        let data = await detailBO.GetPatientStockReturnDetailsForReject(apiReq);
        req.Data.Details = data.Data;

        for (let i = 0, len = req.Data.Details.length; i < len; i++) {
            if (req.Data.Details[i].Id > 0) {
                req.Data.Details[i].ReturnStatusId = 6;
            }
        }

        await detailBO.ManagePatientStockReturnDetails(PatientStockReturnId, req.Data.Details);

        return result;
    }

    public async CompletePatientStockReturn(req: BaseRequest): Promise<boolean> {
        let PSRDBo = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        await PSRDBo.ManagePatientStockReturnDetailsForComplete(req.Data);

        let result = await this.Update(req.Data.Header);
        return result;
    }
    public async PrintPatientStockReturns(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientStockReturnsFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientStockReturns(apiReq);
        let PatientStockReturns = data.Data[0];
        let PatientStockReturnsDetailsBo = BoFactory.GetBo(bo.PatientStockReturnDetailsBo, this.Request);
        let StockReturnsdetailReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: PatientStockReturnDetailsFilters.PatientStockReturnId, Value: req.Id }]
        };
        let PatientStockReturnDetailsData = await PatientStockReturnsDetailsBo.GetPatientStockReturnDetails(StockReturnsdetailReq);
        let PatientStockReturnDetails = PatientStockReturnDetailsData.Data;
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PatientStockReturns.FacilityId);
        let info = {
            PatientStockReturns: PatientStockReturns,
            PatientStockReturnDetails: PatientStockReturnDetails,
            Preferences: printPreferencesData

        };
        let pdfOption: any = null;
        let key = 'Patientreturn';
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

    public GetModel(): SStatic.Model<PatientStockReturnsInstance, PatientStockReturnsAttributes> {
        return this.Models.PatientStockReturns;
    }

}
