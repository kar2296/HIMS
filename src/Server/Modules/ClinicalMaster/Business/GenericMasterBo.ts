import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { GenericMasterInstance, GenericMasterAttributes } from '../Model/Interface/Index';
import { GenericMasterFilters } from '../Common/Filters.e';
import { join } from 'path';

export class GenericMasterBo extends BaseBo<GenericMasterInstance, GenericMasterAttributes> implements IOptionProvider {
    public async AddGenericMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateGenericMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetMaxId(req: BaseRequest): Promise<number> {
        let MaxId = 0;
        let maxidInstance: any = await this.Find({
            attributes: [
                [this.Dal.fn('MAX', this.Dal.col('GenericId')), 'GenericId'],
            ],
            where: {
                Status: 1
            }
        });
        if (maxidInstance) {
            let patient: any = this.GetAttribute(maxidInstance);
            let lastGenericId = patient['GenericId'];
            if (lastGenericId) MaxId = lastGenericId;
        }

        return MaxId;
    }

    public async GetGenericMasterById(req: BaseRequest): Promise<GenericMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetGenericMasters(apiReq?: ApiRequest<GenericMasterFilters>): Promise<ApiResponse<GenericMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AllergenType'));
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('ScheduleType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case GenericMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case GenericMasterFilters.Name:
                        (where as any)['$or'] = [{ 'GenericName': { '$like': (param.Value || '') + '%' } },
                        { 'Code': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case GenericMasterFilters.AllergenType:
                        where['AllergenTypeId'] = param.Value;
                        break;
                    case GenericMasterFilters.ActiveStatus:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case GenericMasterFilters.ScheduleTypeId:
                        where['ScheduleTypeId'] = param.Value;
                        break;
                    case GenericMasterFilters.IsPrescribed:
                        where['IsPrescribed'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }


    public async DeleteGenericMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<GenericMasterInstance, GenericMasterAttributes> {
        return this.Models.GenericMaster;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<GenericMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['GenericName', 'Text'], 'GenericName', 'Code', 'Description', 'ScheduleTypeId'];
        let val = await this.GetGenericMasters(apiReq);
        return { [key]: val.Data };
    }
    public async PrintGenericMasterReport(apiReq?: ApiRequest<GenericMasterFilters>): Promise<any> {
        let data = await this.GetGenericMasters(apiReq);
        let GenericMaster = data.Data;
        let ActiveStatus = apiReq.Data.ActiveStatus;
        let ScheduleType = apiReq.Data.ScheduleType;
        let GenericMasterData = data.Data[0];
        // let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        // let printPreferencesData =
        //     await facilityPreferenceBO.GetFacilityPreferenceWithLogo(GenericMasterData.FacilityId);
        let info = {
            GenericMaster: GenericMaster,
            GenericMasterData: GenericMasterData,
            // Preferences: printPreferencesData,
            ActiveStatus: ActiveStatus,
            ScheduleType: ScheduleType
        };
        let pdfOption: any = null;
        let key = 'genericmasterreport';
        pdfOption = {
            format: 'A4',
            orientation: 'portrait',
            border: '0',
            header: {
                height: '1.5in',
                contents: '',
            },
            footer: {
                height: '0.5in',
                contents: {
                    first: '',
                    default: '',
                    last: '',
                },
            },
            type: 'pdf',
            base: 'file://' + join(__dirname, '/../../Templates/')
        };
        return await Report.Generate(key, { header: {}, body: info }, null, pdfOption);
    }
}
