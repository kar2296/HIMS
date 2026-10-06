import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LHRCVoucherDetailInstance, LHRCVoucherDetailAttributes } from '../Model/Interface/Index';
import { LHRCVoucherDetailFilters } from '../Common/Filters.e';
// import * as billBo from '../../Billing/Business/Index';


export class LHRCVoucherDetailBo extends BaseBo<LHRCVoucherDetailInstance,
    LHRCVoucherDetailAttributes> {
    public async AddLHRCVoucherDetail(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Save(req.Data.Header);
        return result.dataValues.Id;
    }

    public async UpdateLHRCVoucherDetail(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data.Header);
        let result = await this.Update(req.Data.Header);
        return result;
    }

    public async GetLHRCVoucherDetailById(req: BaseRequest): Promise<LHRCVoucherDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async ManageLHRCVoucherDetails(VoucherId: number, details: LHRCVoucherDetailAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.LHRCVoucherId = VoucherId;
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

    public async GetLHRCVoucherDetails(apiReq?: ApiRequest<LHRCVoucherDetailFilters>):
        Promise<ApiResponse<LHRCVoucherDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('InvoiceStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LHRCVoucherDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LHRCVoucherDetailFilters.LHRCVoucherId:
                        where['LHRCVoucherId'] = param.Value;
                        break;
                    default:
                        throw ('Not Implemented');
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLHRCVoucherDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LHRCVoucherDetailInstance, LHRCVoucherDetailAttributes> {
        return this.Models.LHRCVoucherDetail;
    }
}
