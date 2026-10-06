import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions } from '../../../Core/Index';
import { BaseRequest, ISearchEnums, Paginator, ApiRequest } from '../../../Common/Index';
import { SectionCategoryMapInstance, SectionCategoryMapAttributes } from '../Model/Interface/Index';
import * as _ from 'lodash';

export class SectionCategoryMapBo extends BaseBo<SectionCategoryMapInstance, SectionCategoryMapAttributes>  {

    public objectComparer(current: any, other: any): boolean {
        return current.SectionId === other.SectionId && current.CategoryId === other.CategoryId
            && current.DisplayOrder === other.DisplayOrder;
    }

    public async ManageSectionCategories(req: BaseRequest): Promise<boolean> {
        let modified: any = req.Data.map || [];
        let existing: any = [];
        let promises: Array<any> = [];

        let sectionId = req.Data.sectionid || -1;
        let response = await this.FindAll({
            where: {
                SectionId: sectionId
            }
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            existing.push(attribs);
        });

        let toAdd: any[] = _.differenceWith(modified, existing, this.objectComparer);
        let toDelete: any[] = _.differenceWith(existing, modified, this.objectComparer);
        let toUpdate: any[] = _.intersectionWith(existing, modified, this.objectComparer);

        //console.log(toAdd);
        //console.log(toDelete);
        //console.log(toUpdate);

        toAdd.forEach(item => {
            item.Id = 0;
            promises.push(this.Save(item));
        });
        toDelete.forEach(item => {
            promises.push(this.DeleteById(item));
        });
        toUpdate.forEach(item => {
            promises.push(this.Update(item));
        });

        await Promise.all(promises);
        return true;
    }

    public async GetSectionCategories(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<SectionCategoryMapAttributes>> {
        let where: WhereOptions<any> = {};
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ISearchEnums.Id:
                        where['SectionId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        let pg: Paginator = new Paginator(apiReq.PageContext);
        let result = await this.FindAll({ where: where, limit: pg.Limit, offset: pg.Offset });
        return this.GetAttributes(result);
    }
    public GetModel(): SStatic.Model<SectionCategoryMapInstance, SectionCategoryMapAttributes> {
        return this.Models.SectionCategoryMap;
    }

}
