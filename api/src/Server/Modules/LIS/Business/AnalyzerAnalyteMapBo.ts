import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AnalyzerAnalyteMapInstance, AnalyzerAnalyteMapAttributes } from '../Model/Interface/Index';
import { AnalyzerAnalyteMapFilters } from '../Common/Filters.e';

export class AnalyzerAnalyteMapBo extends BaseBo<AnalyzerAnalyteMapInstance, AnalyzerAnalyteMapAttributes> implements IOptionProvider {
    public async AddAnalyzerAnalyteMap(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalyzerAnalyteMap(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnalyzerAnalyteMapById(req: BaseRequest): Promise<AnalyzerAnalyteMapAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetAnalyzerAnalyteMaps(apiReq?:
        ApiRequest<AnalyzerAnalyteMapFilters>): Promise<ApiResponse<AnalyzerAnalyteMapAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AssetType'));
        include.push({
            model: this.Models.Analytemaster, required: true,
            include: [
                { model: this.Models.Analyterefmaster, required: false }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AnalyzerAnalyteMapFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AnalyzerAnalyteMapFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case AnalyzerAnalyteMapFilters.AssetName:
                        where['AssetName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case AnalyzerAnalyteMapFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case AnalyzerAnalyteMapFilters.AnalyteId:
                        where['AnalyteId'] = param.Value;
                        break;
                    case AnalyzerAnalyteMapFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AnalyzerAnalyteMapFilters.Code:
                        where['Code'] = param.Value;
                        break;
                    case AnalyzerAnalyteMapFilters.AnalyteName:
                        where['AnalyteName'] = { '$like': (param.Value || '') + '%' };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });

    }

    public async GetMappedItem(vAssetId: number, vCode: string): Promise<Boolean> {
        let result = false;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: AnalyzerAnalyteMapFilters.AssetId, Value: vAssetId },
                { Key: AnalyzerAnalyteMapFilters.Code, Value: vCode }
            ]
        };
        let MappedData = await this.GetAnalyzerAnalyteMaps(apiReq);

        if (MappedData && MappedData.Data)
            if (MappedData && MappedData.Data.length > 0)
                result = true;

        return result;
    }

    public async DeleteAnalyzerAnalyteMap(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AnalyzerAnalyteMapInstance, AnalyzerAnalyteMapAttributes> {
        return this.Models.AnalyzerAnalyteMap;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AnalyzerAnalyteMapFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Code'];
        let val = await this.GetAnalyzerAnalyteMaps(apiReq);
        return { [key]: val.Data };
    }
}
