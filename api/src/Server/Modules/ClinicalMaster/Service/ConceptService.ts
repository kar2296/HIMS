import {BaseService, BoFactory } from '../../Base/Index';
import { ConceptBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { ConceptAttributes } from '../Model/Interface/Index';
import { ConceptFilters } from '../Common/Filters.e';

export class ConceptService extends BaseService {
    private ConceptBo: ConceptBo;
    constructor(req?: Request) {
        super(req);
        this.ConceptBo = BoFactory.GetBo(ConceptBo, this.Request);
    }

    public async AddConcept(req: BaseRequest): Promise<number> {
        return await this.ConceptBo.AddConcept(req);
    }

    public async UpdateConcept(req: BaseRequest): Promise<boolean> {
        return await this.ConceptBo.UpdateConcept(req);
    }

    public async GetConceptById(req: BaseRequest): Promise<ConceptAttributes> {
        return await this.ConceptBo.GetConceptById(req);
    }

    public async GetConcepts(apiReq?: ApiRequest<ConceptFilters>): Promise<ApiResponse<ConceptAttributes[]>> {
        return await this.ConceptBo.GetConcepts(apiReq);
    }

    public async DeleteConcept(req: BaseRequest): Promise<Boolean> {
        return await this.ConceptBo.DeleteConcept(req);
    }
}
