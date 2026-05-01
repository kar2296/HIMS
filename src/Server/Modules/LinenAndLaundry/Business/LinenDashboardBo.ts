import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { LinenStockEntryInstance, LinenStockEntryAttributes } from '../Model/Interface/Index';
import * as linenandlaundrybo from '../../LinenAndLaundry/Business/Index';

export class LinenDashboardBo extends BaseBo<LinenStockEntryInstance, LinenStockEntryAttributes>  {

    public async GetLinenDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req?.Data?.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = this.getLinenDashboardRegistry()[item.Key];
                if (func) {
                    let bo = func();
                    bo.Request = filterAttributes;
                    infoResponses[item.Key] = await bo.GetLinenDashboardInfo({ Data: filterAttributes } || { Data: {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'LinenDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<LinenStockEntryInstance, LinenStockEntryAttributes> {
        return this.Models.LinenStockEntry;
    }

    private getLinenDashboardRegistry(): { [key: string]: () => any } {
        return {
            stockentrybo: () => BoFactory.GetBo(linenandlaundrybo.LinenStockEntryBo, this.Request),
            issuebookbo: () => BoFactory.GetBo(linenandlaundrybo.LinenStockTransferBo, this.Request),
            receiptbo: () => BoFactory.GetBo(linenandlaundrybo.LinenStockTransferBo, this.Request),
            stockstatusbo: () => BoFactory.GetBo(linenandlaundrybo.LinenStockItemsBo, this.Request),
        };
    }

}
