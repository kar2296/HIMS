import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EntityPrintHistoryInstance, EntityPrintHistoryAttributes } from '../Model/Interface/Index';
import { EntityPrintHistoryFilters } from '../Common/Filters.e';

export class EntityPrintHistoryBo extends BaseBo<EntityPrintHistoryInstance, EntityPrintHistoryAttributes> implements IOptionProvider {
    public async AddEntityPrintHistory(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateEntityPrintHistory(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async PrintReport(reportKey: any
        , reportInput: any
        , printInfo: {
            ObjectId: number, ObjectTypeId: number,
            Reason?: string, Watermark?: string, PrintTypeId?: number
        }
    ): Promise<any> {

        let entityPrintHistoryData = await this.ManagePrintHistory(printInfo);
        if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
            reportInput.watermark = printInfo.Watermark || 'DUPLICATE';
        }
        //console.log(reportInput);
        return await Report.Generate(reportKey, reportInput);
    }

    public async PrintHTMLReport(reportKey: any
        , reportInput: any
        , printInfo: {
            ObjectId: number, ObjectTypeId: number,
            Reason?: string, Watermark?: string, PrintTypeId?: number
        }
    ): Promise<any> {

        let entityPrintHistoryData = await this.ManagePrintHistory(printInfo);
        if (printInfo.PrintTypeId === 2 || entityPrintHistoryData.PrintTypeId === 2) {
            reportInput.watermark = printInfo.Watermark || 'DUPLICATE';
        }
        //console.log(reportInput);
        return await Report.GenerateHtml(reportKey, reportInput);
    }

    public async ManagePrintHistory(printInfo: {
        ObjectId: number, ObjectTypeId: number,
        Reason?: string, Watermark?: string, PrintTypeId?: number
    }): Promise<any> {

        let item: any = {
            FacilityId: this.Session.FacilityId,
            ObjectId: printInfo.ObjectId,
            ObjectTypeId: printInfo.ObjectTypeId,
            PrintDate: new Date(),
            PrintById: this.Session.UserId,
            PrintTypeId: 1, //Original
            Reason: printInfo.Reason
        };

        let printHistoryInstance: any = await this.Find({
            where: {
                ObjectId: item.ObjectId,
                ObjectTypeId: item.ObjectTypeId
            },
            attributes: ['Id']
        });
        if (!item.Reason && printHistoryInstance) {
            item.PrintTypeId = 2; //Duplicate
        }

        let result = await this.Save(item);
        return result;
    }

    public async GetEntityPrintHistoryById(req: BaseRequest): Promise<EntityPrintHistoryAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEntityPrintHistorys(apiReq?: ApiRequest<EntityPrintHistoryFilters>):
        Promise<ApiResponse<EntityPrintHistoryAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Facility, attributes: ['FacilityName'], required: false });
        // include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('ObjectType'));
        include.push(this.GetReference('PrintType'));
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'PrintBy', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EntityPrintHistoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EntityPrintHistoryFilters.Name:
                        where['Name'] = param.Value;
                        break;
                    case EntityPrintHistoryFilters.Facility:
                        where['FacilityId'] = param.Value;
                        break;
                    case EntityPrintHistoryFilters.PrintDate:
                        if (param.Value) {
                            where['PrintDate'] = {
                                '$or':
                                    {
                                        '$between': param.Value,
                                        '$gt': null
                                    }
                            };
                        }
                        break;
                    case EntityPrintHistoryFilters.From:
                        where['PrintDate'] = where['PrintDate'] || {};
                        (where['PrintDate'] as any)['$gte'] = param.Value;
                        break;
                    case EntityPrintHistoryFilters.To:
                        where['PrintDate'] = where['PrintDate'] || {};
                        (where['PrintDate'] as any)['$lte'] = param.Value;
                        break;
                    case EntityPrintHistoryFilters.ObjectType:
                        where['ObjectTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteEntityPrintHistory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<EntityPrintHistoryFilters>): Promise<any> {
        // apiReq.Attributes = apiReq.Attributes || ['Id', ['AllergyName', 'Text'], 'AllergyName', 'AllergyTypeId', 'Description'];
        let val = await this.GetEntityPrintHistorys(apiReq);
        return { [key]: val.Data };
    }
    public GetModel(): SStatic.Model<EntityPrintHistoryInstance, EntityPrintHistoryAttributes> {
        return this.Models.EntityPrintHistory;
    }

}
