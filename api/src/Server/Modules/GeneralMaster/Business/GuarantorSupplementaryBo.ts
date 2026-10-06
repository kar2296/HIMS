import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { GuarantorSupplementaryInstance, GuarantorSupplementaryAttributes } from '../Model/Interface/Index';
import { GuarantorSupplementaryFilters } from '../Common/Filters.e';

export class GuarantorSupplementaryBo extends BaseBo<GuarantorSupplementaryInstance, GuarantorSupplementaryAttributes>  {
    public async AddGuarantorSupplementary(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGuarantorSupplementary(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageGuarantorSupplementary(req: BaseRequest): Promise<boolean> {
        let list: GuarantorSupplementaryAttributes[] = req.Data || [];
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

    public async GetGuarantorSupplementaryById(req: BaseRequest): Promise<GuarantorSupplementaryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGuarantorSupplementarys(apiReq?: ApiRequest<GuarantorSupplementaryFilters>):
        Promise<ApiResponse<GuarantorSupplementaryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            switch (param.Key) {
                case GuarantorSupplementaryFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case GuarantorSupplementaryFilters.GuarantorId:
                    where['GuarantorId'] = param.Value;
                    break;
                case GuarantorSupplementaryFilters.SupplementaryTypeId:
                    where['SupplementaryTypeId'] = param.Value;
                    break;
                case GuarantorSupplementaryFilters.ItemMasterId:
                    where['ItemMasterId'] = param.Value;
                    break;
                case GuarantorSupplementaryFilters.ServiceCategoryId:
                    where['ServiceCategoryId'] = param.Value;
                    break;
                case GuarantorSupplementaryFilters.ItemCategoryId:
                    where['ItemCategoryId'] = param.Value;
                    break;
                default:
                    throw 'Not Implemented';
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async CheckSupplementaryServiceItem(foption: SStatic.FindOptions<any>): Promise<number> {
        let GuarantorSupplementaryId: number = -1;
        let GuarantorSupplementaryInstance: any = await this.Find(foption);
        if (GuarantorSupplementaryInstance) {
            let GuarantorSupplementary = this.GetAttribute(GuarantorSupplementaryInstance);
            GuarantorSupplementaryId = GuarantorSupplementary.Id;
        }
        return GuarantorSupplementaryId;
    }

    public async DeleteGuarantorSupplementary(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GuarantorSupplementaryInstance, GuarantorSupplementaryAttributes> {
        return this.Models.GuarantorSupplementary;
    }

}
