import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { LinenStockEntryInstance, LinenStockEntryAttributes } from '../Model/Interface/Index';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../LinenAndLaundry/Business/Index';
import { LinenStockEntryFilters } from '../Common/Filters.e';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class LinenStockEntryBo extends BaseBo<LinenStockEntryInstance, LinenStockEntryAttributes>  {
    public async AddLinenStockEntry(req: BaseRequest): Promise<number> {
        if (req.Data.Header.LinenStockEntryStatusId === 2 && req.Data.Header.LinenStockEntryNumber === null) {
            req.Data.Header.LinenStockEntryDate = new Date();
            req.Data.Header.EnteredDate = new Date();
            req.Data.Header.ApprovedDate = new Date();
            req.Data.Header.ApprovedBy = this.Session.UserId;
        } else if (req.Data.Header.LinenStockEntryStatusId === 1 && req.Data.Header.LinenStockEntryNumber === null) {
            req.Data.Header.LinenStockEntryDate = new Date();
            req.Data.Header.EnteredDate = new Date();
        }
        let result = await this.Save(req.Data.Header);
        if (result) {
            let detailBO = BoFactory.GetBo(bo.LinenStockEntryDetailBo, this.Request);
            let linenstockentryid = result.dataValues.Id;
            await detailBO.ManageLinenStockEntryDetails(linenstockentryid, req.Data.Details);

            let linenstockitemBO = BoFactory.GetBo(bo.LinenStockItemsBo, this.Request);
            await linenstockitemBO.ManageLinenStockItems(req.Data);

            this.deferSequenceKey(linenstockentryid, 'LinenStockEntryNumber',
                this.getSequenceIdentifier(SequenceKeys.LinenStockEntryId));

            return linenstockentryid;
        }
        return 0;
    }

    public async UpdateLinenStockEntry(req: BaseRequest): Promise<boolean> {
        let generateStockEntryno = 0;
        if (!req.Data.Header.LinenStockEntryNumber &&
            (req.Data.Header.LinenStockEntryStatusId === 3)) {
            req.Data.LinenStockEntryNumber = null;
            generateStockEntryno = 1;
        }
        let result = await this.Update(req.Data.Header);
        let detailBO = BoFactory.GetBo(bo.LinenStockEntryDetailBo, this.Request);
        let linenstockentryid = req.Data.Header.Id;
        if (generateStockEntryno === 1) {
            this.deferSequenceKey(linenstockentryid, 'LinenStockEntryNumber',
                this.getSequenceIdentifier(SequenceKeys.LinenStockEntryId));
        }
        //let linenstockentryid = result.dataValues.Id;
        await detailBO.ManageLinenStockEntryDetails(linenstockentryid, req.Data.Details);
        return result;
    }

    public async GetLinenStockEntryById(req: BaseRequest): Promise<LinenStockEntryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLinenStockEntrys(apiReq?: ApiRequest<LinenStockEntryFilters>): Promise<ApiResponse<LinenStockEntryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('LinenStockEntryType'));
        include.push(this.GetReference('StockEntryStatus'));
        include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.Department, required: false });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'ApprovedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'AuthorizedUser', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'EnterBy', required: false,
            include: [
                this.GetReference('Title')
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenStockEntryFilters.Id:
                        where['LinenStockEntryId'] = param.Value;
                        break;
                    case LinenStockEntryFilters.LinenStockEntryNumber:
                        where['LinenStockEntryNumber'] = { '$like': '%' + (param.Value || '') + '%' };
                        break;
                    case LinenStockEntryFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case LinenStockEntryFilters.LinenStockEntryStatusId:
                        where['LinenStockEntryStatusId'] = param.Value;
                        break;
                    case LinenStockEntryFilters.EnteredDate:
                        where['EnteredDate'] = { '$between': param.Value };
                        break;
                    case LinenStockEntryFilters.From:
                        where['EnteredDate'] = where['EnteredDate'] || {};
                        (where['EnteredDate'] as any)['$gte'] = param.Value;
                        break;
                    case LinenStockEntryFilters.To:
                        where['EnteredDate'] = where['EnteredDate'] || {};
                        (where['EnteredDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLinenStockEntry(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetLinenDashboardInfo(req: BaseRequest): Promise<any> {
        let StockEntryCount = await this.Items.count({
            where: {
                'Status': 1,
                'LinenStockEntryStatusId': { '$in': [2, 3, 4] },
            }
        });
        return {
            'StockEntryCount': StockEntryCount,
        };
    }

    public GetModel(): SStatic.Model<LinenStockEntryInstance, LinenStockEntryAttributes> {
        return this.Models.LinenStockEntry;
    }

}
