import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LHRCVoucherInstance, LHRCVoucherAttributes } from '../Model/Interface/Index';
import { LHRCVoucherFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as voucherbo from '../Business/Index';
import { join } from 'path';
// import * as moment from 'moment';

export class LHRCVoucherBo extends BaseBo<LHRCVoucherInstance, LHRCVoucherAttributes> {
    public async AddLHRCVoucher(req: BaseRequest): Promise<number> {
        let generatelhrcvoucher = 0;
        if (req.Data.Header.VoucherStatusId === 2 && !req.Data.Header.LHRCVoucherNo) {
            req.Data.Header.LHRCVoucherNo = null;
            generatelhrcvoucher = 1;
        }
        let result = await this.Save(req.Data.Header);
        let VoucherId = result.dataValues.Id;
        if (generatelhrcvoucher === 1) {
            this.deferSequenceKey(VoucherId, 'LHRCVoucherNo',
                this.getSequenceIdentifier(SequenceKeys.LHRCVoucherId));
        }
        let VoucherDetailsBo = BoFactory.GetBo(voucherbo.LHRCVoucherDetailBo, this.Request);
        await VoucherDetailsBo.ManageLHRCVoucherDetails(VoucherId, req.Data.Details);
        return VoucherId;
    }

    public async UpdateLHRCVoucher(req: BaseRequest): Promise<boolean> {
        let generatelhrcvoucher = 0;
        if (req.Data.Header.VoucherStatusId === 2 && !req.Data.Header.LHRCVoucherNo) {
            generatelhrcvoucher = 1;
            req.Data.Header.LHRCVoucherNo = null; // await Sequence.Next(SequenceKeys.LHRCVoucher);
        }
        let result = await this.Update(req.Data.Header);
        let VoucherId = req.Data.Header.Id;
        if (generatelhrcvoucher === 1) {
            this.deferSequenceKey(VoucherId, 'LHRCVoucherNo',
                this.getSequenceIdentifier(SequenceKeys.LHRCVoucherId));
        }
        let VoucherDetailsBo = BoFactory.GetBo(voucherbo.LHRCVoucherDetailBo, this.Request);
        await VoucherDetailsBo.ManageLHRCVoucherDetails(VoucherId, req.Data.Details);
        return result;
    }

    public async GetLHRCVoucherById(req: BaseRequest): Promise<LHRCVoucherAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLHRCVouchers(apiReq?: ApiRequest<LHRCVoucherFilters>):
        Promise<ApiResponse<LHRCVoucherAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
            'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
            'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country'],
        required: false,
        include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        include.push(this.GetReference('VoucherType'));
        include.push(this.GetReference('VoucherStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LHRCVoucherFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LHRCVoucherFilters.LHRCVoucherNo:
                        (where as any)['$or'] = [{ 'LHRCVoucherNo': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case LHRCVoucherFilters.VoucherDate:
                        where['VoucherDate'] = { '$between': param.Value || '' };
                        break;
                    case LHRCVoucherFilters.From:
                        where['VoucherDate'] = where['VoucherDate'] || {};
                        (where['VoucherDate'] as any)['$gte'] = param.Value;
                        break;
                    case LHRCVoucherFilters.To:
                        where['VoucherDate'] = where['VoucherDate'] || {};
                        (where['VoucherDate'] as any)['$lte'] = param.Value;
                        break;
                    case LHRCVoucherFilters.CreatedBy:
                        where['CreatedBy'] = param.Value;
                        break;
                    case LHRCVoucherFilters.VoucherStatusId:
                        where['VoucherStatusId'] = param.Value;
                        break;
                    case LHRCVoucherFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case LHRCVoucherFilters.PaymentTypeId:
                        where['PaymentTypeId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        order.push(['VoucherDate', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLHRCVoucher(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintLHRCVoucher(req: BaseRequest): Promise<FileInfo> {

        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: LHRCVoucherFilters.Id, Value: req.Id }]
        };
        let data = await this.GetLHRCVouchers(apiReq);
        let LhrcVoucher = data.Data[0];

        // });
        let info = {
            lhrcvoucher: LhrcVoucher,
        };
        let pdfOption: any = null;
        let key = 'lhrcvoucher';
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
        // return await Report.Generate('wagesservicesbill', { header: {}, body: info });
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }

    public GetModel(): SStatic.Model<LHRCVoucherInstance, LHRCVoucherAttributes> {
        return this.Models.LHRCVoucher;
    }
}
