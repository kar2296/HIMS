import {BaseService, BoFactory } from '../../Base/Index';
import { PatientAlertReviewBo } from '../Business/Index';
import { BaseRequest } from '../../../Common/Index';
import { Request } from '../../../Core/Index';
import { PatientAlertReviewAttributes } from '../Model/Interface/Index';

export class PatientAlertReviewService extends BaseService {
    private PatientAlertReviewBo: PatientAlertReviewBo;
    constructor(req?: Request) {
        super(req);
        this.PatientAlertReviewBo = BoFactory.GetBo(PatientAlertReviewBo, this.Request);
    }

    public async AddPatientAlertReview(req: BaseRequest): Promise<number> {
        return await this.PatientAlertReviewBo.AddPatientAlertReview(req);
    }

    public async UpdatePatientAlertReview(req: BaseRequest): Promise<boolean> {
        return await this.PatientAlertReviewBo.UpdatePatientAlertReview(req);
    }

    public async ManagePatientAlertReviews(req: BaseRequest): Promise<boolean> {
        return await this.PatientAlertReviewBo.ManagePatientAlertReviews(req);
    }

    public async GetPatientAlertReviewById(req: BaseRequest): Promise<PatientAlertReviewAttributes> {
        return await this.PatientAlertReviewBo.GetPatientAlertReviewById(req);
    }

    public async DeletePatientAlertReview(req: BaseRequest): Promise<Boolean> {
        return await this.PatientAlertReviewBo.DeletePatientAlertReview(req);
    }
}
