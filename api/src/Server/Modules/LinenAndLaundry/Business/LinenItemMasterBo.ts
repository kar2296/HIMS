import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { LinenItemMasterInstance, LinenItemMasterAttributes } from '../Model/Interface/Index';
import { LinenItemMasterFilters } from '../Common/Filters.e';

export class LinenItemMasterBo extends BaseBo<LinenItemMasterInstance, LinenItemMasterAttributes> implements IOptionProvider {
    public async AddLinenItemMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLinenItemMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetLinenItemMasterById(req: BaseRequest): Promise<LinenItemMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLinenItemMaster(apiReq?: ApiRequest<LinenItemMasterFilters>): Promise<ApiResponse<LinenItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('LinenType'));
        include.push(this.GetReference('LinenCategory'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenItemMasterFilters.Code:
                        //where['Code'] = { '$like': '%'+ param.Value + '%' };
                        (where as any)[Op.or] = [{ Code: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Name: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case LinenItemMasterFilters.LinenTypeId:
                        where['LinenTypeId'] = param.Value;
                        break;
                    case LinenItemMasterFilters.LinenCategoryId:
                        where['LinenCategoryId'] = param.Value;
                        break;
                    case LinenItemMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case LinenItemMasterFilters.DepartmentId:
                        include.push({
                            model: this.Models.LinenStockItems,
                            required: true,
                            attributes: ['Id', 'LinenItemMasterId', 'DepartmentId', 'Quantity', 'Rev'],
                            where: { 'DepartmentId': param.Value }
                        });
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async GetLinenstockEntryItemMaster
        (apiReq?: ApiRequest<LinenItemMasterFilters>): Promise<ApiResponse<LinenItemMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        include.push(this.GetReference('LinenType'));
        include.push(this.GetReference('LinenCategory'));
        include.push(this.GetReference('ActiveStatus'));

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LinenItemMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LinenItemMasterFilters.Code:
                        //where['Code'] = { '$like': '%'+ param.Value + '%' };
                        (where as any)[Op.or] = [{ Code: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Name: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case LinenItemMasterFilters.LinenTypeId:
                        where['LinenTypeId'] = param.Value;
                        break;
                    case LinenItemMasterFilters.LinenCategoryId:
                        where['LinenCategoryId'] = param.Value;
                        break;
                    case LinenItemMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteLinenItemMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<LinenItemMasterInstance, LinenItemMasterAttributes> {
        return this.Models.LinenItemMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<LinenItemMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['LinenItemMaster', 'Text'], 'LinenItemMaster', 'Code'];
        let val = await this.GetLinenItemMaster(apiReq);
        return { [key]: val.Data };
    }
}
