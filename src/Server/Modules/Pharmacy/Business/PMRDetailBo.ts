import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PMRDetailInstance, PMRDetailAttributes } from '../Model/Interface/Index';
import { PMRDetailFilters } from '../Common/Filters.e';

export class PMRDetailBo extends BaseBo<PMRDetailInstance, PMRDetailAttributes> implements IOptionProvider {
    public async AddPMRDetail(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePMRDetail(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePMRDetail(PMRId: number, details: PMRDetailAttributes[]): Promise<boolean> {
        details = details;
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PMRId = PMRId;
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

    public async GetPMRDetailById(req: BaseRequest): Promise<PMRDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPMRDetails(apiReq?: ApiRequest<PMRDetailFilters>):
        Promise<ApiResponse<PMRDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let order: Array<any> = [];
        let include: Array<IncludeOptions> = [];
        //include.push({ model: this.Models.Facility, required: false });
        include.push({ model: this.Models.PMR, required: false });
        include.push({ model: this.Models.ItemMaster, attributes: ['ItemCode', 'ItemName', 'ProductTypeId'], required: false });
        apiReq.Params.forEach((param) => {

            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PMRDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PMRDetailFilters.PMRId:
                        where['PMRId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['UpdatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePMRDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<PMRDetailFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CourseName', 'Text'], 'CourseName'];
        let val = await this.GetPMRDetails(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<PMRDetailInstance, PMRDetailAttributes> {
        return this.Models.PMRDetail;
    }
}
