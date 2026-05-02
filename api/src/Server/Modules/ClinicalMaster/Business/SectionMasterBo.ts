import * as SStatic from 'sequelize';
import { BaseBo, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ISearchEnums, ApiRequest } from '../../../Common/Index';
import { SectionMasterInstance, SectionMasterAttributes } from '../Model/Interface/Index';
import { SectionMasterFilters } from '../Common/Filters.e';


export class SectionMasterBo extends BaseBo<SectionMasterInstance, SectionMasterAttributes>  {
    public async AddSectionMaster(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateSectionMaster(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetSectionMasterById(req: BaseRequest): Promise<SectionMasterAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.SectionCategoryMap, required: false,
            include: [{
                model: this.Models.Category, required: false,
                include: [{
                    model: this.Models.Concept, required: false,
                    include: [
                        this.GetReference('ValueType', ['Description', 'ReferenceValueCode']),
                        { model: this.Models.Term, required: false }
                    ]
                }]
            }]
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetSectionMasters(apiReq?: ApiRequest<SectionMasterFilters>): Promise<ApiResponse<SectionMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DockPosition'));
        include.push(this.GetReference('SectionType'));
        include.push(this.GetReference('SectionNoteType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case SectionMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case SectionMasterFilters.Name:
                        where['Name'] = { '$like': (param.Value || '') + '%' };
                        break;
                    case SectionMasterFilters.ParentSectionId:
                        where['ParentSectionId'] = param.Value;
                        break;
                    case SectionMasterFilters.SectionTypeId:
                        where['SectionTypeId'] = param.Value;
                        break;
                    case SectionMasterFilters.DockPositionId:
                        where['DockPositionId'] = param.Value;
                        break;
                    case SectionMasterFilters.SectionNoteTypeId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['SectionNoteTypeId'] = { '$like': '%' + ('' || param.Value || '') + '%' };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteSectionMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<SectionMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'SectionId',
            'SectionNoteTypeId'];
        let val = await this.GetSectionMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<SectionMasterInstance, SectionMasterAttributes> {
        return this.Models.SectionMaster;
    }

    public async GetCategories(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.SectionCategoryMap, 'SectionId', 'CategoryId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }

    public async MapCategories(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.SectionCategoryMap, 'SectionId', 'CategoryId', super.Request);
        return await mapbo.Manage(req.Data);
    }

}
