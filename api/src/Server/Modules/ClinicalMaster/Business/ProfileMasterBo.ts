import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { ProfileMasterInstance, ProfileMasterAttributes } from '../Model/Interface/Index';
import { ProfileMasterFilters } from '../Common/Filters.e';

export class ProfileMasterBo extends BaseBo<ProfileMasterInstance, ProfileMasterAttributes> implements IOptionProvider {
    public async AddProfileMaster(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateProfileMaster(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetProfileMasterById(req: BaseRequest): Promise<ProfileMasterAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetProfileMasters(apiReq?: ApiRequest<ProfileMasterFilters>): Promise<ApiResponse<ProfileMasterAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('ActiveStatus'));
        include.push(this.GetReference('SectionNoteType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case ProfileMasterFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case ProfileMasterFilters.Name:
                        (where as any)['$or'] = [{ 'Name': { '$like': (param.Value || '') + '%' } }];
                        break;
                    case ProfileMasterFilters.ProfilemasterType:
                        where['ProfilemasterTypeId'] = param.Value;
                        break;
                    case ProfileMasterFilters.ActiveStatusId:
                        where['ActiveStatusId'] = param.Value;
                        break;
                    case ProfileMasterFilters.ProfileType:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['ProfilemasterTypeId'] = { '$in': paramArr };
                        }
                        break;
                    case ProfileMasterFilters.IsIVF:
                        where['IsIVF'] = param.Value;
                        break;
                    case ProfileMasterFilters.FacilityId:
                        if (param.Value) {
                            let paramArr: Array<number> = [];
                            if (param.Value.toString().indexOf(',') > -1) {
                                paramArr = param.Value.toString().split(',');
                            } else {
                                paramArr = [param.Value];
                            }
                            where['FacilityId'] = { '$in': paramArr };
                        }
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeleteProfileMaster(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async UpdatePrintConfig(req: BaseRequest): Promise<boolean> {
        let profile: any = {
            Id: 0, PrintConfig: req.Data
        };
        await this.Models.ProfileMaster.update(profile, {
            fields: ['PrintConfig'],
            where: {
                Id: req.Id
            }
        });
        return true;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<ProfileMasterFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['Name', 'Text'], 'Description', 'IsIVF', 'ProfilemasterTypeId'];
        let val = await this.GetProfileMasters(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<ProfileMasterInstance, ProfileMasterAttributes> {
        return this.Models.ProfileMaster;
    }

}
