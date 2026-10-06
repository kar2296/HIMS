import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BoFactory } from '../../Base/Business/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDeathInstance, PatientDeathAttributes } from '../Model/Interface/Index';
import { PatientDeathFilters } from '../Common/Filters.e';
import * as regbo from '../../Registration/Business/Index';
import * as encbo from '../../Visit/Business/Index';

export class PatientDeathBo extends BaseBo<PatientDeathInstance, PatientDeathAttributes>  {
    public async AddPatientDeath(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDeath(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        if (req.Data.DeathStatusId === 2) {
            let patientdata: any = {
                Id: req.Data.PatientId,
                DeathDate: req.Data.DeathDate,
                DeathTypeId: req.Data.DeathTypeId,
                DeathPlaceId: req.Data.DeathPlaceId,
                IsDeathConfirmed: req.Data.IsDeathConfirmed,
                DeathUpdatedBy: req.Data.DeathRequestedBy,
                DeathUpdatedDate: req.Data.DeathRequestedDate,
                DeathApprovedBy: req.Data.DeathApprovedBy,
                DeathComents: req.Data.DeathComents,
            };
            let patientbo = BoFactory.GetBo(regbo.PatientBo, this.Request);
            await patientbo.Update(patientdata);
            let encData: any = {
                Id: req.Data.EncounterId,
                DeathDate: req.Data.DeathDate
            };
            let encounterbo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
            await encounterbo.Update(encData);
        }
        return result;
    }

    public async GetPatientDeathById(req: BaseRequest): Promise<PatientDeathAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDeaths(apiReq?: ApiRequest<PatientDeathFilters>):
     Promise<ApiResponse<PatientDeathAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('DeathStatus'));
        include.push({
            model: this.Models.Patient, as: 'Patient', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'DeathRequestedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'DeathApprovedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'DeathReversedUser', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.Encounter, as: 'Encounter', attributes:
             ['EncounterTypeId', 'VisitIdentifier', 'PatientId', 'AdmissionDate'], required: false,
        });
        apiReq.Params.forEach((param) => {
            if(this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDeathFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDeathFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientDeathFilters.FacilityId:
                        where['FacilityId'] = param.Value;
                        break;
                    case PatientDeathFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case PatientDeathFilters.DeathStatusId:
                        where['DeathStatusId'] = param.Value;
                        break;
                    case PatientDeathFilters.From:
                        where['DeathDate'] = where['DeathDate'] || {};
                        (where['DeathDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientDeathFilters.To:
                        where['DeathDate'] = where['DeathDate'] || {};
                        (where['DeathDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDeath(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientDeathInstance, PatientDeathAttributes> {
        return this.Models.PatientDeath;
    }

}
