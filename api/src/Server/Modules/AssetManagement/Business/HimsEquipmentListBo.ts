import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider, } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest, ISearchEnums } from '../../../Common/Index';
import { EquipmentListInstance, EquipmentListAttributes } from '../Model/Interface/Index';
import { EquipmentListFilters } from '../Common/Filters.e';
import { readFileSync } from 'fs';

export class EquipmentListBo extends BaseBo<EquipmentListInstance, EquipmentListAttributes> implements IOptionProvider {
    public async AddAsset(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAsset(req: BaseRequest): Promise<boolean> {
        let file = this.Request.file;
        if (file) {
            req.Data.PhotoPath = file.path;
        }
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async GetAssetProfilePic(req: BaseRequest): Promise<any> {
        let result = await readFileSync(req.Data.PhotoPath);
        return new Buffer(result).toString('base64');
    }
    public async GetDashBoardInfo(key: string, apiReq?: ApiRequest<ISearchEnums>): Promise<any> {
        let count = 0;
        switch (key) {
            case 'resultreview':
                count = await this.Items.count({
                    where: {
                        'Status': { '$in': [1] },  //COMPLETED
                    }
                });
                break;
            default:
                count = 0;
                break;
        }
        return { count: count };
    }

    public async GetAssetById(req: BaseRequest): Promise<EquipmentListAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAssets(apiReq?: ApiRequest<EquipmentListFilters>): Promise<ApiResponse<EquipmentListAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        attributes['include'] = [];
        include.push(this.GetReference('AssetType'));
        include.push(this.GetReference('AssetCategory'));
        include.push(this.GetReference('Manufacturer'));
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EquipmentListFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EquipmentListFilters.AssetTypeId:
                        where['AssetTypeId'] = param.Value;
                        break;
                    case EquipmentListFilters.AssetCategoryId:
                        where['AssetCategoryId'] = param.Value;
                        break;
                    case EquipmentListFilters.DepartmentId:
                        where['DepartmentId'] = param.Value;
                        break;
                    case EquipmentListFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case EquipmentListFilters.ModelNum:
                        where['ModelNum'] = param.Value;
                        break;
                    case EquipmentListFilters.ModelName:
                        where['ModelName'] = param.Value;
                        break;
                    case EquipmentListFilters.Description:
                        where['Description'] = param.Value;
                        break;
                    case EquipmentListFilters.Manufacturer:
                        where['ManufacturerId'] = param.Value;
                        break;
                    case EquipmentListFilters.Serial:
                        where['Serial'] = param.Value;
                        break;
                    case EquipmentListFilters.PONum:
                        where['PONum'] = param.Value;
                        break;
                    case EquipmentListFilters.GRNNum:
                        where['GRNNum'] = param.Value;
                        break;
                    case EquipmentListFilters.PurchaseValue:
                        where['PurchaseValue'] = param.Value;
                        break;
                    case EquipmentListFilters.CurrentValue:
                        where['CurrentValue'] = param.Value;
                        break;
                    case EquipmentListFilters.AssetName:
                        (where as any)['$or'] = [{ 'AssetName': { '$like': (param.Value || '') + '%' } },
                        { 'ShortCode': { '$like': (param.Value || '') + '%' } },
                        { 'Serial': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case EquipmentListFilters.IsLabInterface:
                        where['IsLabInterface'] = param.Value;
                        break;
                    case EquipmentListFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteAsset(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<EquipmentListFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AssetName', 'Text'], 'AssetName'];
        let val = await this.GetAssets(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<EquipmentListInstance, EquipmentListAttributes> {
        return this.Models.EquipmentList;
    }

    public async GetAssetInfoDashBoard(req: BaseRequest): Promise<any> {
        let AssetCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let AssetTransferCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let TicketCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        let AssetAuditCount = await this.Items.count({
            where: {
                'Status': 1,
            }
        });
        return {
            'AssetCount': AssetCount,
            'AssetTransferCount': AssetTransferCount,
            'TicketCount': TicketCount,
            'AssetAuditCount': AssetAuditCount
        };
    }
}
