import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { ItemMasterInstance, ItemMasterAttributes } from '../../Pharmacy/Model/Interface/Index';
import * as appoinmentbo from '../../Appointment/Business/Index';
import * as patientorderbo from '../../EMR/Business/Index';
import * as inpatientbo from '../../Visit/Business/Index';
import * as patientdietorderbo from '../../EMR/Business/Index';
import * as stockrequestbo from '../../Pharmacy/Business/Index';
import * as stockreceivebo from '../../Pharmacy/Business/Index';

export class DietDashboardBo extends BaseBo<ItemMasterInstance, ItemMasterAttributes>  {

    public async GetDietDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getDietDashboardRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetDietDashboardInfo({ Data: filterAttributes } || { Data: {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'DietDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<ItemMasterInstance, ItemMasterAttributes> {
        return this.Models.ItemMaster;
    }

    private getDietDashboardRegistry(): { [key: string]: () => any } {
        return {
            checkedinpatientbo: () => BoFactory.GetBo(appoinmentbo.AppointmentBo, this.Request),
            appoinmentbo: () => BoFactory.GetBo(appoinmentbo.AppointmentBo, this.Request),
            patientdietorderbo: () => BoFactory.GetBo(patientdietorderbo.PatientDietOrderBo, this.Request),
            patientorderbo: () => BoFactory.GetBo(patientorderbo.PatientOrderBo, this.Request),
            inpatientbo: () => BoFactory.GetBo(inpatientbo.EncounterBo, this.Request),
            stockrequestbo: () => BoFactory.GetBo(stockrequestbo.StockRequestBo, this.Request),
            stockreceivebo: () => BoFactory.GetBo(stockreceivebo.StockTransferBo, this.Request),
        };
    }

}
