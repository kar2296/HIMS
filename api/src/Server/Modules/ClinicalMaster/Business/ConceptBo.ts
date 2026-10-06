import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ConceptInstance, ConceptAttributes } from '../Model/Interface/Index';
import { ConceptFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';

export class ConceptBo extends BaseBo<ConceptInstance, ConceptAttributes>  {
    public async AddConcept(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);

        let result = await this.Save(req.Data);

        let termBO = BoFactory.GetBo(bo.TermBo, this.Request);
        let conceptId = result.dataValues.Id;
        await termBO.ManageTerms(conceptId, req.Data.Terms);

        return conceptId;
    }

    public async UpdateConcept(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);

        let conceptId = req.Data.Id;
        let result = await this.Update(req.Data);

        let termBO = BoFactory.GetBo(bo.TermBo, this.Request);
        await termBO.ManageTerms(conceptId, req.Data.Terms);
        return result;
    }

    public async ManageConcepts(categoryId: number, details: any[]): Promise<boolean> {
        details = details || [];
        let termBO = BoFactory.GetBo(bo.TermBo, this.Request);
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.CategoryId = categoryId;
                detail.ActiveStatusId = 2;
                if (!detail.ConceptIdentifier) {
                    detail.ConceptIdentifier = await Sequence.Next(SequenceKeys.ConceptIdentifier);
                }

                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    let conceptId = result.dataValues.Id;
                    await termBO.ManageTerms(conceptId, detail.Terms);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                    await termBO.ManageTerms(detail.Id, detail.Terms);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetConceptById(req: BaseRequest): Promise<ConceptAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.Term, required: false });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetConcepts(apiReq?: ApiRequest<ConceptFilters>): Promise<ApiResponse<ConceptAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];

        include.push({ model: this.Models.Term, required: false });

        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ConceptFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ConceptFilters.Name:
                        (where as any)['$or'] = [{ 'ConceptName': { '$like': (param.Value || '') + '%' } },
                        { 'Description': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ConceptFilters.Category:
                        where['CategoryId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteConcept(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<ConceptInstance, ConceptAttributes> {
        return this.Models.Concept;
    }

}
