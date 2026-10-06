import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LinenStockTransferDetailInstance, LinenStockTransferDetailAttributes } from '../Model/Interface/Index';
import { LinenStockTransferDetailFilters } from '../Common/Filters.e';

export class LinenStockTransferDetailBo extends BaseBo<LinenStockTransferDetailInstance, LinenStockTransferDetailAttributes> {
    public async AddLinenStockTransferDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLinenStockTransferDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageLinenStockTransferDetail
        (LinenStockTransferId: number, details: LinenStockTransferDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.LinenStockTransferId = LinenStockTransferId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetLinenStockTransferDetailById(req: BaseRequest): Promise<LinenStockTransferDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLinenStockTransferDetails(apiReq?: ApiRequest<LinenStockTransferDetailFilters>):
        Promise<ApiResponse<LinenStockTransferDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.LinenStockTransfer, required: false });
        apiReq.Params.forEach((param) => {

            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenStockTransferDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenStockTransferDetailFilters.LinenStockTransferId:
                        where['LinenStockTransferId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLinenStockTransferDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public GetModel(): SStatic.Model<LinenStockTransferDetailInstance, LinenStockTransferDetailAttributes> {
        return this.Models.LinenStockTransferDetail;
    }
}
