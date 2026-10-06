import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { PatientOrderInstance, PatientOrderAttributes } from '../../EMR/Model/Interface/Index';
import * as patemrbo from '../../EMR/Business/Index';
import * as lisbo from '../../LIS/Business/Index';

export class LABDashboardBo extends BaseBo<PatientOrderInstance, PatientOrderAttributes>  {

    public async GetLABDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req?.Data?.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getLABDashboardRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetLABInfoDashBoard({ Data: filterAttributes } || { Data: {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'LABDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<PatientOrderInstance, PatientOrderAttributes> {
        return this.Models.PatientOrder;
    }

    private getLABDashboardRegistry(): { [key: string]: () => any } {
        return {
            patientorderbo: () => BoFactory.GetBo(patemrbo.PatientOrderDetailBo, this.Request),
            workordersamplebo: () => BoFactory.GetBo(lisbo.WorkOrderSampleDetailBo, this.Request),
            patientworkorderbo: () => BoFactory.GetBo(lisbo.PatientWorkorderdetailsBo, this.Request),
            patientorderdetailbo: () => BoFactory.GetBo(patemrbo.PatientOrderDetailBo, this.Request),
        };
    }

}
