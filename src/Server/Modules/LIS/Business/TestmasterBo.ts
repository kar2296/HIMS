import * as SStatic from 'sequelize';
import { Op } from 'sequelize';
import { Request } from '../../../Core/Index';
import { BaseBo, IOptionProvider, MapBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { TestmasterInstance, TestmasterAttributes } from '../Model/Interface/Index';
import { TestMasterFilters } from '../Common/Filters.e';

import { TestdiagnosismappingAttributes } from '../Model/Interface/Index';
import { TestdiagnosisFilters } from '../Common/Filters.e';

import { TestmasteranalytemapAttributes } from '../Model/Interface/Index';
import { TestanalyteFilters } from '../Common/Filters.e';

import { TestmasterInstAttributes } from '../Model/Interface/Index';
import { TestInstFilters } from '../Common/Filters.e';

import { TestmasterTemplateAttributes } from '../Model/Interface/Index';
import { TestmasterTemplateFilters } from '../Common/Filters.e';

import { TestmasterBOMAttributes } from '../Model/Interface/Index';
import { TestmasterBOMFilters } from '../Common/Filters.e';

import * as bo from '../../LIS/Business/Index';
import * as emrBO from '../../EMR/Business/Index';
import * as clinicalmasterBO from '../../ClinicalMaster/Business/Index';
import { ServiceItemFilters } from '../../ClinicalMaster/Common/Filters.e';

export class TestmasterBo extends BaseBo<TestmasterInstance, TestmasterAttributes> implements IOptionProvider {
    protected TestAnalyteBO: bo.TestmasteranalytemapBo;
    protected TestDiagnosisBO: bo.TestdiagnosismappingBo;
    protected TestInstBO: bo.TestmasterInstBo;
    protected TestTemplateBO: bo.TestmasterTemplateBo;
    protected TestBOMBO: bo.TestmasterBOMBo;

    public constructor(req?: Request) {
        super(req);
        this.TestAnalyteBO = BoFactory.GetBo(bo.TestmasteranalytemapBo, req); //TODO
        this.TestDiagnosisBO = BoFactory.GetBo(bo.TestdiagnosismappingBo, req); //TODO
        this.TestInstBO = BoFactory.GetBo(bo.TestmasterInstBo, req); //TODO
        this.TestTemplateBO = BoFactory.GetBo(bo.TestmasterTemplateBo, req); //TODO
        this.TestBOMBO = BoFactory.GetBo(bo.TestmasterBOMBo, req); //TODO
    }
    public async AddTestmaster(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'Code': req.Data['Code']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        this.HandleActiveState(req.Data);
        let ServItemId = req.Data.ServItemId;
        let result = await this.Save(req.Data);
        if (result) {
            let ServItem: any = {
                Data: {
                    Id: ServItemId,
                    MasterTypeId: 2,
                    MasterItemId: result.dataValues.Id,
                    MasterName: req.Data.Name
                }
            };
            let serviceitemBO = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
            await serviceitemBO.UpdateServiceItem(ServItem);
        }
        return result.dataValues.Id;
    }

    public async UpdateTestmaster(req: BaseRequest): Promise<boolean> {
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
                [this.Dal.fn('MAX', this.Dal.col('TestmasterId')), 'TestmasterId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastTestmasterId = patient['TestmasterId'];
            if (lastTestmasterId) MaxId = lastTestmasterId;
        }

        return ++MaxId;
    }

    public async GetTestmasterById(req: BaseRequest): Promise<TestmasterAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Testmasteranalytemap,
            as: 'TestOrProfiles',
            where: { 'AnalyteMasterId': null },
            include: [
                { model: this.Models.Testmaster, as: 'TestAnalyteName', required: false }
            ],
            required: false
        });
        let result = await this.GetById(req.Id, { include: include });
        return this.GetAttribute(result);
    }

    public async GetTestmasters(apiReq?: ApiRequest<TestMasterFilters>): Promise<ApiResponse<TestmasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let isincludeservicedetails = false;
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('TestMasterPosition'));
        include.push(this.GetReference('Side'));
        include.push(this.GetReference('TESTMASTERTYP'));
        include.push({ model: this.Models.Sampletype, attributes: ['Name'], required: false });
        include.push({ model: this.Models.Department, as: 'Department', attributes: ['DepartmentName'], required: false });
        include.push({ model: this.Models.Department, as: 'SubDepartment', attributes: ['DepartmentName'], required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case TestMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case TestMasterFilters.Name:
                        (where as any)[Op.or] = [{ Code: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Mnemonics: { [Op.like]: '%' + (param.Value || '') + '%' } },
                        { Name: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case TestMasterFilters.IsProfile:
                        where['IsProfile'] = param.Value;
                        break;
                    case TestMasterFilters.type:
                        where['TESTMASTERTYPId'] = param.Value;
                        break;
                    case TestMasterFilters.dept:
                        where['DepartmentId'] = param.Value;
                        break;
                    case TestMasterFilters.subdept:
                        where['SubDepartmentId'] = param.Value;
                        break;
                    case TestMasterFilters.status:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case TestMasterFilters.IsTestAnalyteMap:
                        include.push({ model: this.Models.Analytemaster });
                        break;
                    case TestMasterFilters.IncludeServiceDetails:
                        isincludeservicedetails = true;
                        let info = param.Value;
                        include.push({
                            model: this.Models.ServiceItem,
                            attributes: ['Id', 'Name', 'ItemCode', 'IsExecutableProcedure', 'CategoryId', 'IsExternalLab'],
                            // required: false,
                            required: true,
                            where: { 'MasterTypeId': 2 }, //TestMaster
                            include: [{
                                model: this.Models.ServiceItemTariffDetail,
                                attributes: ['Rate', 'DoctorShare'],
                                required: false,
                                where: {
                                    'ServiceRateCategoryId': info.ServiceRateCategoryId,
                                    'FacilityId': info.FacilityId
                                }
                            }]
                        });
                        break;
                    case TestMasterFilters.ExcludeIds:
                        where['Id'] = { '$ne': param.Value };
                        break;

                    case TestMasterFilters.IsSeparateWorkOrder:
                        where['IsSeparateWorkOrder'] = param.Value;
                        break;
                    case TestMasterFilters.IsDirectBill:
                        where['IsDirectBill'] = param.Value;
                        break;
                    case TestMasterFilters.IsSeparateSampleId:
                        where['IsSeparateSampleId'] = param.Value;
                        break;
                    case TestMasterFilters.Methodology:
                        (where as any)[Op.or] = [{ Methodology: { [Op.like]: '%' + (param.Value || '') + '%' } }];
                        break;
                    case TestMasterFilters.IsFreeBill:
                        where['IsFreeBill'] = param.Value;
                        break;
                    case TestMasterFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case TestMasterFilters.IsExcelUpload:
                        where['IsExcelUpload'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        if (!isincludeservicedetails) {
            include.push({
                model: this.Models.ServiceItem,
                attributes: ['Id', 'Name', 'ItemCode', 'CategoryId', 'IsExecutableProcedure'], required: false
            });
        }
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetServiceMappedTestItems(apiReq?: ApiRequest<TestMasterFilters>): Promise<ApiResponse<TestmasterAttributes[]>> {
        let TestItems = await this.GetTestmasters(apiReq);
        let DetailTestItems: any = {
            Data: []
        };
        await Promise.all(TestItems.Data.map((item): Promise<void> => {
            return (async (test): Promise<void> => {
                let serviceItemReq = {
                    Id: 0,
                    PageContext: { PageNumber: 1, PageSize: 100 },
                    Params: [{ Key: ServiceItemFilters.MasterItemId, Value: test.Id }]
                };
                let serviceItemBO = BoFactory.GetBo(clinicalmasterBO.ServiceItemBo, this.Request);
                let ServiceItemData = await serviceItemBO.GetServiceItems(serviceItemReq);
                var TempItem: any = {};
                TempItem = test;
                if (ServiceItemData.Data.length > 0)
                    TempItem.ServiceItem = ServiceItemData.Data[0];
                DetailTestItems.Data.push(TempItem);
            })(item);
        }));
        return DetailTestItems;
    }

    public async DeleteTestmaster(req: BaseRequest): Promise<Boolean> {
        let orderDetailBO = BoFactory.GetBo(emrBO.PatientOrderDetailBo, this.Request);
        let isTestExists: boolean = await orderDetailBO.IsTestAssociated(req.Id);
        if (isTestExists) {
            throw { code: 'TEST_ASSOCIATED_IN_ORDER' };
        } else {
            return await this.MarkAsDelete(req.Id);
        }
    }

    public GetModel(): SStatic.Model<TestmasterInstance, TestmasterAttributes> {
        return this.Models.Testmaster;
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<TestMasterFilters>): Promise<any> {
        apiReq.Params = apiReq.Params || [];
        if (key === 'TestProfile') {
            apiReq.Params.push({ Key: TestMasterFilters.IsProfile, Value: true });
        }

        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Name', 'Description', 'Code', 'DepartmentId',
            'SampletypeId', 'SideId', 'TestMasterPositionId', 'TESTMASTERTYPId', 'IsDirectBill'];
        let val = await this.GetTestmasters(apiReq);
        return { [key]: val.Data };
    }

    public async GetTestAnalytesMapFromTestId(testMasterId: number): Promise<any> {
        let listReq: any = {};
        listReq = {
            Params: [{ Key: TestMasterFilters.Id, Value: testMasterId },
            { Key: TestMasterFilters.IsTestAnalyteMap, Value: 'true' }
            ]
        };
        let response = await this.GetTestmasters(listReq);
        return response;
    }
    public async AddTestMasterExcel(req: BaseRequest): Promise<boolean> {
        let details: TestmasterAttributes[] = req.Data || [];
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

    //Test Facility Mapping
    public async MapFacilities(req: BaseRequest) {
        let mapbo = new MapBo(this.Models.Testmasterfacilitymap, 'TestmasterId', 'FacilityId', super.Request);
        return await mapbo.Manage(req.Data);
    }

    public async GetFacilities(apiReq?: ApiRequest<ISearchEnums>) {
        let mapbo = new MapBo(this.Models.Testmasterfacilitymap, 'TestmasterId', 'FacilityId', super.Request);
        return await mapbo.GetMaps(apiReq);
    }
    //lis/testmaster/TestAnalyteBO
    public async AddTestmasteranalytemap(req: BaseRequest): Promise<number> {
        return this.TestAnalyteBO.AddTestmasteranalytemap(req);
    }
    public async UpdateTestmasteranalytemap(req: BaseRequest): Promise<boolean> {
        return this.TestAnalyteBO.UpdateTestmasteranalytemap(req);
    }
    public async GetTestmasteranalytemapById(req: BaseRequest): Promise<TestmasteranalytemapAttributes> {
        return this.TestAnalyteBO.GetTestmasteranalytemapById(req);
    }
    public async GetTestmasteranalytemaps(apiReq?: ApiRequest<TestanalyteFilters>): Promise<ApiResponse<TestmasteranalytemapAttributes[]>> {
        return this.TestAnalyteBO.GetTestmasteranalytemaps(apiReq);
    }
    public async DeleteTestmasteranalytemap(req: BaseRequest): Promise<Boolean> {
        return this.TestAnalyteBO.DeleteTestmasteranalytemap(req);
    }
    ///lis/testmaster/TestDiagnosisBO
    public async AddTestdiagnosismapping(req: BaseRequest): Promise<number> {
        return this.TestDiagnosisBO.AddTestdiagnosismapping(req);
    }
    public async UpdateTestdiagnosismapping(req: BaseRequest): Promise<boolean> {
        return this.TestDiagnosisBO.UpdateTestdiagnosismapping(req);
    }
    public async GetTestdiagnosismappingById(req: BaseRequest): Promise<TestdiagnosismappingAttributes> {
        return this.TestDiagnosisBO.GetTestdiagnosismappingById(req);
    }
    public async GetTestdiagnosismappings(apiReq?: ApiRequest<TestdiagnosisFilters>):
        Promise<ApiResponse<TestdiagnosismappingAttributes[]>> {
        return this.TestDiagnosisBO.GetTestdiagnosismappings(apiReq);
    }
    public async DeleteTestdiagnosismapping(req: BaseRequest): Promise<Boolean> {
        return this.TestDiagnosisBO.DeleteTestdiagnosismapping(req);
    }
    ///lis/testmaster/TestmasterInstruction
    public async AddTestmasterInst(req: BaseRequest): Promise<number> {
        return this.TestInstBO.AddTestmasterInst(req);
    }
    public async UpdateTestmasterInst(req: BaseRequest): Promise<boolean> {
        return this.TestInstBO.UpdateTestmasterInst(req);
    }
    public async GetTestmasterInstById(req: BaseRequest): Promise<TestmasterInstAttributes> {
        return this.TestInstBO.GetTestmasterInstById(req);
    }
    public async GetTestmasterInsts(apiReq?: ApiRequest<TestInstFilters>):
        Promise<ApiResponse<TestmasterInstAttributes[]>> {
        return this.TestInstBO.GetTestmasterInsts(apiReq);
    }
    public async DeleteTestmasterInst(req: BaseRequest): Promise<Boolean> {
        return this.TestInstBO.DeleteTestmasterInst(req);
    }
    ///lis/testmaster/TestmasterTemplate
    public async AddTestmasterTemplate(req: BaseRequest): Promise<number> {
        return this.TestTemplateBO.AddTestmasterTemplate(req);
    }
    public async UpdateTestmasterTemplate(req: BaseRequest): Promise<boolean> {
        return this.TestTemplateBO.UpdateTestmasterTemplate(req);
    }
    public async GetTestmasterTemplateById(req: BaseRequest): Promise<TestmasterTemplateAttributes> {
        return this.TestTemplateBO.GetTestmasterTemplateById(req);
    }
    public async GetTestmasterTemplates(apiReq?: ApiRequest<TestmasterTemplateFilters>):
        Promise<ApiResponse<TestmasterTemplateAttributes[]>> {
        return this.TestTemplateBO.GetTestmasterTemplates(apiReq);
    }
    public async DeleteTestmasterTemplate(req: BaseRequest): Promise<Boolean> {
        return this.TestTemplateBO.DeleteTestmasterTemplate(req);
    }
    ///lis/testmaster/TestmasterBOM
    public async AddTestmasterBOM(req: BaseRequest): Promise<number> {
        return this.TestBOMBO.AddTestmasterBOM(req);
    }
    public async UpdateTestmasterBOM(req: BaseRequest): Promise<boolean> {
        return this.TestBOMBO.UpdateTestmasterBOM(req);
    }
    public async GetTestmasterBOMById(req: BaseRequest): Promise<TestmasterBOMAttributes> {
        return this.TestBOMBO.GetTestmasterBOMById(req);
    }
    public async GetTestmasterBOMs(apiReq?: ApiRequest<TestmasterBOMFilters>):
        Promise<ApiResponse<TestmasterBOMAttributes[]>> {
        return this.TestBOMBO.GetTestmasterBOMs(apiReq);
    }
    public async DeleteTestmasterBOM(req: BaseRequest): Promise<Boolean> {
        return this.TestBOMBO.DeleteTestmasterBOM(req);
    }
}
