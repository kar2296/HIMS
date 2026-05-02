(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dotmatrixprintcontroller', dotmatrixprintcontroller);

    function dotmatrixprintcontroller($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getDMPrintCtrl({
            $scope: $scope
        }));

        /* DOT Matrix  Common Variables */
        var totalpaperwidth = 135;
        var totalpaperwidthForSmall = 55;
        var totalpaperwidthForMedium = 75;
        var totalpaperwidthForLotus = 85;
        var totalpaperwidthForBigFont = 44;

        var dmSchemaConfig = { // 135 - total width
            row: {
                cols: [{
                    field: 'slno',
                    width: '5',
                    cwidth: '5',
                    align: 'right',
                    calign: 'left',
                    display: 'S.N'
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'desc',
                    width: '26',
                    cwidth: '26',
                    align: 'left',
                    calign: 'left',
                    display: '  Desc  '
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'hsn',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'HSN'
                },
                {
                    field: 'sch',
                    width: '5',
                    cwidth: '5',
                    align: 'left',
                    calign: 'left',
                    display: 'Sch'
                },
                {
                    field: 'batch',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'Batch'
                },
                {
                    field: 'exp',
                    width: '10',
                    cwidth: '16',
                    align: 'left',
                    calign: 'left',
                    display: 'Exp'
                },
                {
                    field: 'mrp',
                    width: '12',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'MRP'
                },
                {
                    field: 'qty',
                    width: '8',
                    cwidth: '8',
                    align: 'right',
                    calign: 'left',
                    display: 'Qty'
                },
                // {
                //     field: 'cgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'CGST'
                // },
                // {
                //     field: 'sgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'SGST'
                // },
                {
                    field: 'amount',
                    width: '15',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'Amount'
                }
                ]
            }
        };

        var dmSchemaConfig_SecondRow = { // 135 - total width
            row: {
                cols: [{
                    field: 'slno',
                    width: '5',
                    cwidth: '5',
                    align: 'right',
                    calign: 'left',
                    display: 'S.N'
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'desc',
                    width: '26',
                    cwidth: '26',
                    align: 'left',
                    calign: 'left',
                    display: '  Desc  '
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'hsn',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'HSN'
                },
                {
                    field: 'sch',
                    width: '5',
                    cwidth: '5',
                    align: 'left',
                    calign: 'left',
                    display: 'Sch'
                },
                {
                    field: 'batch',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'Batch'
                },
                {
                    field: 'exp',
                    width: '10',
                    cwidth: '16',
                    align: 'left',
                    calign: 'left',
                    display: 'Exp'
                },
                {
                    field: 'mrp',
                    width: '12',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'MRP'
                },
                {
                    field: 'qty',
                    width: '8',
                    cwidth: '8',
                    align: 'right',
                    calign: 'left',
                    display: 'Qty'
                },
                // {
                //     field: 'cgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'CGST'
                // },
                // {
                //     field: 'sgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'SGST'
                // },
                {
                    field: 'amount',
                    width: '15',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'Amount'
                }
                ]
            }
        };
        var dmSchemaConfig_ThirdRow = { // 135 - total width
            row: {
                cols: [{
                    field: 'slno',
                    width: '5',
                    cwidth: '5',
                    align: 'right',
                    calign: 'left',
                    display: 'S.N'
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'desc',
                    width: '26',
                    cwidth: '26',
                    align: 'left',
                    calign: 'left',
                    display: '  Desc  '
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'hsn',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'HSN'
                },
                {
                    field: 'sch',
                    width: '5',
                    cwidth: '5',
                    align: 'left',
                    calign: 'left',
                    display: 'Sch'
                },
                {
                    field: 'batch',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'Batch'
                },
                {
                    field: 'exp',
                    width: '10',
                    cwidth: '16',
                    align: 'left',
                    calign: 'left',
                    display: 'Exp'
                },
                {
                    field: 'mrp',
                    width: '12',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'MRP'
                },
                {
                    field: 'qty',
                    width: '8',
                    cwidth: '8',
                    align: 'right',
                    calign: 'left',
                    display: 'Qty'
                },
                // {
                //     field: 'cgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'CGST'
                // },
                // {
                //     field: 'sgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'SGST'
                // },
                {
                    field: 'amount',
                    width: '15',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'Amount'
                }
                ]
            }
        };

        var dmSchemaConfig_AmountDeviation = { // 135 - total width
            row: {
                cols: [{
                    field: 'slno',
                    width: '5',
                    cwidth: '5',
                    align: 'right',
                    calign: 'left',
                    display: 'S.N'
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'desc',
                    width: '26',
                    cwidth: '26',
                    align: 'left',
                    calign: 'left',
                    display: '  Desc  '
                },
                {
                    field: 'ispace',
                    width: '1',
                    cwidth: '1',
                    align: 'left',
                    calign: 'left',
                    display: ''
                },
                {
                    field: 'hsn',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'HSN'
                },
                {
                    field: 'sch',
                    width: '5',
                    cwidth: '5',
                    align: 'left',
                    calign: 'left',
                    display: 'Sch'
                },
                {
                    field: 'batch',
                    width: '12',
                    cwidth: '12',
                    align: 'left',
                    calign: 'left',
                    display: 'Batch'
                },
                {
                    field: 'exp',
                    width: '10',
                    cwidth: '16',
                    align: 'left',
                    calign: 'left',
                    display: 'Exp'
                },
                {
                    field: 'mrp',
                    width: '12',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'MRP'
                },
                {
                    field: 'qty',
                    width: '8',
                    cwidth: '8',
                    align: 'right',
                    calign: 'left',
                    display: 'Qty'
                },
                // {
                //     field: 'cgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'CGST'
                // },
                // {
                //     field: 'sgstamt',
                //     width: '12',
                //     cwidth: '12',
                //     align: 'right',
                //     calign: 'left',
                //     display: 'SGST'
                // },
                {
                    field: 'amount',
                    width: '15',
                    cwidth: '12',
                    align: 'right',
                    calign: 'left',
                    display: 'Amount'
                }
                ]
            }
        };

        var A5WithHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            // var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            // var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 30) + printCodes.new_line;
            heading2 = leftPad(heading2, 30) + printCodes.new_line;
            heading3 = leftPad(heading3, 26) + printCodes.new_line;
            heading4 = leftPad(heading4, 32) + printCodes.new_line;
            heading5 = leftPad(heading5, 28) + printCodes.new_line;



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 75);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 12);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 43);

            // LicenseNo = rightPad(LicenseNo, 10);
            // LicenseNo += ":";
            // var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); 
            // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            // GSTNo = rightPad(GSTNo, 10);
            // GSTNo += ":";
            // var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); 
            // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LicenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var EastCoastA5WithHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            if (dmPrintInput.header.BillType) {
                var heading5 = dmPrintInput.header.BillType;
            } else {
                var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');
            }

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            // var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            // var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = [rightPad(' ', 31), rightPad(heading1, 28), rightPad(' ', 31), printCodes.new_line].join('');
            heading2 = [rightPad(' ', 23), rightPad(heading2, 44), rightPad(' ', 23), printCodes.new_line].join('');
            heading3 = [rightPad(' ', 15), rightPad(heading3, 98), rightPad(' ', 0), printCodes.new_line].join('');
            heading4 = [rightPad(' ', 15), rightPad(heading4, 76), rightPad(' ', 7), printCodes.new_line].join('');
            heading5 = [rightPad(' ', 39), rightPad(heading5, 12), rightPad(' ', 39), printCodes.new_line].join('');



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 75);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 12);
            DoctorName += ":";
            var vDoctorName = '';
            if (dmPrintInput.header.IsDirectDGBill == 1) {
                vDoctorName = rightPad(dmPrintInput.header.ReferralName, 43);
            } else {
                vDoctorName = rightPad(dmPrintInput.header.prescribedby, 43);
            }
            // LicenseNo = rightPad(LicenseNo, 10);
            // LicenseNo += ":";
            // var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); 
            // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            // GSTNo = rightPad(GSTNo, 10);
            // GSTNo += ":";
            // var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); 
            // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblBillNO, vlblBillNO, '', BillDate, vBillDate, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, printCodes.new_line].join(''));
            // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LiFcenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var A4WithHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblGuarantorName = 'Guarantor';
            var lblEmployeeNo = 'Employee No';
            var lblGLNo = 'GL No';


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 65) + printCodes.new_line;
            heading2 = leftPad(heading2, 40) + printCodes.new_line;
            heading3 = leftPad(heading3, 34) + printCodes.new_line;
            heading4 = leftPad(heading4, 47) + printCodes.new_line;
            heading5 = leftPad(heading5, 67) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            lblGuarantorName = rightPad(lblGuarantorName, 17);
            lblGuarantorName += ":";
            var vGuarantorName = rightPad(dmPrintInput.header.PatientGuarantorName, 39);
            lblEmployeeNo = rightPad(lblEmployeeNo, 15);
            lblEmployeeNo += ":";
            var vEmployeeNo = rightPad(dmPrintInput.header.EmployeeId, 22);
            lblGLNo = rightPad(lblGLNo, 15);
            lblGLNo += ":";
            var vGLNo = rightPad(dmPrintInput.header.GuarantorLetterNo, 22);

            var GuarantorTypeId = dmPrintInput.header.GuarantorTypeId;

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            if (GuarantorTypeId == 3) {
                printData.push([lblGuarantorName, vGuarantorName, '', lblEmployeeNo, vEmployeeNo, lblGLNo, vGLNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            }
            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LicenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var A4WithoutHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            // var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            // heading1 = heading1 || '';
            // var storeheading1 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
            //     storeheading1 = dmPrintInput.header.vStoreheading1
            //     heading1 = storeheading1;
            // }

            // var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            // heading2 = heading2 || '';
            // var storeheading2 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
            //     storeheading2 = dmPrintInput.header.vStoreheading2
            //     heading2 = storeheading2;
            // }

            // var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            // heading3 = heading3 || '';
            // var storeheading3 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
            //     storeheading3 = dmPrintInput.header.vStoreheading3
            //     heading3 = storeheading3;
            // }

            // var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            // heading4 = heading4 || '';
            // var storeheading4 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
            //     storeheading4 = dmPrintInput.header.vStoreheading4
            //     heading4 = storeheading4;
            // }

            // if (dmPrintInput.header.nostoreheader) {
            //     heading1 = '';
            //     heading2 = '';
            //     heading3 = '';
            //     heading4 = '';
            // }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblGuarantorName = 'Guarantor';
            var lblEmployeeNo = 'Employee No';
            var lblGLNo = 'GL No';


            // var h1midplace = getCenterPositionforDMPrint(heading1);
            // var h2midplace = getCenterPositionforDMPrint(heading2);
            // var h3midplace = getCenterPositionforDMPrint(heading3);
            // var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            // heading1 = leftPad(heading1, h1midplace) + printCodes.new_line;
            // heading2 = leftPad(heading2, h2midplace) + printCodes.new_line;
            // heading3 = leftPad(heading3, h3midplace) + printCodes.new_line;
            // heading4 = leftPad(heading4, h4midplace) + printCodes.new_line;
            heading5 = leftPad(heading5, h5midplace) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            lblGuarantorName = rightPad(lblGuarantorName, 17);
            lblGuarantorName += ":";
            var vGuarantorName = rightPad(dmPrintInput.header.PatientGuarantorName, 39);
            lblEmployeeNo = rightPad(lblEmployeeNo, 15);
            lblEmployeeNo += ":";
            var vEmployeeNo = rightPad(dmPrintInput.header.EmployeeId, 22);
            lblGLNo = rightPad(lblGLNo, 15);
            lblGLNo += ":";
            var vGLNo = rightPad(dmPrintInput.header.GuarantorLetterNo, 22);

            var GuarantorTypeId = dmPrintInput.header.GuarantorTypeId;

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push('');
            printData.push('');
            printData.push('');
            printData.push('');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            if (GuarantorTypeId == 3) {
                printData.push([lblGuarantorName, vGuarantorName, '', lblEmployeeNo, vEmployeeNo, lblGLNo, vGLNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            }
            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LicenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var MithraA4WithHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }
            if (dmPrintInput.header.BillType) {
                var heading5 = dmPrintInput.header.BillType;
            } else {
                var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');
            }

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblGuarantorName = 'Guarantor';
            var lblEmployeeNo = 'Employee No';
            var lblGLNo = 'GL No';


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 65) + printCodes.new_line;
            heading2 = leftPad(heading2, 40) + printCodes.new_line;
            heading3 = leftPad(heading3, 34) + printCodes.new_line;
            heading4 = leftPad(heading4, 47) + printCodes.new_line;
            heading5 = leftPad(heading5, 67) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            lblGuarantorName = rightPad(lblGuarantorName, 17);
            lblGuarantorName += ":";
            var vGuarantorName = rightPad(dmPrintInput.header.PatientGuarantorName, 39);
            lblEmployeeNo = rightPad(lblEmployeeNo, 15);
            lblEmployeeNo += ":";
            var vEmployeeNo = rightPad(dmPrintInput.header.EmployeeId, 22);
            lblGLNo = rightPad(lblGLNo, 15);
            lblGLNo += ":";
            var vGLNo = rightPad(dmPrintInput.header.GuarantorLetterNo, 22);

            var GuarantorTypeId = dmPrintInput.header.GuarantorTypeId;

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            if (GuarantorTypeId == 3) {
                printData.push([lblGuarantorName, vGuarantorName, '', lblEmployeeNo, vEmployeeNo, lblGLNo, vGLNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            }
            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LicenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };


        var KumarA4WithHeaderPharmacySalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblGuarantorName = 'Guarantor';
            var lblEmployeeNo = 'Employee No';
            var lblGLNo = 'GL No';


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);


            heading1 = [rightPad(' ', 31), rightPad(heading1, 28), rightPad(' ', 31), printCodes.new_line].join('');
            heading2 = [rightPad(' ', 23), rightPad(heading2, 44), rightPad(' ', 23), printCodes.new_line].join('');
            heading3 = [rightPad(' ', 8), rightPad(heading3, 98), rightPad(' ', 8), printCodes.new_line].join('');
            heading4 = [rightPad(' ', 11), rightPad(heading4, 76), rightPad(' ', 11), printCodes.new_line].join('');
            heading5 = [rightPad(' ', 40), rightPad(heading5, 12), rightPad(' ', 40), printCodes.new_line].join('');



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            lblGuarantorName = rightPad(lblGuarantorName, 17);
            lblGuarantorName += ":";
            var vGuarantorName = rightPad(dmPrintInput.header.PatientGuarantorName, 39);
            lblEmployeeNo = rightPad(lblEmployeeNo, 15);
            lblEmployeeNo += ":";
            var vEmployeeNo = rightPad(dmPrintInput.header.EmployeeId, 22);
            lblGLNo = rightPad(lblGLNo, 15);
            lblGLNo += ":";
            var vGLNo = rightPad(dmPrintInput.header.GuarantorLetterNo, 22);

            var GuarantorTypeId = dmPrintInput.header.GuarantorTypeId;

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            if (GuarantorTypeId == 3) {
                printData.push([lblGuarantorName, vGuarantorName, '', lblEmployeeNo, vEmployeeNo, lblGLNo, vGLNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            }
        };


        var DSMCHPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            //var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');
            var heading5 = 'ISSUE TYPE : ' + (dmPrintInput.header.BillType);
            var heading6 = 'Ph : 04328-254546 / 84899 23828, 70944 66296';

            var lblName = 'Name';
            var lblMRNNO = 'PMRN';
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = 'Ret No';

            var DoctorName = 'Dr';
            var BillDate = 'Ret Date';
            var BillTime = 'Ret Time';

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrintSmall(heading1);
            var h2midplace = getCenterPositionforDMPrintSmall(heading2);
            var h3midplace = getCenterPositionforDMPrintSmall(heading3);
            var h4midplace = getCenterPositionforDMPrintSmall(heading4);
            var h5midplace = getCenterPositionforDMPrintSmall(heading5);
            var h6midplace = getCenterPositionforDMPrintSmall(heading6);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;
            heading6 = leftPad(heading6, h6midplace) + printCodes.new_line;

            lblName = rightPad(lblName, 4);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);
            vPatName = rightPad(vPatName, 28);

            lblMRNNO = rightPad(lblMRNNO, 4);
            lblMRNNO += ":";
            var vMRN = dmPrintInput.header.MRN;
            vMRN = rightPad(vMRN, 28);

            DoctorName = rightPad(DoctorName, 4);
            DoctorName += ":";
            //var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 28);
            var DoctorAndDepartment = '';
            if (dmPrintInput.header.DepartmentName && dmPrintInput.header.DepartmentName != null &&
                dmPrintInput.header.DepartmentName != undefined && dmPrintInput.header.DepartmentName != '') {
                DoctorAndDepartment = dmPrintInput.header.prescribedby + '(' + dmPrintInput.header.DepartmentName + ')';
            } else {
                DoctorAndDepartment = dmPrintInput.header.prescribedby;
            }

            var vDoctorName = rightPad(DoctorAndDepartment, 28);

            BillDate = rightPad(BillDate, 9);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.BillDate, 12);
            BillTime = rightPad(BillTime, 9);
            BillTime += ":";
            var vBillTime = rightPad(dmPrintInput.header.BillTime, 12);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 9);
            lblBillNO += ":";
            var vBillNO = rightPad(dmPrintInput.header.billno, 12);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push(heading6);
            printData.push(heading5);
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([lblMRNNO, vMRN, lblBillNO, vBillNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([lblName, vPatName, BillDate, vBillDate, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, BillTime, vBillTime, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
        };

        var PrimePharmacyScheduletHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            var heading5 = "Pharmacy Schedule Report";

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblsign = "Sign";


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;


            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDrName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 77);

            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vbillno = rightPad(dmPrintInput.header.billno, 22);

            GSTNo = rightPad(GSTNo, 17);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 77); // TinNo


            lblsign = rightPad(lblsign, 15);
            lblsign += ":";
            var vsign = rightPad(dmPrintInput.header.sign, 22);

            printData.push(heading1);
            printData.push(heading2);
            printData.push(heading3);
            printData.push(heading4);
            printData.push(heading5);
            // printData.push([lblName, vPatName, printCodes.new_line].join(''));
            // printData.push([DoctorName, vDrName, lblBillNO, vbillno, printCodes.new_line].join(''));
            // printData.push([GSTNo, vGSTNo, LicenseNo, vLicenseNo, printCodes.new_line].join(''));
            // printData.push([BillDate, vBillDate, lblsign, vsign, printCodes.new_line].join(''));

            // printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
            // printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
            // printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

        };

        var LotusPharmacyScheduletHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = 'LOTUS MEDICALS';
            var heading2 = 'A Unit Of Sanjeevi Healthcare India Pvt Ltd.';
            var heading3 = '90, Thaymanavar Sundaram St, Kollampalayam, Erode - 638002';
            var heading4 = '';
            var FromDate = dmPrintInput.Summary.FromDate;
            var ToDate = dmPrintInput.Summary.ToDate;
            var ScheduleType = dmPrintInput.Summary.ScheduleType;

            if (FromDate != null && FromDate != undefined &&
                FromDate != '') {
                if (ScheduleType != null && ScheduleType != undefined &&
                    ScheduleType != '') {
                    heading4 = 'PHARMACY SCHEDULE ' + ScheduleType + ' REPORT FROM ' + FromDate + ' TO ' + ToDate;
                } else {
                    heading4 = 'PHARMACY SCHEDULE REPORT FROM ' + FromDate + ' TO ' + ToDate;
                }
            } else {
                heading4 = 'PHARMACY SCHEDULE REPORT';
            }

            var h1midplace = getCenterPositionforDMPrintMedium(heading1);
            var h2midplace = getCenterPositionforDMPrintMedium(heading2);
            var h3midplace = getCenterPositionforDMPrintMedium(heading3);
            var h4midplace = getCenterPositionforDMPrintMedium(heading4);

            heading1 = leftPad(heading1, h1midplace) + printCodes.new_line;
            heading2 = leftPad(heading2, h2midplace) + printCodes.new_line;
            heading3 = leftPad(heading3, h3midplace) + printCodes.new_line;
            heading4 = leftPad(heading4, h4midplace) + printCodes.new_line;

            printData.push(String.fromCharCode(27) + String.fromCharCode(69));
            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(' ' + printCodes.new_line);
            printData.push(heading4 || '');
        };

        var PrimeOPBillingHeader = function (printData, dmPrintInput, ri) {
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            var heading5 = "OUTPATIENT BILL";

            var lblName = "Name";
            var lblmobno = "Mobile No";

            var lbladdr1 = "Address1";
            var lbladdr2 = "Address2";
            var lblpincode = "Pincode";
            var lblarea = "Area";
            var lblcity = "City";
            var lblstate = "State";
            var lblcountry = "Country";

            var lblguarantor = "Guarantor";

            var lbldoctorname = "Doctor Name";
            var lblbilldate = "Bill Date";

            var lblBillNO = "Bill No";

            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;


            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width
            lbladdr1 = rightPad(lbladdr1, 17);
            lbladdr1 += ":";
            var vaddr1 = rightPad(dmPrintInput.header.AddressLine1, 77);

            lbladdr2 = rightPad(lbladdr2, 15);
            lbladdr2 += ":";
            var vaddr2 = rightPad(dmPrintInput.header.AddressLine2, 22);

            lblarea = rightPad(lblarea, 17);
            lblarea += ":";
            var varea = rightPad(dmPrintInput.header.Area, 77);



            lblcity = rightPad(lblcity, 15);
            lblcity += ":";
            var vcity = rightPad(dmPrintInput.header.City, 22);


            lblstate = rightPad(lblstate, 17);
            lblstate += ":";
            var vstate = rightPad(dmPrintInput.header.State, 77);


            lblcountry = rightPad(lblcountry, 15);
            lblcountry += ":";
            var vcountry = rightPad(dmPrintInput.header.Country, 22);


            lblpincode = rightPad(lblpincode, 17);
            lblpincode += ":";
            var vpincode = rightPad(dmPrintInput.header.Pincode, 77);



            lblguarantor = rightPad(lblguarantor, 15);
            lblguarantor += ":";
            var vGuarantor = rightPad(dmPrintInput.header.Guarantor, 22);




            lbldoctorname = rightPad(lbldoctorname, 17);
            lbldoctorname += ":";
            var vDrName = rightPad(dmPrintInput.header.prescribedby, 77);




            lblmobno = rightPad(lblmobno, 15);
            lblmobno += ":";
            var vContactNo = rightPad(dmPrintInput.header.Mobile, 22);


            lblbilldate = rightPad(lblbilldate, 17);
            lblbilldate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 77);

            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vbillno = rightPad(dmPrintInput.header.billno, 22);

            printData.push(heading1);
            printData.push(heading2);
            printData.push(heading3);
            printData.push(heading4);
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join(''));
            printData.push([lbladdr1, vaddr1, '', lbladdr2, vaddr2, printCodes.new_line].join(''));
            printData.push([lblarea, varea, lblcity, vcity, printCodes.new_line].join(''));
            printData.push([lblstate, vstate, lblcountry, vcountry, printCodes.new_line].join(''));
            printData.push([lblpincode, vpincode, lblguarantor, vGuarantor, printCodes.new_line].join(''));
            printData.push([lbldoctorname, vDrName, lblmobno, vContactNo, printCodes.new_line].join(''));
            printData.push([lblbilldate, vBillDate, lblBillNO, vbillno, printCodes.new_line].join(''));


        };

        var PrimeIPBillingHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var PrimeMaterialIssueHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = "Stock Transfer";

            var lblFromStore = "From Store";
            var lblIssueNo = "Issue No";
            var lblRequestedBy = "Requested By";

            var lblToStore = "To Store";
            var lblIssueDate = "Issue Date";
            var lblApprovedBy = "ApprovedBy";

            var lblPriority = "Priority";
            var lblIssuedBy = "Issued By";
            var lblRequestedNo = "Requested No";


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblFromStore = rightPad(lblFromStore, 17);
            lblFromStore += ":";
            var vFromStore = rightPad(dmPrintInput.header.vfromstore, 27);

            lblIssueNo = rightPad(lblIssueNo, 17);
            lblIssueNo += ":";
            var vIssueNo = rightPad(dmPrintInput.header.vissueno, 27);

            lblRequestedBy = rightPad(lblRequestedBy, 17);
            lblRequestedBy += ":";
            var vRequestedby = rightPad(dmPrintInput.header.vrequestedby, 27);

            // 17 + 28 + 17 + 28 + 17 + 28 = 135 total width

            lblToStore = rightPad(lblToStore, 17);
            lblToStore += ":";
            var vToStore = rightPad(dmPrintInput.header.vtostore, 27);

            lblIssueDate = rightPad(lblIssueDate, 17);
            lblIssueDate += ":";
            var vIssuedate = rightPad(dmPrintInput.header.vissuedate, 27);

            lblApprovedBy = rightPad(lblApprovedBy, 17);
            lblApprovedBy += ":";
            var vApprovedby = rightPad(dmPrintInput.header.vapprovedby, 27);


            lblPriority = rightPad(lblPriority, 17);
            lblPriority += ":";
            var vPriority = rightPad(dmPrintInput.header.vpriority, 27);

            lblIssuedBy = rightPad(lblIssuedBy, 17);
            lblIssuedBy += ":";
            var vIssuedby = rightPad(dmPrintInput.header.vissuedby, 27);

            lblRequestedNo = rightPad(lblRequestedNo, 17);
            lblRequestedNo += ":";

            if (!dmPrintInput.header.vrequestedno)
                dmPrintInput.header.vrequestedno = '';

            var vRequestedno = rightPad(dmPrintInput.header.vrequestedno, 27);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblFromStore, vFromStore, lblIssueNo, vIssueNo, lblRequestedBy, vRequestedby, printCodes.new_line].join(''));
            printData.push([lblToStore, vToStore, lblIssueDate, vIssuedate, lblApprovedBy, vApprovedby, printCodes.new_line].join(''));
            printData.push([lblPriority, vPriority, lblIssuedBy, vIssuedby, lblRequestedNo, vRequestedno, printCodes.new_line].join(''));


        };

        var PrimePatientDispenseHeader = function (printData, dmPrintInput, ri) {

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = "PATIENT DISPENSE";

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Dispense No"

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = "Dispense Date";

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22);

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join(''));
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join(''));
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join(''));

        };

        var PrimeDirectPharmacyReturnHeader = function (printData, dmPrintInput, ri) {

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;


            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var PrimeGRNHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';

            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';

            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }
            var heading5 = "GOODS RECEIPT NOTE";

            var lblGRNNo = "GRN No";
            var lblStoreName = "Store Name";

            var lblGRNDate = "GRN Date";
            var lblGRNType = "GRN Type";

            var lblVendorName = "Vendor Name";
            var lblInvoiceDate = "Invoice Date";
            var lblInvoiceNo = "Invoice No";

            var lblPODate = "PO Date";
            var lblDCDate = "DC Date";
            var lblDCNo = "DC No";

            var lblPONo = "PO No";
            var lblGPDate = "GP Date";
            var lblGPNo = "GP No";

            var lblOrderBy = "Order By";
            var lblGRNStatus = "GRN Status";

            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblGRNNo = rightPad(lblGRNNo, 17);
            lblGRNNo += ":";
            var vGRNNo = rightPad(dmPrintInput.header.vGRNNo, 77);

            lblStoreName = rightPad(lblStoreName, 15);
            lblStoreName += ":";
            var vStoreName = rightPad(dmPrintInput.header.vStoreName, 22);

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            lblGRNDate = rightPad(lblGRNDate, 17);
            lblGRNDate += ":";
            var vGRNDate = rightPad(dmPrintInput.header.vGRNDate, 77);
            lblGRNType = rightPad(lblGRNType, 15);
            lblGRNType += ":";
            var vGRNType = rightPad(dmPrintInput.header.vGRNType, 22);

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            lblVendorName = rightPad(lblVendorName, 17);
            lblVendorName += ":";
            var vVendorName = rightPad(dmPrintInput.header.vVendorName, 39);
            lblInvoiceDate = rightPad(lblInvoiceDate, 15);
            lblInvoiceDate += ":";
            var vInvoiceDate = rightPad(dmPrintInput.header.vInvoiceDate, 22);
            lblInvoiceNo = rightPad(lblInvoiceNo, 15);
            lblInvoiceNo += ":";
            var vInvoiceNo = rightPad(dmPrintInput.header.vInvoiceNo, 22);

            lblPODate = rightPad(lblPODate, 17);
            lblPODate += ":";
            var vPODate = rightPad(dmPrintInput.header.vPODate, 39);
            lblDCDate = rightPad(lblDCDate, 15);
            lblDCDate += ":";
            var vDCDate = rightPad(dmPrintInput.header.vDCDate, 22);
            lblDCNo = rightPad(lblDCNo, 15);
            lblDCNo += ":";
            var vDCNo = rightPad(dmPrintInput.header.vDCNo, 22);

            lblPONo = rightPad(lblPONo, 17);
            lblPONo += ":";
            var vPONo = ' ';
            if (dmPrintInput.header.vPONo) {
                vPONo = dmPrintInput.header.vPONo;
            }
            vPONo = rightPad(vPONo, 39);
            lblGPDate = rightPad(lblGPDate, 15);
            lblGPDate += ":";
            var vGPDate = rightPad(dmPrintInput.header.vGPDate, 22);
            lblGPNo = rightPad(lblGPNo, 15);
            lblGPNo += ":";
            var vGPNo = rightPad(dmPrintInput.header.vGPNo, 22);

            lblOrderBy = rightPad(lblOrderBy, 17);
            lblOrderBy += ":";
            var vOrderBy = rightPad(dmPrintInput.header.vOrderBy, 77);
            lblGRNStatus = rightPad(lblGRNStatus, 15);
            lblGRNStatus += ":";
            var vGRNStatus = rightPad(dmPrintInput.header.vGRNStatus, 22);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblGRNNo, vGRNNo, lblStoreName, vStoreName, printCodes.new_line].join(''));
            printData.push([lblGRNDate, vGRNDate, lblGRNType, vGRNType, printCodes.new_line].join(''));
            printData.push([lblVendorName, vVendorName, lblInvoiceDate, vInvoiceDate, lblInvoiceNo, vInvoiceNo, printCodes.new_line].join(''));
            printData.push([lblPODate, vPODate, lblDCDate, vDCDate, lblDCNo, vDCNo, printCodes.new_line].join(''));
            printData.push([lblPONo, vPONo, lblGPDate, vGPDate, lblGPNo, vGPNo, printCodes.new_line].join(''));
            printData.push([lblOrderBy, vOrderBy, lblGRNStatus, vGRNStatus, printCodes.new_line].join(''));
        };
        var LOTUSGRNHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';

            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';

            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }
            var heading5 = "GOODS RECEIPT NOTE";

            var lblGRNNo = "GRN No";
            var lblStoreName = "Store Name";

            var lblGRNDate = "GRN Date";
            var lblGRNType = "GRN Type";

            var lblVendorName = "Vendor Name";
            var lblInvoiceDate = "Inv. Date";
            var lblInvoiceNo = "Invoice No";

            var lblPODate = "PO Date";
            var lblDCDate = "DC Date";
            var lblDCNo = "DC No";

            var lblPONo = "PO No";
            var lblGPDate = "GP Date";
            var lblGPNo = "GP No";

            var lblOrderBy = "Order By";
            var lblGRNStatus = "GRN Status";

            var h1midplace = getCenterPositionforDMPrintMedium(heading1);
            var h2midplace = getCenterPositionforDMPrintMedium(heading2);
            var h3midplace = getCenterPositionforDMPrintMedium(heading3);
            var h4midplace = getCenterPositionforDMPrintMedium(heading4);
            var h5midplace = getCenterPositionforDMPrintMedium(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblGRNNo = rightPad(lblGRNNo, 15);
            lblGRNNo += ":";
            var vGRNNo = rightPad(dmPrintInput.header.vGRNNo, 25);
            lblGRNDate = rightPad(lblGRNDate, 10);
            lblGRNDate += ":";
            //var vGRNDate = rightPad(dmPrintInput.header.vGRNDate, 25);
            var vGRNDate = dmPrintInput.header.GRNDateOnly + ' ' + dmPrintInput.header.GRNTime;
            vGRNDate = rightPad(vGRNDate, 25);

            lblVendorName = rightPad(lblVendorName, 15);
            lblVendorName += ":";
            var vVendorName = rightPad(dmPrintInput.header.vVendorName, 25);
            lblStoreName = rightPad(lblStoreName, 10);
            lblStoreName += ":";
            var vStoreName = rightPad(dmPrintInput.header.vStoreName, 25);


            lblGRNType = rightPad(lblGRNType, 15);
            lblGRNType += ":";
            var vGRNType = rightPad(dmPrintInput.header.vGRNType, 25);
            lblGRNStatus = rightPad(lblGRNStatus, 10);
            lblGRNStatus += ":";
            var vGRNStatus = rightPad(dmPrintInput.header.vGRNStatus, 25);

            lblInvoiceNo = rightPad(lblInvoiceNo, 15);
            lblInvoiceNo += ":";
            var vInvoiceNo = rightPad(dmPrintInput.header.vInvoiceNo, 25);
            lblInvoiceDate = rightPad(lblInvoiceDate, 10);
            lblInvoiceDate += ":";
            var InvoiceDateOnly = rightPad(dmPrintInput.header.InvoiceDateOnly, 25);

            lblPONo = rightPad(lblPONo, 15);
            lblPONo += ":";
            var vPONo = ' ';
            if (dmPrintInput.header.vPONo) {
                vPONo = dmPrintInput.header.vPONo;
            }
            vPONo = rightPad(vPONo, 25);
            lblPODate = rightPad(lblPODate, 10);
            lblPODate += ":";
            var vPODate = rightPad(dmPrintInput.header.vPODate, 25);

            lblDCNo = rightPad(lblDCNo, 15);
            lblDCNo += ":";
            var vDCNo = rightPad(dmPrintInput.header.vDCNo, 25);
            lblDCDate = rightPad(lblDCDate, 10);
            lblDCDate += ":";
            var vDCDate = rightPad(dmPrintInput.header.vDCDate, 25);

            lblGPNo = rightPad(lblGPNo, 15);
            lblGPNo += ":";
            var vGPNo = rightPad(dmPrintInput.header.vGPNo, 25);
            lblGPDate = rightPad(lblGPDate, 10);
            lblGPDate += ":";
            var vGPDate = rightPad(dmPrintInput.header.vGPDate, 25);

            lblOrderBy = rightPad(lblOrderBy, 15);
            lblOrderBy += ":";
            var vOrderBy = rightPad(dmPrintInput.header.vOrderBy, 30);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push(heading5);

            printData.push([lblGRNNo, vGRNNo, lblGRNDate, vGRNDate, printCodes.new_line].join(''));
            printData.push([lblVendorName, vVendorName, lblStoreName, vStoreName, printCodes.new_line].join(''));
            printData.push([lblGRNType, vGRNType, lblGRNStatus, vGRNStatus, printCodes.new_line].join(''));
            printData.push([lblInvoiceNo, vInvoiceNo, lblInvoiceDate, InvoiceDateOnly, printCodes.new_line].join(''));
            if (vPONo != null && vPONo != 0 && vPONo != '' && vPONo != undefined) {
                printData.push([lblPONo, vPONo, lblPODate, vPODate, printCodes.new_line].join(''));
            }
            if (vGPNo != null && vGPNo != 0 && vGPNo != '' && vGPNo != undefined) {
                printData.push([lblGPNo, vGPNo, lblGPDate, vGPDate, printCodes.new_line].join(''));
            }
            if (vDCNo != null && vDCNo != 0 && vDCNo != '' && vDCNo != undefined) {
                printData.push([lblDCNo, vDCNo, lblDCDate, vDCDate, printCodes.new_line].join(''));
            }
        };

        var PrimePurchaseOrderHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = "PURCHASE ORDER";

            var lblVendorName = "Vendor Name";
            var lblPODate = "PO Date";

            var lblAddress1 = "Address1";
            var lblAddress2 = "Address2";

            var lblStateName = "State Name";
            var lblCountryName = "Country Name";

            var lblPincode = "Pincode";
            var lblPONo = "PO No";

            var lblContactPerson = "Contact Person";
            var lblPOType = "PO Type";

            var lblFacility = "Facility";
            var lblExpDelDate = "ExpDel Date";

            var lblStatus = "Status";
            var lblStore = "Store";

            var lblDeliverStore = "Deliver Store";

            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblVendorName = rightPad(lblVendorName, 17);
            lblVendorName += ":";
            var vVendorName = rightPad(dmPrintInput.header.vVendorName, 77);
            lblPODate = rightPad(lblPODate, 15);
            lblPODate += ":";
            var vPODate = rightPad(dmPrintInput.header.vPODate, 22);

            lblAddress1 = rightPad(lblAddress1, 17);
            lblAddress1 += ":";
            var vAddress1 = rightPad(dmPrintInput.header.vAddress1, 77);
            lblAddress2 = rightPad(lblAddress2, 15);
            lblAddress2 += ":";
            var vAddress2 = rightPad(dmPrintInput.header.vAddress2, 22);

            lblStateName = rightPad(lblStateName, 17);
            lblStateName += ":";
            var vStateName = rightPad(dmPrintInput.header.vStateName, 77);
            lblCountryName = rightPad(lblCountryName, 15);
            lblCountryName += ":";
            var vCountryName = rightPad(dmPrintInput.header.vCountryName, 22);

            lblPincode = rightPad(lblPincode, 17);
            lblPincode += ":";
            var vPincode = rightPad(dmPrintInput.header.vPincode, 77);
            lblPONo = rightPad(lblPONo, 15);
            lblPONo += ":";
            var vPONo = rightPad(dmPrintInput.header.vPONo, 22);

            lblContactPerson = rightPad(lblContactPerson, 17);
            lblContactPerson += ":";
            var vContactPerson = '';
            if (dmPrintInput.header.vContactPerson) {
                vContactPerson = dmPrintInput.header.vContactPerson;
            }
            vContactPerson = rightPad(vContactPerson, 77);

            lblPOType = rightPad(lblPOType, 15);
            lblPOType += ":";
            var vPOType = rightPad(dmPrintInput.header.vPOType, 22);

            lblFacility = rightPad(lblFacility, 17);
            lblFacility += ":";
            var vFacility = rightPad(dmPrintInput.header.vFacility, 77);
            lblExpDelDate = rightPad(lblExpDelDate, 15);
            lblExpDelDate += ":";
            var vExpDelDate = '';
            if (dmPrintInput.header.vExpDelDate, 22) {
                vExpDelDate = dmPrintInput.header.vExpDelDate;
            }

            lblStatus = rightPad(lblStatus, 17);
            lblStatus += ":";
            var vStatus = rightPad(dmPrintInput.header.vStatus, 77);
            lblStore = rightPad(lblStore, 15);
            lblStore += ":";
            var vStore = rightPad(dmPrintInput.header.vStore, 22);

            lblDeliverStore = rightPad(lblDeliverStore, 17);
            lblDeliverStore += ":";
            var vDeliverStore = rightPad(dmPrintInput.header.vDeliverStore, 77);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblVendorName, vVendorName, lblPODate, vPODate, printCodes.new_line].join(''));
            printData.push([lblAddress1, vAddress1, lblAddress2, vAddress2, printCodes.new_line].join(''));
            printData.push([lblStateName, vStateName, lblCountryName, vCountryName, printCodes.new_line].join(''));
            printData.push([lblPincode, vPincode, lblPONo, vPONo, printCodes.new_line].join(''));
            printData.push([lblContactPerson, vContactPerson, lblPOType, vPOType, printCodes.new_line].join(''));
            printData.push([lblFacility, vFacility, lblExpDelDate, vExpDelDate, printCodes.new_line].join(''));
            printData.push([lblStatus, vStatus, lblStore, vStore, printCodes.new_line].join(''));
            printData.push([lblDeliverStore, vDeliverStore, printCodes.new_line].join(''));
        };

        var PrimeIPPharmacyReturnHeader = function (printData, dmPrintInput, ri) {

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');


            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width


        };

        var PrimeStockTransferHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = "Stock Transfer";

            var lblFromStore = "From Store";
            var lblIssueNo = "Issue No";
            var lblRequestedBy = "Requested By";

            var lblToStore = "To Store";
            var lblIssueDate = "Issue Date";
            var lblApprovedBy = "ApprovedBy";

            var lblPriority = "Priority";
            var lblIssuedBy = "Issued By";
            var lblRequestedNo = "Requested No";


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblFromStore = rightPad(lblFromStore, 17);
            lblFromStore += ":";
            var vFromStore = rightPad(dmPrintInput.header.vfromstore, 27);

            lblIssueNo = rightPad(lblIssueNo, 17);
            lblIssueNo += ":";
            var vIssueNo = rightPad(dmPrintInput.header.vissueno, 27);

            lblRequestedBy = rightPad(lblRequestedBy, 17);
            lblRequestedBy += ":";
            var vRequestedby = rightPad(dmPrintInput.header.vrequestedby, 27);

            // 17 + 28 + 17 + 28 + 17 + 28 = 135 total width

            lblToStore = rightPad(lblToStore, 17);
            lblToStore += ":";
            var vToStore = rightPad(dmPrintInput.header.vtostore, 27);

            lblIssueDate = rightPad(lblIssueDate, 17);
            lblIssueDate += ":";
            var vIssuedate = rightPad(dmPrintInput.header.vissuedate, 27);

            lblApprovedBy = rightPad(lblApprovedBy, 17);
            lblApprovedBy += ":";
            var vApprovedby = rightPad(dmPrintInput.header.vapprovedby, 27);


            lblPriority = rightPad(lblPriority, 17);
            lblPriority += ":";
            var vPriority = rightPad(dmPrintInput.header.vpriority, 27);

            lblIssuedBy = rightPad(lblIssuedBy, 17);
            lblIssuedBy += ":";
            var vIssuedby = rightPad(dmPrintInput.header.vissuedby, 27);

            lblRequestedNo = rightPad(lblRequestedNo, 17);
            lblRequestedNo += ":";

            if (!dmPrintInput.header.vrequestedno)
                dmPrintInput.header.vrequestedno = '';

            var vRequestedno = rightPad(dmPrintInput.header.vrequestedno, 27);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblFromStore, vFromStore, lblIssueNo, vIssueNo, lblRequestedBy, vRequestedby, printCodes.new_line].join(''));
            printData.push([lblToStore, vToStore, lblIssueDate, vIssuedate, lblApprovedBy, vApprovedby, printCodes.new_line].join(''));
            printData.push([lblPriority, vPriority, lblIssuedBy, vIssuedby, lblRequestedNo, vRequestedno, printCodes.new_line].join(''));


        };

        var PrimeCustomerSalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var DSMCHCustomerSalesHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');

            var lbldate = $translate.instant('billing.CustomerSales.date.lbl');
            var lblbillnumber = $translate.instant('billing.CustomerSales.billnumber.lbl');
            var vatnumber = $translate.instant('billing.CustomerSales.vatnumber.lbl');
            var CustomerAddress = $translate.instant('billing.CustomerSales.CustomerAddress.lbl');
            var CustomerName = $translate.instant('billing.CustomerSales.CustomerName.lbl');
            var GSTNo = $translate.instant('billing.CustomerSales.gstno.lbl');
            var Mobile = $translate.instant('billing.CustomerSales.mobile.lbl');
            var Phone = $translate.instant('billing.CustomerSales.phone.lbl');
            var Email = $translate.instant('billing.CustomerSales.email.lbl');

            var h1midplace = getCenterPositionforDMPrintMedium(heading1);
            var h2midplace = getCenterPositionforDMPrintMedium(heading2);
            var h3midplace = getCenterPositionforDMPrintMedium(heading3);
            var h4midplace = getCenterPositionforDMPrintMedium(heading4);
            var h5midplace = getCenterPositionforDMPrintMedium(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lbldate = rightPad(lbldate, 10);
            lbldate += ":";
            var vdate = rightPad(dmPrintInput.header.billdate, 25);

            lblbillnumber = rightPad(lblbillnumber, 10);
            lblbillnumber += ":";
            var vbillnumber = rightPad(dmPrintInput.header.billno, 25);

            CustomerName = rightPad(CustomerName, 10);
            CustomerName += ":";
            var vCustomerName = rightPad(dmPrintInput.header.CustomerName, 25);

            CustomerAddress = rightPad(CustomerAddress, 10);
            CustomerAddress += ":";
            var vCustomerAddress = rightPad(dmPrintInput.header.CustomerAddress, 25);

            vatnumber = rightPad(vatnumber, 10);
            vatnumber += ":";
            var vvatnumber = rightPad(dmPrintInput.header.VATNumber, 25);

            Mobile = rightPad(Mobile, 10);
            Mobile += ":";
            var vMobile = rightPad(dmPrintInput.header.CustomerMobile, 25);

            Phone = rightPad(Phone, 10);
            Phone += ":";
            var vPhone = rightPad(dmPrintInput.header.CustomerPhone, 25);

            GSTNo = rightPad(GSTNo, 10);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.GstNo, 25);

            Email = rightPad(Email, 10);
            Email += ":";
            var vEmail = rightPad(dmPrintInput.header.CustomerEmail, 25);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push(' ' + printCodes.new_line);
            printData.push(heading5);
            printData.push(' ' + printCodes.new_line);
            printData.push([CustomerName, vCustomerName, GSTNo, vGSTNo, printCodes.new_line].join(''));
            printData.push([CustomerAddress, vCustomerAddress, Email, vEmail, printCodes.new_line].join(''));
            printData.push([Mobile, vMobile, Phone, vPhone, printCodes.new_line].join(''));
            printData.push([lblbillnumber, vbillnumber, lbldate, vdate, printCodes.new_line].join(''));
        };

        var PrimePatientDispenseView = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = "PATIENT DISPENSE";

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Dispense No"

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = "Dispense Date";

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var A5WithHeaderPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }


            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            // var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            // heading5 = leftPad(heading5, 43) + printCodes.new_line;



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 80);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 12);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 39);

            LicenseNo = rightPad(LicenseNo, 10);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            GSTNo = rightPad(GSTNo, 10);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var A4WithHeaderPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }


            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 30) + printCodes.new_line;
            heading2 = leftPad(heading2, 30) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 30) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 80);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 10);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 41);

            LicenseNo = rightPad(LicenseNo, 10);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            GSTNo = rightPad(GSTNo, 10);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var KumarA4WithHeaderPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }


            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');
            var lblGuarantorName = 'Guarantor';
            var lblEmployeeNo = 'Employee No';
            var lblGLNo = 'GL No';


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 65) + printCodes.new_line;
            heading2 = leftPad(heading2, 57) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 40) + printCodes.new_line;
            heading5 = leftPad(heading5, 70) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 41);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            GSTNo = rightPad(GSTNo, 15);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo

            lblGuarantorName = rightPad(lblGuarantorName, 17);
            lblGuarantorName += ":";
            var vGuarantorName = rightPad(dmPrintInput.header.PatientGuarantorName, 39);
            lblEmployeeNo = rightPad(lblEmployeeNo, 15);
            lblEmployeeNo += ":";
            var vEmployeeNo = rightPad(dmPrintInput.header.EmployeeId, 22);
            lblGLNo = rightPad(lblGLNo, 15);
            lblGLNo += ":";
            var vGLNo = rightPad(dmPrintInput.header.GuarantorLetterNo, 22);

            var GuarantorTypeId = dmPrintInput.header.GuarantorTypeId;

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            if (GuarantorTypeId == 3) {
                printData.push([lblGuarantorName, vGuarantorName, '', lblEmployeeNo, vEmployeeNo, lblGLNo, vGLNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            }
        };

        var A4WithoutHeaderPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            // var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            // heading1 = heading1 || '';
            // var storeheading1 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
            //     storeheading1 = dmPrintInput.header.vStoreheading1
            //     heading1 = storeheading1;
            // }

            // var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            // heading2 = heading2 || '';
            // var storeheading2 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
            //     storeheading2 = dmPrintInput.header.vStoreheading2
            //     heading2 = storeheading2;
            // }

            // var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            // heading3 = heading3 || '';
            // var storeheading3 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
            //     storeheading3 = dmPrintInput.header.vStoreheading3
            //     heading3 = storeheading3;
            // }

            // var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            // heading4 = heading4 || '';
            // var storeheading4 = null;
            // if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
            //     storeheading4 = dmPrintInput.header.vStoreheading4
            //     heading4 = storeheading4;
            // }


            var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opreturnheading');

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = "Return No";

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            // var h1midplace = getCenterPositionforDMPrint(heading1);
            // var h2midplace = getCenterPositionforDMPrint(heading2);
            // var h3midplace = getCenterPositionforDMPrint(heading3);
            // var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            // heading1 = leftPad(heading1, 30) + printCodes.new_line;
            // heading2 = leftPad(heading2, 30) + printCodes.new_line;
            // heading3 = leftPad(heading3, 30) + printCodes.new_line;
            // heading4 = leftPad(heading4, 30) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 80);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 10);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 41);

            LicenseNo = rightPad(LicenseNo, 10);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            GSTNo = rightPad(GSTNo, 10);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push('');
            printData.push('');
            printData.push('');
            printData.push('');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, LicenseNo, vLicenseNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };
        var PrimePOAmendmentHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = "PURCHASE ORDER";

            var lblVendorName = "Vendor Name";
            var lblPODate = "PO Date";

            var lblAddress1 = "Address1";
            var lblAddress2 = "Address2";

            var lblStateName = "State Name";
            var lblCountryName = "Country Name";

            var lblPincode = "Pincode";
            var lblPONo = "PO No";

            var lblContactPerson = "Contact Person";
            var lblPOType = "PO Type";

            var lblFacility = "Facility";
            var lblExpDelDate = "ExpDel Date";

            var lblStatus = "Status";
            var lblStore = "Store";

            var lblDeliverStore = "Deliver Store";

            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;

            lblVendorName = rightPad(lblVendorName, 17);
            lblVendorName += ":";
            var vVendorName = rightPad(dmPrintInput.header.vVendorName, 77);
            lblPODate = rightPad(lblPODate, 15);
            lblPODate += ":";
            var vPODate = rightPad(dmPrintInput.header.vPODate, 22);

            lblAddress1 = rightPad(lblAddress1, 17);
            lblAddress1 += ":";
            var vAddress1 = rightPad(dmPrintInput.header.vAddress1, 77);
            lblAddress2 = rightPad(lblAddress2, 15);
            lblAddress2 += ":";
            var vAddress2 = rightPad(dmPrintInput.header.vAddress2, 22);

            lblStateName = rightPad(lblStateName, 17);
            lblStateName += ":";
            var vStateName = rightPad(dmPrintInput.header.vStateName, 77);
            lblCountryName = rightPad(lblCountryName, 15);
            lblCountryName += ":";
            var vCountryName = rightPad(dmPrintInput.header.vCountryName, 22);

            lblPincode = rightPad(lblPincode, 17);
            lblPincode += ":";
            var vPincode = rightPad(dmPrintInput.header.vPincode, 77);
            lblPONo = rightPad(lblPONo, 15);
            lblPONo += ":";
            var vPONo = rightPad(dmPrintInput.header.vPONo, 22);

            lblContactPerson = rightPad(lblContactPerson, 17);
            lblContactPerson += ":";
            var vContactPerson = '';
            if (dmPrintInput.header.vContactPerson) {
                vContactPerson = dmPrintInput.header.vContactPerson;
            }
            vContactPerson = rightPad(vContactPerson, 77);

            lblPOType = rightPad(lblPOType, 15);
            lblPOType += ":";
            var vPOType = rightPad(dmPrintInput.header.vPOType, 22);

            lblFacility = rightPad(lblFacility, 17);
            lblFacility += ":";
            var vFacility = rightPad(dmPrintInput.header.vFacility, 77);
            lblExpDelDate = rightPad(lblExpDelDate, 15);
            lblExpDelDate += ":";
            var vExpDelDate = '';
            if (dmPrintInput.header.vExpDelDate, 22) {
                vExpDelDate = dmPrintInput.header.vExpDelDate;
            }

            lblStatus = rightPad(lblStatus, 17);
            lblStatus += ":";
            var vStatus = rightPad(dmPrintInput.header.vStatus, 77);
            lblStore = rightPad(lblStore, 15);
            lblStore += ":";
            var vStore = rightPad(dmPrintInput.header.vStore, 22);

            lblDeliverStore = rightPad(lblDeliverStore, 17);
            lblDeliverStore += ":";
            var vDeliverStore = rightPad(dmPrintInput.header.vDeliverStore, 77);

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblVendorName, vVendorName, lblPODate, vPODate, printCodes.new_line].join(''));
            printData.push([lblAddress1, vAddress1, lblAddress2, vAddress2, printCodes.new_line].join(''));
            printData.push([lblStateName, vStateName, lblCountryName, vCountryName, printCodes.new_line].join(''));
            printData.push([lblPincode, vPincode, lblPONo, vPONo, printCodes.new_line].join(''));
            printData.push([lblContactPerson, vContactPerson, lblPOType, vPOType, printCodes.new_line].join(''));
            printData.push([lblFacility, vFacility, lblExpDelDate, vExpDelDate, printCodes.new_line].join(''));
            printData.push([lblStatus, vStatus, lblStore, vStore, printCodes.new_line].join(''));
            printData.push([lblDeliverStore, vDeliverStore, printCodes.new_line].join(''));
        };

        var PrimePharmacyBillDetailsHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            var heading5 = "Pharmacy Bill Details";

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 71);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 34); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 15);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 28);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 16);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 28);
            GSTNo = rightPad(GSTNo, 17);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo



            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, lblBillNO, vlblBillNO, printCodes.new_line].join(''));
            printData.push([GSTNo, vGSTNo, LicenseNo, vLicenseNo, BillDate, vBillDate, printCodes.new_line].join(''));
        };

        var PrimeConsolidatePaymentHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format

            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var heading5 = "Pharmacy Sales Consolidated Bill";

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = leftPad(heading1, 28) + printCodes.new_line;
            heading2 = leftPad(heading2, 33) + printCodes.new_line;
            heading3 = leftPad(heading3, 30) + printCodes.new_line;
            heading4 = leftPad(heading4, 33) + printCodes.new_line;
            heading5 = leftPad(heading5, 30) + printCodes.new_line;



            lblName = rightPad(lblName, 17);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 112);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 17);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 77);

            LicenseNo = rightPad(LicenseNo, 15);
            LicenseNo += ":";
            var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 22); // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 17);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 39);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 15);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 22);
            GSTNo = rightPad(GSTNo, 17);
            GSTNo += ":";
            var vGSTNo = rightPad(dmPrintInput.header.TinNo, 22); // TinNo



            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([lblName, vPatName, printCodes.new_line].join(''));
            printData.push([GSTNo, vGSTNo, LicenseNo, vLicenseNo, printCodes.new_line].join(''));
        };
        /* DOT Matrix  Common Variables */


        $scope.TestPrint = function () {
            // Test Print for print per page Column count and row count
            var data = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
            var data1 = "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            data1 += "1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0\x0A1\x0A2\x0A3\x0A4\x0A5\x0A6\x0A7\x0A8\x0A9\x0A0";
            var printData = []
            printData.push(data);
            printData.push(data1);
            $scope.printRaw(printData);
        };

        $scope.printPharmacySales = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'a5withheader') {
                A5WithHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a5withoutheader') {
                A5WithoutHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a4withoutheader') {
                A4WithoutHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a4withheader') {
                A4WithHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'kumara4withheader') {
                KumarA4WithHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'eastcoasta5withheader') {
                EastCoastA5WithHeaderPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'mithraa4withheader') {
                MithraA4WithHeaderPharmacySales(dmPrintInput);
            }
        };

        $scope.printPharmacyScheduleReport = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePharmacyScheduleReport(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'lotus') {
                LotusPharmacyScheduleReport(dmPrintInput);
            } else {
                GeneralPharmacyScheduleReport(dmPrintInput);
            }
        };

        $scope.printOPBilling = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeOPBillingPrint(dmPrintInput);
            } else {
                GeneralOPBillingPrint(dmPrintInput);
            }
        };

        $scope.printIPPharmacySales = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeIPPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'deepam') {
                DSMCHIPPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'eastcoasta5withheader') {
                EastCoastA5IPPharmacySales(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'rmr') {
                LOTUSIPPharmacySales(dmPrintInput);
            } else {
                GeneralIPPharmacySales(dmPrintInput);
            }
        };

        $scope.printMaterialIssue = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeMaterialIssuePrint(dmPrintInput);
            } else {
                GeneralMaterialIssuePrint(dmPrintInput);
            }
        };

        $scope.printPatientDispense = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePatientDispensePrint(dmPrintInput);
            } else {
                GeneralPatientDispensePrint(dmPrintInput);
            }
        };

        $scope.printDirectPhrmacyReturn = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeDirectPhrmacyReturnPrint(dmPrintInput);
            } else {
                GeneralDirectPhrmacyReturnPrint(dmPrintInput);
            }
        };

        $scope.printGRNDetail = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeGRNPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'deepam') {
                LotusGRNPrint(dmPrintInput);
            } else {
                GeneralGRNPrint(dmPrintInput);
            }
        };

        $scope.printPurchaseOrder = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePurchaseOrderPrint(dmPrintInput);
            } else {
                GeneralPurchaseOrderPrint(dmPrintInput);
            }
        };

        $scope.printIPPharmacyReturn = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeIPPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'deepam') {
                DSMCHIPPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'deepam') {
                LOTUSPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'eastcoasta5withheader') {
                EastCoastA5IPPharmacyReturnPrint(dmPrintInput);
            } else {
                GeneralIPPharmacyReturnPrint(dmPrintInput);
            }
        };

        $scope.printStockTransfer = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeStockTransferPrint(dmPrintInput);
            } else {
                GeneralStockTransferPrint(dmPrintInput);
            }
        };

        $scope.printCustomerSales = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeCustomerSalesPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'deepam') {
                DSMCHCustomerSalesPrint(dmPrintInput);
            } else {
                GeneralCustomerSalesPrint(dmPrintInput);
            }
        };

        $scope.printPatientDispenseView = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePatientDispenseViewPrint(dmPrintInput);
            } else {
                GeneralPatientDispenseViewPrint(dmPrintInput);
            }
        };

        $scope.printPharmcyReturn = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'eastcoasta5withheader') {
                EastCoastA5PharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a5withoutheader') {
                A5WithoutHeaderPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a4withoutheader') {
                A4WithoutHeaderPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'a4withheader') {
                A4WithHeaderPharmacyReturnPrint(dmPrintInput);
            } else if (window.clientcode.toLowerCase() == 'kumara4withheader') {
                KumarA4WithHeaderPharmacyReturnPrint(dmPrintInput);
            }
        };

        $scope.printPurchaseOrderAmendment = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePurchaseOrderAmendmentPrint(dmPrintInput);
            } else {
                GeneralPurchaseOrderAmendmentPrint(dmPrintInput);
            }
        };

        $scope.printPharmacyBillDetails = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimePharmacyBillDetailsPrint(dmPrintInput);
            } else {
                GeneralPharmacyBillDetailsPrint(dmPrintInput);
            }
        };

        $scope.printConsolidatePayment = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'drhms') {
                PrimeConsolidatePaymentPrint(dmPrintInput);
            } else {
                GeneralConsolidatePaymentPrint(dmPrintInput);
            }
        };

        $scope.printPharmacyConsolidatedBill = function (dmPrintInput) {
            if (window.clientcode.toLowerCase() == 'lotus') {
                LotusPharmacyConsolidatedBill(dmPrintInput);
            } else {
                GeneralPharmacyConsolidatedBill(dmPrintInput);
            }
        };




        /* OP Billing Client Method */
        var PrimeOPBillingPrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'Desc',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Desc'
                    },
                    {
                        field: 'ispace',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'Department',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Department'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'qty',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'netamount',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Net Amount'
                    },
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeOPBillingHeader(printData, dmPrintInput, ri);
                    lineno += 8;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billdueamt = dmPrintInput.header.totdueamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var NetAmountInWords = dmPrintInput.header.NetAmountInWords;

            billtotalamt = parseFloat(billtotalamt).toFixed(2);
            billtotaldisamt = parseFloat(billtotaldisamt).toFixed(2);
            billtotrndoffamt = parseFloat(billtotrndoffamt).toFixed(2);
            billnetamt = parseFloat(billnetamt).toFixed(2);
            billPaidAmt = parseFloat(billPaidAmt).toFixed(2);
            billdueamt = parseFloat(billdueamt).toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;
            var LenbillPaidAmt = 11 - ('' + billPaidAmt).length;
            var Lenbilldueamt = 11 - ('' + billdueamt).length;
            var condition1 = "";
            var condition2 = "";
            var condition3 = "";
            var condition4 = "";

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Amount IN Words', 16), rightPad(': Rupees ', 9), rightPad(NetAmountInWords, 80), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Paid Amt', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billPaidAmt, LenbillPaidAmt), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Due Amt', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billdueamt, Lenbilldueamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 16), rightPad(':', 9), rightPad(BilledBy, 80), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };

        var GeneralOPBillingPrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'Desc',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Desc'
                    },
                    {
                        field: 'ispace',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'Department',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Department'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'qty',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'netamount',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Net Amount'
                    },
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeOPBillingHeader(printData, dmPrintInput, ri);
                    lineno += 8;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billdueamt = dmPrintInput.header.totdueamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var NetAmountInWords = dmPrintInput.header.NetAmountInWords;

            billtotalamt = parseFloat(billtotalamt).toFixed(2);
            billtotaldisamt = parseFloat(billtotaldisamt).toFixed(2);
            billtotrndoffamt = parseFloat(billtotrndoffamt).toFixed(2);
            billnetamt = parseFloat(billnetamt).toFixed(2);
            billPaidAmt = parseFloat(billPaidAmt).toFixed(2);
            billdueamt = parseFloat(billdueamt).toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;
            var LenbillPaidAmt = 11 - ('' + billPaidAmt).length;
            var Lenbilldueamt = 11 - ('' + billdueamt).length;
            var condition1 = "";
            var condition2 = "";
            var condition3 = "";
            var condition4 = "";

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Amount IN Words', 16), rightPad(': Rupees ', 9), rightPad(NetAmountInWords, 80), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Paid Amt', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billPaidAmt, LenbillPaidAmt), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Due Amt', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billdueamt, Lenbilldueamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 16), rightPad(':', 9), rightPad(BilledBy, 80), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        /* OP Billing Client Method */

        /* Pharmacy Sales Client Method */
        var A5WithHeaderPharmacySales = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A5WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 60), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            lineno += 4;

            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var EastCoastA5WithHeaderPharmacySales = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    }, {
                        field: 'desc',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    // if (ri > 0) {
                    //     for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                    //         if (viend === 0) {
                    //             printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    //         } else if (viend == 1) {
                    //             printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                    //             printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                    //         } else {
                    //             printData.push(printCodes.new_line);
                    //         }
                    //     }
                    //     lineno = 0; // new page;
                    // }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    EastCoastA5WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            // if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            TotalQuantity = TotalQuantity.toFixed(0);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            GrossAmount = GrossAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbilltotrndoffamtfixed = Lenbilltotrndoffamt.toFixed(3);
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('TOT ITEM', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalNoOfItems, 25), rightPad(' ', 5), rightPad(condition1, 60), rightPad('Gross Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(GrossAmount, 10), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotrndoffamt, Lenbilltotrndoffamtfixed, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('SGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalCGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('CGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalSGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 60), rightPad(' ', 45), rightPad('Total Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billnetamt, 10), printCodes.new_line].join(''));
            printData.push([rightPad('LOGIN ID', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('PAYMENT MODE', 15), rightPad(':', 1), rightPad(vPaymode, 25), printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 24), rightPad('COSTAL MEDICAL WISH YOU A SPEEDY RECOVERY', 42), rightPad(' ', 24), printCodes.new_line].join(''));
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            // lineno += 4;

            // for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
            printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var EastCoastA5PharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    EastCoastA5WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            // if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            TotalQuantity = TotalQuantity.toFixed(0);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            GrossAmount = GrossAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbilltotrndoffamtfixed = Lenbilltotrndoffamt.toFixed(3);
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('TOT ITEM', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalNoOfItems, 25), rightPad(' ', 5), rightPad(condition1, 60), rightPad('Gross Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(GrossAmount, 10), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotrndoffamt, Lenbilltotrndoffamtfixed, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('SGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalCGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('CGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalSGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 60), rightPad(' ', 45), rightPad('Total Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billnetamt, 10), printCodes.new_line].join(''));
            printData.push([rightPad('LOGIN ID', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('PAYMENT MODE', 15), rightPad(':', 1), rightPad(vPaymode, 25), printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 24), rightPad('COSTAL MEDICAL WISH YOU A SPEEDY RECOVERY', 42), rightPad(' ', 24), printCodes.new_line].join(''));
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            // lineno += 4;

            // for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
            printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var EastCoastA5IPPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '7',
                    //     cwidth: '7',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 5;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    EastCoastA5WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            // if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            TotalQuantity = TotalQuantity.toFixed(0);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            GrossAmount = GrossAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbilltotrndoffamtfixed = Lenbilltotrndoffamt.toFixed(3);
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('TOT ITEM', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalNoOfItems, 25), rightPad(' ', 5), rightPad(condition1, 60), rightPad('Gross Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(GrossAmount, 10), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotrndoffamt, Lenbilltotrndoffamtfixed, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('SGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalCGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('CGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalSGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 60), rightPad(' ', 45), rightPad('Total Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billnetamt, 10), printCodes.new_line].join(''));
            printData.push([rightPad('LOGIN ID', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('PAYMENT MODE', 15), rightPad(':', 1), rightPad(vPaymode, 25), printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 24), rightPad('COSTAL MEDICAL WISH YOU A SPEEDY RECOVERY', 42), rightPad(' ', 24), printCodes.new_line].join(''));
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            // lineno += 4;

            // for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
            printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };

        var EastCoastA5IPPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    EastCoastA5WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            // if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            TotalQuantity = TotalQuantity.toFixed(0);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            GrossAmount = GrossAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbilltotrndoffamtfixed = Lenbilltotrndoffamt.toFixed(3);
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('TOT ITEM', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalNoOfItems, 25), rightPad(' ', 5), rightPad(condition1, 60), rightPad('Gross Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(GrossAmount, 10), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 5), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotrndoffamt, Lenbilltotrndoffamtfixed, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('SGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalCGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 60), rightPad(' ', 45), rightPad('CGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalSGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 60), rightPad(' ', 45), rightPad('Total Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billnetamt, 10), printCodes.new_line].join(''));
            printData.push([rightPad('LOGIN ID', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('PAYMENT MODE', 15), rightPad(':', 1), rightPad(vPaymode, 25), printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 24), rightPad('COSTAL MEDICAL WISH YOU A SPEEDY RECOVERY', 42), rightPad(' ', 24), printCodes.new_line].join(''));
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            // lineno += 4;

            // for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
            printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var EastCoastA5WithHeaderPharmacyReturnHeader = function (printData, dmPrintInput, ri) { // Without Pre Print format
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            heading1 = heading1 || '';
            var storeheading1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading1) {
                storeheading1 = dmPrintInput.header.vStoreheading1
                heading1 = storeheading1;
            }

            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            heading2 = heading2 || '';
            var storeheading2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading2) {
                storeheading2 = dmPrintInput.header.vStoreheading2
                heading2 = storeheading2;
            }

            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            heading3 = heading3 || '';
            var storeheading3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading3) {
                storeheading3 = dmPrintInput.header.vStoreheading3
                heading3 = storeheading3;
            }

            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            heading4 = heading4 || '';
            var storeheading4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStoreheading4) {
                storeheading4 = dmPrintInput.header.vStoreheading4
                heading4 = storeheading4;
            }

            if (dmPrintInput.header.nostoreheader) {
                heading1 = '';
                heading2 = '';
                heading3 = '';
                heading4 = '';
            }

            if (dmPrintInput.header.BillType) {
                var heading5 = dmPrintInput.header.BillType;
            } else {
                var heading5 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'opsalesheading');
            }

            var lblName = $translate.instant('billing.pharmacy.lblName.lbl');
            var lblMRNNO = $translate.instant('billing.pharmacy.MRNNO.lbl');
            var OPIPERNO = $translate.instant('billing.pharmacy.OPIPERNO.lbl');

            var lblAgeSex = $translate.instant('billing.pharmacy.lblAgeSex.lbl');
            var lblBillNO = $translate.instant('billing.pharmacy.lblBillNO.lbl');

            var DoctorName = $translate.instant('billing.pharmacy.DoctorName.lbl');
            var BillDate = $translate.instant('billing.pharmacy.BillDate.lbl');

            // var LicenseNo = $translate.instant('billing.pharmacy.LicenseNo.lbl');
            // var GSTNo = $translate.instant('billing.pharmacy.GSTNo.lbl');


            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);

            heading1 = [rightPad(' ', 31), rightPad(heading1, 28), rightPad(' ', 31), printCodes.new_line].join('');
            heading2 = [rightPad(' ', 23), rightPad(heading2, 44), rightPad(' ', 23), printCodes.new_line].join('');
            heading3 = [rightPad(' ', 15), rightPad(heading3, 98), rightPad(' ', 0), printCodes.new_line].join('');
            heading4 = [rightPad(' ', 15), rightPad(heading4, 76), rightPad(' ', 7), printCodes.new_line].join('');
            heading5 = [rightPad(' ', 39), rightPad(heading5, 12), rightPad(' ', 39), printCodes.new_line].join('');



            lblName = rightPad(lblName, 10);
            lblName += ":";
            var vPatName = (dmPrintInput.header.patientname);

            var vAge = '' + dmPrintInput.header.Age;
            var vGender = '' + dmPrintInput.header.Gender;
            if (vGender.toUpperCase() == "MALE") vGender = "M";
            else if (vGender.toUpperCase() == "FEMALE") vGender = "F";
            var vAgeGender = (vAge + '/' + vGender);

            var vMRN = dmPrintInput.header.MRN;

            var vOPIPERNO = (dmPrintInput.header.IPOPNO);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vOPIPERNO.length > 0)
                vPatName = vPatName + ' / ' + vOPIPERNO;


            vPatName = rightPad(vPatName, 75);


            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            DoctorName = rightPad(DoctorName, 12);
            DoctorName += ":";
            var vDoctorName = rightPad(dmPrintInput.header.prescribedby, 43);

            // LicenseNo = rightPad(LicenseNo, 10);
            // LicenseNo += ":";
            // var vLicenseNo = rightPad(dmPrintInput.header.licenseno, 19); 
            // DL no

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 20 + 10 + 10 + 10 + 18 = 80 total width

            BillDate = rightPad(BillDate, 10);
            BillDate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 18);
            lblBillNO = ' ' + lblBillNO;
            lblBillNO = rightPad(lblBillNO, 10);
            lblBillNO += ":";
            var vlblBillNO = rightPad(dmPrintInput.header.billno, 18);
            // GSTNo = rightPad(GSTNo, 10);
            // GSTNo += ":";
            // var vGSTNo = rightPad(dmPrintInput.header.TinNo, 18); 
            // TinNo

            // 17 + 40 + 15 + 23 + 15 + 25 = 135 total width
            // 12 + 1 + 17   +  10 + 1 + 10   +  10 + 1 + 18  // 80

            printData.push(heading1 || '');
            printData.push(heading2 || '');
            printData.push(heading3 || '');
            printData.push(heading4 || '');
            printData.push("");
            printData.push("");
            printData.push("");
            printData.push(heading5);
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            printData.push([lblBillNO, vlblBillNO, '', BillDate, vBillDate, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([lblName, vPatName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            printData.push([DoctorName, vDoctorName, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([lblName, vPatName, '', lblMRNNO, vMRN, OPIPERNO, vOPIPERNO, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([DoctorName, vDoctorName, '', lblAgeSex, vAgeGender, LicenseNo, vLicenseNo, printCodes.new_line].join(''));  // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width
            // printData.push([BillDate, vBillDate, '', lblBillNO, vlblBillNO, GSTNo, vGSTNo, printCodes.new_line].join('')); // 12 + 20 + 10 + 12 + 10 + 16 = 80 total width

        };

        var MithraA4WithHeaderPharmacySales = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 10;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    MithraA4WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 133, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 133, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }



            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            TotalQuantity = TotalQuantity.toFixed(0);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            GrossAmount = GrossAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbilltotrndoffamtfixed = Lenbilltotrndoffamt.toFixed(3);
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', 134, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 90), rightPad('TOT ITEM', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalNoOfItems, 25), rightPad(' ', 65), rightPad(condition1, 90), rightPad('Gross Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(GrossAmount, 10), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 90), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 65), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 90), rightPad('TOT QTY', 12), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalQuantity, 25), rightPad(' ', 65), rightPad('Discount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 90), rightPad(' ', 105), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotrndoffamt, Lenbilltotrndoffamtfixed, 10), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 90), rightPad(' ', 105), rightPad('Round off', 15), rightPad(' ', 2), rightPad(':', 1), rightPad('0.00', 10), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 90), rightPad(' ', 105), rightPad('SGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalCGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 90), rightPad(' ', 105), rightPad('CGST', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(TotalSGSTAmount, 10), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 90), rightPad(' ', 105), rightPad('Total Amount', 15), rightPad(' ', 2), rightPad(':', 1), rightPad(billnetamt, 10), printCodes.new_line].join(''));
            printData.push([rightPad('LOGIN ID', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('PAYMENT MODE', 15), rightPad(':', 1), rightPad(vPaymode, 25), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('-', 134, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 54), rightPad('WISH YOU A SPEEDY RECOVERY', 26), rightPad(' ', 54), printCodes.new_line].join(''));
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            printData.push("" + printCodes.new_line);
            // lineno += 4;

            // for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
            printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };


        var A5WithoutHeaderPharmacySales = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    // A5WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 60), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            lineno += 4;

            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        var A4WithoutHeaderPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'A.4'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 10;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A4WithoutHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var A4WithHeaderPharmacySales = function (dmPrintInput) {

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 35; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A4WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

            if (savehitcompleted == 1)
                $scope.clear();

        };

        var KumarA4WithHeaderPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'desc',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'qty',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'batch',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 35; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    KumarA4WithHeaderPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';


            if (billPaidAmt > 0) {
                vPaidAmt = ' Paid Amt : ' + billPaidAmt;
            }


            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition3, 106), rightPad('SGST', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(TotalCGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 106), rightPad('CGST', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(TotalSGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

            if (savehitcompleted == 1)
                $scope.clear();

        };

        var LOTUSIPPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: 'Item Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'vLocation',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Loc'
                    },
                    {
                        field: 'batch',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'value',
                        width: '7',
                        cwidth: '7',
                        align: 'right',
                        calign: 'right',
                        display: 'Amt'
                    },
                    {
                        field: 'qty',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'Qty'
                    },
                    {
                        field: 'gstper',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'GST'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'right',
                        calign: 'right',
                        display: 'MRP'
                    }
                    ]
                }
            };

            dmSchemaConfig_AmountDeviation = { // 135 - total width
                row: {
                    cols: [{
                        field: 'space',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'IndividualGSTPercentage',
                        width: '21',
                        cwidth: '21',
                        align: 'right',
                        calign: 'right',
                        display: 'GST %'
                    },
                    {
                        field: 'IndividualCGSTAmount',
                        width: '21',
                        cwidth: '21',
                        align: 'right',
                        calign: 'right',
                        display: 'CGST (Rs)'
                    },
                    {
                        field: 'IndividualSGSTAmount',
                        width: '22',
                        cwidth: '22',
                        align: 'right',
                        calign: 'right',
                        display: 'SGST (Rs)'
                    },
                    {
                        field: 'IndividualGSTAmount',
                        width: '20',
                        cwidth: '20',
                        align: 'right',
                        calign: 'right',
                        display: 'GST (Rs)'
                    }
                    ]
                }
            };

            var headerlineno = 12;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);



            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 85 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }


                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    lotusPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 1;

                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            var LenTotalNoOfItems = 6;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            TotalQuantity = TotalQuantity.toFixed(0);
            var LenTotalQuantity = 8;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            billtotaldisamt = billtotaldisamt.toFixed(2);
            var Lenbilltotaldisamt = 8;
            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            billtotalamt = billtotalamt.toFixed(2);
            var Lenbilltotalamt = 6;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;
            GrossAmount = GrossAmount.toFixed(2);
            var LenGrossAmount = 18;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            var LenTotalCGSTAmount = 8;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            var LenTotalSGSTAmount = 6;
            var TotalGSTAmount = dmPrintInput.header.TotalGSTAmount || 0.00;
            TotalGSTAmount = TotalGSTAmount.toFixed(2);
            var LenTotalGSTAmount = 8;
            var BilledBy = dmPrintInput.header.billedby;
            var LenBilledBy = 20;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 5;

            var totalgstpercent = dmPrintInput.header.TotalGstPercent || 0.00;
            var totalcgstpercent = dmPrintInput.header.TotalCGstPercent || 0.00;
            var totalsgstpercent = dmPrintInput.header.TotalSGstPercent || 0.00;
            var totalsgstamount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var totalcgstamount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var totalgstamount = dmPrintInput.header.TotalGSTAmount || 0.00;
            var gstpercentage = dmPrintInput.header.GSTPercentage || 0.00;
            var Total12perGstPercent = dmPrintInput.header.Total12perGstPercent || 0.00;
            var Total12perCGSTAmount = dmPrintInput.header.Total12perCGSTAmount || 0.00;
            var Total12perSGSTAmount = dmPrintInput.header.Total12perSGSTAmount || 0.00;
            var Total12GSTAmount = Total12perCGSTAmount + Total12perSGSTAmount || 0.00;
            // var Total14GSTAmount = Total14perCGSTAmount + Total14perSGSTAmount || 0.00;
            var Total18GSTAmount = Total18perCGSTAmount + Total18perSGSTAmount || 0.00;
            var Total28GSTAmount = Total28perCGSTAmount + Total28perSGSTAmount || 0.00;
            var Total5GSTAmount = Total5perCGSTAmount + Total5perSGSTAmount || 0.00;
            var Total0GSTAmount = Total0perCGSTAmount + Total0perSGSTAmount || 0.00;

            var Total28perGstPercent = dmPrintInput.header.Total28perGstPercent || 0.00;
            var Total28perCGSTAmount = dmPrintInput.header.Total28perCGSTAmount || 0.00;
            var Total28perSGSTAmount = dmPrintInput.header.Total28perSGSTAmount || 0.00;

            var Total18perGstPercent = dmPrintInput.header.Total18perGstPercent || 0.00;
            var Total18perCGSTAmount = dmPrintInput.header.Total18perCGSTAmount || 0.00;
            var Total18perSGSTAmount = dmPrintInput.header.Total18perSGSTAmount || 0.00;

            var Total5perGstPercent = dmPrintInput.header.Total5perGstPercent || 0.00;
            var Total5perCGSTAmount = dmPrintInput.header.Total5perCGSTAmount || 0.00;
            var Total5perSGSTAmount = dmPrintInput.header.Total5perSGSTAmount || 0.00;

            var Total0perGstPercent = dmPrintInput.header.Total0perGstPercent || 0.00;
            var Total0perCGSTAmount = dmPrintInput.header.Total0perCGSTAmount || 0.00;
            var Total0perSGSTAmount = dmPrintInput.header.Total0perSGSTAmount || 0.00;

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            if (billtotaldisamt > 0) {
                printData.push([rightPad('Discount : ', 10), leftPad(billtotaldisamt, Lenbilltotaldisamt), leftPad(' ', 5), rightPad('Gross Amount : ', 15), leftPad(GrossAmount, Lenbilltotalamt), rightPad(' ', 6), rightPad('Total Amount : ', 10), leftPad(billnetamt, Lenbilltotalamt), printCodes.new_line].join(''));
            } else {
                printData.push([leftPad(' ', 20), rightPad('Gross Amount : ', 15), leftPad(GrossAmount, Lenbilltotalamt), rightPad(' ', 8), rightPad('Total Amount : ', 15), leftPad(billnetamt, Lenbilltotalamt), printCodes.new_line].join(''));
            }

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            printData.push(appendLineHeader_AmountDeviation(dmPrintInput.GSTDetails[rj], rj));
            for (var rj = 0; rj < dmPrintInput.GSTDetails.length; rj++) {
                printData.push(appendLine_AmountDeviation(dmPrintInput.GSTDetails[rj], rj));
                lineno += 1;
            }

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            printData.push([leftPad('', 1), rightPad('Sales Man', 10), rightPad(' : ', 3), rightPad(BilledBy, 25), rightPad(' ', 21), rightPad('Net Amount', 10), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
            lineno += 1;

            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 7; k++) // set to correct place bottomspace
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Pharmacy Sales Client Method */


        /* Pharmacy Schedule Report Client Method */
        var PrimePharmacyScheduleReport = function (dmAllPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'billno',
                        width: '17',
                        cwidth: '17',
                        align: 'left',
                        calign: 'left',
                        display: 'BillNo'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'billdate', width: '19', cwidth: '19', align: 'left', calign: 'left', display: 'Bill Date' },
                    {
                        field: 'doctor',
                        width: '24',
                        cwidth: '24',
                        align: 'left',
                        calign: 'left',
                        display: 'Doctor'
                    },
                    {
                        field: 'patient',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: 'Patient Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: 'Desc'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'qty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'mfr', width: '12', cwidth: '12', align: 'left', calign: 'left', display: 'Manuf' },
                    //{ field: 'ispace', width: '2', cwidth: '2', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'batch',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'exp',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'sign',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Sign'
                    }
                    ]
                }
            };

            dmSchemaConfig_SecondRow = { // 135 - total width
                row: {
                    cols: [{
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'center',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'billdate',
                        width: '21',
                        cwidth: '21',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'billdate', width: '19', cwidth: '19', align: 'left', calign: 'left', display: 'Bill Date' },
                    {
                        field: 'DrQalfca_FirstRow',
                        width: '24',
                        cwidth: '24',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'PAddress_FirstRow',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'mfr', width: '12', cwidth: '12', align: 'left', calign: 'left', display: 'Manuf' },
                    //{ field: 'ispace', width: '2', cwidth: '2', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'ispace',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    }
                    ]
                }
            };

            dmSchemaConfig_ThirdRow = { // 135 - total width
                row: {
                    cols: [{
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'center',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '21',
                        cwidth: '21',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'billdate', width: '19', cwidth: '19', align: 'left', calign: 'left', display: 'Bill Date' },
                    {
                        field: 'DrQalfca_SecondRow',
                        width: '24',
                        cwidth: '24',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'PAddress_SecondRow',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '30',
                        cwidth: '30',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'mfr', width: '12', cwidth: '12', align: 'left', calign: 'left', display: 'Manuf' },
                    //{ field: 'ispace', width: '2', cwidth: '2', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'ispace',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'ispace',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 1;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var ColumnHeadingPrint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            var gbillnr = '';
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }

                    if (headingprint == 0) {
                        lineno = 0;
                        PrimePharmacyScheduletHeader(printData, dmPrintInput, ri);
                        lineno += 8;
                        headingprint++;
                    }

                    if (ColumnHeadingPrint == 0) {
                        lineno = 9;
                        printData.push(printCodes.new_line);
                        printData.push(printCodes.new_line);
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        lineno += 4;
                        ColumnHeadingPrint++;
                    }

                    /*
                                        if (gbillnr != dmPrintInput.header.billno) {
                                            gbillnr = dmPrintInput.header.billno;
                                            var lblDoctorName = rightPad("Doctor Name :", 17);
                                            var vDrName = rightPad(dmPrintInput.header.prescribedby, 40);
                                            var vQualification = rightPad(dmPrintInput.header.DrQalfca, 50);
                                            printData.push([lblDoctorName, vDrName, vQualification, printCodes.new_line].join(''));

                                            var lblbillnr = rightPad("Bill Nr. :", 10);
                                            var vbillnr = rightPad(dmPrintInput.header.billno, 20);
                                            var lblbillDt = rightPad("Bill Dt. :", 10);
                                            var vBillDt = rightPad(dmPrintInput.header.billdate, 20);
                                            var lblName = rightPad("Name :", 17);
                                            var vPatientName = rightPad(dmPrintInput.header.patientname, 50);
                                            printData.push([lblbillnr, vbillnr, lblbillDt, vBillDt, lblName, vPatientName, printCodes.new_line].join(''));

                                            var lblAddress = rightPad("Address :", 17);
                                            var PAddress1 = rightPad(dmPrintInput.header.PAddress1, 50);
                                            var PAddress2 = rightPad(dmPrintInput.header.PAddress2, 50);
                                            var PAddress = rightPad(dmPrintInput.header.PAddress1+'  '+dmPrintInput.header.PAddress2, 90);

                                            printData.push([lblAddress, PAddress, printCodes.new_line].join(''));
                                            printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                            printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                                            printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                        }
                    */

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    if (gbillnr != dmPrintInput.header.billno) {
                        gbillnr = dmPrintInput.header.billno;
                        var rowdata2 = appendLine_SecondRow(dmPrintInput.lines[ri], ri);
                        printData.push(rowdata2);
                        if (dmPrintInput.header.DrQalfca_SecondRow != '' && dmPrintInput.header.DrQalfca_SecondRow != null) {
                            var rowdata3 = appendLine_ThirdRow(dmPrintInput.lines[ri], ri);
                            printData.push(rowdata3);
                        }
                    }

                    lineno += 2;
                }
                //printData.push(printCodes.new_line);

            }


            for (var k = 0; k < 10; k++) // set to correct place
                //printData.push(' ' + printCodes.new_line);

                console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };

        var LotusPharmacyScheduleReport = function (dmAllPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'S.NO'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '25',
                        cwidth: '25',
                        align: 'left',
                        calign: 'left',
                        display: 'ITEM'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'sch',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'SCH'
                    },
                    //{ field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'qty',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'OTY'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mfr',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'MANU'
                    },
                    //{ field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'batch',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'BATCH'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'exp',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'EXP'
                    },
                    //{ field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: '' },
                    {
                        field: 'sign',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'SIGN'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 1;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            var gbillnr = '';
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (headingprint == 0) {

                        LotusPharmacyScheduletHeader(printData, dmPrintInput, ri);
                        printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));

                        headingprint++;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(70));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(52));
                    if (gbillnr != dmPrintInput.header.billno) {
                        gbillnr = dmPrintInput.header.billno;
                        var lblDoctorName = rightPad("Doctor Name:", 15);
                        var vDrName = rightPad(dmPrintInput.header.prescribedby, 25);
                        var lblbillnr = rightPad("Bill No:", 15);
                        var vbillnr = rightPad(dmPrintInput.header.billno, 25);
                        var lblbillDt = rightPad("Bill Date:", 15);
                        //var vBillDt = rightPad(dmPrintInput.header.billdate, 25);
                        var vBillDt = dmPrintInput.header.BillDate + ' ' + dmPrintInput.header.BillTime;
                        vBillDt = rightPad(vBillDt, 25);
                        var lblName = rightPad("Patient Name:", 15);
                        var vPatientName = rightPad(dmPrintInput.header.patientname, 25);

                        printData.push([lblbillnr, vbillnr, lblbillDt, vBillDt, printCodes.new_line].join(''));
                        printData.push([lblName, vPatientName, lblDoctorName, vDrName, printCodes.new_line].join(''));
                        printData.push(' ' + printCodes.new_line);
                    }
                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);

                }
                if (dmPrintInput.lines.length > 0) {
                    printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));
                }
            }

            for (var k = 0; k < 15; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };

        var GeneralPharmacyScheduleReport = function (dmAllPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'S.No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    //{ field: 'billno', width: '10', cwidth: '10', align: 'left', calign: 'left', display: 'BillNo' },
                    //{ field: 'ispace', width: '1', cwidth: '0', align: 'left', calign: 'left', display: '' },
                    //{ field: 'billdate', width: '19', cwidth: '19', align: 'left', calign: 'left', display: 'Bill Date' },
                    //{ field: 'doctor', width: '18', cwidth: '18', align: 'left', calign: 'left', display: 'Doctor' },
                    //{ field: 'patient', width: '20', cwidth: '20', align: 'left', calign: 'left', display: 'Patient Name' },
                    {
                        field: 'desc',
                        width: '40',
                        cwidth: '40',
                        align: 'left',
                        calign: 'left',
                        display: 'Desc'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'sch',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'qty',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mfr',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Manuf'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'exp',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'sign',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Sign'
                    }
                    ]
                }
            };

            var headerlineno = 5;
            var footerline = 1;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            var gbillnr = '';
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }

                    if (headingprint == 0) {
                        lineno = 0;
                        PrimePharmacyScheduletHeader(printData, dmPrintInput, ri);
                        lineno += 8;
                        headingprint++;
                    }

                    if (gbillnr != dmPrintInput.header.billno) {
                        gbillnr = dmPrintInput.header.billno;
                        var lblDoctorName = rightPad("Doctor Name :", 17);
                        var vDrName = rightPad(dmPrintInput.header.prescribedby, 40);
                        var vQualification = rightPad(dmPrintInput.header.DrQalfca, 50);
                        printData.push([lblDoctorName, vDrName, vQualification, printCodes.new_line].join(''));

                        var lblbillnr = rightPad("Bill Nr. :", 10);
                        var vbillnr = rightPad(dmPrintInput.header.billno, 20);
                        var lblbillDt = rightPad("Bill Dt. :", 10);
                        var vBillDt = rightPad(dmPrintInput.header.billdate, 20);
                        var lblName = rightPad("Name :", 17);
                        var vPatientName = rightPad(dmPrintInput.header.patientname, 50);
                        printData.push([lblbillnr, vbillnr, lblbillDt, vBillDt, lblName, vPatientName, printCodes.new_line].join(''));

                        var lblAddress = rightPad("Address :", 17);
                        var PAddress1 = rightPad(dmPrintInput.header.PAddress1, 50);
                        var PAddress2 = rightPad(dmPrintInput.header.PAddress2, 50);
                        var PAddress = rightPad(dmPrintInput.header.PAddress1 + '  ' + dmPrintInput.header.PAddress2, 100);

                        printData.push([lblAddress, PAddress, printCodes.new_line].join(''));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    }

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    lineno += 1;
                }

            }

            for (var k = 0; k < 10; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        /* Pharmacy Schedule Report Client Method */

        /* IP-Pharmacy Sales Client Method */
        var PrimeIPPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeIPBillingHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };

        var DSMCHIPPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '3',
                        cwidth: '3',
                        align: 'center',
                        calign: 'left',
                        display: 'No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Drug Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'qty',
                        width: '5',
                        cwidth: '5',
                        align: 'center',
                        calign: 'center',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mrp',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Rate'
                    },
                    {
                        field: 'DetailDiscountPercentage',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'Dis'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'amount',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    DSMCHPharmacySalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            var LenTotalNoOfItems = 6;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            TotalQuantity = TotalQuantity.toFixed(0);
            var LenTotalQuantity = 8;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            billtotaldisamt = billtotaldisamt.toFixed(2);
            var Lenbilltotaldisamt = 8;
            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            billtotalamt = billtotalamt.toFixed(2);
            var Lenbilltotalamt = 8;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;
            GrossAmount = GrossAmount.toFixed(2);
            var LenGrossAmount = 18;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            var LenTotalCGSTAmount = 8;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            var LenTotalSGSTAmount = 6;
            var TotalGSTAmount = dmPrintInput.header.TotalGSTAmount || 0.00;
            TotalGSTAmount = TotalGSTAmount.toFixed(2);
            var LenTotalGSTAmount = 8;
            var BilledBy = dmPrintInput.header.billedby;
            var LenBilledBy = 20;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 8;


            printData.push([rightPad(' ', 30), rightPad('-', 25, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 30), rightPad('Total Amount', 13), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Taxmidplace = getCenterPositionforDMPrintSmall('Tax Braekup');
            var TaxBreakupHeading = leftPad('Tax Braekup', Taxmidplace) + printCodes.new_line;
            printData.push(TaxBreakupHeading || '');
            printData.push([rightPad('Gross Value', 12), rightPad(':', 1), rightPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));
            printData.push([rightPad('     SGST', 12), rightPad(':', 1), rightPad(TotalSGSTAmount, LenTotalSGSTAmount), rightPad('CGST', 5), rightPad(':', 1), rightPad(TotalCGSTAmount, LenTotalCGSTAmount), rightPad('GST Amount', 12), rightPad(':', 1), rightPad(TotalGSTAmount, LenTotalGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Total Items', 12), rightPad(':', 1), rightPad(TotalNoOfItems, LenTotalNoOfItems), rightPad('Qty', 5), rightPad(':', 1), rightPad(TotalQuantity, LenTotalQuantity), rightPad('Dis. Amount', 12), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('User', 12), rightPad(':', 1), rightPad(BilledBy, LenBilledBy), rightPad('Bill Amount', 12), rightPad(':', 1), rightPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Messagemidplace = getCenterPositionforDMPrintSmall('Wish You A Speedy Recovery');
            var MessageHeading = leftPad('Wish You A Speedy Recovery', Messagemidplace) + printCodes.new_line;
            printData.push(MessageHeading || '');

            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 12; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var GeneralIPPharmacySales = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 5;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeIPBillingHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 10)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 10); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 10) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 60), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 60), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 60), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 12); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        /* IP-Pharmacy Sales Client Method */

        /* Material Issue Print Client Method */
        var PrimeMaterialIssuePrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '29',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batchid',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'expirydt',
                        width: '15',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'transferqty',
                        width: '8',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'Issue Qty'
                    },
                    {
                        field: 'UCP',
                        width: '16',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'netamt',
                        width: '16',
                        cwidth: '17',
                        align: 'right',
                        calign: 'left',
                        display: 'Net Amt'
                    },
                    {
                        field: 'mrpprice',
                        width: '14',
                        cwidth: '13',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'TotalMrp',
                        width: '16',
                        cwidth: '10',
                        align: 'right',
                        calign: 'left',
                        display: 'TotalMRP'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeMaterialIssueHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.vtotalmrpamount || 0.00;
            var vApprovedBy = dmPrintInput.header.vapprovedby || '';

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        var GeneralMaterialIssuePrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '29',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batchid',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'expirydt',
                        width: '15',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'transferqty',
                        width: '8',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'Issue Qty'
                    },
                    {
                        field: 'UCP',
                        width: '16',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'netamt',
                        width: '16',
                        cwidth: '17',
                        align: 'right',
                        calign: 'left',
                        display: 'Net Amt'
                    },
                    {
                        field: 'mrpprice',
                        width: '14',
                        cwidth: '13',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'TotalMrp',
                        width: '16',
                        cwidth: '10',
                        align: 'right',
                        calign: 'left',
                        display: 'TotalMRP'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeMaterialIssueHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.vtotalmrpamount || 0.00;
            var vApprovedBy = dmPrintInput.header.vapprovedby || '';

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Material Issue Print Client Method */


        /* Patient Dispense Print Client Method */
        var PrimePatientDispensePrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40',
                '\x1B' + '\x61' + '\x30',
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePatientDispenseHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) {
                for (var k = lineno; k < (totallinenrperpage - 7); k++) {
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++)
                    printData.push(printCodes.new_line);

                lineno = 0;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++)
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }



        };
        var GeneralPatientDispensePrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40',
                '\x1B' + '\x61' + '\x30',
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                String.fromCharCode(27) + String.fromCharCode(106) + 1,
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePatientDispenseHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) {
                for (var k = lineno; k < (totallinenrperpage - 7); k++) {
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++)
                    printData.push(printCodes.new_line);

                lineno = 0;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++)
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Patient Dispense Print Client Method */


        /* Direct Pharmacy Return Print Client Method */
        var PrimeDirectPhrmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeDirectPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        var GeneralDirectPhrmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeDirectPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Direct Pharmacy Return Print Client Method */

        /* GRN Print Client Method */
        var PrimeGRNPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '18',
                        cwidth: '18',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'hsn',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'UOM',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'UOM'
                    },
                    {
                        field: 'batch',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'right',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'Ordqty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'OrdQty'
                    },
                    {
                        field: 'Recqty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'RecQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'mrp',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'value',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    {
                        field: 'dis',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'Dis'
                    },
                    {
                        field: 'cgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'totgst',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    {
                        field: 'ProfitPercentage',
                        width: '9',
                        cwidth: '9',
                        align: 'right',
                        calign: 'left',
                        display: 'Profit %'
                    },
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeGRNHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 6;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            // if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var RoundOff = dmPrintInput.header.vRoundOff || 0.00;
            var GSTAmount = dmPrintInput.header.vGSTAmount || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;
            var grndis = dmPrintInput.header.vgrndis || 0.00;


            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            RoundOff = RoundOff.toFixed(2);
            GSTAmount = GSTAmount.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);
            grndis = grndis.toFixed(2);

            var vApprovedBy = dmPrintInput.header.vapprovedby || '';


            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenRoundOff = 11 - ('' + RoundOff).length;
            var LenGSTAmount = 11 - ('' + GSTAmount).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;
            var Lengrndis = 11 - ('' + grndis).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad(condition1, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (RoundOff != 0)
                printData.push([rightPad('', 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(RoundOff, LenRoundOff), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('GST Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GSTAmount, LenGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('GRN Dis', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(grndis, Lengrndis), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };


        var LotusGRNPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [
                        //{ field: 'ispace', width: '1', cwidth: '0', align: 'left', calign: 'left', display: ' ' },
                        {
                            field: 'slno',
                            width: '4',
                            cwidth: '4',
                            align: 'left',
                            calign: 'left',
                            display: 'S.N'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '0',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'MatName',
                            width: '15',
                            cwidth: '15',
                            align: 'left',
                            calign: 'left',
                            display: 'Item Name'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        //{ field: 'UOM', width: '6', cwidth: '6', align: 'left', calign: 'left', display: 'UOM' },
                        {
                            field: 'FullBatch',
                            width: '8',
                            cwidth: '8',
                            align: 'left',
                            calign: 'left',
                            display: 'Batch'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'exp',
                            width: '6',
                            cwidth: '6',
                            align: 'left',
                            calign: 'left',
                            display: 'Exp'
                        },
                        //{ field: 'Ordqty', width: '6', cwidth: '6', align: 'left', calign: 'left', display: 'OrdQty' },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'Recqty',
                            width: '4',
                            cwidth: '4',
                            align: 'left',
                            calign: 'left',
                            display: 'Qty'
                        },
                        {
                            field: 'FreeQty',
                            width: '4',
                            cwidth: '4',
                            align: 'left',
                            calign: 'left',
                            display: 'Free'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'ConversionQty',
                            width: '4',
                            cwidth: '4',
                            align: 'left',
                            calign: 'left',
                            display: 'Pkg'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'TotalQtyInDetail',
                            width: '6',
                            cwidth: '6',
                            align: 'left',
                            calign: 'left',
                            display: 'Total'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'PurchasePrice',
                            width: '6',
                            cwidth: '6',
                            align: 'left',
                            calign: 'left',
                            display: 'Rate'
                        },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        {
                            field: 'mrp',
                            width: '6',
                            cwidth: '6',
                            align: 'left',
                            calign: 'left',
                            display: 'MRP'
                        },
                        //{ field: 'value', width: '9', cwidth: '9', align: 'left', calign: 'left', display: 'Value' },
                        //{ field: 'dis', width: '6', cwidth: '6', align: 'right', calign: 'right', display: 'Dis' },
                        // { field: 'cgstamt', width: '7', cwidth: '7', align: 'left', calign: 'left', display: 'CGST' },
                        //{ field: 'sgstamt', width: '7', cwidth: '7', align: 'left', calign: 'left', display: 'SGST' },
                        {
                            field: 'ispace',
                            width: '1',
                            cwidth: '1',
                            align: 'left',
                            calign: 'left',
                            display: ''
                        },
                        //{ field: 'totgst', width: '6', cwidth: '6', align: 'left', calign: 'left', display: 'GST' },
                        //{ field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: '' },
                        {
                            field: 'amount',
                            width: '7',
                            cwidth: '7',
                            align: 'left',
                            calign: 'left',
                            display: 'Amount'
                        }
                    ]
                }
            };
            /*
                        dmSchemaConfig_AmountDeviation = { // 135 - total width
                            row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                                cols: [
                                    { field: 'SerialNo', width: '4', cwidth: '4', align: 'right', calign: 'right', display: 'S.N' },
                                    { field: 'ispace', width: '1', cwidth: '0', align: 'left', calign: 'left', display: '' },
                                   // { field: 'GRNNumber', width: '10', cwidth: '10', align: 'left', calign: 'left', display: 'GRN No' },
                                    { field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: ' ' },
                                   // { field: 'GRNDate', width: '10', cwidth: '10', align: 'left', calign: 'left', display: 'Date' },
                                    { field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: ' ' },
                                    { field: 'VendorName', width: '15', cwidth: '15', align: 'left', calign: 'left', display: 'Vendor' },
                                    { field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: ' ' },
                                    { field: 'ItemName', width: '16', cwidth: '16', align: 'left', calign: 'left', display: 'Item Name' },
                                    { field: 'ispace', width: '1', cwidth: '1', align: 'left', calign: 'left', display: ' ' },
                                  //  { field: 'BatchNo', width: '7', cwidth: '7', align: 'left', calign: 'left', display: 'Batch' },
                                   // { field: 'UOMName', width: '7', cwidth: '7', align: 'left', calign: 'left', display: 'UOM' },
                                   // { field: 'ExpiryDate', width: '5', cwidth: '5', align: 'left', calign: 'left', display: 'Exp' },
                                    { field: 'ispace1', width: '0', cwidth: '1', align: 'left', calign: 'left', display: ' ' },
                                    { field: 'GRNQuantity', width: '5', cwidth: '5', align: 'right', calign: 'right', display: 'Qty' },
                                   // { field: 'ConversionQuantity', width: '5', cwidth: '5', align: 'right', calign: 'right', display: 'Pkg' },
                                  //  { field: 'UomPrice', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Price' },
                                    { field: 'MRP', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'MRP' },
                                    { field: 'Amount', width: '8', cwidth: '8', align: 'right', calign: 'right', display: 'Value' },
                                    { field: 'Discount', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Dis' },
                                    //{ field: 'CGSTAmount', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'CGST' },
                                    //{ field: 'SGSTAmount', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'SGST' },
                                    { field: 'TotalGST', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'GST' },
                                    { field: 'TotalAmount', width: '8', cwidth: '8', align: 'right', calign: 'right', display: 'Total' }
                                ]
                            }
                        };
            */
            var headerlineno = 12;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            //per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 85 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    LOTUSGRNHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));
                    lineno += 6;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            printData.push([rightPad('-', 80, '-'), printCodes.new_line].join(''));

            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var RoundOff = dmPrintInput.header.vRoundOff || 0.00;
            var GSTAmount = dmPrintInput.header.vGSTAmount || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;
            var grndis = dmPrintInput.header.vgrndis || 0.00;


            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            RoundOff = RoundOff.toFixed(2);
            GSTAmount = GSTAmount.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);
            grndis = grndis.toFixed(2);

            var vApprovedBy = dmPrintInput.header.vapprovedby || '';

            var CommonLength = 10;
            var CommonLength1 = 40;
            var LenGrossAmount = 10;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenRoundOff = 11 - ('' + RoundOff).length;
            var LenGSTAmount = 11 - ('' + GSTAmount).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;
            var Lengrndis = 11 - ('' + grndis).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vcomments)
                dmPrintInput.header.vcomments = '';
            var condition2 = "" + dmPrintInput.header.vcomments;
            if (GrossAmount > 0) {
                printData.push([rightPad(' ', 55), rightPad('Gross Amount', 12), rightPad(' : ', 3), rightPad(GrossAmount, CommonLength), printCodes.new_line].join(''));
            }
            if (GSTAmount > 0) {
                printData.push([rightPad(' ', 55), rightPad('GST Amount', 12), rightPad(' : ', 3), rightPad(GSTAmount, CommonLength), printCodes.new_line].join(''));
            }
            if (Discount > 0) {
                printData.push([rightPad(' ', 55), rightPad('Discount', 12), rightPad(' : ', 3), rightPad(Discount, CommonLength), printCodes.new_line].join(''));
            }
            if (grndis > 0) {
                printData.push([rightPad(' ', 55), rightPad('GRN Discount', 12), rightPad(' : ', 3), rightPad(grndis, CommonLength), printCodes.new_line].join(''));
            }
            if (OtherCost > 0) {
                printData.push([rightPad(' ', 55), rightPad('Other Cost', 12), rightPad(' : ', 3), rightPad(OtherCost, CommonLength), printCodes.new_line].join(''));
            }
            if (RoundOff > 0) {
                printData.push([rightPad(' ', 55), rightPad('Round Off', 12), rightPad(' : ', 3), rightPad(RoundOff, CommonLength), printCodes.new_line].join(''));
            }
            if (NetAmount > 0) {
                printData.push([rightPad(' ', 55), rightPad('Net Amount', 12), rightPad(' : ', 3), rightPad(NetAmount, CommonLength), printCodes.new_line].join(''));
            }
            if (condition2 != '' && condition2 != null && condition2 != undefined) {
                printData.push([rightPad('Comments', 12), rightPad(' : ', 3), rightPad(condition2, CommonLength1), printCodes.new_line].join(''));
            }

            //printData.push([rightPad('', 85, '-'), printCodes.new_line].join(''));
            //printData.push([rightPad('', 85, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Approved By', 12), rightPad(' : ', 3), rightPad(vApprovedBy, 60), printCodes.new_line].join(''));


            for (var k = 0; k < 16; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };

        var GeneralGRNPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'hsn',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'UOM',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'UOM'
                    },
                    {
                        field: 'batch',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'right',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'Ordqty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'OrdQty'
                    },
                    {
                        field: 'Recqty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'RecQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'mrp',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'value',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    {
                        field: 'dis',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Dis'
                    },
                    {
                        field: 'cgstamt',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'totgst',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeGRNHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 6;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            // if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
            //     for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
            //         printData.push(printCodes.new_line);
            //         lineno++;
            //     }
            // }

            // if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
            //     for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
            //         printData.push(printCodes.new_line);

            //     lineno = 0; // new page;
            // }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var RoundOff = dmPrintInput.header.vRoundOff || 0.00;
            var GSTAmount = dmPrintInput.header.vGSTAmount || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;
            var grndis = dmPrintInput.header.vgrndis || 0.00;


            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            RoundOff = RoundOff.toFixed(2);
            GSTAmount = GSTAmount.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);
            grndis = grndis.toFixed(2);

            var vApprovedBy = dmPrintInput.header.vapprovedby || '';


            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenRoundOff = 11 - ('' + RoundOff).length;
            var LenGSTAmount = 11 - ('' + GSTAmount).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;
            var Lengrndis = 11 - ('' + grndis).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad(condition1, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (RoundOff != 0)
                printData.push([rightPad('', 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(RoundOff, LenRoundOff), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('GST Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GSTAmount, LenGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('GRN Dis', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(grndis, Lengrndis), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        /* GRN Print Client Method */

        /* Purchase Order Print Client Method */
        var PrimePurchaseOrderPrint = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '25',
                        cwidth: '25',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'POqty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'POQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'GST',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'GST'
                    },
                    {
                        field: 'UCP',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'UCP'
                    },
                    {
                        field: 'Dis',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'DIS'
                    },
                    {
                        field: 'Value',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    {
                        field: 'cgstamt',
                        width: '11',
                        cwidth: '11',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'totgst',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    {
                        field: 'TotalMrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'TMRP'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePurchaseOrderHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var Tax = dmPrintInput.header.vTax || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;

            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            Tax = Tax.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);

            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenTax = 11 - ('' + Tax).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));

            if (Tax != 0)
                printData.push([rightPad('', 106), rightPad('Tax', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Tax, LenTax), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        var GeneralPurchaseOrderPrint = function (dmPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '25',
                        cwidth: '25',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'POqty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'POQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'GST',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'GST'
                    },
                    {
                        field: 'UCP',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'UCP'
                    },
                    {
                        field: 'Dis',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'DIS'
                    },
                    {
                        field: 'Value',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    {
                        field: 'cgstamt',
                        width: '11',
                        cwidth: '11',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'totgst',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    {
                        field: 'TotalMrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'TMRP'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePurchaseOrderHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var Tax = dmPrintInput.header.vTax || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;

            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            Tax = Tax.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);

            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenTax = 11 - ('' + Tax).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));

            if (Tax != 0)
                printData.push([rightPad('', 106), rightPad('Tax', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Tax, LenTax), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        /* Purchase Order Print Client Method */


        /* IP-Pharmacy Return Print Client Method */
        var PrimeIPPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeIPPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var DSMCHIPPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '3',
                        cwidth: '3',
                        align: 'center',
                        calign: 'left',
                        display: 'No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Drug Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'qty',
                        width: '5',
                        cwidth: '5',
                        align: 'center',
                        calign: 'center',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mrp',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Rate'
                    },
                    {
                        field: 'DetailDiscountPercentage',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'Dis'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'amount',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    DSMCHPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            var LenTotalNoOfItems = 6;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            TotalQuantity = TotalQuantity.toFixed(0);
            var LenTotalQuantity = 8;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            billtotaldisamt = billtotaldisamt.toFixed(2);
            var Lenbilltotaldisamt = 8;
            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            billtotalamt = billtotalamt.toFixed(2);
            var Lenbilltotalamt = 8;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;
            GrossAmount = GrossAmount.toFixed(2);
            var LenGrossAmount = 18;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            var LenTotalCGSTAmount = 8;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            var LenTotalSGSTAmount = 6;
            var TotalGSTAmount = dmPrintInput.header.TotalGSTAmount || 0.00;
            TotalGSTAmount = TotalGSTAmount.toFixed(2);
            var LenTotalGSTAmount = 8;
            var BilledBy = dmPrintInput.header.billedby;
            var LenBilledBy = 20;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 8;


            printData.push([rightPad(' ', 30), rightPad('-', 25, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 30), rightPad('Total Amount', 13), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Taxmidplace = getCenterPositionforDMPrintSmall('Tax Braekup');
            var TaxBreakupHeading = leftPad('Tax Braekup', Taxmidplace) + printCodes.new_line;
            printData.push(TaxBreakupHeading || '');
            printData.push([rightPad('Gross Value', 12), rightPad(':', 1), rightPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));
            printData.push([rightPad('     SGST', 12), rightPad(':', 1), rightPad(TotalSGSTAmount, LenTotalSGSTAmount), rightPad('CGST', 5), rightPad(':', 1), rightPad(TotalCGSTAmount, LenTotalCGSTAmount), rightPad('GST Amount', 12), rightPad(':', 1), rightPad(TotalGSTAmount, LenTotalGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Total Items', 12), rightPad(':', 1), rightPad(TotalNoOfItems, LenTotalNoOfItems), rightPad('Qty', 5), rightPad(':', 1), rightPad(TotalQuantity, LenTotalQuantity), rightPad('Dis. Amount', 12), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('User', 12), rightPad(':', 1), rightPad(BilledBy, LenBilledBy), rightPad('Return Amount', 12), rightPad(':', 1), rightPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Messagemidplace = getCenterPositionforDMPrintSmall('Wish You A Speedy Recovery');
            var MessageHeading = leftPad('Wish You A Speedy Recovery', Messagemidplace) + printCodes.new_line;
            printData.push(MessageHeading || '');

            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 12; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        var GeneralIPPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeIPPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* IP-Pharmacy Return Print Client Method */


        /* Stock Transfer Print Client Method */
        var PrimeStockTransferPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '29',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batchid',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'expirydt',
                        width: '15',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'transferqty',
                        width: '8',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'Issue Qty'
                    },
                    {
                        field: 'UCP',
                        width: '16',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'netamt',
                        width: '16',
                        cwidth: '17',
                        align: 'right',
                        calign: 'left',
                        display: 'Net Amt'
                    },
                    {
                        field: 'mrpprice',
                        width: '14',
                        cwidth: '13',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'TotalMrp',
                        width: '16',
                        cwidth: '10',
                        align: 'right',
                        calign: 'left',
                        display: 'TotalMRP'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeStockTransferHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.vtotalmrpamount || 0.00;
            var vApprovedBy = dmPrintInput.header.vapprovedby || '';

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        var GeneralStockTransferPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '30',
                        cwidth: '29',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batchid',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'expirydt',
                        width: '15',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'transferqty',
                        width: '8',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'Issue Qty'
                    },
                    {
                        field: 'UCP',
                        width: '16',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Rate'
                    },
                    {
                        field: 'netamt',
                        width: '16',
                        cwidth: '17',
                        align: 'right',
                        calign: 'left',
                        display: 'Net Amt'
                    },
                    {
                        field: 'mrpprice',
                        width: '14',
                        cwidth: '13',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'TotalMrp',
                        width: '16',
                        cwidth: '10',
                        align: 'right',
                        calign: 'left',
                        display: 'TotalMRP'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeStockTransferHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }


            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.vtotalmrpamount || 0.00;
            var vApprovedBy = dmPrintInput.header.vapprovedby || '';

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;

            var condition1 = "Comments";

            if (!dmPrintInput.header.vvcomments)
                dmPrintInput.header.vvcomments = '';
            var condition2 = "" + dmPrintInput.header.vvcomments;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad('', 133), printCodes.new_line].join(''));
            printData.push([rightPad(vApprovedBy, 25), rightPad('Authorized Signature', 35), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Stock Transfer Print Client Method */


        /* Customer Sales Print Client Method */
        var PrimeCustomerSalesPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeCustomerSalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }



        };
        var DSMCHCustomerSalesPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '4',
                        cwidth: '4',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Item'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'qty',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'Qty'
                    },
                    {
                        field: 'mrp',
                        width: '7',
                        cwidth: '7',
                        align: 'right',
                        calign: 'right',
                        display: 'Price'
                    },
                    {
                        field: 'DiscountValue',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'Dis%'
                    },
                    {
                        field: 'Discount',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'Dis'
                    },
                    {
                        field: 'vatper',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'GST%'
                    },
                    {
                        field: 'vatamt',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'GST'
                    },
                    {
                        field: 'netamount',
                        width: '7',
                        cwidth: '7',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    DSMCHCustomerSalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad(' ', 80, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad(' ', 80, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            /*
                        if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                            for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                                printData.push(printCodes.new_line);
                                lineno++;
                            }
                        }

                        if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                            for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                                printData.push(printCodes.new_line);

                            lineno = 0; // new page;
                        }
            */
            var TotalAmount = dmPrintInput.header.TotalAmount || 0.00;
            var TotalDiscont = dmPrintInput.header.TotalDiscont || 0.00;
            var TotalRoundoff = dmPrintInput.header.TotalRoundoff || 0.00;
            var GSTAmount = dmPrintInput.header.GSTAmount || 0.00;
            var TotalAmountBeforeGST = dmPrintInput.header.TotalAmountBeforeGST || 0.00;
            var NetAmount = dmPrintInput.header.NetAmount || 0.00;
            var BilledBy = dmPrintInput.header.billedby;

            TotalAmount = TotalAmount.toFixed(2);
            TotalDiscont = TotalDiscont.toFixed(2);
            TotalRoundoff = TotalRoundoff.toFixed(2);
            GSTAmount = GSTAmount.toFixed(2);
            TotalAmountBeforeGST = TotalAmountBeforeGST.toFixed(2);
            NetAmount = NetAmount.toFixed(2);

            var LenTotalAmount = 11 - ('' + TotalAmount).length;
            var LenTotalDiscont = 11 - ('' + TotalDiscont).length;
            var LenTotalRoundoff = 11 - ('' + TotalRoundoff).length;
            var LenGSTAmount = 11 - ('' + GSTAmount).length;
            var LenTotalAmountBeforeGST = 11 - ('' + TotalAmountBeforeGST).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');

            //printData.push([rightPad(' ', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push(' ' + printCodes.new_line);
            printData.push([rightPad(' ', 50), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(TotalAmount, LenTotalAmount), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 50), rightPad(' Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(TotalDiscont, LenTotalDiscont), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 50), rightPad(' Gst Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GSTAmount, LenGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 50), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 2); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        var GeneralCustomerSalesPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimeCustomerSalesHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));
            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Customer Sales Print Client Method */


        /* Patient Dispense view Print Client Method */
        var PrimePatientDispenseViewPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePatientDispenseView(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        var GeneralPatientDispenseViewPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34;
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePatientDispenseView(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;


            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), rightPad(' ', 5), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        /* Patient Dispense view Print Client Method */


        /* Pharmacy Return Print Client Method */
        var A5WithHeaderPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A5WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 60), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            $scope.printRaw(printData);

        };
        var A5WithoutHeaderPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '16',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: '  DESC  '
                    },
                    {
                        field: 'ispace',
                        width: '2',
                        cwidth: '2',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    // { field: 'hsn', width: '4', cwidth: '4', align: 'left', calign: 'left', display: 'HSN' },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '13',
                        cwidth: '13',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 5;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(60) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 90 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    // A5WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 60), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 60), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 60), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 60), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 60), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 60), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('-', 90, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            $scope.printRaw(printData);

        };

        var A4WithoutHeaderPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A4WithoutHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            $scope.printRaw(printData);

        };

        var A4WithHeaderPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    A4WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            $scope.printRaw(printData);

        };
        var KumarA4WithHeaderPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'cgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 7;
            var totallinenrperpage = 35; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    KumarA4WithHeaderPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;
                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                    printData.push(printCodes.new_line);
                    lineno++;
                }
            }

            if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                    printData.push(printCodes.new_line);

                lineno = 0; // new page;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 11 - ('' + billnetamt).length;

            var condition1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer1');
            var vStorefooter1 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter1) {
                vStorefooter1 = dmPrintInput.header.vStorefooter1
                condition1 = vStorefooter1;
            }

            var condition2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer2');
            var vStorefooter2 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter2) {
                vStorefooter2 = dmPrintInput.header.vStorefooter2
                condition2 = vStorefooter2;
            }

            var condition3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer3');
            var vStorefooter3 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter3) {
                vStorefooter3 = dmPrintInput.header.vStorefooter3
                condition3 = vStorefooter3;
            }

            var condition4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'footer4');
            var vStorefooter4 = null;
            if (dmPrintInput.header && dmPrintInput.header.vStorefooter4) {
                vStorefooter4 = dmPrintInput.header.vStorefooter4
                condition4 = vStorefooter4;
            }

            var vPaidAmt = '';
            var vPaymode = '';

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(condition1, 106), rightPad('Total Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));

            if (billtotaldisamt > 0)
                printData.push([rightPad(condition2, 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition2, 106), printCodes.new_line].join(''));

            if (billtotrndoffamt != 0)
                printData.push([rightPad(condition3, 106), rightPad('Round off', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billtotrndoffamt, Lenbilltotrndoffamt), printCodes.new_line].join(''));
            else
                printData.push([rightPad(condition3, 106), printCodes.new_line].join(''));

            printData.push([rightPad(condition4, 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('Authorized By', 15), rightPad(':', 1), rightPad(BilledBy, 25), rightPad(' ', 5), vPaymode, rightPad(' ', 5), vPaidAmt, printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;

            for (var k = lineno; k < (totallinenrperpage + 10); k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            $scope.printRaw(printData);

        };

        var LOTUSPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'desc',
                        width: '28',
                        cwidth: '28',
                        align: 'left',
                        calign: 'left',
                        display: 'Item Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'vLocation',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Loc'
                    },
                    {
                        field: 'qty',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'batch',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '6',
                        cwidth: '6',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'value',
                        width: '7',
                        cwidth: '7',
                        align: 'right',
                        calign: 'right',
                        display: 'Amt'
                    },
                    {
                        field: 'gstper',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'GST'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'right',
                        calign: 'right',
                        display: 'MRP'
                    }
                    ]
                }
            };

            dmSchemaConfig_AmountDeviation = { // 135 - total width
                row: {
                    cols: [{
                        field: 'space',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ' '
                    },
                    {
                        field: 'IndividualGSTPercentage',
                        width: '21',
                        cwidth: '21',
                        align: 'right',
                        calign: 'right',
                        display: 'GST %'
                    },
                    {
                        field: 'IndividualCGSTAmount',
                        width: '21',
                        cwidth: '21',
                        align: 'right',
                        calign: 'right',
                        display: 'CGST (Rs)'
                    },
                    {
                        field: 'IndividualSGSTAmount',
                        width: '22',
                        cwidth: '22',
                        align: 'right',
                        calign: 'right',
                        display: 'SGST (Rs)'
                    },
                    {
                        field: 'IndividualGSTAmount',
                        width: '20',
                        cwidth: '20',
                        align: 'right',
                        calign: 'right',
                        display: 'GST (Rs)'
                    }
                    ]
                }
            };

            var headerlineno = 12;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 85 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }

                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    LotusPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 1;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }

            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = dmPrintInput.header.totalamount || 0.00;
            var totalgstpercent = dmPrintInput.header.TotalGstPercent || 0.00;
            var totalcgstpercent = dmPrintInput.header.TotalCGstPercent || 0.00;
            var totalsgstpercent = dmPrintInput.header.TotalSGstPercent || 0.00;
            var totalsgstamount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            var totalcgstamount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            var totalgstamount = totalsgstamount + totalcgstamount;
            billtotalamt = billtotalamt - totalgstamount;
            var gstpercentage = dmPrintInput.header.GSTPercentage || 0.00;

            var BilledBy = dmPrintInput.header.billedby;

            billtotalamt = billtotalamt.toFixed(2);
            billtotaldisamt = billtotaldisamt.toFixed(2);
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);

            var TotalNetAmountWithRoundOff = Math.round(billnetamt);
            TotalNetAmountWithRoundOff = TotalNetAmountWithRoundOff.toFixed(2);

            var Lenbilltotalamt = 10 - ('' + billtotalamt).length;
            var Lenbilltotalamt1 = 11 - ('' + billtotalamt).length;
            var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 4;

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            if (billtotaldisamt > 0) {
                printData.push([rightPad('Discount : ', 10), leftPad(billtotaldisamt, Lenbilltotaldisamt), leftPad(' ', 5), rightPad('Gross Amount : ', 15), leftPad(billtotalamt, Lenbilltotalamt), rightPad(' ', 7), rightPad('Total Amount : ', 15), leftPad(billnetamt, Lenbilltotalamt), printCodes.new_line].join(''));
            } else {
                printData.push([leftPad(' ', 20), rightPad('Gross Amount : ', 15), leftPad(billtotalamt, Lenbilltotalamt), rightPad(' ', 12), rightPad('Total Amount : ', 15), leftPad(billnetamt, Lenbilltotalamt1), printCodes.new_line].join(''));
            }

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            printData.push(appendLineHeader_AmountDeviation(dmPrintInput.GSTDetails[rj], rj));
            for (var rj = 0; rj < dmPrintInput.GSTDetails.length; rj++) {
                printData.push(appendLine_AmountDeviation(dmPrintInput.GSTDetails[rj], rj));
                lineno += 1;
            }

            printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));

            printData.push(String.fromCharCode(27) + String.fromCharCode(77));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
            printData.push([rightPad('Sales Man', 9), rightPad(' : ', 3), rightPad(BilledBy, 15), rightPad(' ', 2), rightPad('Net Amount', 10), rightPad(':', 1), leftPad(TotalNetAmountWithRoundOff, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
            printData.push(String.fromCharCode(27) + String.fromCharCode(80));

            //printData.push([leftPad('', 1), rightPad('Sales Man', 10), rightPad(' : ', 3), rightPad(BilledBy, 25), rightPad(' ', 22), rightPad('Net Amount', 10), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            //printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
            lineno += 1;

            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 8; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };


        var DSMCHPharmacyReturnPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: {
                    cols: [{
                        field: 'slno',
                        width: '3',
                        cwidth: '3',
                        align: 'center',
                        calign: 'left',
                        display: 'No'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Drug Name'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'batch',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'qty',
                        width: '5',
                        cwidth: '5',
                        align: 'center',
                        calign: 'center',
                        display: 'Qty'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'mrp',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Rate'
                    },
                    {
                        field: 'DetailDiscountPercentage',
                        width: '4',
                        cwidth: '4',
                        align: 'right',
                        calign: 'right',
                        display: 'Dis'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'amount',
                        width: '6',
                        cwidth: '6',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 11;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7


            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    DSMCHPharmacyReturnHeader(printData, dmPrintInput, ri);
                    lineno += 11;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var TotalNoOfItems = dmPrintInput.header.TotalNoOfItems || 0;
            TotalNoOfItems = TotalNoOfItems.toFixed(0);
            var LenTotalNoOfItems = 6;
            var TotalQuantity = dmPrintInput.header.TotalQuantity || 0;
            TotalQuantity = TotalQuantity.toFixed(0);
            var LenTotalQuantity = 8;
            var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
            billtotaldisamt = billtotaldisamt.toFixed(2);
            var Lenbilltotaldisamt = 8;
            var billtotalamt = dmPrintInput.header.totalamount || 0.00;
            billtotalamt = billtotalamt.toFixed(2);
            var Lenbilltotalamt = 8;
            var GrossAmount = dmPrintInput.header.GrossAmount || 0.00;
            GrossAmount = GrossAmount.toFixed(2);
            var LenGrossAmount = 18;
            var TotalCGSTAmount = dmPrintInput.header.TotalCGSTAmount || 0.00;
            TotalCGSTAmount = TotalCGSTAmount.toFixed(2);
            var LenTotalCGSTAmount = 8;
            var TotalSGSTAmount = dmPrintInput.header.TotalSGSTAmount || 0.00;
            TotalSGSTAmount = TotalSGSTAmount.toFixed(2);
            var LenTotalSGSTAmount = 6;
            var TotalGSTAmount = dmPrintInput.header.TotalGSTAmount || 0.00;
            TotalGSTAmount = TotalGSTAmount.toFixed(2);
            var LenTotalGSTAmount = 8;
            var BilledBy = dmPrintInput.header.billedby;
            var LenBilledBy = 20;
            var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
            var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
            var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
            billtotrndoffamt = billtotrndoffamt.toFixed(2);
            billPaidAmt = billPaidAmt.toFixed(2);
            billnetamt = billnetamt.toFixed(2);
            var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
            var Lenbillnetamt = 8;


            printData.push([rightPad(' ', 30), rightPad('-', 25, '-'), printCodes.new_line].join(''));
            printData.push([rightPad(' ', 30), rightPad('Total Amount', 13), rightPad(' ', 2), rightPad(':', 1), rightPad(billtotalamt, Lenbilltotalamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Taxmidplace = getCenterPositionforDMPrintSmall('Tax Braekup');
            var TaxBreakupHeading = leftPad('Tax Braekup', Taxmidplace) + printCodes.new_line;
            printData.push(TaxBreakupHeading || '');
            printData.push([rightPad('Gross Value', 12), rightPad(':', 1), rightPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));
            printData.push([rightPad('     SGST', 12), rightPad(':', 1), rightPad(TotalSGSTAmount, LenTotalSGSTAmount), rightPad('CGST', 5), rightPad(':', 1), rightPad(TotalCGSTAmount, LenTotalCGSTAmount), rightPad('GST Amount', 12), rightPad(':', 1), rightPad(TotalGSTAmount, LenTotalGSTAmount), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('Total Items', 12), rightPad(':', 1), rightPad(TotalNoOfItems, LenTotalNoOfItems), rightPad('Qty', 5), rightPad(':', 1), rightPad(TotalQuantity, LenTotalQuantity), rightPad('Dis. Amount', 12), rightPad(':', 1), rightPad(billtotaldisamt, Lenbilltotaldisamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('User', 12), rightPad(':', 1), rightPad(BilledBy, LenBilledBy), rightPad('Return Amount', 12), rightPad(':', 1), rightPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
            printData.push([rightPad('-', 55, '-'), printCodes.new_line].join(''));
            var Messagemidplace = getCenterPositionforDMPrintSmall('Wish You A Speedy Recovery');
            var MessageHeading = leftPad('Wish You A Speedy Recovery', Messagemidplace) + printCodes.new_line;
            printData.push(MessageHeading || '');

            printData.push(' ' + printCodes.new_line);
            printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 12; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };

        /* Pharmacy Return Print Client Method */

        /* Purchase Order Amentment Print Client Method */
        var PrimePurchaseOrderAmendmentPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '25',
                        cwidth: '25',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'POqty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'POQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'GST',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'GST'
                    },
                    {
                        field: 'UCP',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'UCP'
                    },
                    {
                        field: 'Dis',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'DIS'
                    },
                    {
                        field: 'Value',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    {
                        field: 'cgstamt',
                        width: '11',
                        cwidth: '11',
                        align: 'left',
                        calign: 'left',
                        display: 'CGST'
                    },
                    {
                        field: 'sgstamt',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'SGST'
                    },
                    {
                        field: 'totgst',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    {
                        field: 'TotalMrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'TMRP'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePOAmendmentHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var Tax = dmPrintInput.header.vTax || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;

            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            Tax = Tax.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);

            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenTax = 11 - ('' + Tax).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));

            if (Tax != 0)
                printData.push([rightPad('', 106), rightPad('Tax', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Tax, LenTax), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        var GeneralPurchaseOrderAmendmentPrint = function (dmPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'right',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '0',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'MatName',
                        width: '25',
                        cwidth: '25',
                        align: 'left',
                        calign: 'left',
                        display: '  MatName  '
                    },
                    {
                        field: 'POqty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'POQty'
                    },
                    {
                        field: 'FreeQty',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'FreeQty'
                    },
                    {
                        field: 'PurchasePrice',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'PurPrice'
                    },
                    {
                        field: 'GST',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'GST'
                    },
                    {
                        field: 'UCP',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'UCP'
                    },
                    {
                        field: 'Dis',
                        width: '7',
                        cwidth: '7',
                        align: 'left',
                        calign: 'left',
                        display: 'DIS'
                    },
                    {
                        field: 'Value',
                        width: '8',
                        cwidth: '8',
                        align: 'left',
                        calign: 'left',
                        display: 'Value'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '11',
                    //     cwidth: '11',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '10',
                    //     cwidth: '10',
                    //     align: 'left',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'totgst',
                        width: '10',
                        cwidth: '10',
                        align: 'left',
                        calign: 'left',
                        display: 'Total'
                    },
                    {
                        field: 'amount',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'Amount'
                    },
                    {
                        field: 'TotalMrp',
                        width: '9',
                        cwidth: '9',
                        align: 'left',
                        calign: 'left',
                        display: 'TMRP'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 7;
            var totallinenrperpage = 68; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];
            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }
                    printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    PrimePOAmendmentHeader(printData, dmPrintInput, ri);
                    lineno += 8;
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    lineno += 3;
                }
                var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var GrossAmount = dmPrintInput.header.vGrossAmount || 0.00;
            var Discount = dmPrintInput.header.vDiscount || 0.00;
            var Tax = dmPrintInput.header.vTax || 0.00;
            var OtherCost = dmPrintInput.header.vOtherCost || 0.00;
            var NetAmount = dmPrintInput.header.vNetAmount || 0.00;

            GrossAmount = GrossAmount.toFixed(2);
            Discount = Discount.toFixed(2);
            Tax = Tax.toFixed(2);
            OtherCost = OtherCost.toFixed(2);
            NetAmount = NetAmount.toFixed(2);

            var LenGrossAmount = 11 - ('' + GrossAmount).length;
            var LenDiscount = 11 - ('' + Discount).length;
            var LenTax = 11 - ('' + Tax).length;
            var LenOtherCost = 11 - ('' + OtherCost).length;
            var LenNetAmount = 11 - ('' + NetAmount).length;

            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Gross Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(GrossAmount, LenGrossAmount), printCodes.new_line].join(''));

            if (Discount > 0)
                printData.push([rightPad('', 106), rightPad('Discount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Discount, LenDiscount), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));

            if (Tax != 0)
                printData.push([rightPad('', 106), rightPad('Tax', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(Tax, LenTax), printCodes.new_line].join(''));
            else
                printData.push([rightPad('', 106), printCodes.new_line].join(''));
            printData.push([rightPad('', 106), rightPad('Net Amount', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(NetAmount, LenNetAmount), printCodes.new_line].join(''));
            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
            lineno += 7;


            for (var k = lineno; k < 44; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        /* Purchase Order Amentment Print Client Method */



        /* Pharamcy Bill Details Print Client Method */
        var PrimePharmacyBillDetailsPrint = function (dmAllPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '36',
                        cwidth: '36',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '17',
                        cwidth: '17',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '17',
                        cwidth: '17',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '16',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 10;
            var footerline = 1;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }
                    if (perbillheader == 1) {
                        lineno = 0;
                        PrimePharmacyBillDetailsHeader(printData, dmPrintInput, ri);
                        lineno += 11;

                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        lineno += 3;


                        perbillheader = 0;
                    }

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    lineno += 1;
                }
                if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                    for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                        printData.push(printCodes.new_line);
                        lineno++;
                    }
                }

                if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                    for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                        printData.push(printCodes.new_line);

                    lineno = 0; // new page;
                }

                var billtotalamt = dmPrintInput.header.totalamount || 0.00;
                var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
                var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
                var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
                var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
                var BilledBy = dmPrintInput.header.billedby;

                GrossAmt += billnetamt;

                billtotalamt = billtotalamt.toFixed(2);
                billtotaldisamt = billtotaldisamt.toFixed(2);
                billtotrndoffamt = billtotrndoffamt.toFixed(2);
                billnetamt = billnetamt.toFixed(2);
                billPaidAmt = billPaidAmt.toFixed(2);

                var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
                var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
                var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
                var Lenbillnetamt = 11 - ('' + billnetamt).length;

                var vPaidAmt = '';
                var vPaymode = '';

                if (billPaidAmt > 0) {
                    vPaidAmt = ' Paid Amt : ' + billPaidAmt;
                }

                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                printData.push([rightPad('', 108), rightPad('Total', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                lineno += 3;
            }


            for (var k = 0; k < 10; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        var GeneralPharmacyBillDetailsPrint = function (dmAllPrintInput) {
            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '36',
                        cwidth: '36',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '17',
                        cwidth: '17',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '17',
                        cwidth: '17',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '16',
                        cwidth: '16',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    {
                        field: 'amount',
                        width: '18',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 10;
            var footerline = 1;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }
                    if (perbillheader == 1) {
                        lineno = 0;
                        PrimePharmacyBillDetailsHeader(printData, dmPrintInput, ri);
                        lineno += 11;

                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        lineno += 3;


                        perbillheader = 0;
                    }

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    lineno += 1;
                }
                if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                    for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                        printData.push(printCodes.new_line);
                        lineno++;
                    }
                }

                if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                    for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                        printData.push(printCodes.new_line);

                    lineno = 0; // new page;
                }

                var billtotalamt = dmPrintInput.header.totalamount || 0.00;
                var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
                var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
                var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
                var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
                var BilledBy = dmPrintInput.header.billedby;

                GrossAmt += billnetamt;

                billtotalamt = billtotalamt.toFixed(2);
                billtotaldisamt = billtotaldisamt.toFixed(2);
                billtotrndoffamt = billtotrndoffamt.toFixed(2);
                billnetamt = billnetamt.toFixed(2);
                billPaidAmt = billPaidAmt.toFixed(2);

                var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
                var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
                var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
                var Lenbillnetamt = 11 - ('' + billnetamt).length;

                var vPaidAmt = '';
                var vPaymode = '';

                if (billPaidAmt > 0) {
                    vPaidAmt = ' Paid Amt : ' + billPaidAmt;
                }

                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                printData.push([rightPad('', 108), rightPad('Total', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                lineno += 3;
            }


            for (var k = 0; k < 10; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);

            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }

        };
        /* Pharamcy Bill Details Print Client Method */


        /* Consolidate Payment Print Client Method */
        var PrimeConsolidatePaymentPrint = function (dmAllPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 1;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }
                    if (perbillheader == 1) {
                        lineno = 0;
                        PrimeConsolidatePaymentHeader(printData, dmPrintInput, ri);
                        lineno += 8;

                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        lineno += 3;


                        perbillheader = 0;
                    }

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    lineno += 1;
                }
                if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                    for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                        printData.push(printCodes.new_line);
                        lineno++;
                    }
                }

                if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                    for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                        printData.push(printCodes.new_line);

                    lineno = 0; // new page;
                }

                var billtotalamt = dmPrintInput.header.totalamount || 0.00;
                var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
                var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
                var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
                var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
                var BilledBy = dmPrintInput.header.billedby;

                GrossAmt += billnetamt;

                billtotalamt = parseFloat(billtotalamt).toFixed(2);
                billtotaldisamt = parseFloat(billtotaldisamt).toFixed(2);
                billtotrndoffamt = parseFloat(billtotrndoffamt).toFixed(2);
                billnetamt = parseFloat(billnetamt).toFixed(2);
                billPaidAmt = parseFloat(billPaidAmt).toFixed(2);

                var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
                var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
                var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
                var Lenbillnetamt = 11 - ('' + billnetamt).length;

                var vPaidAmt = '';
                var vPaymode = '';

                if (billPaidAmt > 0) {
                    vPaidAmt = ' Paid Amt : ' + billPaidAmt;
                }

                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                printData.push([rightPad('', 108), rightPad('Total', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                lineno += 3;
            }


            for (var k = 0; k < 10; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        var GeneralConsolidatePaymentPrint = function (dmAllPrintInput) {

            dmSchemaConfig = { // 135 - total width
                row: { // printData.push(String.fromCharCode(27) + String.fromCharCode(15));
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'right',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'desc',
                        width: '26',
                        cwidth: '26',
                        align: 'left',
                        calign: 'left',
                        display: '  Desc  '
                    },
                    {
                        field: 'ispace',
                        width: '1',
                        cwidth: '1',
                        align: 'left',
                        calign: 'left',
                        display: ''
                    },
                    {
                        field: 'hsn',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'HSN'
                    },
                    {
                        field: 'sch',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'Sch'
                    },
                    {
                        field: 'batch',
                        width: '12',
                        cwidth: '12',
                        align: 'left',
                        calign: 'left',
                        display: 'Batch'
                    },
                    {
                        field: 'exp',
                        width: '10',
                        cwidth: '16',
                        align: 'left',
                        calign: 'left',
                        display: 'Exp'
                    },
                    {
                        field: 'mrp',
                        width: '12',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'MRP'
                    },
                    {
                        field: 'qty',
                        width: '8',
                        cwidth: '8',
                        align: 'right',
                        calign: 'left',
                        display: 'Qty'
                    },
                    // {
                    //     field: 'cgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'CGST'
                    // },
                    // {
                    //     field: 'sgstamt',
                    //     width: '12',
                    //     cwidth: '12',
                    //     align: 'right',
                    //     calign: 'left',
                    //     display: 'SGST'
                    // },
                    {
                        field: 'amount',
                        width: '15',
                        cwidth: '12',
                        align: 'right',
                        calign: 'left',
                        display: 'Amount'
                    }
                    ]
                }
            };

            var headerlineno = 8;
            var footerline = 1;
            var totallinenrperpage = 34; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);
            // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var headingprint = 0;
            var lineno = 0;
            var perbillheader = 0;
            var GrossAmt = 0;
            for (var idnx in dmAllPrintInput) {
                perbillheader = 1;
                var dmPrintInput = dmAllPrintInput[idnx];
                for (var ri = 0; ri < dmPrintInput.lines.length; ri++) {
                    if (ri % linesPerPage === 0) {
                        if (ri > 0) {
                            for (var viend = 0, k = lineno; k < (totallinenrperpage + 2); viend++, k++) {
                                if (viend === 0) {
                                    printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                                } else if (viend == 1) {
                                    printData.push([leftPad('continued....', 135 - 15), printCodes.new_line].join(''));
                                    printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                                } else {
                                    printData.push(printCodes.new_line);
                                }
                            }
                            lineno = 0; // new page;
                        }
                        printData.push(String.fromCharCode(27) + String.fromCharCode(15));


                    }
                    if (perbillheader == 1) {
                        lineno = 0;
                        PrimeConsolidatePaymentHeader(printData, dmPrintInput, ri);
                        lineno += 8;

                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                        printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                        lineno += 3;


                        perbillheader = 0;
                    }

                    var rowdata = appendLine(dmPrintInput.lines[ri], ri);
                    printData.push(rowdata);
                    lineno += 1;
                }
                if (lineno <= (totallinenrperpage - 7)) { // 7 - line for footer
                    for (var k = lineno; k < (totallinenrperpage - 7); k++) { // 7 - line for footer
                        printData.push(printCodes.new_line);
                        lineno++;
                    }
                }

                if (lineno > (totallinenrperpage - 7) && lineno < totallinenrperpage) {
                    for (var k = lineno; k < (totallinenrperpage + 2); k++) // one page upto 21 lines
                        printData.push(printCodes.new_line);

                    lineno = 0; // new page;
                }

                var billtotalamt = dmPrintInput.header.totalamount || 0.00;
                var billtotaldisamt = dmPrintInput.header.totDiscont || 0.00;
                var billtotrndoffamt = dmPrintInput.header.totroundoff || 0.00;
                var billPaidAmt = dmPrintInput.header.totpaidamt || 0.00;
                var billnetamt = (billtotalamt - billtotaldisamt) + billtotrndoffamt;
                var BilledBy = dmPrintInput.header.billedby;

                GrossAmt += billnetamt;

                billtotalamt = parseFloat(billtotalamt).toFixed(2);
                billtotaldisamt = parseFloat(billtotaldisamt).toFixed(2);
                billtotrndoffamt = parseFloat(billtotrndoffamt).toFixed(2);
                billnetamt = parseFloat(billnetamt).toFixed(2);
                billPaidAmt = parseFloat(billPaidAmt).toFixed(2);

                var Lenbilltotalamt = 11 - ('' + billtotalamt).length;
                var Lenbilltotaldisamt = 11 - ('' + billtotaldisamt).length;
                var Lenbilltotrndoffamt = 11 - ('' + billtotrndoffamt).length;
                var Lenbillnetamt = 11 - ('' + billnetamt).length;

                var vPaidAmt = '';
                var vPaymode = '';

                if (billPaidAmt > 0) {
                    vPaidAmt = ' Paid Amt : ' + billPaidAmt;
                }

                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                printData.push([rightPad('', 108), rightPad('Total', 12), rightPad(' ', 2), rightPad(':', 1), leftPad(billnetamt, Lenbillnetamt), printCodes.new_line].join(''));
                printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                lineno += 3;
            }


            for (var k = 0; k < 10; k++) // set to correct place
                printData.push(' ' + printCodes.new_line);


            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }


        };
        /* Consolidate Payment Print Client Method */

        var LotusPharmacyConsolidatedBill = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'BillNumber',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill No'
                    },
                    {
                        field: 'BillDateWithTime',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill Date'
                    },
                    {
                        field: 'BillAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    },
                    {
                        field: 'BillDiscount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Discount'
                    },
                    {
                        field: 'RoundOffValue',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Rnd Off'
                    },
                    {
                        field: 'BillNetAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Net Amt'
                    }
                    ]
                }
            };

            dmSchemaConfig_AmountDeviation = {
                row: {
                    cols: [{
                        field: 'slno1',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ReturnNumber',
                        width: '14',
                        cwidth: '14',
                        align: 'left',
                        calign: 'left',
                        display: 'Ret No'
                    },
                    {
                        field: 'ReturnDateWithTime',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Ret Date'
                    },
                    {
                        field: 'BillNumberAgainstReturn',
                        width: '14',
                        cwidth: '14',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill No'
                    },
                    {
                        field: 'BillDateWithTimeAgainstReturn',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill Date'
                    },
                    {
                        field: 'ReturnAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                        //{ field: 'DiscountAmount', width: '8', cwidth: '8', align: 'right', calign: 'right', display: 'Dis' }
                        //{ field: 'RoundOffValue', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Rnd Off' },
                        //{ field: 'ReturnNetAmount', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Net Amt' }
                    ]
                }
            };

            var headerlineno = 12;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.PharmacyBills.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 85 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }

                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    LotusPharmacyConsolidatedHeader(printData, dmPrintInput, ri);
                    lineno += 1;
                    //printData.push([rightPad('', 85, ''), printCodes.new_line].join(''));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(77));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                    printData.push([rightPad('Sales Details : ', 50), printCodes.new_line].join(''));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.PharmacyBills[ri], ri));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    lineno += 5;
                }
                var rowdata = appendLine(dmPrintInput.PharmacyBills[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var LenTotalAmount = 5;
            printData.push(String.fromCharCode(27) + String.fromCharCode(77));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
            printData.push([rightPad(' ', 15), rightPad('Total Sales Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalSalesAmount, LenTotalAmount), printCodes.new_line].join(''));
            //printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
            //printData.push(String.fromCharCode(27) + String.fromCharCode(80));
            lineno += 1;
            if (dmPrintInput.summary.IsDisplayReturns == true) {
                //printData.push([rightPad('', 85, ''), printCodes.new_line].join(''));
                //printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                printData.push([rightPad('Return Details : ', 50), printCodes.new_line].join(''));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                printData.push(appendLineHeader_AmountDeviation(dmPrintInput.PharmacyReturns[rj], rj));
                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                for (var rj = 0; rj < dmPrintInput.PharmacyReturns.length; rj++) {
                    printData.push(appendLine_AmountDeviation(dmPrintInput.PharmacyReturns[rj], rj));
                    lineno += 1;
                }
                printData.push(String.fromCharCode(27) + String.fromCharCode(77));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                printData.push([rightPad(' ', 15), rightPad('Total Return Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalReturnAmount, LenTotalAmount), printCodes.new_line].join(''));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                lineno += 1;
            }
            printData.push(String.fromCharCode(27) + String.fromCharCode(77));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
            printData.push([rightPad(' ', 15), rightPad('Net Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalAmount, LenTotalAmount), printCodes.new_line].join(''));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
            printData.push(String.fromCharCode(27) + String.fromCharCode(80));
            lineno += 1;


            //printData.push(' ' + printCodes.new_line);
            //printData.push(' ' + printCodes.new_line);
            //printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 8; k++) // set to correct place bottomspace
                printData.push(' ' + printCodes.new_line);
            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };
        var GeneralPharmacyConsolidatedBill = function (dmPrintInput) {

            dmSchemaConfig = {
                row: {
                    cols: [{
                        field: 'slno',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'BillNumber',
                        width: '15',
                        cwidth: '15',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill No'
                    },
                    {
                        field: 'BillDateWithTime',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill Date'
                    },
                    {
                        field: 'BillAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    },
                    {
                        field: 'BillDiscount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Discount'
                    },
                    {
                        field: 'RoundOffValue',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Rnd Off'
                    },
                    {
                        field: 'BillNetAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Net Amt'
                    }
                    ]
                }
            };

            dmSchemaConfig_AmountDeviation = {
                row: {
                    cols: [{
                        field: 'slno1',
                        width: '5',
                        cwidth: '5',
                        align: 'left',
                        calign: 'left',
                        display: 'S.N'
                    },
                    {
                        field: 'ReturnNumber',
                        width: '14',
                        cwidth: '14',
                        align: 'left',
                        calign: 'left',
                        display: 'Ret No'
                    },
                    {
                        field: 'ReturnDateWithTime',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Ret Date'
                    },
                    {
                        field: 'BillNumberAgainstReturn',
                        width: '14',
                        cwidth: '14',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill No'
                    },
                    {
                        field: 'BillDateWithTimeAgainstReturn',
                        width: '20',
                        cwidth: '20',
                        align: 'left',
                        calign: 'left',
                        display: 'Bill Date'
                    },
                    {
                        field: 'ReturnAmount',
                        width: '10',
                        cwidth: '10',
                        align: 'right',
                        calign: 'right',
                        display: 'Amount'
                    }
                        //{ field: 'DiscountAmount', width: '8', cwidth: '8', align: 'right', calign: 'right', display: 'Dis' }
                        //{ field: 'RoundOffValue', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Rnd Off' },
                        //{ field: 'ReturnNetAmount', width: '7', cwidth: '7', align: 'right', calign: 'right', display: 'Net Amt' }
                    ]
                }
            };

            var headerlineno = 12;
            var footerline = 10;
            var totallinenrperpage = 200; // total line number per page.
            var linesPerPage = totallinenrperpage - (headerlineno + footerline);

            var printData = [
                '\x1B' + '\x40', // Printer initalize                // ESC + @
                '\x1B' + '\x61' + '\x30', // Cursor move to Print left align  // Esc + a + 0
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                String.fromCharCode(27) + String.fromCharCode(106) + 1, //Head Adj  // Esc + j + 1
                printCodes.new_line
            ];

            var lineno = 0;
            for (var ri = 0; ri < dmPrintInput.PharmacyBills.length; ri++) {
                if (ri % linesPerPage === 0) {
                    if (ri > 0) {
                        for (var viend = 0, k = lineno; k < (totallinenrperpage + 5); viend++, k++) {
                            if (viend === 0) {
                                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                            } else if (viend == 1) {
                                printData.push([leftPad('continued....', 85 - 15), printCodes.new_line].join(''));
                                printData.push(String.fromCharCode(27) + String.fromCharCode(18));
                            } else {
                                printData.push(printCodes.new_line);
                            }
                        }
                        lineno = 0; // new page;
                    }

                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    LotusPharmacyConsolidatedHeader(printData, dmPrintInput, ri);
                    lineno += 1;
                    //printData.push([rightPad('', 85, ''), printCodes.new_line].join(''));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(77));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                    printData.push([rightPad('Sales Details : ', 50), printCodes.new_line].join(''));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                    printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    printData.push(appendLineHeader(dmPrintInput.PharmacyBills[ri], ri));
                    printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                    lineno += 5;
                }
                var rowdata = appendLine(dmPrintInput.PharmacyBills[ri], ri);
                printData.push(rowdata);
                lineno += 1;
            }
            var LenTotalAmount = 5;
            printData.push(String.fromCharCode(27) + String.fromCharCode(77));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
            printData.push([rightPad(' ', 15), rightPad('Total Sales Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalSalesAmount, LenTotalAmount), printCodes.new_line].join(''));
            //printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
            //printData.push(String.fromCharCode(27) + String.fromCharCode(80));
            lineno += 1;
            if (dmPrintInput.summary.IsDisplayReturns == true) {
                //printData.push([rightPad('', 85, ''), printCodes.new_line].join(''));
                //printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                printData.push([rightPad('Return Details : ', 50), printCodes.new_line].join(''));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                printData.push(appendLineHeader_AmountDeviation(dmPrintInput.PharmacyReturns[rj], rj));
                printData.push([rightPad('-', 85, '-'), printCodes.new_line].join(''));
                for (var rj = 0; rj < dmPrintInput.PharmacyReturns.length; rj++) {
                    printData.push(appendLine_AmountDeviation(dmPrintInput.PharmacyReturns[rj], rj));
                    lineno += 1;
                }
                printData.push(String.fromCharCode(27) + String.fromCharCode(77));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
                printData.push([rightPad(' ', 15), rightPad('Total Return Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalReturnAmount, LenTotalAmount), printCodes.new_line].join(''));
                printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
                printData.push(String.fromCharCode(27) + String.fromCharCode(80));
                lineno += 1;
            }
            printData.push(String.fromCharCode(27) + String.fromCharCode(77));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(1));
            printData.push([rightPad(' ', 15), rightPad('Net Amount', 20), rightPad(' : ', 3), leftPad(dmPrintInput.summary.TotalAmount, LenTotalAmount), printCodes.new_line].join(''));
            printData.push(String.fromCharCode(27) + String.fromCharCode(87) + String.fromCharCode(0));
            printData.push(String.fromCharCode(27) + String.fromCharCode(80));
            lineno += 1;


            //printData.push(' ' + printCodes.new_line);
            //printData.push(' ' + printCodes.new_line);
            //printData.push(' ' + printCodes.new_line);

            for (var k = 0; k < 8; k++) // set to correct place bottomspace
                printData.push(' ' + printCodes.new_line);
            console.log('printData');
            console.log(printData);
            try {
                $scope.printRaw(printData);
            } catch (e) {
                console.log("Got an error!", e);
            }
        };



        /* Common Method */

        var printCodes = {
            new_line: '\x0A'
        };

        var leftPad = function (text, length, padText) {
            padText = ' ';
            var empties = '';
            for (var i = 0; i < length; i++) {
                empties += padText;
            }
            return empties + text;
        };

        var rightPad = function (text, totalLength, padText) {
            var result = text;
            if (result) {
                padText = padText || ' ';
                if (text.length < totalLength) {
                    var length = totalLength - text.length;
                    var empties = '';
                    for (var i = 0; i < length; i++) {
                        empties += padText;
                    }
                    result = text + empties;
                } else {
                    result = text.substr(0, totalLength);
                }
            }
            return result;
        };

        var appendColumnHeader = function (rowData, cMeta, colIndex) {
            var cValue = cMeta.display;
            var cText = ' ' + cValue;
            var diff = cMeta.cwidth - cText.length;
            diff = diff < 0 ? 0 : diff;
            var content = cText;
            content = cMeta.calign === 'left' ? rightPad(content, cMeta.cwidth) : leftPad(content, diff);
            return content;
        };

        var appendColumn = function (rowData, cMeta, colIndex) {
            var cValue = rowData[cMeta.field];
            var cText = '' + cValue;
            cText = cMeta.align === 'left' ? cText + ' ' : cText;
            var diff = cMeta.width - cText.length;
            diff = diff < 0 ? 0 : diff;
            var content = cText;
            content = cMeta.align === 'left' ? rightPad(content, cMeta.width) : leftPad(content, diff);
            return content;
        };

        var appendLineHeader = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig.row.cols[ci];
                columns.push(appendColumnHeader(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        var appendLine = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig.row.cols[ci];
                columns.push(appendColumn(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        var appendLine_SecondRow = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig_SecondRow.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig_SecondRow.row.cols[ci];
                columns.push(appendColumn(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        var appendLine_ThirdRow = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig_ThirdRow.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig_ThirdRow.row.cols[ci];
                columns.push(appendColumn(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        var appendLineHeader_AmountDeviation = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig_AmountDeviation.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig_AmountDeviation.row.cols[ci];
                columns.push(appendColumnHeader(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        var appendLine_AmountDeviation = function (rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig_AmountDeviation.row.cols.length; ci++) {
                var cMeta = dmSchemaConfig_AmountDeviation.row.cols[ci];
                columns.push(appendColumn(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };

        function getCenterPositionforDMPrint(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidth - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }

        function getCenterPositionforDMPrintSmall(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidthForSmall - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }

        function getCenterPositionforDMPrintMedium(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidthForMedium - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }

        function getCenterPositionforDMPrintLotus(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidthForLotus - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }

        function getCenterPositionforDMPrintBigFont(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidthForBigFont - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }

        /*Common Method */

    }

    dotmatrixprintcontroller.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();