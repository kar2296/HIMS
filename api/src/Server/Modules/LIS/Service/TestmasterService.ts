import { BaseService, BoFactory } from '../../Base/Index';
import { TestmasterBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { Request } from '../../../Core/Index';

import { TestmasterAttributes } from '../Model/Interface/Index';

import { TestmasterfacilitymapAttributes } from '../Model/Interface/Index';

import { TestmasteranalytemapAttributes } from '../Model/Interface/Index';
import { TestanalyteFilters, TestMasterFilters } from '../Common/Filters.e';

import { TestdiagnosismappingAttributes } from '../Model/Interface/Index';
import { TestdiagnosisFilters } from '../Common/Filters.e';

import { TestmasterInstAttributes } from '../Model/Interface/Index';
import { TestInstFilters } from '../Common/Filters.e';

import { TestmasterTemplateAttributes } from '../Model/Interface/Index';
import { TestmasterTemplateFilters } from '../Common/Filters.e';

import { TestmasterBOMAttributes } from '../Model/Interface/Index';
import { TestmasterBOMFilters } from '../Common/Filters.e';



export class TestmasterService extends BaseService {
    private TestmasterBo: TestmasterBo;
    constructor(req?: Request) {
        super(req);
        this.TestmasterBo = BoFactory.GetBo(TestmasterBo, this.Request);
    }
    //Testmaster
    public async AddTestmaster(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestmaster(req);
    }

    public async UpdateTestmaster(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestmaster(req);
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.GetMaxId(req);
    }


    public async GetTestmasterById(req: BaseRequest): Promise<TestmasterAttributes> {
        return await this.TestmasterBo.GetTestmasterById(req);
    }

    public async GetTestmasters(apiReq?: ApiRequest<TestMasterFilters>): Promise<ApiResponse<TestmasterAttributes[]>> {
        return await this.TestmasterBo.GetTestmasters(apiReq);
    }

    public async DeleteTestmaster(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestmaster(req);
    }
    //MapFacilities
    public async MapFacilities(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.MapFacilities(req);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>): Promise<Array<TestmasterfacilitymapAttributes>> {
        return await this.TestmasterBo.GetFacilities(apiReq);
    }
    //Testanalytemap
    public async AddTestmasteranalytemap(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestmasteranalytemap(req);
    }

    public async UpdateTestmasteranalytemap(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestmasteranalytemap(req);
    }

    public async GetTestmasteranalytemapById(req: BaseRequest): Promise<TestmasteranalytemapAttributes> {
        return await this.TestmasterBo.GetTestmasteranalytemapById(req);
    }

    public async GetTestmasteranalytemaps(apiReq?: ApiRequest<TestanalyteFilters>):
        Promise<ApiResponse<TestmasteranalytemapAttributes[]>> {
        return await this.TestmasterBo.GetTestmasteranalytemaps(apiReq);
    }

    public async DeleteTestmasteranalytemap(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestmasteranalytemap(req);
    }
    //Testdiagnosis
    public async AddTestdiagnosismapping(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestdiagnosismapping(req);
    }

    public async UpdateTestdiagnosismapping(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestdiagnosismapping(req);
    }

    public async GetTestdiagnosismappingById(req: BaseRequest): Promise<TestdiagnosismappingAttributes> {
        return await this.TestmasterBo.GetTestdiagnosismappingById(req);
    }

    public async GetTestdiagnosismappings(apiReq?: ApiRequest<TestdiagnosisFilters>):
        Promise<ApiResponse<TestdiagnosismappingAttributes[]>> {
        return await this.TestmasterBo.GetTestdiagnosismappings(apiReq);
    }

    public async DeleteTestdiagnosismapping(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestdiagnosismapping(req);
    }
    //Testmasterinst
    public async AddTestmasterInst(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestmasterInst(req);
    }

    public async UpdateTestmasterInst(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestmasterInst(req);
    }

    public async GetTestmasterInstById(req: BaseRequest): Promise<TestmasterInstAttributes> {
        return await this.TestmasterBo.GetTestmasterInstById(req);
    }

    public async GetTestmasterInsts(apiReq?: ApiRequest<TestInstFilters>):
        Promise<ApiResponse<TestmasterInstAttributes[]>> {
        return await this.TestmasterBo.GetTestmasterInsts(apiReq);
    }

    public async DeleteTestmasterInst(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestmasterInst(req);
    }
    //TestmasterTemplate
    public async AddTestmasterTemplate(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestmasterTemplate(req);
    }

    public async UpdateTestmasterTemplate(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestmasterTemplate(req);
    }

    public async GetTestmasterTemplateById(req: BaseRequest): Promise<TestmasterTemplateAttributes> {
        return await this.TestmasterBo.GetTestmasterTemplateById(req);
    }

    public async GetTestmasterTemplates(apiReq?: ApiRequest<TestmasterTemplateFilters>):
        Promise<ApiResponse<TestmasterTemplateAttributes[]>> {
        return await this.TestmasterBo.GetTestmasterTemplates(apiReq);
    }

    public async DeleteTestmasterTemplate(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestmasterTemplate(req);
    }
    //TestmasterBOM
    public async AddTestmasterBOM(req: BaseRequest): Promise<number> {
        return await this.TestmasterBo.AddTestmasterBOM(req);
    }

    public async UpdateTestmasterBOM(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.UpdateTestmasterBOM(req);
    }

    public async GetTestmasterBOMById(req: BaseRequest): Promise<TestmasterBOMAttributes> {
        return await this.TestmasterBo.GetTestmasterBOMById(req);
    }

    public async GetTestmasterBOMs(apiReq?: ApiRequest<TestmasterBOMFilters>):
        Promise<ApiResponse<TestmasterBOMAttributes[]>> {
        return await this.TestmasterBo.GetTestmasterBOMs(apiReq);
    }

    public async DeleteTestmasterBOM(req: BaseRequest): Promise<Boolean> {
        return await this.TestmasterBo.DeleteTestmasterBOM(req);
    }
    public async GetServiceMappedTestItems(apiReq?: ApiRequest<TestMasterFilters>): Promise<ApiResponse<TestmasterAttributes[]>> {
        return await this.TestmasterBo.GetServiceMappedTestItems(apiReq);
    }
    public async AddTestMasterExcel(req: BaseRequest): Promise<boolean> {
        return await this.TestmasterBo.AddTestMasterExcel(req);
    }
}
