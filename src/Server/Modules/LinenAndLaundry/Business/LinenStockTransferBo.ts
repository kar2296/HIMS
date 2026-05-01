import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LinenStockTransferInstance, LinenStockTransferAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../LinenAndLaundry/Business/Index';
import { LinenStockTransferFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class LinenStockTransferBo extends BaseBo<LinenStockTransferInstance, LinenStockTransferAttributes> {
    public async AddLinenStockTransfer(req: BaseRequest): Promise<number> {
        let generateTransferno = 0;
        if (!req.Data.Header.LinenStockTransferNo &&
            (req.Data.Header.LinenStockTransferStatusId === 2 || req.Data.Header.LinenStockTransferStatusId === 3)) {
            req.Data.LinenStockTransferNo = null;
            generateTransferno = 1;
        }
        let result = await this.Save(req.Data.Header);
        let linstocktransferid = result.dataValues.Id;
        if (generateTransferno === 1) {
            this.deferSequenceKey(linstocktransferid, 'LinenStockTransferNo',
                this.getSequenceIdentifier(SequenceKeys.LinenTransferId));
        }
        let detailBO = BoFactory.GetBo(bo.LinenStockTransferDetailBo, this.Request);
        // let linstocktransferid = result.dataValues.Id;
        await detailBO.ManageLinenStockTransferDetail(linstocktransferid, req.Data.Details);
        return linstocktransferid;
    }

    public async UpdateLinenStockTransfer(req: BaseRequest): Promise<boolean> {
        let linstocktransferid = req.Data.Header.Id;
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.LinenStockTransferDetailBo, this.Request);
        await detailBO.ManageLinenStockTransferDetail(linstocktransferid, req.Data.Details);
        return result;
    }

    public async GetLinenStockTransferById(req: BaseRequest): Promise<LinenStockTransferAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('LinenStockTransferStatus'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'IssuedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, as: 'Department', required: false });
        include.push({ model: this.Models.Department, as: 'ToDepartment', required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetLinenStockTransfers(apiReq?: ApiRequest<LinenStockTransferFilters>):
        Promise<ApiResponse<LinenStockTransferAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('LinenStockTransferStatus'));
        // include.push({
        //     model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'DisposedUser', required: false,
        //     include: [this.GetReference('Title')]
        // });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'IssuedUser', required: false,
            include: [this.GetReference('Title')]
        });
        include.push({ model: this.Models.Department, as: 'Department', required: false });
        include.push({ model: this.Models.Department, as: 'ToDepartment', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenStockTransferFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenStockTransferFilters.FromDepartmentId:
                        where['FromDepartmentId'] = param.Value;
                        break;
                    case LinenStockTransferFilters.LinenStockTransferNo:
                        where['LinenStockTransferNo'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case LinenStockTransferFilters.LinenStockTransferDate:
                        where['LinenStockTransferDate'] = { '$between': param.Value };
                        break;
                    case LinenStockTransferFilters.From:
                        where['LinenStockTransferDate'] = where['LinenStockTransferDate'] || {};
                        (where['LinenStockTransferDate'] as any)['$gte'] = param.Value;
                        break;
                    case LinenStockTransferFilters.To:
                        where['LinenStockTransferDate'] = where['LinenStockTransferDate'] || {};
                        (where['LinenStockTransferDate'] as any)['$lte'] = param.Value;
                        break;
                    case LinenStockTransferFilters.LinenStockTransferStatusId:
                        where['LinenStockTransferStatusId'] = param.Value;
                        break;
                        case LinenStockTransferFilters.ToDepartmentId:
                        where['ToDepartmentId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLinenStockTransfer(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetLinenDashboardInfo(req: BaseRequest): Promise<any> {
        let IssueBookCount = await this.Items.count({
            where: {
                'Status': 1,
                'LinenStockTransferStatusId': { '$in': [3, 4] },
            }
        });
        let ReceiptCount = await this.Items.count({
            where: {
                'Status': 1,
                'LinenStockTransferStatusId': { '$in': [5] },
            }
        });
        return {
            'IssueBookCount': IssueBookCount,
            'ReceiptCount': ReceiptCount,
        };
    }

    public GetModel(): SStatic.Model<LinenStockTransferInstance, LinenStockTransferAttributes> {
        return this.Models.LinenStockTransfer;
    }
}
