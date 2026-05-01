import {BaseService, BoFactory} from '../../Base/Index';
import { DrugAlertBo} from '../Business/Index';
import {ApiRequest, BaseRequest} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { DrugAlertAttributes} from '../Model/Interface/Index';
import { DrugAlertFilters } from '../Common/Filters.e';

export class DrugAlertService extends BaseService {
    private DrugAlertBo: DrugAlertBo;
    constructor(req?: Request) {
        super(req);
        this.DrugAlertBo = BoFactory.GetBo(DrugAlertBo, this.Request);
    }

    public async AddDrugAlert(req: BaseRequest): Promise<number> {
        return await this.DrugAlertBo.AddDrugAlert(req);
    }

    public async UpdateDrugAlert(req: BaseRequest): Promise<boolean> {
        return await this.DrugAlertBo.UpdateDrugAlert(req);
    }

    public async GetDrugAlertById(req: BaseRequest): Promise<DrugAlertAttributes> {
        return await this.DrugAlertBo.GetDrugAlertById(req);
    }

    public async GetDrugAlerts(apiReq?: ApiRequest<DrugAlertFilters>): Promise<Array<DrugAlertAttributes>> {
        return await this.DrugAlertBo.GetDrugAlerts(apiReq);
    }

    public async DeleteDrugAlert(req: BaseRequest): Promise<Boolean> {
        return await this.DrugAlertBo.DeleteDrugAlert(req);
    }
}
