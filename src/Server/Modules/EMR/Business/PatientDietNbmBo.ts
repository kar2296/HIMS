import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientDietNbmInstance, PatientDietNbmAttributes } from '../Model/Interface/Index';
import { PatientDietNbmFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';

export class PatientDietNbmBo extends BaseBo<PatientDietNbmInstance, PatientDietNbmAttributes> implements IOptionProvider {
    public async AddPatientDietNbm(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.PatientDietNbmTypeId = req.Data.PatientDietNbmTypeId;
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDietNbm(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let EncounterInfo = await encounterbo.GetEncounterById({ Id: req.Data.EncounterId });
        EncounterInfo.PatientDietNbmTypeId = req.Data.PatientDietNbmTypeId;
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientDietNbmById(req: BaseRequest): Promise<PatientDietNbmAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDietNbms(apiReq?: ApiRequest<PatientDietNbmFilters>): Promise<ApiResponse<PatientDietNbmAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push({
            model: this.Models.User, as: 'CreatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'UpdatedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDietNbmFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDietNbmFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDietNbmFilters.PatientDietNbmTypeId:
                        where['PatientDietNbmTypeId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDietNbm(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientDietNbmFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientDietNbms(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientDietNbmInstance, PatientDietNbmAttributes> {
        return this.Models.PatientDietNbm;
    }
}
