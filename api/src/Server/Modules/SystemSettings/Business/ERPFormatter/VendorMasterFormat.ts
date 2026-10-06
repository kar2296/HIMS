import { BaseRequest } from '../../../../Common/Index';
import * as moment from 'moment';

export class VendorMasterFormat {
    public static heading: any = [];
    public async VendorMasterValidation(req: BaseRequest): Promise<any[]> {
        let isERPValid: boolean = true;
        let AllVendorMasterFormat: any = [];
        try {
            if (req.Data.Itemdatas) {
                let item = req.Data.Itemdatas;
                for (var i = 0; i < item.length; i++) {
                    let VendorMasterFormat = {
                        ActiveFrom: moment(item[i].ActiveFrom).format('YYYY-MM-DD HH:mm:ss'),
                        ActiveStatus: item[i].ActiveStatus.Description,
                        ActiveTo: item[i].ActiveTo,
                        AddressLine1: item[i].AddressLine1,
                        AddressLine2: item[i].AddressLine2,
                        AddressLine3: item[i].AddressLine3,
                        Area: item[i].Area,
                        BusinessDomain: item[i].BusinessDomain,
                        City: item[i].City,
                        Comments: item[i].Comments,
                        ContactPerson: item[i].ContactPerson,
                        Country: item[i].Country,
                        EmailAddress: item[i].EmailAddress,
                        FacilityId: item[i].FacilityId,
                        FaxNumber: item[i].FaxNumber,
                        LeadTime: item[i].LeadTime,
                        LicenceCode: item[i].LicenceCode,
                        MobileNumber: item[i].MobileNumber,
                        PaymentTermsDesc: item[i].PaymentTerms.Description,
                        PhoneNumber: item[i].PhoneNumber,
                        VendorCode: item[i].VendorCode,
                        VendorDescription: item[i].VendorDescription,
                        VendorName: item[i].VendorName,
                        VendorTypeDesc: item[i].VendorType.Description,
                        VendorUrl: item[i].VendorUrl
                    };
                    AllVendorMasterFormat.push(VendorMasterFormat);
                }
            }
        } catch (e) {
            isERPValid = false;
            console.log('error : ' + e);
        }

        return AllVendorMasterFormat;
    }
}
