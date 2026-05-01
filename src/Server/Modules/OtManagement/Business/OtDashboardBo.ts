import * as SStatic from 'sequelize';
import { BaseBo } from '../../Base/Index';
import { BaseRequest } from '../../../Common/Index';
import { BoFactory } from '../../Base/Business/Index';
import { OtRequestInstance, OtRequestAttributes } from '../Model/Interface/Index';
import * as otmanagementbo from '../../OtManagement/Business/Index';
import * as otbedmanagementbo from '../../GeneralMaster/Business/Index';
import * as medicinerequestbo from '../../IPManagement/Business/Index';
import * as labresultbo from '../../EMR/Business/Index';
import * as mrdrequestbo from '../../IPManagement/Business/Index';
import * as otworklistbo from '../../Visit/Business/Index';

export class OtDashboardBo extends BaseBo<OtRequestInstance, OtRequestAttributes> {

    // ALL PUBLIC METHODS FIRST - TSLint requirement
    public async GetOtDashboardOptions(req: BaseRequest): Promise<any> {
        let infoResponses: any = {};

        // Add null/undefined checks
        let filterAttributes = req?.Attributes;
        let requestKeys: any = req?.Data?.Keys;

        // Check if requestKeys exists and is an array
        if (!requestKeys || !Array.isArray(requestKeys)) {
            throw { code: 'INVALID_REQUEST', message: 'Request keys are missing or invalid' };
        }

        const registry = this.getOtDashboardRegistry();

        await Promise.all(requestKeys.map((infoRequest: any): Promise<void> => {
            return (async (item): Promise<void> => {
                // Add null check for item and item.Key
                if (!item?.Key) {
                    throw { code: 'INVALID_KEY', message: 'Request item key is missing' };
                }

                let func = registry[item.Key];
                if (func) {
                    let bo = func();
                    if (bo) {
                        bo.Request = filterAttributes;
                        try {
                            infoResponses[item.Key] = await bo.GetOtDashboardInfo({ Data: filterAttributes } || { Data: {} });
                        } catch (error) {
                            // Handle potential errors from GetOtDashboardInfo
                            infoResponses[item.Key] = { error: 'Failed to get dashboard info', details: error };
                        }
                    } else {
                        throw { code: 'BO_CREATION_FAILED', message: 'Failed to create business object for key: ' + item.Key };
                    }
                } else {
                    throw { code: 'KEY_NOT_FOUND', message: 'OtDashboardRegistry does not contain Key: ' + item.Key };
                }
            })(infoRequest);
        }));
        return infoResponses;
    }

    public GetModel(): SStatic.Model<OtRequestInstance, OtRequestAttributes> {
        return this.Models.OtRequest;
    }

    // ALL PRIVATE METHODS AFTER PUBLIC METHODS - TSLint requirement
    private getOtDashboardRegistry(): { [key: string]: () => any } {
        return {
            otregisterbo: () => BoFactory.GetBo(otmanagementbo.SurgeryEntryBo, this.Request),
            otrequestbo: () => BoFactory.GetBo(otmanagementbo.OtRequestBo, this.Request),
            otworklistbo: () => BoFactory.GetBo(otworklistbo.EncounterBo, this.Request),
            otschedulebo: () => BoFactory.GetBo(otmanagementbo.OtScheduleBo, this.Request),
            otbedmanagementbo: () => BoFactory.GetBo(otbedmanagementbo.WardMasterBo, this.Request),
            otconformationbo: () => BoFactory.GetBo(otmanagementbo.OtRequestBo, this.Request),
            medicinerequestbo: () => BoFactory.GetBo(medicinerequestbo.PatientStockRequestsBo, this.Request),
            // pharmachydispensebo: () => BoFactory.GetBo(medicinerequestbo.PatientStockRequestsBo, this.Request),
            radiologyimagingbo: () => BoFactory.GetBo(labresultbo.PatientOrderBo, this.Request),
            labresultbo: () => BoFactory.GetBo(labresultbo.PatientOrderBo, this.Request),
            mrdrequestbo: () => BoFactory.GetBo(mrdrequestbo.FileRequestBo, this.Request),
            endoscopybo: () => BoFactory.GetBo(labresultbo.PatientOrderBo, this.Request),
        };
    }

}
