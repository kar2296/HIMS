import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PriceMappingInstance, PriceMappingAttributes } from '../Model/Interface/Index';
import { PriceMappingFilters } from '../Common/Filters.e';
import * as clinicalBo from '../../ClinicalMaster/Business/Index';
import { ServiceItemFilters, ServiceItemTariffDetailFilters } from '../../ClinicalMaster/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
export class PriceMappingBo extends BaseBo<PriceMappingInstance, PriceMappingAttributes> implements IOptionProvider {
    public async AddPriceMapping(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        if (result) {
            let ServiceitemBO = BoFactory.GetBo(clinicalBo.ServiceItemBo, this.Request);
            let ServiceitemTariffBO = BoFactory.GetBo(clinicalBo.ServiceItemTariffDetailBo, this.Request);
            let apiReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ServiceItemFilters.MasterItemId, Value: req.Data.TestId }
                ]
            };
            let ServiceData = await ServiceitemBO.GetServiceItems(apiReq);
            let ServiceInfo: any = {};
            ServiceInfo = ServiceData.Data[0];
            let serTariffReq = {
                Id: 0,
                PageContext: { PageSize: -1, PageNumber: 1 },
                Params: [
                    { Key: ServiceItemTariffDetailFilters.ServiceItemId, Value: ServiceInfo.Id }
                ]
            };
            let ServiceTariffData = await ServiceitemTariffBO.GetServiceItemTariffDetails(serTariffReq);
            if (ServiceTariffData.Data.length > 0) {
                for (let sdx in ServiceTariffData.Data) {
                    let tariffData = ServiceTariffData.Data[sdx];
                    let tariffupdate: any = {
                        Id: tariffData.Id,
                        ExternalPrice: req.Data.Price
                    };
                    await ServiceitemTariffBO.Update(tariffupdate);
                }
            }
        }
        return result.dataValues.Id;
    }

    public async UpdatePriceMapping(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        let ServiceitemBO = BoFactory.GetBo(clinicalBo.ServiceItemBo, this.Request);
        let ServiceitemTariffBO = BoFactory.GetBo(clinicalBo.ServiceItemTariffDetailBo, this.Request);
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ServiceItemFilters.MasterItemId, Value: req.Data.TestId }
            ]
        };
        let ServiceData = await ServiceitemBO.GetServiceItems(apiReq);
        let ServiceInfo: any = {};
        ServiceInfo = ServiceData.Data[0];
        let serTariffReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: ServiceItemTariffDetailFilters.ServiceItemId, Value: ServiceInfo.Id }
            ]
        };
        let ServiceTariffData = await ServiceitemTariffBO.GetServiceItemTariffDetails(serTariffReq);
        if (ServiceTariffData.Data.length > 0) {
            for (let sdx in ServiceTariffData.Data) {
                let tariffData = ServiceTariffData.Data[sdx];
                let tariffupdate: any = {
                    Id: tariffData.Id,
                    ExternalPrice: req.Data.Price
                };
                await ServiceitemTariffBO.Update(tariffupdate);
            }
        }
        return result;
    }

    public async GetPriceMappingById(req: BaseRequest): Promise<PriceMappingAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPriceMappings(apiReq?: ApiRequest<PriceMappingFilters>): Promise<ApiResponse<PriceMappingAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let attributes: any = {};
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({ model: this.Models.Testmaster, attributes: ['Name'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PriceMappingFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PriceMappingFilters.TestmasterId:
                        where['TestmasterId'] = param.Value;
                        break;
                    case PriceMappingFilters.TESTMASTERTYPId:
                        where['TESTMASTERTYPId'] = param.Value;
                        break;
                    case PriceMappingFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case PriceMappingFilters.TestId:
                        where['TestId'] = param.Value;
                        break;
                    case PriceMappingFilters.ExternalProviderId:
                        where['ExternalProviderId'] = param.Value;
                        break;
                    case PriceMappingFilters.TestName:
                        (where as any)[Op.or] = [{ TestName: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        // where['TestName'] = param.Value;
                        break;
                    case PriceMappingFilters.Price:
                        where['Price'] = param.Value;
                        break;

                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['CreatedAt', 'DESC']);
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePriceMapping(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PriceMappingFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetPriceMappings(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PriceMappingInstance, PriceMappingAttributes> {
        return this.Models.PriceMapping;
    }
}
