import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { NewBornDetailInstance, NewBornDetailAttributes } from '../Model/Interface/Index';
import { NewBornDetailFilters } from '../Common/Filters.e';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import * as regbo from '../../Registration/Business/Index';
import * as Userbo from '../../SystemSettings/Business/Index';


export class NewBornDetailBo extends BaseBo<NewBornDetailInstance, NewBornDetailAttributes> implements IOptionProvider {
    public async AddNewBornDetail(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdateNewBornDetail(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetNewBornDetailById(req: BaseRequest): Promise<NewBornDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetNewBornDetails(apiReq?: ApiRequest<NewBornDetailFilters>):
        Promise<ApiResponse<NewBornDetailAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ModeOfDelivery'));
        include.push(this.GetReference('NewBornStatus'));
        include.push(this.GetReference('CongentialAnomalies'));
        include.push(this.GetReference('DeliveryComplications'));
        include.push(this.GetReference('CordBloodFor'));
        include.push(this.GetReference('BirthOutCome'));
        include.push(this.GetReference('Urine'));
        include.push(this.GetReference('BloodGroup'));
        include.push(this.GetReference('RhFactor'));
        include.push(this.GetReference('PatencyOfAnus'));
        include.push(this.GetReference('JellyCordType'));
        include.push(this.GetReference('JellyCordCutBy'));
        include.push(this.GetReference('Colour'));
        include.push(this.GetReference('Reflexes'));
        include.push(this.GetReference('HeartRate'));
        include.push(this.GetReference('MuscleTone'));
        include.push(this.GetReference('Respiration'));
        include.push(this.GetReference('HEIGHTUNITS'));
        include.push(this.GetReference('WeightUnits'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName', 'SignPath', 'Qualification'], required: false,
            include: [this.GetReference('Title'), {
                model: this.Models.Speciality, attributes: ['SpecialityName'], required: false,
            }]
        });
        include.push({
            model: this.Models.User, as: 'Pediatrician', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Createdby', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case NewBornDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case NewBornDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case NewBornDetailFilters.ModeOfDeliveryId:
                        where['ModeOfDeliveryId'] = param.Value;
                        break;
                    case NewBornDetailFilters.NewBornStatusId:
                        where['NewBornStatusId'] = param.Value;
                        break;
                    case NewBornDetailFilters.FromDate:
                        where['DeliveryDate'] = where['DeliveryDate'] || {};
                        (where['DeliveryDate'] as any)['$gte'] = param.Value;
                        break;
                    case NewBornDetailFilters.ToDate:
                        where['DeliveryDate'] = where['DeliveryDate'] || {};
                        (where['DeliveryDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['DeliveryDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeleteNewBornDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public async GetFacilityInfoDashBoard(req: BaseRequest): Promise<any> {
        let newBornCount = await this.Items.count({
            where: {
                'Status': 1,
                'DeliveryDate': { '$gt': req.Data.FromDate, '$lte': req.Data.ToDate },
                'FacilityId': req.Data.FacilityId,
            }
        });
        return { 'NewBornCount': newBornCount };
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<NewBornDetailFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetNewBornDetails(apiReq);
        return { [key]: val.Data };
    }
    public async PrintNewBornDetail(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: NewBornDetailFilters.Id, Value: req.Id }]
        };
        let data = await this.GetNewBornDetails(apiReq);
        let NewBornDetail = data.Data[0];
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: NewBornDetail.PatientId }]
        };
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: NewBornDetail.PatientId });
        let facilityPreferenceBO = BoFactory.GetBo(Userbo.FacilityPreferenceBo, this.Request);
        let printPreferencesData =
            await facilityPreferenceBO.GetFacilityPreferenceWithLogo(NewBornDetail.FacilityId);
        let info = {
            NewBornDetail: NewBornDetail,
            Encounter: encounterData.Data[0],
            Patient: patientData,
            Preferences: printPreferencesData
        };
        return await Report.Generate('newborndetail', { header: {}, body: info });
    }
    public GetModel(): SStatic.Model<NewBornDetailInstance, NewBornDetailAttributes> {
        return this.Models.NewBornDetail;
    }
}
