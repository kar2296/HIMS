import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { SampletypeInstance, SampletypeAttributes } from '../Model/Interface/Index';
import { SampletypeFilters } from '../Common/Filters.e';

export class SampletypeBo extends BaseBo<SampletypeInstance, SampletypeAttributes>  {
    public async AddSampletype(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSampletype(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSampletypeById(req: BaseRequest): Promise<SampletypeAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetSampletypes(apiReq?: ApiRequest<SampletypeFilters>): Promise<ApiResponse<SampletypeAttributes[]>> {
        let where: WhereOptions<any>= {};
       let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('SAMPLETYP'));
        include.push(this.GetReference('GENERICIND'));
        include.push(this.GetReference('CollectionSite'));
        include.push(this.GetReference('CollectionMethod'));
        include.push(this.GetReference('CollectionRoute'));
        include.push(this.GetReference('SampleUnits'));
        apiReq.Params.forEach((param) => {
             if (this.IsValidParam(param)) {
            switch (param.Key) {
                case SampletypeFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case SampletypeFilters.Name:
                    (where as any)[Op.or] = [{ Code: { [Op.like]: (param.Value || '') + '%' } },
                    { Mnemonics: { [Op.like]: (param.Value || '') + '%' } },
                    { Name: { [Op.like]: (param.Value || '') + '%' } }];
                    break;
                case SampletypeFilters.type:
                    where['SAMPLETYPId'] = param.Value;
                    break;
                case SampletypeFilters.status:
                    where['ActiveStatusId'] = param.Value;
                    break;
                    case SampletypeFilters.ismicro:
                        where['IsMicro'] = param.Value;
                        break;
                default:
                    throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSampletype(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<SampletypeInstance, SampletypeAttributes> {
        return this.Models.Sampletype;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SampletypeFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Volume', 'SampleUnitsId','SampleUnits.Description' ];
        let val = await this.GetSampletypes(apiReq);
        return { [key]: val.Data };
    }

}
