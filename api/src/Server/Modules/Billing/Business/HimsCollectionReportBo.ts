import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CollectionReportInstance, CollectionReportAttributes } from '../Model/Interface/Index';
import { CollectionReportFilters } from '../Common/Filters.e';
//import * as userbo from '../../SystemSettings/Business/Index';
//import { join } from 'path';
//import { BoFactory } from '../../Base/Business/Index';
//import * as _ from 'lodash';

export class CollectionReportBo extends BaseBo<CollectionReportInstance, CollectionReportAttributes>  {
    public async AddCollectionReport(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async ManageCollectionReport(billId: number, billdetailId: number,
        details: any[]): Promise<any> {
        details = details || [];
        console.log(details);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
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
    public async ManageCollectionReportUpdate(req: BaseRequest): Promise<boolean> {
        let list: CollectionReportAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        list.forEach(item => {
            item.Id = item.Id || 0;
            if (item.Status === 2 && item.Id !== 0) {
                promises.push(this.MarkAsDelete(item.Id));
            } else if (item.Id === 0) {
                promises.push(this.Save(item));
            } else if (item.Id > 0) {
                promises.push(this.Update(item));
            }
        });
        await Promise.all(promises);
        return true;
    }

    public async UpdateCollectionReport(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetCollectionReportById(req: BaseRequest): Promise<CollectionReportAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetCollectionReports(apiReq?: ApiRequest<CollectionReportFilters>):
        Promise<ApiResponse<CollectionReportAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];

        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('CollectionStatus'));
        include.push({
            model: this.Models.User, required: false,
            as: 'CreatedUser',
            include: [
                this.GetReference('Title'),
                //this.GetReference('Team'),
                { model: this.Models.GstMaster, attributes: ['GstCode', 'GstName', 'GstPercentage'], required: false },
                { model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CollectionReportFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CollectionReportFilters.FromDate:
                        where['CollectionDate'] = where['CollectionDate'] || {};
                        (where['CollectionDate'] as any)['$gte'] = param.Value;
                        break;
                    case CollectionReportFilters.ToDate:
                        where['CollectionDate'] = where['CollectionDate'] || {};
                        (where['CollectionDate'] as any)['$lte'] = param.Value;
                        break;
                    case CollectionReportFilters.CollectionStatusId:
                        where['CollectionStatusId'] = param.Value;
                        break;
                    case CollectionReportFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case CollectionReportFilters.IsUpdated:
                        where['IsUpdated'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CollectionDate', 'ASC']);
        console.log(apiReq);
        console.log(apiReq.Attributes);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public GetModel(): SStatic.Model<CollectionReportInstance, CollectionReportAttributes> {
        return this.Models.CollectionReport;
    }

}
