import { BaseService, BoFactory } from '../../Base/Index';
import { PatientWorkorderBo } from '../Business/Index';
import { ApiRequest, BaseRequest, ApiResponse } from '../../../Common/Index';
import { Request, FileInfo } from '../../../Core/Index';
import { PatientWorkorderAttributes } from '../Model/Interface/Index';
import { PatientWorkorderFilters } from '../Common/Filters.e';

export class PatientWorkorderService extends BaseService {
    private PatientWorkorderBo: PatientWorkorderBo;
    constructor(req?: Request) {
        super(req);
        this.PatientWorkorderBo = BoFactory.GetBo(PatientWorkorderBo, this.Request);
    }

    public async AddPatientWorkorder(req: BaseRequest): Promise<number> {
        return await this.PatientWorkorderBo.AddPatientWorkorder(req);
    }

    public async UpdatePatientWorkorder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.UpdatePatientWorkorder(req);
    }

    public async UpdatePrintPatientWorkorder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.UpdatePrintPatientWorkorder(req);
    }

    public async AssignExternalProvider(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.AssignExternalProvider(req);
    }

    public async CompleteExternalProvider(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.CompleteExternalProvider(req);
    }

    public async ManagePatientWorkOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.ManagePatientWorkOrder(req);
    }

    public async GetPatientWorkorderById(req: BaseRequest): Promise<PatientWorkorderAttributes> {
        return await this.PatientWorkorderBo.GetPatientWorkorderById(req);
    }

    public async GetPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        return await this.PatientWorkorderBo.GetPatientWorkorders(apiReq);
    }

    public async GetMinPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        return await this.PatientWorkorderBo.GetMinPatientWorkorders(apiReq);
    }

    public async GetVirtualPatientWorkorders(apiReq?: ApiRequest<PatientWorkorderFilters>):
        Promise<ApiResponse<PatientWorkorderAttributes[]>> {
        return await this.PatientWorkorderBo.GetVirtualPatientWorkorders(apiReq);
    }

    public async DeletePatientWorkorder(req: BaseRequest): Promise<Boolean> {
        return await this.PatientWorkorderBo.DeletePatientWorkorder(req);
    }

    public async AssignOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.AssignOrder(req);
    }

    public async AssignOrderById(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.AssignOrderById(req);
    }

    public async AcceptOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.AcceptOrder(req);
    }

    public async updateOrderStatus(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.updateOrderStatus(req);
    }

    public async AcceptVirtualOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.AcceptVirtualOrder(req);
    }

    public async CancelOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.CancelOrder(req);
    }

    public async CancelBillOrder(req: BaseRequest): Promise<boolean> {
        return await this.PatientWorkorderBo.CancelBillOrder(req);
    }

    public async DispatchResult(req: BaseRequest): Promise<Boolean> {
        return await this.PatientWorkorderBo.DispatchResult(req);
    }

    public async PrintExternallabSlip(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintExternallabSlip(req);
    }
    public async PrintPatientWorkorder(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintPatientWorkorder(req);
    }
    public async PrintPatientWorkorderArray(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintPatientWorkorderArray(req);
    }
    public async PrintPatientWorkorderWithoutheader(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintPatientWorkorderWithoutheader(req);
    }
    public async PrintVirtualPatientWorkorder(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintVirtualPatientWorkorder(req);
    }
    public async Printmicrobiology(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.Printmicrobiology(req);
    }
    public async Printpathaology(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.Printpathaology(req);
    }
    public async PrintExternalLab(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintExternalLab(req);
    }
    public async Printecho(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.Printecho(req);
    }
    public async printWorkSheet(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.printWorkSheet(req);
    }
    public async Printendoscopy(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.Printendoscopy(req);
    }
    public async PrintERCP(req: BaseRequest): Promise<FileInfo> {
        return await this.PatientWorkorderBo.PrintERCP(req);
    }
    public async PrintLabRedoReport(apiReq?: ApiRequest<PatientWorkorderFilters>): Promise<any> {
        return await this.PatientWorkorderBo.PrintLabRedoReport(apiReq);
    }
}
