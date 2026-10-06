import {BaseService, BoFactory} from '../../Base/Index';
import { QMSBo} from '../Business/Index';
import {ApiRequest, BaseRequest, ApiResponse} from '../../../Common/Index';
import {Request} from '../../../Core/Index';
import { QMSAttributes} from '../Model/Interface/Index';
import { QMSFilters } from '../Common/Filters.e';

export class QMSService extends BaseService {
    private QMSBo: QMSBo;
    constructor(req?: Request) {
        super(req);
        this.QMSBo = BoFactory.GetBo(QMSBo, this.Request);
    }

    public async AddQMS(req: BaseRequest): Promise<number> {
        return await this.QMSBo.AddQMS(req);
    }

    public async createTokenForOldPatient(req: BaseRequest): Promise<number> {
        return await this.QMSBo.createTokenForOldPatient(req);
    }

    public async UpdateQMS(req: BaseRequest): Promise<boolean> {
        return await this.QMSBo.UpdateQMS(req);
    }

    public async GetLastTokenCount(req: BaseRequest): Promise<QMSAttributes> {
        return await this.QMSBo.GetLastTokenCount();
    }

    public async GetQMSById(req: BaseRequest): Promise<QMSAttributes> {
        return await this.QMSBo.GetQMSById(req);
    }

    public async GetQMS(apiReq?: ApiRequest<QMSFilters>): Promise<ApiResponse<QMSAttributes[]>> {
        return await this.QMSBo.GetQMS(apiReq);
    }

    public async DeleteQMS(req: BaseRequest): Promise<Boolean> {
        return await this.QMSBo.DeleteQMS(req);
    }
}
