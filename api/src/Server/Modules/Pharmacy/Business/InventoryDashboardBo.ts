import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { ItemMasterInstance, ItemMasterAttributes } from '../../Pharmacy/Model/Interface/Index';
import * as inventorybo from '../../Pharmacy/Business/Index';

const InventoryDashboardRegistry: { [key: string]: (request: any) => any } = {
    purchaseorderbo: (request: any) => BoFactory.GetBo(inventorybo.PurchaseOrderBo, request),
    grnbo: (request: any) => BoFactory.GetBo(inventorybo.GrnBo, request),
    purchaserequestbo: (request: any) => BoFactory.GetBo(inventorybo.PurchaseRequestBo, request),
    stockrequestbo: (request: any) => BoFactory.GetBo(inventorybo.StockRequestBo, request),
    stocktransferbo: (request: any) => BoFactory.GetBo(inventorybo.StockTransferBo, request),
    purchasereturnbo: (request: any) => BoFactory.GetBo(inventorybo.PurchaseReturnBo, request),
};


export class InventoryDashboardBo extends BaseBo<ItemMasterInstance, ItemMasterAttributes>  {

    public async GetInventoryDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        let filterAttributes = req.Attributes;
        let requestKeys: any = req.Data.Keys;

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                let func = InventoryDashboardRegistry[item.Key];
                if (func) {
                    let bo = func(this.Request);
                    infoResponses[item.Key] = await bo.GetInventoryDashBoardInfo({ Data: filterAttributes } || { Data: {} });
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'InventoryDashboardRegistry does not contain Key:' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<ItemMasterInstance, ItemMasterAttributes> {
        return this.Models.ItemMaster;
    }

}
