import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { PatientAlertReviewInstance, PatientAlertReviewAttributes } from '../Model/Interface/Index';

export class PatientAlertReviewBo extends BaseBo<PatientAlertReviewInstance, PatientAlertReviewAttributes>  {
    public async AddPatientAlertReview(req: BaseRequest): Promise<number> {
        let result = await this.Save(req.Data);
        return result.dataValues.Id;
    }

    public async UpdatePatientAlertReview(req: BaseRequest): Promise<boolean> {
        let result = await this.Update(req.Data);
        return result;
    }

    public async ManagePatientAlertReviews(req: BaseRequest): Promise<boolean> {
        var details: PatientAlertReviewAttributes[] = req.Data;
        let promises: Array<any> = [];
        details.forEach(detail => {
            detail.ReviewedOn = new Date();
            promises.push(this.Save(detail));
        });
        await Promise.all(promises);
        return true;
    }

    public async GetUserReviewedAlerts(userId: number): Promise<number[]> {
        let result: Array<number> = [];
        let response = await this.FindAll({
            where: {
                UserId: userId
            },
            attributes: ['PatientAlertId']
        });
        response.forEach((res) => {
            let attribs = this.GetAttribute(res);
            result.push(attribs.PatientAlertId);
        });
        return result;
    }

    public async GetPatientAlertReviewById(req: BaseRequest): Promise<PatientAlertReviewAttributes> {
        let result = await this.GetById(req.Id);
        return this.GetAttribute(result);
    }

    public async DeletePatientAlertReview(req: BaseRequest): Promise<Boolean> {
        return await this.MarkAsDelete(req.Id);
    }

    public GetModel(): SStatic.Model<PatientAlertReviewInstance, PatientAlertReviewAttributes> {
        return this.Models.PatientAlertReview;
    }
}
