import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LinenStockItemsInstance, LinenStockItemsAttributes } from '../Model/Interface/Index';
import { LinenStockItemsFilters } from '../Common/Filters.e';
import * as _ from 'lodash';

export class LinenStockItemsBo extends BaseBo<LinenStockItemsInstance, LinenStockItemsAttributes> implements IOptionProvider {
    public async AddLinenStockItems(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        let linenStockItemId = result.dataValues.Id;
        return linenStockItemId;
    }


    public async UpdateLinenStockItems(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageLinenStockItems(request: any): Promise<any> {
        let details: Array<any> = request.Details;
        let itemDetails: any = _.groupBy(details, (item: any) => { return item.LinenItemMasterId; });
        let groupedItems: Array<any> = Object.keys(itemDetails).map((itemId: any) => {
            return {
                itemid: itemId,
                batches: itemDetails[itemId],
                error: null
            };
        });

        await Promise.all(groupedItems.map((groupedItem: any) => {
            return (async (gi) => {
                await this.ManageLinenStockItem(request, gi);
            })(groupedItem);
        }));

        return _.filter(groupedItems, (item: any) => { return item.error !== null; });
    }

    public async ManageLinenStockItem(request: any, itemInfo: any): Promise<void> {
        let details = itemInfo.batches;
        let stockitem = {};
        stockitem = {
            LinenItemMasterId: details[0].LinenItemMasterId,
            DepartmentId: request.Header.DepartmentId,
            FacilityId: request.Header.FacilityId,
            OrgId: 1,
            LinenStockItemStatusId: 2,
            Quantity: _.sumBy(details, (detail: any) => Number(detail.Quantity))
        };


        try {
            await this.ManageLinenStock(stockitem as any, details);
        } catch (ex) {
            //console.log(['managestock failed for', details[0].ItemName].join(' '));
            itemInfo.error = { name: details[0].ItemName };
        }
    }

    public async ManageLinenStock(stockitem: LinenStockItemsAttributes, details: Array<any>): Promise<boolean> {
        let saveResult: any;
        let ExistingLinenStockItem = await this.GetLinenStockItemIdByFilter({
            Id: 0,
            Data: {
                DepartmentId: stockitem.DepartmentId,
                LinenItemMasterId: stockitem.LinenItemMasterId
            }
        });
        if (ExistingLinenStockItem !== null) {
            ExistingLinenStockItem.Quantity = ExistingLinenStockItem.Quantity + Number(stockitem.Quantity);
            saveResult = await this.Update(ExistingLinenStockItem);
        } else {
            saveResult = await this.Save(stockitem);
            stockitem.Id = saveResult.dataValues.Id;
        }
        return true;
    }

    public async GetLinenStockItemIdByFilter(req: BaseRequest): Promise<any> {
        let stockitem = null;
        let filterInfo = req.Data;
        let stockitemInstance = await this.Find({
            where: {
                DepartmentId: filterInfo.DepartmentId,
                LinenItemMasterId: filterInfo.LinenItemMasterId
            }
        });
        if (stockitemInstance) {
            stockitem = this.GetAttribute(stockitemInstance);
        }
        return stockitem;
    }

    public async GetLinenStockItemsById(req: BaseRequest): Promise<LinenStockItemsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLinenStockItems(apiReq?: ApiRequest<LinenStockItemsFilters>): Promise<ApiResponse<LinenStockItemsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.LinenItemMaster, attributes: ['Name', 'Code'], required: false });
        // include.push(this.GetReference('LinenType'));
        // include.push(this.GetReference('LinenCategory'));
        // include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenStockItemsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenStockItemsFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case LinenStockItemsFilters.LinenItemMasterId:
                        where['LinenItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLinenStockItems(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LinenStockItemsInstance, LinenStockItemsAttributes> {
        return this.Models.LinenStockItems;
    }

    public async GetLinenDashboardInfo(req: BaseRequest): Promise<any> {
        let StatusCount = await this.Items.count({
            where: {
                'Status': 1,
                'DepartmentId': req.Data.DepartmentId,
            }
        });
        return {
            'StatusCount': StatusCount,
        };
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<LinenStockItemsFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['LinenStockItems', 'Text'], 'LinenStockItems', 'Code'];
        let val = await this.GetLinenStockItems(apiReq);
        return { [key]: val.Data };
    }
}
