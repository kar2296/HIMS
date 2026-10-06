import * as SStatic from 'sequelize';
import { BaseBo, IOptionProvider } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { BaseRequest, ApiRequest, ApiResponse } from '../../../Common/Index';
import { PatientWorkOrderAntibioticsInstance, PatientWorkOrderAntibioticsAttributes } from '../Model/Interface/Index';
import { PatientWorkOrderAntibioticsFilters } from '../Common/Filters.e';

export class PatientWorkOrderAntibioticsBo extends BaseBo<PatientWorkOrderAntibioticsInstance,
    PatientWorkOrderAntibioticsAttributes> implements IOptionProvider {
    public async AddPatientWorkOrderAntibiotics(req: BaseRequest): Promise<number> {
        if (req.Data) {
            if (req.Data.length > 0) {
                await this.ManagePatientWorkOrderAntibiotics(req.Data);
                return req.Data[0].PatientId;
            }
        }
        return 0;
        // let result = await this.Save(req.Data);
        // return result.dataValues.Id;
    }

    public async UpdatePatientWorkOrderAntibiotics(req: BaseRequest): Promise<boolean> {
        this.HandleActiveState(req.Data);
        let result = await this.Update(req.Data);
        return result;
    }
    public async ManagePatientWorkOrderAntibiotics(req: BaseRequest): Promise<boolean> {
        let details: PatientWorkOrderAntibioticsAttributes[] = req.Data || [];
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.Id = detail.Id || 0;
            if (detail.Status === 2 && detail.Id !== 0) {
                promises.push(this.MarkAsDelete(detail.Id));
            } else if (detail.Id === 0) {
                promises.push(this.Save(detail));
            } else if (detail.Id > 0) {
                promises.push(this.Update(detail));
            }
        });
        await Promise.all(promises);
        return true;
    }

    // public async ManagePatientWorkOrderAntibiotics(details: PatientWorkOrderAntibioticsAttributes[])
    //     : Promise<boolean> {
    //     details = details || [];
    //     await Promise.all(details.map((DetailItem): Promise<void> => {
    //         return (async (detail): Promise<void> => {
    //             detail.Id = detail.Id || 0;
    //             if (detail.Status === 2 && detail.Id !== 0) {
    //                 await this.MarkAsDelete(detail.Id);
    //             } else if (detail.Id === 0) {
    //                 await this.Save(detail);
    //             } else if (detail.Id > 0) {
    //                 await this.Update(detail);
    //             }
    //         })(DetailItem);
    //     }));
    //     return true;
    // }
    public async GetPatientWorkOrderAntibioticsById(req: BaseRequest): Promise<PatientWorkOrderAntibioticsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientWorkOrderAntibioticss(apiReq?: ApiRequest<PatientWorkOrderAntibioticsFilters>):
        Promise<ApiResponse<PatientWorkOrderAntibioticsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        // include.push(this.GetReference('ActiveStatus'));
        // include.push(this.GetReference('AntibioticType'));
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientWorkOrderAntibioticsFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientWorkOrderAntibioticsFilters.WorkorderId:
                        where['WorkOrderId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });

    }

    public async DeletePatientWorkOrderAntibiotics(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientWorkOrderAntibioticsInstance, PatientWorkOrderAntibioticsAttributes> {
        return this.Models.PatientWorkOrderAntibiotics;
    }

    public async GetOptions(key: string, apiReq?: ApiRequest<PatientWorkOrderAntibioticsFilters>): Promise<any> {
        apiReq.Attributes = apiReq.Attributes || ['Id', ['AntibioticName', 'Text'], 'Code'];
        let val = await this.GetPatientWorkOrderAntibioticss(apiReq);
        return { [key]: val.Data };
    }
}
