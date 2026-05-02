import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    AnalytemasterInstance, AnalytemasterAttributes,
    AnalytealiasesmasterAttributes, AnalyterefmasterAttributes
} from '../Model/Interface/Index';
import * as bo from '../../LIS/Business/Index';
import { AnalytemasterFilters, AnalyteAliasFilters, AnalyteRefFilters } from '../Common/Filters.e';


export class AnalytemasterBo extends BaseBo<AnalytemasterInstance, AnalytemasterAttributes> implements IOptionProvider {
    protected AliasBO: bo.AnalytealiasesmasterBo;
    protected AnalyteRefBO: bo.AnalyterefmasterBo;

    public constructor(req?: Request) {
        super(req);
        this.AliasBO = BoFactory.GetBo(bo.AnalytealiasesmasterBo, req); //TODO
        this.AnalyteRefBO = BoFactory.GetBo(bo.AnalyterefmasterBo, req); //TODO
    }

    public async AddAnalytemaster(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'Code': req.Data['Code']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalytemaster(req: BaseRequest): Promise<boolean> {
        let duplicate = await this.FindAll({
            where: {
                'Code': req.Data['Code'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('AnalyteId')), 'AnalyteId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastAnalyteId = patient['AnalyteId'];
            if (lastAnalyteId) MaxId = lastAnalyteId;
        }

        return ++MaxId;
    }

    public async GetAnalytemasterById(req: BaseRequest): Promise<AnalytemasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAnalytemasters(apiReq?: ApiRequest<AnalytemasterFilters>): Promise<ApiResponse<AnalytemasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AnalyteType'));
        include.push(this.GetReference('Analyteuom'));
        include.push({ model: this.Models.Sampletype, attributes: ['Name'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AnalytemasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AnalytemasterFilters.Name:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mnemonics: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Name: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case AnalytemasterFilters.AnalyteType:
                        where['AnalyteTypeId'] = param.Value;
                        break;
                    case AnalytemasterFilters.vtype:
                        where['Valuetype_e'] = param.Value;
                        break;
                    case AnalytemasterFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AnalytemasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case AnalytemasterFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }
    public async AddAnalyteMasterExcel(req: BaseRequest): Promise<boolean> {
        let details: AnalytemasterAttributes[] = req.Data || [];
        const filteredDetails: any[] = [];

        for (const DetailItem of details) {
            let codeduplicate = await this.FindAll({
                where: { Code: DetailItem.Code }
            });

            if (!codeduplicate || codeduplicate.length === 0) {
                filteredDetails.push(DetailItem);
            } else {
                console.warn('Duplicate Code found: ' + DetailItem.Code + '. Skipping this row.');
            }
        }

        if (filteredDetails.length === 0) {
            console.warn('No new items to insert.');
            return false; // No items to insert
        }

        let successCount = 0;

        await Promise.all(filteredDetails.map(async (DetailItem: any) => {
            try {
                await this.Save(DetailItem);
                successCount++;
            } catch (error) {
                console.error('Error saving detail:', DetailItem, error);
            }
        }));
        return successCount > 0;
    }
    public async DeleteAnalytemaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AnalytemasterInstance, AnalytemasterAttributes> {
        return this.Models.Analytemaster;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<AnalytemasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Code'];
        let val = await this.GetAnalytemasters(apiReq);
        return { [key]: val.Data };
    }
    ///lis/analytemaster/AddAliasesmaster
    public async AddAliasesmaster(req: BaseRequest): Promise<number> {
        return this.AliasBO.AddAnalytealiasesmaster(req);
    }
    public async UpdateAliasesmaster(req: BaseRequest): Promise<boolean> {
        return this.AliasBO.UpdateAnalytealiasesmaster(req);
    }
    public async GetAliasesmasterById(req: BaseRequest): Promise<AnalytealiasesmasterAttributes> {
        return this.AliasBO.GetAnalytealiasesmasterById(req);
    }
    public async GetAliasesmasters(apiReq?: ApiRequest<AnalyteAliasFilters>): Promise<ApiResponse<AnalytealiasesmasterAttributes[]>> {
        return this.AliasBO.GetAnalytealiasesmasters(apiReq);
    }
    public async DeleteAliasesmaster(req: BaseRequest): Promise<Boolean> {
        return this.AliasBO.DeleteAnalytealiasesmaster(req);
    }
    ///lis/analytemaster/AddAnalyteRefmaster
    public async AddAnalyteRefmaster(req: BaseRequest): Promise<number> {
        return this.AnalyteRefBO.AddAnalyterefmaster(req);
    }
    public async UpdateAnalyteRefmaster(req: BaseRequest): Promise<boolean> {
        return this.AnalyteRefBO.UpdateAnalyterefmaster(req);
    }
    public async GetAnalyterefmasterById(req: BaseRequest): Promise<AnalyterefmasterAttributes> {
        return this.AnalyteRefBO.GetAnalyterefmasterById(req);
    }
    public async GetAnalyterefmasters(apiReq?: ApiRequest<AnalyteRefFilters>): Promise<ApiResponse<AnalyterefmasterAttributes[]>> {
        return this.AnalyteRefBO.GetAnalyterefmasters(apiReq);
    }
    public async DeleteAnalyteRefmaster(req: BaseRequest): Promise<Boolean> {
        return this.AnalyteRefBO.DeleteAnalyterefmaster(req);
    }
}
