import { BaseRequest } from '../../../../Common/Index';
import * as moment from 'moment';

export class FinanceReceivableFormat {
    public static Customerheading: any = [
        'No.', 'Name', 'Address', 'City', 'Phone No.', 'Customer Posting Group',
        'Payment Terms Code', 'Gen. Bus. Posting Group', 'VAT Bus. Posting Group'
    ];
    public static Financeheading: any = [
        'Journal Template Name', 'Journal Batch Name', 'Line No', 'Account Type', 'Account No',
        'Posting Date', 'Document Type', 'Document No', 'Bal Account No', 'Amount',
        'Credit Amount', 'Business Unit Code', 'Dimension Code', 'Dimension Value Code',
        'Bal Account Type', 'Payment Method Code', 'Dimension Set ID'
    ];

    public async CustomerValidation(req: BaseRequest): Promise<any[]> {
        let isERPValid: boolean = true;
        let AllFinanceReceivableFormat: any = [];
        try {
            if (req.Data.Itemdatas) {
                let items = req.Data.Itemdatas;
                for (let i = 0; i < items.length; i++) {
                    let PatientName = '';
                    let MRN = '';
                    let Address = '';
                    let mobileno = '';
                    let vcity = '';
                    if (items[i].PatientId > 0) {
                        MRN = items[i].Patient.MRN || '';
                        PatientName = '' + (items[i].Patient.Title ? items[i].Patient.Title.Description : '') + '. ' +
                            (items[i].Patient.FirstName || '') + '  ' + (items[i].Patient.LastName || '');
                        if (items[i].Patient.Address1)
                            Address += items[i].Patient.Address1;
                        if (items[i].Patient.Address2)
                            Address += items[i].Patient.Address2;
                        if (items[i].Patient.mobile)
                            mobileno = items[i].Patient.mobile;
                        if (items[i].Patient.City)
                            vcity = items[i].Patient.City;
                    } else {
                        PatientName = '' + (items[i].PatientName);
                    }

                    let vCustomer_Posting_Group = items[i].Customer_Posting_Group || '';
                    let vPayment_Terms_Code = items[i].Payment_Terms_Code || '';
                    let vGen_Bus_Posting_Group = items[i].Gen_Bus_Posting_Group || '';
                    let vVAT_Bus_Posting_Group = items[i].VAT_Bus_Posting_Group || '';
                    let alreadyexist = 0;
                    for (let mrni = 0; mrni < AllFinanceReceivableFormat.length; mrni++) {
                        if (AllFinanceReceivableFormat[mrni]['No.'] === MRN) {
                            alreadyexist = 1;
                        }
                    }

                    if (alreadyexist === 0) {
                        let Customer = {
                            'No.': MRN,
                            'Name': PatientName,
                            'Address': Address,
                            'City': vcity,
                            'Phone No.': mobileno,
                            'Customer Posting Group': vCustomer_Posting_Group,
                            'Payment Terms Code': vPayment_Terms_Code,
                            'Gen. Bus. Posting Group': vGen_Bus_Posting_Group,
                            'VAT Bus. Posting Group': vVAT_Bus_Posting_Group
                        };
                        AllFinanceReceivableFormat.push(Customer);
                    }
                }


            }
        } catch (e) {
            isERPValid = false;
            console.log('error : ' + e);
        }

        return AllFinanceReceivableFormat;
    }

    public async FinanceReceivableValidation(req: BaseRequest): Promise<any[]> {
        let isERPValid: boolean = true;
        let AllFinanceReceivableFormat: any = [];
        try {
            if (req.Data.Itemdatas) {
                let items = req.Data.Itemdatas;
                for (let i = 0; i < items.length; i++) {
                    let PatientName = '';
                    let MRN = '';
                    if (items[i].PatientId > 0) {
                        MRN = items[i].Patient.MRN || '';
                        PatientName = '' + (items[i].Patient.Title ? items[i].Patient.Title.Description : '') + '. ' +
                            (items[i].Patient.FirstName || '') + '  ' + (items[i].Patient.LastName || '');
                    } else {
                        PatientName = '' + (items[i].PatientName);
                    }
                    let paytype = '';
                    if (items[i].PaymentType)
                        paytype = items[i].PaymentType.Description;

                    let FinanceReceivableFormat = {
                        'Journal Template Name': items[i].Journal_Template_Name,
                        'Journal Batch Name': paytype,
                        'Line No': items[i].Line_No,// + (i + 1),
                        'Account Type': items[i].Account_Type,
                        'Account No': items[i].Account_No || '',//MRN,
                        'Posting Date': moment(new Date()).format('YYYY-MM-DD'),
                        'Document Type': items[i].Document_Type,
                        'Document No': items[i].ReceiptNumber || '',
                        'Bal Account No': items[i].Bal_Account_No,
                        'Amount': -1 * items[i].AmountPaid,
                        'Credit Amount': items[i].AmountPaid,
                        'Business Unit Code': items[i].Business_Unit_Code,
                        'Dimension Code': items[i].Department.DepartmentCode,
                        'Dimension Value Code': items[i].Department.DepartmentName,
                        'Bal Account Type': items[i].Bal_Account_Type,
                        'Payment Method Code': items[i].Payment_Method_Code,
                        'Dimension Set ID': items[i].Dimension_Set_ID
                    };
                    AllFinanceReceivableFormat.push(FinanceReceivableFormat);
                }

            }
        } catch (e) {
            isERPValid = false;
            console.log('error : ' + e);
        }

        return AllFinanceReceivableFormat;
    }
}
