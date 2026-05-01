import { BaseRequest } from '../../../../Common/Index';

export class GuarantorFormat {
    public static heading: any = [];
    //heading: ['ActiveStatus','Code'] // patientcular fields only display
    public async GuarantorValidation(req: BaseRequest): Promise<any[]> {
        let isERPValid: boolean = true;
        let AllGurantorFormat: any = [];
        try {
            if (req.Data.Itemdatas) {
                let items = req.Data.Itemdatas;
                for (var i = 0; i < items.length; i++) {
                    let GurantorFormat = {
                        ActiveStatus: items[i].ActiveStatus.Description,
                        AddressLine1: items[i].AddressLine1,
                        AddressLine2: items[i].AddressLine2,
                        Area: items[i].Area,
                        AvailableLimit: items[i].AvailableLimit,
                        BusinessDevelopmentManager: items[i].BusinessDevelopmentManager,
                        CityMaster: items[i].CityMaster,
                        Code: items[i].Code,
                        ContractDate: items[i].ContractDate,
                        ContractExpiryDate: items[i].ContractExpiryDate,
                        CountryMaster: items[i].CountryMaster,
                        CreditAccountNo: items[i].CreditAccountNo,
                        CreditLimit: items[i].CreditLimit,
                        DebitAccountNo: items[i].DebitAccountNo,
                        Email: items[i].Email,
                        GuarantorClientTypeId: items[i].GuarantorClientTypeId,
                        GuarantorName: items[i].GuarantorName,
                        GuarantorType: items[i].GuarantorType.Description,
                        Phone: items[i].Phone,
                        TPA: items[i].TPA.Description
                    };
                    AllGurantorFormat.push(GurantorFormat);
                }
            }
        } catch (e) {
            isERPValid = false;
            console.log('error : ' + e);
        }

        return AllGurantorFormat;
    }
}
