import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ServiceCategoryInstance, ServiceCategoryAttributes } from '../Model/Interface/Index';
import { ServiceCategoryFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import { join } from 'path';

export class ServiceCategoryBo extends BaseBo<ServiceCategoryInstance, ServiceCategoryAttributes> implements IOptionProvider {
    public async AddServiceCategory(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateServiceCategory(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManageSerivceCategories(req: BaseRequest): Promise<boolean> {
        let list: ServiceCategoryAttributes[] = req.Data || [];
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

    public async ManageSerivceSubCategories(req: BaseRequest): Promise<boolean> {
        let list: ServiceCategoryAttributes[] = req.Data || [];
        let priorityBO = BoFactory.GetBo(bo.ServiceCategoryPriorityBo, this.Request);
        await Promise.all(list.map(mappedItem => {
            (async (item) => {
                item.Id = item.Id || 0;
                if (item.Status === 2 && item.Id !== 0) {
                    await this.MarkAsDelete(item.Id);
                } else if (item.Id === 0) {
                    let sc = await this.Save(item);
                    await priorityBO.ManageServiceCategoryPriorities(sc.dataValues.Id, item.Priorities);
                } else if (item.Id > 0) {
                    await this.Update(item);
                    await priorityBO.ManageServiceCategoryPriorities(item.Id, item.Priorities);
                }
            })(mappedItem);
        }));
        return true;
    }

    public async GetServiceCategoryById(req: BaseRequest): Promise<ServiceCategoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetServiceCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<ApiResponse<ServiceCategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceCategoryFilters.Name:
                        (where as any)['$or'] = [{ 'ServiceCategoryCode': { '$like': (param.Value || '') + '%' } },
                        { 'ServiceCategoryName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ServiceCategoryFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.SourceType:
                        //where['SourceTypeId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.ServiceGroup:
                        where['ServiceGroupId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.Status:
                        where['StatusId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.ParentServiceCategoryId:
                        where['ParentServiceCategoryId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.AllFacility:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        where['ParentServiceCategoryId'] = -1;
        order.push(['ServiceCategoryName', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async GetServiceSubCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<ApiResponse<ServiceCategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        where['ParentServiceCategoryId'] = { '$ne': -1 };

        include.push({
            model: this.Models.ServiceCategoryPriority, required: false, as: 'Priorities',
            include: [this.GetReference('OrderPriority'), this.GetReference('DurationPeriod')]
        });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ServiceCategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ServiceCategoryFilters.Name:
                        (where as any)['$or'] = [{ 'ServiceCategoryCode': { '$like': (param.Value || '') + '%' } },
                        { 'ServiceCategoryName': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ServiceCategoryFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.SourceType:
                        //where['SourceTypeId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.Status:
                        where['StatusId'] = param.Value;
                        break;
                    case ServiceCategoryFilters.ServiceCategory:
                        where['ParentServiceCategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });

        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeleteServiceCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<any> {
        if (key === 'SubCategory') {
            apiReq.Params.push({ Key: ServiceCategoryFilters.ServiceCategory, Value: { '$ne': -1 } });
        }
        apiReq.Attributes = apiReq.Attributes || ['Id', ['ServiceCategoryName', 'Text'],
            'ServiceCategoryName', 'ServiceCategoryCode', 'ServiceGroupId', 'ParentServiceCategoryId'];
        let val = await this.GetServiceCategorys(apiReq);
        return { [key]: val.Data };
    }

    public async PrintServiceCategorys(apiReq?: ApiRequest<ServiceCategoryFilters>): Promise<any> {
        let data = await this.GetServiceCategorys(apiReq);
        let ServiceCategory = data.Data;
        let ServiceCategoryData = data.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(ServiceCategoryData.FacilityId);
        let info = {
            ServiceCategory: ServiceCategory,
            Preferences: printPreferencesData
        };
        let pdfOption: any = null;
        let key = 'servicegroups';
        let pdfOptionJSON = await Report.GetPdfOption(key);
        if (!pdfOptionJSON) {
            pdfOption = {
                format: 'A4',
                orientation: 'landscape',
                border: '0',
                header: {
                    height: '1.5in',
                    contents: '',
                },
                footer: {
                    height: '0.5in',
                    contents: {
                        first: '',
                        default: '',
                        last: '',
                    },
                },
                type: 'pdf',
                base: 'file://' + join(__dirname, '/../../Templates/assets/')
            };
        } else {
            pdfOption = JSON.parse(pdfOptionJSON);
            pdfOption.base = 'file://' + join(__dirname, '/../../Templates/assets/');
        }
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
    public GetModel(): SStatic.Model<ServiceCategoryInstance, ServiceCategoryAttributes> {
        return this.Models.ServiceCategory;
    }
}
