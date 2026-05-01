import * as SStatic  from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as encbo from '../../Visit/Business/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientIntakeOutputInstance, PatientIntakeOutputAttributes } from '../Model/Interface/Index';
import { PatientIntakeOutputFilters } from '../Common/Filters.e';
import * as userbo from '../../SystemSettings/Business/Index';

export class PatientIntakeOutputBo extends BaseBo<PatientIntakeOutputInstance, PatientIntakeOutputAttributes>  {
    public async AddPatientIntakeOutput(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientIntakeOutput(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientIntakeOutputById(req: BaseRequest): Promise<PatientIntakeOutputAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientIntakeOutputs(apiReq?: ApiRequest<PatientIntakeOutputFilters>):
     Promise<ApiResponse<PatientIntakeOutputAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('IntakeOutputType'));
        include.push(this.GetReference('IntakeOutputStatus'));
        include.push(this.GetReference('IntakeType'));
        include.push(this.GetReference('OutputType'));
         include.push({
            model: this.Models.Encounter,
            required: true,
            include: [
                { model: this.Models.WardMaster, required: false },
                { model: this.Models.WardRoomMaster, required: false },
                { model: this.Models.WardRoomBedMaster, required: false }
            ]
        });
        include.push({
            model: this.Models.User, attributes: ['FirstName', 'LastName'], as: 'CapturedById', required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
            switch (param.Key) {
                case PatientIntakeOutputFilters.Id:
                    where['Id'] = param.Value;
                    break;
                case PatientIntakeOutputFilters.Name:
                    where['Name'] = param.Value;
                    break;
                case PatientIntakeOutputFilters.PatientId:
                    where['PatientId'] = param.Value;
                    break;
                    case PatientIntakeOutputFilters.IntakeOutputTime:
                        where['IntakeOutputTime'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.From:
                        where['IntakeOutputTime'] = where['IntakeOutputTime'] || {};
                        (where['IntakeOutputTime'] as any)['$gte'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.To:
                        where['IntakeOutputTime'] = where['IntakeOutputTime'] || {};
                        (where['IntakeOutputTime'] as any)['$lte'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.CapturedBy:
                        where['CapturedBy'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.IntakeOutputTypeId:
                        where['IntakeOutputTypeId'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.IntakeTypeId:
                        where['IntakeTypeId'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.OutputTypeId:
                        where['OutputTypeId'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.IntakeOutputStatusId:
                        where['IntakeOutputStatusId'] = param.Value;
                        break;
                    case PatientIntakeOutputFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({
            model: this.Models.Patient,
            attributes: ['Id', 'TitleId', 'FirstName', 'MiddleName', 'LastName', 'MRN', 'Age', 'GenderId', 'DOB'],
            include: [this.GetReference('Title'), this.GetReference('Gender')]
        });
        order.push(['IntakeOutputTime', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientIntakeOutput(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientIntakeOutput(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientIntakeOutputFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetPatientIntakeOutputs(apiReq);
        let PatientIntakeOutput = data.Data[0];
        let PatientIntakeOutputlist = data.Data;
        let encReq = {
            Id: 0,
            PageContext: { PageSize: -1, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: req.Id }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo( Encounter.FacilityId);
        let info = {
            PatientIntakeOutput: PatientIntakeOutput,
            Encounter: Encounter,
            PatientIntakeOutputlist: PatientIntakeOutputlist,
            Preferences: printPreferencesData
        };
        return await Report.Generate('intakeoutput', { header: {}, body: info });
    }

    public GetModel(): SStatic.Model<PatientIntakeOutputInstance, PatientIntakeOutputAttributes> {
        return this.Models.PatientIntakeOutput;
    }

}
