import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import {
    LISInterfacePatientDetailsInstance,
    LISInterfacePatientDetailsAttributes
} from '../Model/Interface/Index';
import { LISInterfacePatientDetailsFilters } from '../Common/Filters.e';

export class LISInterfacePatientDetailsBo extends
    BaseBo<LISInterfacePatientDetailsInstance, LISInterfacePatientDetailsAttributes> {
    public async AddLISPatientDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateLISPatientDetails(req: BaseRequest): Promise<boolean> {
        if (req && req.Data) {
            await this.Update(req.Data);
        }
        return true;
    }

    public async GetLISPatientDetailsById(req: BaseRequest):
        Promise<LISInterfacePatientDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetLISPatientDetails(apiReq?: ApiRequest<LISInterfacePatientDetailsFilters>):
        Promise<ApiResponse<LISInterfacePatientDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        let patientQryJoin: any = {
            model: this.Models.Patient, attributes: ['FirstName', 'LastName', 'MRN', 'Age', 'Mobile',
                'MRNTypeId', 'DOB', 'TitleId', 'GenderId', 'AddressLine1',
                'AddressLine2', 'Pincode', 'Area', 'City', 'State', 'Country', 'NationalityIdentifier'],
            required: false,
            include: [
                this.GetReference('Title'), this.GetReference('Gender')
            ],
        };
        let encounterQryJoin: any = {
            model: this.Models.Encounter,
            attributes: ['VisitIdentifier', 'EncounterTypeId', 'AdmissionDate', 'AdmissionStatusId', 'DischargeDate'],
            required: false,
            include: [
                this.GetReference('AdmissionStatus'),
                this.GetReference('EncounterType')
            ],
        };
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case LISInterfacePatientDetailsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.AssetId:
                        where['AssetId'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.Sampleid:
                        where['Sampleid'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.EncounterId:
                        where['EncounterId'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.CreatedAt:
                        where['CreatedAt'] = { '$between': param.Value || '' };
                        break;
                    case LISInterfacePatientDetailsFilters.MRN:
                        patientQryJoin['where'] = {
                            '$or': [
                                { 'MRN': { '$like': '%' + (param.Value) + '%' } },
                                { 'FirstName': { '$like': '%' + (param.Value || '') + '%' } },
                                { 'LastName': { '$like': '%' + (param.Value || '') + '%' } }
                            ]
                        };
                        patientQryJoin['required'] = true;
                        break;
                    case LISInterfacePatientDetailsFilters.VisitIdentifier:
                        encounterQryJoin['where'] = { 'VisitIdentifier': { '$like': '%' + (param.Value) + '%' } };
                        encounterQryJoin['required'] = true;
                        break;
                    case LISInterfacePatientDetailsFilters.EncounterTypeId:
                        encounterQryJoin['where'] = { 'EncounterTypeId': param.Value };
                        encounterQryJoin['required'] = true;
                        break;
                    case LISInterfacePatientDetailsFilters.Approved:
                        where['Approved'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.Rejected:
                        where['Rejected'] = param.Value;
                        break;
                    case LISInterfacePatientDetailsFilters.PatientInfo:
                        where['PatientId'] = { '$gt': 0 };
                        break;
                    case LISInterfacePatientDetailsFilters.WOPatientInfo:
                        where['PatientId'] = { '$lt': 0 };
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        include.push({ model: this.Models.Asset, attributes: ['AssetName'], required: false });
        include.push(patientQryJoin);
        include.push(encounterQryJoin);
        order.push(['Id', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteLISResults(req: BaseRequest): Promise<Boolean> {
        console.log(req);
        return true;
    }

    public GetModel(): SStatic.Model<LISInterfacePatientDetailsInstance,
        LISInterfacePatientDetailsAttributes> {
        return this.Models.LISInterfacePatientDetails;
    }
}
