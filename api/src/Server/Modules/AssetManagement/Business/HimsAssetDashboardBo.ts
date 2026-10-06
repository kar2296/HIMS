import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { AssetInstance, AssetAttributes } from '../Model/Interface/Index';
import * as manageassetbo from './Index';

export class AssetDashboardBo extends BaseBo<AssetInstance, AssetAttributes> {
    public async GetAssetDashboardOptions(req: BaseRequest): Promise<Record<string, any>> {
        const infoResponses: Record<string, any> = {};
        const filterAttributes = req?.Attributes ?? {};
        const requestKeys = req?.Data?.Keys ?? [];

        if (!Array.isArray(requestKeys) || requestKeys.length === 0) {
            return infoResponses;
        }

        const assetRegistry = this.getAssetRegistry();

        const promises = requestKeys.map(async (infoRequest: any) => {
            let itemKey = '';
            let itemData: any = null;

            try {
                if (!infoRequest || typeof infoRequest.Key !== 'string') {
                    throw new Error('Invalid request item: missing or invalid Key');
                }

                itemKey = infoRequest.Key;
                const factoryMethod = assetRegistry[itemKey];

                if (!factoryMethod) {
                    throw new Error('AssetDashboardRegistry does not contain the specified Key');
                }

                const businessObject = factoryMethod();
                if (!businessObject) {
                    throw new Error('Failed to create business object');
                }

                const requestData: BaseRequest = {
                    Data: filterAttributes,
                    Attributes: filterAttributes
                } as BaseRequest;

                const methodResult = businessObject.GetAssetInfoDashBoard?.(requestData);

                if (methodResult instanceof Promise) {
                    itemData = await methodResult;
                } else {
                    itemData = methodResult;
                }

                return { success: true, itemKey: itemKey, itemData: itemData };
            } catch (error) {
                console.error('Error processing request:', error);
                itemData = {
                    error: true,
                    message: error instanceof Error ? error.message : 'Unknown error'
                };
                return { success: false, itemKey: itemKey || 'unknown', itemData: itemData };
            }
        });

        const results = await Promise.all(promises);

        for (let i = 0; i < results.length; i++) {
            const currentResult = results[i];
            const resultKey = currentResult.itemKey;
            const resultData = currentResult.itemData;
            infoResponses[resultKey] = resultData;
        }

        return infoResponses;
    }

    public GetModel(): SStatic.Model<AssetInstance, AssetAttributes> {
        return this.Models.Asset;
    }

    private getAssetRegistry(): Record<string, () => any> {
        return {
            assetbo: () => BoFactory.GetBo(manageassetbo.AssetBo, this.Request),
            assettransferbo: () => BoFactory.GetBo(manageassetbo.AssetTransferBo, this.Request),
            servicerequestbo: () => BoFactory.GetBo(manageassetbo.ServiceRequestBo, this.Request),
            assetauditbo: () => BoFactory.GetBo(manageassetbo.AssetAuditBo, this.Request),
            assetdisposebo: () => BoFactory.GetBo(manageassetbo.AssetDisposeBo, this.Request),
            assetwarrentybo: () => BoFactory.GetBo(manageassetbo.AssetWarrantyBo, this.Request),
        };
    }
}
