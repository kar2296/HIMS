import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { UomConversionInstance, UomConversionAttributes } from '../Model/Interface/Index';
import { UomConversionFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Pharmacy/Business/Index';

export class UomConversionBo extends BaseBo<UomConversionInstance, UomConversionAttributes> implements IOptionProvider {
    public async AddUomConversion(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateUomConversion(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageUomConversions(req: BaseRequest): Promise<any> {
        if (req.Data) {
            let details: UomConversionAttributes[] = req.Data || [];
            await Promise.all(details.map((DetailItem): Promise<void> => {
                return (async (detail): Promise<void> => {
                    detail.Id = detail.Id || 0;
                    if (detail.Status === 2 && detail.Id !== 0) {
                        await this.MarkAsDelete(detail.Id);
                    } else if (detail.Id === 0) {
                        let result = await this.Save(detail);
                        detail.Id = result.dataValues.Id;
                    } else if (detail.Id > 0) {
                        let result = await this.Update(detail);
                        if (result) {
                            if (detail.UomTypeId === 2) {
                                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                                await itemvendorBO.ManageItemUomChanges(detail.ItemMasterId, detail);
                            }
                        }
                    }
                })(DetailItem);
            }));
            return true;
        }
        if (req) {
            let details: UomConversionAttributes[] = req.Data || req || [];
            await Promise.all(details.map((DetailItem): Promise<void> => {
                return (async (detail): Promise<void> => {
                    detail.Id = detail.Id || 0;
                    if (detail.Status === 2 && detail.Id !== 0) {
                        await this.MarkAsDelete(detail.Id);
                    } else if (detail.Id === 0) {
                        let result = await this.Save(detail);
                        detail.Id = result.dataValues.Id;
                    } else if (detail.Id > 0) {
                        let result = await this.Update(detail);
                        if (result) {
                            if (detail.UomTypeId === 2) {
                                let itemvendorBO = BoFactory.GetBo(bo.ItemVendorMapBo, this.Request);
                                await itemvendorBO.ManageItemUomChanges(detail.ItemMasterId, detail);
                            }
                        }
                    }
                })(DetailItem);
            }));
            return true;
        }
    }

    public async GetUomConversionById(req: BaseRequest): Promise<UomConversionAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetUomConversions(apiReq?: ApiRequest<UomConversionFilters>): Promise<ApiResponse<UomConversionAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.UomMaster, as: 'UomMaster', required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case UomConversionFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case UomConversionFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    case UomConversionFilters.UomTypeId:
                        where['UomTypeId'] = param.Value;
                        break;
                    case UomConversionFilters.UomId:
                        where['UomId'] = param.Value;
                        break;
                    case UomConversionFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case UomConversionFilters.Status:
                        where['StatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteUomConversion(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<UomConversionFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['UomTypeName', 'Text'],
            'UomTypeName', 'UomTypeCode'];
        let val = await this.GetUomConversions(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<UomConversionInstance, UomConversionAttributes> {
        return this.Models.UomConversion;
    }

}
