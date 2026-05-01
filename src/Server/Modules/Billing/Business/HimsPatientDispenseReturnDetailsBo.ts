import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { WhereOptions, IncludeOptions } from '../../../Core/Index';
import { ApiResponse, BaseRequest, ApiRequest } from '../../../Common/Index';
import { PatientDispenseReturnDetailsInstance, PatientDispenseReturnDetailsAttributes } from '../Model/Interface/Index';
import { PatientDispenseReturnDetailFilters } from '../Common/Filters.e';

export class PatientDispenseReturnDetailsBo extends BaseBo<PatientDispenseReturnDetailsInstance, PatientDispenseReturnDetailsAttributes>  {
    public async AddPatientDispenseReturnDetails(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientDispenseReturnDetails(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientDispenseReturnDetails(PatientDispenseReturnId: number,
        details: PatientDispenseReturnDetailsAttributes[]): Promise<boolean> {
        details = details || [];
        await Promise.all(details.map((DetailItem): Promise<void> => {
            return (async (detail): Promise<void> => {
                detail.Id = detail.Id || 0;
                detail.PatientDispenseReturnId = PatientDispenseReturnId;
                detail.DispenseReturnDateTime = new Date();
                if (detail.Status === 2 && detail.Id !== 0) {
                    await this.MarkAsDelete(detail.Id);
                } else if (detail.Id === 0) {
                    let result = await this.Save(detail);
                    detail.Id = result.dataValues.Id;
                } else if (detail.Id > 0) {
                    await this.Update(detail);
                }
            })(DetailItem);
        }));
        return true;
    }

    /*
    public async ManagePatientDispenseReturnedItemDetails(PatientDispenseReturnId: number, request: any): Promise<any> {
        let details: Array<any> = request.Details;
        await Promise.all(details.map(item => {
            return (async (detail) => {
                await this.ManagePatientDispenseReturnedItem(PatientDispenseReturnId, request, detail);
            })(item);
        }));
    }

    public async ManagePatientDispenseReturnedItem(PatientDispenseReturnId: number, request: any, detail: any): Promise<void> {
        let PatientDispenseReturnDetailId = detail.Id;
        if (PatientDispenseReturnDetailId > 0) {
            let PatientDispenseReturnDetailedItem =
            await this.GetPatientDispenseReturnDetailsById({ Id: PatientDispenseReturnDetailId });
            PatientDispenseReturnDetailedItem.AcceptedQuantity =
            PatientDispenseReturnDetailedItem.AcceptedQuantity + detail.AcceptedQuantity;
            PatientDispenseReturnDetailedItem.TransitQuantity = 0;
            await this.Update(PatientDispenseReturnDetailedItem);
        }
    }
    */

    public async GetPatientDispenseReturnDetailsById(req: BaseRequest): Promise<PatientDispenseReturnDetailsAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async GetPatientDispenseReturnDetails(apiReq?: ApiRequest<PatientDispenseReturnDetailFilters>):
        Promise<ApiResponse<PatientDispenseReturnDetailsAttributes[]>> {
        let where: WhereOptions<any> = {};
        let include: Array<IncludeOptions> = [];
        include.push({ model: this.Models.PatientStockReturnDetails, required: false });
        apiReq.Params.forEach((param) => {
            if (this.IsValidParam(param)) {
                switch (param.Key) {
                    case PatientDispenseReturnDetailFilters.Id:
                        where['Id'] = param.Value;
                        break;
                    case PatientDispenseReturnDetailFilters.PatientDispenseReturnId:
                        where['PatientDispenseReturnId'] = param.Value;
                        break;
                    case PatientDispenseReturnDetailFilters.ItemMasterId:
                        where['ItemMasterId'] = param.Value;
                        break;
                    default:
                        throw 'Not Implemented';
                }
            }
        });
        return await this.FindAndCountAll(apiReq, { where: where, include: include, attributes: apiReq.Attributes });
    }

    public async DeletePatientDispenseReturnDetails(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientDispenseReturnDetailsInstance, PatientDispenseReturnDetailsAttributes> {
        return this.Models.PatientDispenseReturnDetails;
    }

}
