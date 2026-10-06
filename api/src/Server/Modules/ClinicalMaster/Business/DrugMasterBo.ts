import * as SStatic from 'sequelize';
import { BaseBo, MapBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ISearchEnums, ApiResponse } from '../../../Common/Index';
import { DrugMasterInstance, DrugMasterAttributes } from '../Model/Interface/Index';
import { DrugMasterFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as emrBO from '../../EMR/Business/Index';
import { readFileSync } from 'fs';

export class DrugMasterBo extends BaseBo<DrugMasterInstance, DrugMasterAttributes> {
    public async AddDrugMaster(req: BaseRequest): Promise<number> {
        let duplicate = await this.FindAll({
            where: {
                'DrugCode': req.Data['DrugCode']
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateDrugMaster(req: BaseRequest): Promise<boolean> {
        let duplicate = await this.FindAll({
            where: {
                'DrugCode': req.Data['DrugCode'],
                'Id': { '$ne': req.Data['Id'] }
            }
        });
        if (duplicate && duplicate.length > 0) {
            throw { code: 'ALREADYEXIST' };
        }
        let file = this.Request.file;
        if (file) {
            req.Data.LogoPath = file.path;
        }
        this.HandleNullDataViaFileUpload(req.Data);
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('DrugId')), 'DrugId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastDrugId = patient['DrugId'];
            if (lastDrugId) MaxId = lastDrugId;
        }

        return ++MaxId;
    }

    public async GetDrugLogo(req: BaseRequest): Promise<any> {
        let fileBuff = await readFileSync(req.Data.LogoPath);
        let logoBase64 = new Buffer(fileBuff).toString('base64');
        return { Id: req.Data.Id, Logo: logoBase64 };
    }

    public async GetDrugMasterById(req: BaseRequest): Promise<DrugMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetDrugMasters(apiReq?: ApiRequest<DrugMasterFilters>): Promise<ApiResponse<DrugMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let attributes: any = {};
        attributes['include'] = [];
        let storemasterId = -1;
        let GenericWhere: WhereOptions<any> = {};
        let isReqGenericSearch: boolean = false;
        include.push(this.GetReference('DrugType'));
        include.push(this.GetReference('DrugGroup'));
        include.push(this.GetReference('DrugSubGroup'));
        include.push(this.GetReference('DrugTrade'));
        include.push(this.GetReference('DrugForm'));
        include.push(this.GetReference('DurationPeriod'));
        include.push({ model: this.Models.DrugFrequency, attributes: ['Name'], required: false });
        include.push(this.GetReference('ActiveStatus'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case DrugMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case DrugMasterFilters.Name:
                        (where as any)['$or'] = [{ 'DrugName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'DrugCode': { '$like': '%' + (param.Value || '') + '%' } }];
                        break;
                    case DrugMasterFilters.DrugType:
                        where['DrugTypeId'] = param.Value;
                        break;
                    case DrugMasterFilters.GenericId:
                        where['GenericId'] = param.Value;
                        break;
                    case DrugMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case DrugMasterFilters.PharmacyId:
                        storemasterId = param.Value;
                        break;
                    case DrugMasterFilters.DrugName:
                        include.push({
                            model: this.Models.ItemMaster,
                            attributes: ['Id', 'ItemMasterId', 'ItemCode', 'ItemName', 'MrPrice'],
                            required: false,
                            include: [
                                {
                                    model: this.Models.StockItem,
                                    required: false,
                                    attributes: ['Id', 'StoreMasterId', 'ItemMasterId', 'ItemCode', 'ItemName', 'Quantity'],
                                    where: { 'StoreMasterId': storemasterId }
                                }
                            ],
                            as: 'ItemMaster'
                        });
                        break;
                    case DrugMasterFilters.IsCalculateFrequencyQty:
                        where['IsCalculateFrequencyQty'] = param.Value;
                        break;
                    case DrugMasterFilters.GenericName:
                        (GenericWhere as any)['$or'] = [{ 'GenericName': { '$like': '%' + (param.Value || '') + '%' } },
                        { 'Code': { '$like': '%' + (param.Value || '') + '%' } }];
                        isReqGenericSearch = true;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.GenericMaster,
            attributes: ['Code', 'GenericName'],
            required: isReqGenericSearch,
            where: GenericWhere
        });
        apiReq.Attributes = apiReq.Attributes || attributes;
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteDrugMaster(req: BaseRequest): Promise<Boolean> {
        let prescriptionDetailBo = BoFactory.GetBo(emrBO.PrescriptionDetailBo, this.Request);
        let isDrugExists: boolean = await prescriptionDetailBo.IsDrugAssociated(req.Id);
        if (isDrugExists) {
            throw { code: 'DRUG_ASSOCIATED_IN_PRESCRIPTION' };
        } else {
            return await this.MarkAsDelete(req.Id);
        }
    }

    public GetModel(): SStatic.Model<DrugMasterInstance, DrugMasterAttributes> {
        return this.Models.DrugMaster;
    }

    public async MapDiagnosiss(req: BaseRequest) {
    let mapbo = new MapBo(this.Models.DrugDiagnosisMap as any, 'DrugId', 'DiagnosisId', super.Request);
    return await mapbo.Manage(req.Data);
}

public async GetDiagnosiss(apiReq?: ApiRequest<ISearchEnums>) {
    let mapbo = new MapBo(this.Models.DrugDiagnosisMap as any, 'DrugId', 'DiagnosisId', super.Request);
    return await mapbo.GetMaps(apiReq);
}
    public async GetOptions(key: string, apiReq?: ApiRequest<DrugMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['DrugName', 'Text'], ['DrugCode', 'Code'], 'DrugName', 'DrugCode', 'Description',
            'DrugRouteId', 'DrugFrequencyId', 'GenericId', 'DrugFormId'];
        let val = await this.GetDrugMasters(apiReq);
        return { [key]: val.Data };
    }

}
