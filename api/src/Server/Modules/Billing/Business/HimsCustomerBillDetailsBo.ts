import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CustomerBillDetailsFilters } from '../Common/Filters.e';
import { CustomerBillDetailsInstance, CustomerBillDetailsAttributes } from '../Model/Interface/Index';

export class CustomerBillDetailsBo extends BaseBo<CustomerBillDetailsInstance, CustomerBillDetailsAttributes>  {
    public async AddCustomerBillDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateCustomerBillDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageCustomerBillDetails(CustomerBillId: number, details: CustomerBillDetailsAttributes[]): Promise<any> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.CustomerBillId = CustomerBillId;
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

    public async GetCustomerBillDetailsById(req: BaseRequest): Promise<CustomerBillDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCustomerBillDetails(apiReq?: ApiRequest<CustomerBillDetailsFilters>):
        Promise<ApiResponse<CustomerBillDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let billWhere: WhereOptions<any> = {};
        let isReqBillSearch: boolean = false;
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, as: 'PurchaseUom', required: false });
        include.push({ model: this.Models.UomMaster, as: 'SaleUom', required: false });
        include.push({ model: this.Models.GstMaster, as: 'GstMaster', required: false });
        include.push({ model: this.Models.Department, attributes: ['DepartmentName'], required: false });
        include.push(this.GetReference('CustomerBillStatus'));
        include.push({ model: this.Models.StoreMaster, attributes: ['StoreDescription'], required: false });
        include.push({ model: this.Models.StockSerialItem, attributes: ['Ucp', 'Mrp'], required: false });
        include.push({
            model: this.Models.ItemMaster,
            attributes: ['ItemName', 'ProductRegNo', 'SubCategoryId', 'ManufacturerCode', 'ManufacturerName', 'MrPrice' ],
            required: false,
            include: [this.GetReference('ScheduleType')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param))
                switch (param.Key) {
                    case CustomerBillDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CustomerBillDetailsFilters.CustomerBillId:
                        where['CustomerBillId'] = param.Value;
                        break;
                    case CustomerBillDetailsFilters.BillStatus:
                        where['CustomerBillStatusId'] = param.Value;
                        break;
                    case CustomerBillDetailsFilters.FromDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$gte'] = param.Value;
                        break;
                    case CustomerBillDetailsFilters.ToDate:
                        where['BillDateTime'] = where['BillDateTime'] || {};
                        (where['BillDateTime'] as any)['$lte'] = param.Value;
                        break;
                    case CustomerBillDetailsFilters.StoreMasterId:
                        where['StoreMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
        });
        include.push({
            model: this.Models.CustomerBills,
            attributes: ['BillNumber', 'BillTypeId', 'BillDateTime', 'CustomerMasterId'],
            required: isReqBillSearch,
            where: billWhere
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteCustomerBillDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<CustomerBillDetailsInstance, CustomerBillDetailsAttributes> {
        return this.Models.CustomerBillDetails;
    }
}
