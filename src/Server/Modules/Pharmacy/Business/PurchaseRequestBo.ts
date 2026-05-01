import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PurchaseRequestInstance, PurchaseRequestAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';
import { PurchaseRequestFilters, PurchaseRequestDetailFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import * as userbo from '../../SystemSettings/Business/Index';
import * as invbo from '../../Pharmacy/Business/Index';
import { join } from 'path';

export class PurchaseRequestBo extends BaseBo<PurchaseRequestInstance, PurchaseRequestAttributes> {

    public async AddPurchaseRequest(req: BaseRequest): Promise<number> {
        if (req.Data.Header.PrStatusId === 2 && req.Data.Header.PrNumber === null) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PrNumber = await Sequence.Next(SequenceKeys.MDPurchaseRequestId);
            } else {
                req.Data.Header.PrNumber = await Sequence.Next(SequenceKeys.NMDPurchaseRequestId);
            }
            */
            req.Data.Header.RequestedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.PrStatusId === 1 && req.Data.Header.PrNumber === null) {
            req.Data.Header.RequestedDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseRequestDetailBo, this.Request);
            let PurchaseRequestId = result.dataValues.Id;
            await detailBO.ManagePurchaseRequestDetails(PurchaseRequestId, req.Data.Details);

            let prIdentifier: any = null;
            if (req.Data.Header.PrStatusId === 2 && req.Data.Header.PrNumber === null) {
                if (req.Data.Header.StoreTypeId === 1) {
                    prIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseRequestId,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                } else {
                    prIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseRequestId,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                }
            }

            if (prIdentifier) {
                try {
                    this.deferSequenceKey(PurchaseRequestId, 'PrNumber', prIdentifier, []);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }

            return PurchaseRequestId;
        }

        return 0;
    }

    public async UpdatePurchaseRequest(req: BaseRequest): Promise<boolean> {
        if (req.Data.Header.PrStatusId === 2 && req.Data.Header.PrNumber === null) {
            /*
            if (req.Data.Header.StoreTypeId === 1) {
                req.Data.Header.PrNumber = await Sequence.Next(SequenceKeys.MDPurchaseRequestId);
            } else {
                req.Data.Header.PrNumber = await Sequence.Next(SequenceKeys.NMDPurchaseRequestId);
            }
            */
            req.Data.Header.RequestedDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
        } else if (req.Data.Header.PrStatusId === 3 && req.Data.Header.PrNumber !== null) {
            req.Data.Header.AuthorizedDate = new Date();
        }
        let result = await this.Update(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.PurchaseRequestDetailBo, this.Request);
            let PurchaseRequestId = req.Data.Header.Id;
            await detailBO.ManagePurchaseRequestDetails(PurchaseRequestId, req.Data.Details);

            let prIdentifier: any = null;
            if (req.Data.Header.PrStatusId === 2 && req.Data.Header.PrNumber === null) {
                if (req.Data.Header.StoreTypeId === 1) {
                    prIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.MDPurchaseRequestId,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                } else {
                    prIdentifier = this.getFacilitySequenceIdentifier(SequenceKeys.NMDPurchaseRequestId,
                        (req.Data.Header.FacilityId ? req.Data.Header.FacilityId : -1)
                    );
                }
            }

            if (prIdentifier) {
                try {
                    this.deferSequenceKey(PurchaseRequestId, 'PrNumber', prIdentifier, []);
                } catch (error) {
                    throw { message: 'Sequence Issue.. Please contact Support' };
                }
            }

            return PurchaseRequestId;
        }

        return result;
    }

    public async GetPurchaseRequestById(req: BaseRequest): Promise<PurchaseRequestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPurchaseRequests(apiReq?: ApiRequest<PurchaseRequestFilters>): Promise<ApiResponse<PurchaseRequestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'RequestedUser', required: false,
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
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, as: 'Created', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
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
        include.push(this.GetReference('PrType'));
        include.push(this.GetReference('PrStatus'));
        include.push({ model: this.Models.StoreMaster, as: 'FromStore', required: false });
        include.push({ model: this.Models.StoreMaster, as: 'ToStore', required: false });
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreCode', 'StoreName'], as: 'StoreName', required: false });
        include.push({ model: this.Models.VendorMaster, required: false });
        include.push({ model: this.Models.PurchaseRequestDetail, required: false });
        include.push({ model: this.Models.Facility, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PurchaseRequestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PurchaseRequestFilters.PrNumber:
                        where['PrNumber'] = param.Value;
                        break;
                    case PurchaseRequestFilters.PrTypeId:
                        where['PrTypeId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.VendorFacilityMapId:
                        where['VendorFacilityMapId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.FromStoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.ToStoreMasterId:
                        where['ToStoreMasterId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.VendorMasterId:
                        where['VendorMasterId'] = param.Value;
                        break;
                    case PurchaseRequestFilters.RequestedDate:
                        where['RequestedDate'] = { '$between': param.Value || '' };
                        break;
                    case PurchaseRequestFilters.From:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$gte'] = param.Value;
                        break;
                    case PurchaseRequestFilters.To:
                        where['RequestedDate'] = where['RequestedDate'] || {};
                        (where['RequestedDate'] as any)['$lte'] = param.Value;
                        break;
                    case PurchaseRequestFilters.ApprovedBy:
                        where['ApprovedBy'] = param.Value;
                        break;
                    case PurchaseRequestFilters.AuthorizedBy:
                        where['AuthorizedBy'] = param.Value;
                        break;
                    case PurchaseRequestFilters.PrStatusId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['PrStatusId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePurchaseRequest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async PrintPurchaseRequest(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseRequestFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPurchaseRequests(apiReq);
        let PurchaseRequests = data.Data[0];
        let Req = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PurchaseRequestDetailFilters.PurchaseRequestId, Value: PurchaseRequests.Id }]
        };
        let PurchaseRequestDetailBo = BoFactory.GetBo(bo.PurchaseRequestDetailBo, this.Request);
        let PurchaseRequestDetailData = await PurchaseRequestDetailBo.GetPurchaseRequestDetails(Req);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let storePreferenceBO = BoFactory.GetBo(invbo.StorePreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(PurchaseRequests.FacilityId);
        let printStoreData =
            await storePreferenceBO.GetStorePreferenceWithLogo(PurchaseRequests.FacilityId, PurchaseRequests.StoreMasterId);
        if (printStoreData && printStoreData.printheader)
            printPreferencesData.printheader = printStoreData.printheader;
        if (printStoreData && printStoreData.printfooter)
            printPreferencesData.printfooter = printStoreData.printfooter;
        if (printStoreData && printStoreData.StoreLogo)
            printPreferencesData.Facilitylogo = printStoreData.StoreLogo;
        let info = {
            PurchaseRequest: PurchaseRequests,
            PurchaseRequestDetail: PurchaseRequestDetailData.Data,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'purchaserequest';
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

    public GetModel(): SStatic.Model<PurchaseRequestInstance, PurchaseRequestAttributes> {
        return this.Models.PurchaseRequest;
    }
    public async GetInventoryDashBoardInfo(req: BaseRequest): Promise<any> {
        let prCount = await this.Items.count({
            where: {
                'Status': 1,
                'PrStatusId': { '$in': [2, 3] },
                // 'ItemmasterId': req.Data.itemid,
                // 'StoremasterId': req.Data.storeid
            }
        });
        return {
            'prCount': prCount
        };
    }
}
