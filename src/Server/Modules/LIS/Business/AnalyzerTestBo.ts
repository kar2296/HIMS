import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { AnalyzerTestInstance, AnalyzerTestAttributes } from '../Model/Interface/Index';
import { AnalyzerTestFilters } from '../Common/Filters.e';

export class AnalyzerTestBo extends BaseBo<AnalyzerTestInstance, AnalyzerTestAttributes> implements IOptionProvider {
    public async AddAnalyzerTest(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateAnalyzerTest(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetAnalyzerTestById(req: BaseRequest): Promise<AnalyzerTestAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async getLISName(vAssetId: number, vCode: string): Promise<string> {
        let sResult = '';
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: AnalyzerTestFilters.AssetId, Value: vAssetId },
                { Key: AnalyzerTestFilters.Code, Value: vCode }
            ]
        };
        let TestData = await this.GetAnalyzerTests(apiReq);

        if (TestData && TestData.Data)
            if (TestData && TestData.Data.length > 0)
            sResult = TestData.Data[0].Name;

        return sResult;
    }

    public async getDisplayNo(vAssetId: number, vCode: string): Promise<number> {
        let iResult = 0;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: AnalyzerTestFilters.AssetId, Value: vAssetId },
                { Key: AnalyzerTestFilters.Code, Value: vCode }
            ]
        };
        let TestData = await this.GetAnalyzerTests(apiReq);

        if (TestData && TestData.Data)
            if (TestData && TestData.Data.length > 0)
            iResult = TestData.Data[0].DisplayNo;

        return iResult;
    }

    public async IsAnalyzerItemCode(vAssetId: number, vCode: string): Promise<Boolean> {
        let result = false;
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [
                { Key: AnalyzerTestFilters.AssetId, Value: vAssetId },
                { Key: AnalyzerTestFilters.Code, Value: vCode }
            ]
        };
        let TestData = await this.GetAnalyzerTests(apiReq);

        if (TestData && TestData.Data)
            if (TestData && TestData.Data.length > 0)
                result = true;

        return result;
    }

    public async GetAnalyzerTests(apiReq?: ApiRequest<AnalyzerTestFilters>): Promise<ApiResponse<AnalyzerTestAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('AssetType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case AnalyzerTestFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case AnalyzerTestFilters.Code:
                        where['Code'] =  param.Value;
                        break;
                    case AnalyzerTestFilters.Name:
                        (where as any)[Op.or] = [{ Name: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case AnalyzerTestFilters.AssetName:
                        (where as any)[Op.or] = [{ AssetName: { [Op.like]: (param.Value || '') + '%' } }];
                        break;
                    case AnalyzerTestFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case AnalyzerTestFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['AssetId', 'ASC']);
        order.push(['DisplayNo', 'ASC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });

    }

    public async DeleteAnalyzerTest(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<AnalyzerTestInstance, AnalyzerTestAttributes> {
        return this.Models.AnalyzerTest;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<AnalyzerTestFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'TestName'], ['AssetName', 'AssetName'], 'Code'];
        let val = await this.GetAnalyzerTests(apiReq);
        return { [key]: val.Data };
    }
}
