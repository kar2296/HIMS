import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientEstimationDetailsAttributes, PatientEstimationDetailsInstance } from '../Model/Interface/Index';
import { PatientEstimationDetailsFilters } from '../Common/Filters.e';

export class PatientEstimationDetailsBo extends BaseBo<PatientEstimationDetailsInstance, PatientEstimationDetailsAttributes>  {
    public async AddPatientEstimationDetails(req: BaseRequest): Promise<any> {
        try {
            this.HandleActiveState(req.Data);
            let result = await this.Save(req.Data);
            return {
                message: 'data saved successfully',
                data: result.dataValues.Id
            };
        } catch (error) {
            return {
                message: error.message,
                data: null
            };
        }
    }

    public async UpdatePatientEstimationDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientEstimationDetails(PatientEstimationId: number, details:
         PatientEstimationDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientEstimationId = PatientEstimationId;
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    await this.Save(detail);
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    public async GetPatientEstimationDetailsById(req: BaseRequest): Promise<PatientEstimationDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientEstimationDetails(apiReq?: ApiRequest<PatientEstimationDetailsFilters>):
        Promise<ApiResponse<PatientEstimationDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push(this.GetReference('BedType'));
        include.push({
            model: this.Models.PatientEstimation,
            attributes: ['PatientEstimationId'],
            required: false
        });
        include.push({
            model: this.Models.ServiceGroupRateMapping,
            attributes: ['ServiceGroupId','ServiceGroup','BedTypeId','Amount'],
            required: false
        });
        if (apiReq && apiReq.Params && Array.isArray(apiReq.Params)) {
            apiReq.Params.forEach((param) => {
                if (this.IsValidParam(param)) {
                    switch (param.Key) {
                        case PatientEstimationDetailsFilters.Id:
                            where['PatientEstimationDetailsId'] = param.Value;
                            break;
                        case PatientEstimationDetailsFilters.PatientEstimationId:
                            where['PatientEstimationId'] = param.Value;
                            break;
                        default:
                            throw 'Not Implemented';
                    }
                }
            });
        } else {
            console.error('apiReq.Params is undefined, null, or not an array');
        }
        return await this.FindAndCountAll(apiReq, { where: where, attributes: apiReq.Attributes });
    }

    public async DeletePatientEstimationDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientEstimationDetailsInstance, PatientEstimationDetailsAttributes> {
        return this.Models.PatientEstimationDetails;
    }

}
