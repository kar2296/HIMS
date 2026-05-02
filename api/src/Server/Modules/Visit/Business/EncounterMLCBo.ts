import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { EncounterMLCInstance, EncounterMLCAttributes } from '../Model/Interface/Index';
import { EncounterMLCFilters, EncounterFilters, EncounterMLCOfficerFilters } from '../Common/Filters.e';
import { UserFilters } from '../../SystemSettings/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as bo from '../../Visit/Business/Index';
import * as userbo from '../../SystemSettings/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as aebo from '../../AccidentEmergency/Business/Index';
import { SequenceKeys } from '../../General/Common/Sequence.s';

export class EncounterMLCBo extends BaseBo<EncounterMLCInstance, EncounterMLCAttributes>  {
    public async AddEncounterMLC(req: BaseRequest): Promise<number> {
        let generateEncMLC = 0;
        if (!req.Data.MLCNo && req.Data.MLCStatusId === 1) {
            req.Data.MLCNo = null; // await Sequence.Next(SequenceKeys.MLCNoId);
            generateEncMLC = 1;
        }
        let result = await this.Save(req.Data);
        let MLCId = result.dataValues.Id;
        if (generateEncMLC === 1) {
            this.deferSequenceKey(MLCId, 'MLCNo',
                this.getSequenceIdentifier(SequenceKeys.MLCNoId));
        }
        let detailBO = BoFactory.GetBo(bo.EncounterMLCOfficerBo, this.Request);
        await detailBO.ManageEncounterMLCOfficers(result.dataValues.Id, req.Data.Details);
        return MLCId;
    }

    public async UpdateEncounterMLC(req: BaseRequest): Promise<boolean> {
        let generateEncMLC = 0;
        if (!req.Data.MLCNo && req.Data.MLCStatusId === 1) {
            req.Data.MLCNo = null; // await Sequence.Next(SequenceKeys.MLCNoId);
            generateEncMLC = 1;
        }
        let result = await this.Update(req.Data);
        if (generateEncMLC === 1) {
            this.deferSequenceKey(req.Data.Id, 'MLCNo',
                this.getSequenceIdentifier(SequenceKeys.MLCNoId));
        }
        let detailBO = BoFactory.GetBo(bo.EncounterMLCOfficerBo, this.Request);
        await detailBO.ManageEncounterMLCOfficers(req.Data.Id, req.Data.Details);
        return result;
    }

    public async GetEncounterMLCById(req: BaseRequest): Promise<EncounterMLCAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetEncounterMLCs(apiReq?: ApiRequest<EncounterMLCFilters>): Promise<ApiResponse<EncounterMLCAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('AccidentType'));
        include.push(this.GetReference('EscortType'));
        include.push({
            model: this.Models.EncounterMLCOfficer, required: false, attributes: ['Id', 'OfficerName', 'Designation', 'ContactNo', 'Status']
        });
        include.push({
            model: this.Models.PincodeMaster, required: false, attributes: ['Pincode']
        });
        include.push({
            model: this.Models.CityMaster, required: false, attributes: ['CityName']
        });
        include.push({
            model: this.Models.StateMaster, required: false, attributes: ['StateName']
        });
        include.push({
            model: this.Models.CountryMaster, required: false, attributes: ['CountryName']
        });
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'LicenseNo', 'SpecialityId'], required: false,
            include: [this.GetReference('Title'),
            {
                model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
            }
            ]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case EncounterMLCFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case EncounterMLCFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case EncounterMLCFilters.MLCNo:
                        where['MLCNo'] = param.Value;
                        break;
                    case EncounterMLCFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case EncounterMLCFilters.ConsultationId:
                        where['ConsultationId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async GetAccidentMLC(req: BaseRequest): Promise<any> {
        let RegistrationBo = BoFactory.GetBo(aebo.AERegistrationBo, this.Request);
        let AEDetail = await RegistrationBo.GetAERegistrationById({ Id: req.Id });
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterMLCFilters.EncounterId, Value: AEDetail.EncounterId }]
        };
        let result: any = {};
        let data = await this.GetEncounterMLCs(apiReq);
        result.Data = data.Data;
        result.AEDetail = AEDetail;
        return result;
    }

    public async DeleteEncounterMLC(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintEncounterMLC(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterMLCFilters.EncounterId, Value: req.Id }]
        };
        let data = await this.GetEncounterMLCs(apiReq);
        let Data = data.Data[0];
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.Id, Value: Data.EncounterId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let Encounter = encounterData.Data[0];
        let EncounterMLCReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterMLCOfficerFilters.EncounterMlcId, Value: Data.Id }]
        };
        let MLCBo = BoFactory.GetBo(encbo.EncounterMLCOfficerBo, this.Request);
        let MLCData = await MLCBo.GetEncounterMLCOfficers(EncounterMLCReq);
        let userReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: UserFilters.Id, Value: Data.DoctorId }]
        };
        let UserBo = BoFactory.GetBo(userbo.UserBo, this.Request);
        let User = await UserBo.GetUsers(userReq);
        let facilityPreferenceBO = BoFactory.GetBo(userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(Encounter.FacilityId);
        let info = {
            EncounterMLC: Data,
            Encounter: Encounter,
            EncounterMLCOfficer: MLCData.Data[0],
            User: User.Data[0],
            Preferences: printPreferencesData
        };
        return await Report.Generate('medicolegalcertificate', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<EncounterMLCInstance, EncounterMLCAttributes> {
        return this.Models.EncounterMLC;
    }
}
