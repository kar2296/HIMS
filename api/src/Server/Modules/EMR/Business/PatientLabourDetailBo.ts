import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions, Report, FileInfo } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientLabourDetailInstance, PatientLabourDetailAttributes } from '../Model/Interface/Index';
import { PatientLabourDetailFilters } from '../Common/Filters.e';
import { BoFactory } from '../../Base/Business/Index';
import * as encbo from '../../Visit/Business/Index';
import { EncounterFilters } from '../../Visit/Common/Filters.e';
import * as regbo from '../../Registration/Business/Index';

export class PatientLabourDetailBo extends BaseBo<PatientLabourDetailInstance, PatientLabourDetailAttributes> implements IOptionProvider {
    public async AddPatientLabourDetail(req: BaseRequest): Promise<number> {
        this.HandleActiveState(req.Data);
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientLabourDetail(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }

    public async GetPatientLabourDetailById(req: BaseRequest): Promise<PatientLabourDetailAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientLabourDetails(apiReq?: ApiRequest<PatientLabourDetailFilters>):
        Promise<ApiResponse<PatientLabourDetailAttributes[]>> {
        let where: WhereOptions<any>= {};
        let include: Array<IncludeOptions> = [];
        let order: Array<any> = [];
        // include.push(this.GetReference('Gender'));
        include.push(this.GetReference('ModeOfDelivery'));
        include.push(this.GetReference('LabourStatus'));
        include.push(this.GetReference('GABy'));
        include.push(this.GetReference('Presentation'));
        include.push(this.GetReference('Indication'));
        include.push(this.GetReference('Labour'));
        include.push(this.GetReference('MembraneRuptured'));
        include.push(this.GetReference('AmnoticFluid'));
        include.push(this.GetReference('UserType'));
        include.push(this.GetReference('PlacentaMembranes'));
        include.push(this.GetReference('GrossAppearance'));
        include.push(this.GetReference('PostPartumCondition'));
        include.push(this.GetReference('Assistant'));
        include.push({
            model: this.Models.User, as: 'Doctor', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'Anesthesiologist', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        include.push({
            model: this.Models.User, as: 'ScrubNurse', attributes: ['FirstName', 'LastName'], required: false,
            include: [this.GetReference('Title')]
        });
        // include.push({
        //     model: this.Models.User, as: 'Pediatrician', attributes: ['FirstName', 'LastName'], required: false,
        //     include: [this.GetReference('Title')]
        // });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientLabourDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientLabourDetailFilters.PatientId:
                        where['PatientId'] = param.Value;
                        break;
                    case PatientLabourDetailFilters.LMPDate:
                        where['LMPDate'] = param.Value;
                        break;
                    case PatientLabourDetailFilters.LabourStatusId:
                        where['LabourStatusId'] = param.Value;
                        break;
                    case PatientLabourDetailFilters.ModeOfDeliveryId:
                        where['ModeOfDeliveryId'] = param.Value;
                        break;
				    case PatientLabourDetailFilters.From:
                        where['LMPDate'] = where['LMPDate'] || {};
                        (where['LMPDate'] as any)['$gte'] = param.Value;
                        break;
                    case PatientLabourDetailFilters.To:
                        where['LMPDate'] = where['LMPDate'] || {};
                        (where['LMPDate'] as any)['$lte'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        order.push(['LMPDate', 'DESC']);
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes, order: order });
    }

    public async DeletePatientLabourDetail(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }
    public async PrintPatientLabourDetail(req: BaseRequest): Promise<FileInfo> {
        let apiReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: PatientLabourDetailFilters.Id, Value: req.Id }]
        };
        let data = await this.GetPatientLabourDetails(apiReq);
        let PatientLabourDetail = data.Data[0];
        let encounterBo = BoFactory.GetBo(encbo.EncounterBo, this.Request);
        let encReq = {
            Id: 0,
            PageContext: { PageSize: 50, PageNumber: 1 },
            Params: [{ Key: EncounterFilters.PatientId, Value: PatientLabourDetail.PatientId }]
        };
        let encounterData = await encounterBo.GetEncounters(encReq);
        let patientBo = BoFactory.GetBo(regbo.PatientBo, this.Request);
        let patientData = await patientBo.GetPatientById({ Id: PatientLabourDetail.PatientId });
        let info = {
            PatientLabourDetail: PatientLabourDetail,
            Encounter: encounterData.Data[0],
            Patient: patientData,

        };

        return await Report.Generate('labourdetail', { header: {}, body: info });
    }
    public async GetOptions(key: string, apiReq?: ApiRequest<PatientLabourDetailFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id'];
        let val = await this.GetPatientLabourDetails(apiReq);
        return { [key]: val.Data };
    }

    public GetModel(): SStatic.Model<PatientLabourDetailInstance, PatientLabourDetailAttributes> {
        return this.Models.PatientLabourDetail;
    }
}
