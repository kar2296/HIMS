import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { CategoryInstance, CategoryAttributes } from '../Model/Interface/Index';
import { CategoryFilters } from '../Common/Filters.e';
import { Sequence, SequenceKeys } from '../../General/Common/Sequence.s';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../ClinicalMaster/Business/Index';
import * as appmanagerBO from '../../SystemSettings/Business/Index';
import * as emrbo from '../../EMR/Business/Index';
import * as XLSX from 'xlsx';

export class CategoryBo extends BaseBo<CategoryInstance, CategoryAttributes> implements IOptionProvider {

    public async ImportCategories(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            let wb = XLSX.readFile(file.path);
            let sheets = wb.SheetNames;
            let sheet: XLSX.WorkSheet = wb.Sheets[sheets[0]];
            let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            //Category Type Master
            let apiReq: any = { Params: [] };
            let categoryTypeMasterBo = BoFactory.GetBo(bo.CategoryTypeMasterBo, this.Request);
            let categoryTypeMasterResult: any = await categoryTypeMasterBo.GetCategoryTypeMasters(apiReq);
            let categoryTypes: any = categoryTypeMasterResult.Data;
            let categoryTypeMap: any = {};
            for (var jdx in categoryTypes) {
                var catType = categoryTypes[jdx];
                if (catType.Name) {
                    var catTypeName = catType.Name.trim().toLowerCase();
                    catTypeName = catTypeName.replace(/\s/g, '');
                    categoryTypeMap[catTypeName] = catType;
                }
            }

            //Ref Value - ValueType
            let apiReq1: any = {
                Params: [
                    { Key: 3, Value: 'ValueType' }
                ]
            };

            let refValueBO = BoFactory.GetBo(appmanagerBO.ReferenceValueBo, this.Request);
            let refValueResult: any = await refValueBO.GetReferenceValues(apiReq1);
            let refValues: any = refValueResult.Data;
            let valueTypeMap: any = {};
            for (var jdx1 in refValues) {
                var refValue = refValues[jdx1];
                if (refValue.Description) {
                    var refValueName = refValue.Description.trim().toLowerCase();
                    refValueName = refValueName.replace(/\s/g, '');
                    valueTypeMap[refValueName] = refValue;
                }
            }


            let currentCategory: string = '';
            let categoryObj: any = null;
            let chiefComplaintCategoryList: any = [];
            for (var idx in rows) {
                var detail: any = rows[idx];
                //console.log(detail);
                let chiefComplaint: any = detail[0] ? detail[0].trim() : '';
                let categoryType = detail[1] ? detail[1] : '';
                let categoryTypeNoCase = categoryType.trim().toLowerCase().replace(/\s/g, '');
                let categoryTypeId = categoryTypeMap[categoryTypeNoCase] ? categoryTypeMap[categoryTypeNoCase].Id : -1;
                //let sectionType : any = detail[2];
                //let sectionName : any = detail[3];
                let categoryName: string = detail[4];
                let conceptName: any = detail[5];

                let valueType: any = detail[6] ? detail[6].trim().toLowerCase() : '';
                valueType = valueType.replace(/\s/g, '');
                let valueTypeId = valueTypeMap[valueType] ? valueTypeMap[valueType].ReferenceValueCodeId : -1;

                let isMultipleStr: any = detail[7] ? detail[7].trim().toLowerCase() : 'no';
                let isMultiple: any = isMultipleStr === 'yes' ? true : false;

                let isMandatoryStr: any = detail[8] ? detail[8].trim().toLowerCase() : 'no';
                let isMandatory: any = isMandatoryStr === 'yes' ? true : false;

                let displayOrder: any = detail[9];
                let term: any = detail[10];

                if (categoryName && categoryName !== 'CategoryName') {
                    if (categoryName !== currentCategory) {
                        currentCategory = categoryName;
                        if (categoryObj !== null) {

                            for (var key in categoryObj.ConceptsList) {
                                var concept = categoryObj.ConceptsList[key];
                                categoryObj.Concepts.push(concept);
                            }

                            //Emptying dummy list
                            categoryObj.ConceptsList = {};

                            console.log('Saving ' + categoryObj.CategoryName);
                            let reqObj: any = { Data: categoryObj };
                            let categoryId = await this.AddCategory(reqObj);
                            chiefComplaintCategoryList.push({
                                CategoryId: categoryId, CategoryName: categoryObj.CategoryName,
                                ChiefComplaint: categoryObj.ChiefComplaint
                            });
                        }
                        categoryObj = null;
                    }

                    if (categoryObj === null) {

                        categoryObj = {
                            Id: 0,
                            CategoryName: categoryName,
                            CategoryType: categoryType,
                            CategoryTypeId: categoryTypeId,
                            ChiefComplaint: chiefComplaint,
                            ActiveStatus: 'Active',
                            ConceptsList: {},
                            Concepts: [],
                            Status: 1
                        };
                    }
                    if (!categoryObj.ConceptsList[conceptName]) {
                        categoryObj.ConceptsList[conceptName] = {
                            Id: 0,
                            ConceptName: conceptName,
                            Description: conceptName,
                            ValueTypeId: valueTypeId,
                            IsMultiple: isMultiple,
                            IsMandatory: isMandatory,
                            DisplayOrder: displayOrder,
                            ActiveStatus: 'Active',
                            Status: 1,
                            Terms: []
                        };
                    }
                    if (term) {
                        let termObj: any = { Id: 0, TermName: term, Code: term, DisplayOrder: displayOrder, Status: 1 };
                        categoryObj.ConceptsList[conceptName].Terms.push(termObj);
                    }
                }
            }

            //Saving last category
            if (categoryObj !== null) {

                for (var key1 in categoryObj.ConceptsList) {
                    var concept1 = categoryObj.ConceptsList[key1];
                    categoryObj.Concepts.push(concept1);
                }

                //Emptying dummy list
                categoryObj.ConceptsList = {};

                console.log('Saving ' + categoryObj.CategoryName);
                let reqObj: any = { Data: categoryObj };
                let categoryId = await this.AddCategory(reqObj);
                chiefComplaintCategoryList.push({
                    CategoryId: categoryId, CategoryName: categoryObj.CategoryName,
                    ChiefComplaint: categoryObj.ChiefComplaint
                });
            }

            //get chiefcomplaint ids
            let chiefComplaintCategoryMap: any = [];
            for (var cdx in chiefComplaintCategoryList) {
                var item = chiefComplaintCategoryList[cdx];
                if (item.ChiefComplaint) {
                    let apiReq2: any = {
                        Params: [
                            { Key: 4, Value: item.ChiefComplaint }
                        ]
                    };
                    let chiefComplaintBO = BoFactory.GetBo(bo.ChiefComplaintBo, this.Request);
                    let chiefComplaintResult: any = await chiefComplaintBO.GetChiefComplaints(apiReq2);
                    let chiefComplaints: any = chiefComplaintResult.Data;
                    if (chiefComplaints && chiefComplaints.length > 0) {
                        var chiefComplaint = chiefComplaints[0];
                        chiefComplaintCategoryMap.push({ CategoryId: item.CategoryId, ChiefComplaintId: chiefComplaint.Id });
                    }
                }
            }
            //console.log(JSON.stringify(rows));
            //console.log(chiefComplaintCategoryMap);

            if (chiefComplaintCategoryMap && chiefComplaintCategoryMap.length > 0) {
                let chiefComplaintCategoryMapBo = BoFactory.GetBo(bo.ChiefComplaintCategoryMapBo, this.Request);
                await chiefComplaintCategoryMapBo.ManageMaps(chiefComplaintCategoryMap);
            }
        }
        return 0;
    }


    public async AddCategory(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);

        if (!req.Data.CategoryIdentifier) {
            req.Data.CategoryIdentifier = await Sequence.Next(SequenceKeys.CategoryIdentifier);
        }

        let result = await this.Save(req.Data);

        let conceptBO = BoFactory.GetBo(bo.ConceptBo, this.Request);
        let categoryId = result.dataValues.Id;
        await conceptBO.ManageConcepts(categoryId, req.Data.Concepts);

        return result.dataValues.Id;
    }

    public async UpdateCategory(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);

        if (!req.Data.CategoryIdentifier) {
            req.Data.CategoryIdentifier = await Sequence.Next(SequenceKeys.CategoryIdentifier);
        }

        let result = await this.Update(req.Data);
        let conceptBO = BoFactory.GetBo(bo.ConceptBo, this.Request);
        await conceptBO.ManageConcepts(req.Data.Id, req.Data.Concepts);
        return result;
    }

    public async GetCategoryById(req: BaseRequest): Promise<CategoryAttributes> {
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Concept, required: false,
            include: [
                this.GetReference('ValueType', ['Description', 'ReferenceValueCode']),
                {
                    model: this.Models.Term, required: false
                }
            ]
        });
        let result = await this.GetById(req.Id, {
            include: include, order: [
                [{ model: this.Models.Concept }, 'DisplayOrder', 'ASC']
            ]
        });
        return this.GetAttribute(result);
    }

    public async GetCategoriesByType(req: BaseRequest): Promise<any> {
        let data = req.Data;
        let consultationId = data.consultationid;
        let categoryType = data.categorytype;
        console.log(data);

        //Get patient chief complaints by consultation id
        let apiReq: any = {
            Params: [
                { Key: 4, Value: consultationId }
            ]
        };
        let patientCCBO = BoFactory.GetBo(emrbo.PatientChiefComplaintBo, this.Request);
        let patientCCResult: any = await patientCCBO.GetPatientChiefComplaints(apiReq);
        let patientCC: any = patientCCResult.Data;
        let ccList = [];
        for (var idx in patientCC) {
            var item = patientCC[idx];
            ccList.push(item.ChiefComplaintId);
        }
        console.log('Chief complaints'); console.log(ccList);

        if (ccList.length === 0) {
            throw { code: 'NO_PAIENT_CC_IN_CONSULTATION' };
        }

        //Get list of chiefcomplaint category maps
        let apiReq1: any = {
            Params: [
                { Key: 2, Value: ccList }
            ]
        };
        let ccCatMapBO = BoFactory.GetBo(bo.ChiefComplaintCategoryMapBo, this.Request);
        let ccCatMapResult: any = await ccCatMapBO.GetChiefComplaintCategoryMaps(apiReq1);
        let ccCatMaps: any = ccCatMapResult.Data;
        console.log(ccCatMaps);
        let categoryList = [];
        for (var jdx in ccCatMaps) {
            var item1 = ccCatMaps[jdx];
            categoryList.push(item1.CategoryId);
        }
        console.log('Categories'); console.log(categoryList);


        //Get list of categories
        let apiReq2: any = {
            Params: [
                { Key: 4, Value: categoryList },
                { Key: 5, Value: categoryType }
            ]
        };
        let result: any = await this.GetCategorys(apiReq2);
        console.log(result);
        return result;
    }

    public async GetCategorys(apiReq?: ApiRequest<CategoryFilters>): Promise<ApiResponse<CategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.Concept, required: false,
            include: [
                this.GetReference('ValueType', ['Description', 'ReferenceValueCode']),
                {
                    model: this.Models.Term, required: false
                },
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CategoryFilters.Name:
                        (where as any)['$or'] = [{ 'CategoryName': { '$like': (param.Value || '') + '%' } },
                        { 'Description': { '$like': (param.Value || '') + '%' } },
                        { 'CategoryIdentifier': { '$like': (param.Value || '') + '%' } },
                        { 'CategoryType': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case CategoryFilters.CategoryTypeId:
                        where['CategoryTypeId'] = param.Value;
                        break;
                    case CategoryFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CategoryFilters.IdArr:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case CategoryFilters.CategoryType:
                        where['CategoryType'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where, include: include, attributes: apiReq.Attributes, order: [
                [{ model: this.Models.Concept }, 'DisplayOrder', 'ASC']
            ]
        });
    }
    public async GetCategorysWithoutConcept(apiReq?: ApiRequest<CategoryFilters>): Promise<ApiResponse<CategoryAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case CategoryFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case CategoryFilters.Name:
                        (where as any)['$or'] = [{ 'CategoryName': { '$like': (param.Value || '') + '%' } },
                        { 'Description': { '$like': (param.Value || '') + '%' } },
                        { 'CategoryIdentifier': { '$like': (param.Value || '') + '%' } },
                        { 'CategoryType': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case CategoryFilters.CategoryTypeId:
                        where['CategoryTypeId'] = param.Value;
                        break;
                    case CategoryFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case CategoryFilters.IdArr:
                        where['Id'] = { '$in': param.Value };
                        break;
                    case CategoryFilters.CategoryType:
                        where['CategoryType'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, {
            where: where, include: include, attributes: apiReq.Attributes
        });
    }
    public async DeleteCategory(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<CategoryFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['CategoryName', 'Text'], 'Description'];
        let val = await this.GetCategorys(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<CategoryInstance, CategoryAttributes> {
        return this.Models.Category;
    }

}
