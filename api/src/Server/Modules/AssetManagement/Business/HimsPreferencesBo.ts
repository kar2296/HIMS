import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PreferencesInstance, PreferencesAttributes } from '../Model/Interface/Index';
import { PreferencesFilters } from '../Common/Filters.e';

export class PreferencesBo extends BaseBo<PreferencesInstance, PreferencesAttributes>  {
    public async AddPreferences(req: BaseRequest): Promise<number> {
        let file = this.Request.file;
        if (file) {
            req.Data.FilePath = file.path;
        }
        //Handling for json 'null' value while save user with file upload
        for (var idx in req.Data) {
            var strValue = req.Data[idx];
            if (strValue === 'null') {
                req.Data[idx] = null;
            }
        }
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePreferences(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPreferencesById(req: BaseRequest): Promise<PreferencesAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPreferencess(apiReq?: ApiRequest<PreferencesFilters>): Promise<ApiResponse<PreferencesAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PreferencesFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePreferences(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PreferencesInstance, PreferencesAttributes> {
        return this.Models.Preferences;
    }

}
