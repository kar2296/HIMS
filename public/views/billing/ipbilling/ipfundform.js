(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('addFundFormController', addFundFormController);

    function addFundFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;

        $scope.item = {
            PaymentTypeId: 1,
            ReceiptDateTime: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrencyTypeId: 1
        };
        $scope.currentcontext = {}
        $scope.CanShowClearBtn = true;
        $scope.currentcontext.PatientOrderReq = false;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            if (modalConfig.params.guarantorid) {
                $scope.item.GuarantorId = modalConfig.params.guarantorid;
                $scope.item.GuarantorTypeId = modalConfig.params.guarantortypeid;
            }
            $scope.Patient = modalConfig.params.patient;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if (modalConfig && modalConfig.params &&
            modalConfig.params.patientorderreq) {
            $scope.currentcontext.PatientOrderReq = modalConfig.params.patientorderreq;
        }

        if (modalConfig && modalConfig.params &&
            modalConfig.params.advcomments) {
            $scope.item.Comments = modalConfig.params.advcomments;
        }

        $scope.maxadvancecash = 0;
        $scope.maxadvancecash =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxadvancecash');

        $scope.ipmaxcash = 0;
        $scope.ipmaxcash =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ipmaxcash');


        $scope.item.PatientName = ($scope.Patient.Title ? $scope.Patient.Title.Description : '') + ' ' +
            $scope.Patient.FirstName + ' ' +
            ($scope.Patient.LastName != null ? $scope.Patient.LastName : '');
        $scope.currentcontext.rid = parseInt(modalConfig.params.rid);
        $scope.currentcontext.BillId = parseInt(modalConfig.params.billid);
        $scope.item.AmountPaid = parseFloat(modalConfig.params.osamt);
        $scope.currentcontext.AmountPaid = parseInt(modalConfig.params.osamt);
        $scope.BillFinalized = modalConfig.params.summarystatus;


        var sort_by = function(field, reverse, primer) {
            var key = primer ?
                function(x) {
                    return primer(x[field])
                } :
                function(x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function(a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        //Load patient guarantors
        $scope.loadPatientGuarantorsCallback = function(scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            if (!$scope.item.GuarantorId) {
                if ($scope.$parent.Data.GuarantorId)
                    $scope.item.GuarantorId = $scope.$parent.Data.GuarantorId;
                else
                    $scope.item.GuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
        }

        $scope.loadPatientGuarantors = function() {
            //Get only active guarantors - 2
            if ($scope.Encounter.PatientId && $scope.Encounter.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        }


        $scope.getEncounterCallback = function(scope, data, options, hasError) {
            $scope.Encounter = data;
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.DepartmentID = $scope.Encounter.DepartmentId;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.loadPatientGuarantors();
        };

        $scope.getEncounter = function(pageNo) {

            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.id
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };
            utl.Http.doAction(options);
        };

        //get item
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.IsCompleted = false;
            $scope.canShowPrintledBtn = false;
            $scope.canShowCancelledBtn = false;
            $scope.canHidePrintledBtn = false;
            if ($scope.item.ReceiptStatusId == 1) {
                $scope.canShowCancelledBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.CanShowClearBtn = false;
            }
            if ($scope.item.ReceiptStatusId == 1 || 3) {
                $scope.IsCompleted = true;
                $scope.canShowPrintledBtn = true;
                $scope.canHidePrintledBtn = true;
            }
            if ($scope.item.ReceiptStatusId == 2) {
                $scope.IsCompleted = false;
                $scope.canShowPrintledBtn = false;
                $scope.canHidePrintledBtn = false;
            }
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.rid && $scope.currentcontext.rid > 0) {

                var options = {
                    action: 'billing/PatientPaymentDetails/GetPatientPaymentDetailsById',
                    data: {
                        Id: $scope.currentcontext.rid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            // $state.go('app.remarks');
            $scope.confirmCallback();
        }
        $scope.onCancelConfirmed = function() {
            // $scope.item.ReceiptStatusId = 3; // Cancelled
            $scope.saveItem(3);
        }
        $scope.originalprint = function() {

            var inputData = {
                Id: $scope.currentcontext.rid,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        }
        $scope.print = function() {
            var inputData = {
                Id: $scope.currentcontext.rid
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);


        }
        $scope.afterSave = function(data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $timeout(function () {
            //     $scope.originalprint();
            // }, 500);

        };
        var totalpaperwidth = 135;

        function getCenterPositionforDMPrint(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidth - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        }
        $scope.dmPrint = function() {

            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg('No Perference Settings for current facility');
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.rid
                };
                var options = {
                    action: 'billing/PatientPaymentDetails/DMPrintPatientPaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.dmPrintCallback = function(scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            constructTableAndPrint(dmPrintInput);
        }


        function preparePrintData(data) {
            console.log('preparePrintData starts');
            console.log(data);

            var vIPNo = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';

            var vaddr1 = '';
            var vaddr2 = '';
            var vpincode = '';
            var varea = '';
            var vcity = '';
            var vstate = '';
            var vcountry = '';
            var vContactNo = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vWardNo = '';
            var vWardRoomNo = '';
            var vWardBedNo = '';
            var vReceiptNO = '';
            var NetAmountInWords = '';
            var vDepartment = '';
            var vpaymentmode = '';



            if (data.PatientPaymentDetails.Encounter) var vIPNo = '' + data.PatientPaymentDetails.Encounter.VisitIdentifier;

            if (data.PatientPaymentDetails.User) {
                if (data.PatientPaymentDetails.User.Title) vUTitle = data.PatientPaymentDetails.User.Title.Description;
                if (data.PatientPaymentDetails.User.FirstName) vUFirstName = data.PatientPaymentDetails.User.FirstName;
                if (data.PatientPaymentDetails.User.LastName) vULastName = data.PatientPaymentDetails.User.LastName;
                vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
            }


            if (data.PatientPaymentDetails.CreatedUser) {
                if (data.PatientPaymentDetails.CreatedUser.Title) vCTitle = data.PatientPaymentDetails.CreatedUser.Title.Description;
                if (data.PatientPaymentDetails.CreatedUser.FirstName) vCFirstName = data.PatientPaymentDetails.CreatedUser.FirstName;
                if (data.PatientPaymentDetails.CreatedUser.LastName) vCLastName = data.PatientPaymentDetails.CreatedUser.LastName;
            }


            if (data.PatientPaymentDetails.Patient) {
                if (data.PatientPaymentDetails.Patient.Title) vPTitle = data.PatientPaymentDetails.Patient.Title.Description;
                if (data.PatientPaymentDetails.Patient.FirstName) vPFirstName = data.PatientPaymentDetails.Patient.FirstName;
                if (data.PatientPaymentDetails.Patient.LastName) vPLastName = data.PatientPaymentDetails.Patient.LastName;
                if (data.PatientPaymentDetails.Patient.MRN) vMRN = '' + data.PatientPaymentDetails.Patient.MRN;
                if (data.PatientPaymentDetails.Patient.Age) vAge = '' + data.PatientPaymentDetails.Patient.Age;



                if (data.PatientPaymentDetails.Patient.Gender) vGender = '' + data.PatientPaymentDetails.Patient.Gender.Description;
                if (data.Patient.AddressLine1)
                    vaddr1 = '' + data.Patient.AddressLine1;
                if (data.Patient.AddressLine2)
                    vaddr2 = '' + data.Patient.AddressLine2;
                if (data.Patient.Pincode)
                    vpincode = '' + data.Patient.Pincode;


                if (data.Patient.Area)
                    varea = '' + data.Patient.Area;
                if (data.Patient.City)
                    vcity = '' + data.Patient.City;
                if (data.Patient.State)
                    vstate = '' + data.Patient.State;
                if (data.Patient.Country)
                    vcountry = '' + data.Patient.Country;

                if (data.Encounter.WardMaster.WardName)
                    vWardNo = '' + data.Encounter.WardMaster.WardName;

                if (data.Encounter.WardRoomMaster.RoomNo)
                    vWardRoomNo = '' + data.Encounter.WardRoomMaster.RoomNo;

                if (data.Encounter.WardRoomBedMaster.Description)
                    vWardBedNo = '' + data.Encounter.WardRoomBedMaster.Description;

                if (data.PatientPaymentDetails.ReceiptNumber)
                    vReceiptNO = '' + data.PatientPaymentDetails.ReceiptNumber;

                if (data.Encounter.Department.DepartmentName)
                    vDepartment = '' + data.Encounter.Department.DepartmentName;


                if (data.Patient.Mobile) vContactNo = '' + data.Patient.Mobile;
            } else {
                if (data.PatientPaymentDetails.Title)
                    vPTitle = data.PatientPaymentDetails.Title.Description;
                vPFirstName = data.PatientPaymentDetails.PatientName;
                if (data.PatientPaymentDetails.Age)
                    vAge = '' + data.PatientPaymentDetails.Age;
                if (data.PatientPaymentDetails.Gender)
                    vGender = '' + data.PatientPaymentDetails.Gender.Description;
                if (data.PatientPaymentDetails.DoctorName)
                    vDrName = '' + data.PatientPaymentDetails.DoctorName;
            }

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: vDrName || '',
                patientname: vPTitle + '.' +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN,
                Age: vAge,

                Gender: vGender,
                IPNo: vIPNo,
                AddressLine1: vaddr1,
                AddressLine2: vaddr2,
                Pincode: vpincode,
                Area: varea,
                City: vcity,
                State: vstate,
                Country: vcountry,
                Mobile: vContactNo,
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                PaidAmt: data.PatientPaymentDetails.AmountPaid,
                WardNo: vWardNo,
                WardRoomNo: vWardRoomNo,
                WardBedNo: vWardBedNo,
                ReceiptNo: vReceiptNO,
                Department: vDepartment,
                billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                NetAmountInWords: data.NetAmountInWords,
                paymentmode: data.PatientPaymentDetails.PaymentType.Description
            };
            dmPrintInput.lines = [];

            var detail = {};

            dmPrintInput.lines.push(detail);

            console.log('preparePrintData ends');
            return dmPrintInput;
        }
        var printCodes = {
            new_line: '\x0A'
        };
        var dmSchemaConfig = {
            row: {
                cols: []
            }
        }

        var leftPad = function(text, length, padText) {
            padText = ' ';
            var empties = '';
            for (var i = 0; i < length; i++) {
                empties += padText;
            }
            return empties + text;
        };
        var rightPad = function(text, totalLength, padText) {
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


        var appendColumnHeader = function(rowData, cMeta, colIndex) {
            var cValue = cMeta.display;
            var cText = ' ' + cValue;
            var diff = cMeta.cwidth - cText.length;
            diff = diff < 0 ? 0 : diff;
            var content = cText;
            content = cMeta.calign === 'left' ? rightPad(content, cMeta.cwidth) : leftPad(content, diff);
            return content;
        };
        var appendColumn = function(rowData, cMeta, colIndex) {
            var cValue = rowData[cMeta.field];
            var cText = '' + cValue;
            cText = cMeta.align === 'left' ? cText + ' ' : cText;
            var diff = cMeta.width - cText.length;
            diff = diff < 0 ? 0 : diff;
            var content = cText;
            content = cMeta.align === 'left' ? rightPad(content, cMeta.width) : leftPad(content, diff);
            return content;
        };
        var appendLineHeader = function(rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig.row.cols.length; ci++) {
                var cMeta = dmPrintInput.row.cols[ci];
                columns.push(appendColumnHeader(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };
        var appendLine = function(rowData, rowIndex) {
            var columns = [];
            for (var ci = 0; ci < dmSchemaConfig.row.cols.length; ci++) {
                var cMeta = dmPrintInput.row.cols[ci];
                columns.push(appendColumn(rowData, cMeta, ci));
            }
            columns.push(printCodes.new_line);
            return columns.join('');
        };
        var constructHeader = function(printData, dmPrintInput, ri) {
            var heading1 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading1');
            var heading2 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading2');
            var heading3 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading3');
            var heading4 = utl.FacilitySetting.getFacilitySettingValue('dmprint', 'heading4');
            var heading5 = "ADVANCE RECEIPT";

            var lblName = "Name";
            var lblmobno = "Mobile No";

            var lbladdr1 = "Address1";
            var lbladdr2 = "Address2";
            var lblpincode = "Pincode";
            var lblarea = "Area";
            var lblcity = "City";
            var lblstate = "State";
            var lblcountry = "Country";


            var lbldoctorname = "Doctor Name";
            var lblbilldate = "Bill Date";



            var lblWard = "Ward";
            var lblWardRoomNo = "Room";
            var lblWardBedNo = "Bed";

            var lblReceiptNo = "Receipt";

            var lblDepartment = "Department";

            var h1midplace = getCenterPositionforDMPrint(heading1);
            var h2midplace = getCenterPositionforDMPrint(heading2);
            var h3midplace = getCenterPositionforDMPrint(heading3);
            var h4midplace = getCenterPositionforDMPrint(heading4);
            var h5midplace = getCenterPositionforDMPrint(heading5);



            heading1 = leftPad(heading1, h1midplace) + printCodes.new_line;
            heading2 = leftPad(heading2, h2midplace) + printCodes.new_line;
            heading3 = leftPad(heading3, h3midplace) + printCodes.new_line;
            heading4 = leftPad(heading4, h4midplace) + printCodes.new_line;
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


            var vIPNo = (dmPrintInput.header.IPNo);

            if (vAgeGender.length > 1)
                vPatName = vPatName + ' / ' + vAgeGender;

            if (vMRN.length > 0)
                vPatName = vPatName + ' / ' + vMRN;

            if (vIPNo.length > 0)
                vPatName = vPatName + ' / ' + vIPNo;


            vPatName = rightPad(vPatName, 112);

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



            lbldoctorname = rightPad(lbldoctorname, 17);
            lbldoctorname += ":";
            var vDrName = rightPad(dmPrintInput.header.prescribedby, 77);




            lblmobno = rightPad(lblmobno, 15);
            lblmobno += ":";
            var vContactNo = rightPad(dmPrintInput.header.Mobile, 22);


            lblbilldate = rightPad(lblbilldate, 17);
            lblbilldate += ":";
            var vBillDate = rightPad(dmPrintInput.header.billdate, 77);




            lblWard = rightPad(lblWard, 17);
            lblWard += ":";
            var vWardNo = rightPad(dmPrintInput.header.WardNo);




            lblReceiptNo = rightPad(lblReceiptNo, 15);
            lblReceiptNo += ":";
            var vReceiptNO = rightPad(dmPrintInput.header.ReceiptNo, 22);



            lblDepartment = rightPad(lblDepartment, 15);
            lblDepartment += ":";
            var VDepartment = rightPad(dmPrintInput.header.Department, 22);

            var vWardRoomNo = '' + dmPrintInput.header.WardRoomNo;
            var vWardBedNo = '' + dmPrintInput.header.WardBedNo;

            if (vWardRoomNo.length > 1)
                vWardNo = vWardNo + ' / ' + vWardRoomNo;

            if (vWardBedNo.length > 0)
                vWardNo = vWardNo + ' / ' + vWardBedNo;

            vWardNo = rightPad(vWardNo, 112);


            printData.push(heading1);
            printData.push(heading2);
            printData.push(heading3);
            printData.push(heading4);
            printData.push(heading5);

            printData.push([lblName, vPatName, printCodes.new_line].join(''));
            printData.push([lbladdr1, vaddr1, lbladdr2, vaddr2, printCodes.new_line].join(''));
            printData.push([lblarea, varea, lblcity, vcity, printCodes.new_line].join(''));
            printData.push([lblstate, vstate, lblcountry, vcountry, printCodes.new_line].join(''));
            printData.push([lblpincode, vpincode, lblDepartment, VDepartment, printCodes.new_line].join(''));
            printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
            printData.push([lbldoctorname, vDrName, lblmobno, vContactNo, printCodes.new_line].join(''));
            printData.push([lblbilldate, vBillDate, lblReceiptNo, vReceiptNO, printCodes.new_line].join(''));
            printData.push([lblWard, vWardNo, printCodes.new_line].join(''));

        };

        var headerlineno = 8;
        var footerline = 7;
        var totallinenrperpage = 34; // total line number per page.
        var linesPerPage = totallinenrperpage - (headerlineno + footerline); // per page  item calculation =  totallinenrperpage 33 - headerline 8 + footer line 7
        var constructTableAndPrint = function(dmPrintInput) {
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
                    constructHeader(printData, dmPrintInput, ri);
                    lineno += 8;

                    //printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));
                    // printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
                    // printData.push(appendLineHeader(dmPrintInput.lines[ri], ri));
                    // printData.push([rightPad('', 135, '-'), printCodes.new_line].join(''));
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



            var billPaidAmt = dmPrintInput.header.PaidAmt || 0.00;
            var NetAmountInWords = dmPrintInput.header.NetAmountInWords;
            var BilledBy = dmPrintInput.header.billedby;
            var Paymenttype = dmPrintInput.header.paymentmode;


            billPaidAmt = billPaidAmt.toFixed(2);


            var LenbillPaidAmt = 11 - ('' + billPaidAmt).length;
            var LenPaymenttype = 11 - ('' + Paymenttype).length;
            var condition1 = "";
            var condition2 = "";
            var condition3 = "";
            var condition4 = "";




            if ($('#paymenttype').text().length > 0) {
                var vPaymodeobj = utl.Lookup.getObject($scope.lookup.PaymentType, dmPrintInput.header.paytypeid);
                if (vPaymodeobj)
                    vPaymode = ' ' + $.trim(vPaymodeobj.Text) + ' ';
            }



            printData.push([rightPad('', totalpaperwidth, '-'), printCodes.new_line].join(''));

            printData.push([rightPad('ADVANCE RECEIPT', 16), rightPad(':', 9), rightPad(billPaidAmt, LenbillPaidAmt, 20), leftPad('Payment Mode', 77), rightPad(' ', 2), rightPad(':', 1), leftPad(Paymenttype, LenPaymenttype), printCodes.new_line].join(''));


            printData.push([rightPad('Amount IN Words', 16), rightPad(': Rupees ', 9), rightPad(NetAmountInWords, 80), printCodes.new_line].join(''));



            printData.push([rightPad('Authorized By', 16), rightPad(':', 2), rightPad(BilledBy, 20), leftPad('TOTAL ADVANCE AMOUNT', 61), rightPad(' ', 2), rightPad(':', 1), leftPad(billPaidAmt, LenbillPaidAmt), printCodes.new_line].join(''));


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
            if (savehitcompleted == 1)
                $scope.clear();

        };
        $scope.clear = function() {
            $scope.item = {};
        }
        $scope.setPaymentType = function(selected) {
            if (selected.Id == 6 || selected.Id == 5)
                $scope.item.TerminalNoId = 2;
            else $scope.item.TerminalNoId = 0;
        };

        $scope.Cancel = function() {
            if (!$scope.BillFinalized) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.receipt-form.cancelmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    placeholder: $scope.item.ReceiptNumber,
                    onSuccessMethod: $scope.onCancelConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
            } else {
                utl.Alert.showErrorMsg('Bill Has Been Finalized');
            }
        }
        $scope.save = function() {
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            // $scope.item.ReceiptStatusId = 2; // Draft
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.saveItem(2);
        }

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function(SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveandApprove();
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function() {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function() {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */

        $scope.saveandApprove = function() {

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;
                /* Security IsValid */

            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            // $scope.item.ReceiptStatusId = 1; // Completed
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.saveItem(1);
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            if ($scope.currentcontext.PatientOrderReq) {
                savehitcompleted = 0;
                $scope.currentcontext.rid = data;
                $scope.confirmCallback({
                    ReceiptId: $scope.currentcontext.rid
                });
            } else {
                savehitcompleted = 0;
                //utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.currentcontext.rid = data;
                $scope.getItem();
                $scope.afterSave();
            }

            // $scope.backToList();
        };
        $scope.completeReceipt = function() {
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
            if ($scope.requiredsecuritypin) {
                $scope.saveandApprove();
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.receipt-form.confirm.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveandApprove
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        $scope.getPrevAdvancesCallback = function(scope, data, options, hasError) {
            var prevpaidamt = 0;
            if (data.Data.length > 0) {
                for (var pdx in data.Data) {
                    var preadv = data.Data[pdx];
                    prevpaidamt += preadv.AmountPaid;
                }
            }
            $scope.totalpaidamt = prevpaidamt;

        };

        $scope.getPrevAdvances = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 23,
                        Value: 1
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 11,
                        Value: 2
                    },
                    {
                        Key: 13,
                        Value: false
                    },
                    {
                        Key: 16,
                        Value: false
                    },
                ],
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevAdvancesCallback
            };

            utl.Http.doAction(options);
        };
        $scope.saveItem = function(status) {

            if (savehitcompleted == 1) return;

            if ($scope.item.PaymentTypeId == 1) {
                if ($scope.maxadvancecash == 1) {
                    var nettotalpaidamt = $scope.totalpaidamt + parseFloat($scope.item.AmountPaid);
                    if (nettotalpaidamt > parseInt($scope.ipmaxcash)) {
                        utl.Alert.showErrorMsg('Receipt Amount is greater than allowed Maximum Cash.....');
                        return;
                    }
                }
            }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.AmountPaid <= 0) {
                utl.Alert.showErrorMsg('Enter a Valid Amount');
                return;
            }

            $scope.advancecomments =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'advancecomments');
            if ($scope.advancecomments) {
                if (!$scope.item.Comments) {
                    utl.Alert.showErrorMsg('Comment is Required....');
                    return;
                }
            }
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.ReceiptTypeId = 5;
            $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();
            $scope.item.TDSAmount = $scope.item.TDSAmount != undefined ? $scope.item.TDSAmount : 0;
            $scope.item.Disallowance = $scope.item.Disallowance != undefined ? $scope.item.Disallowance : 0;
            var actionName = 'billing/PatientPaymentDetails/AddPatientPaymentDetails';
            if ($scope.currentcontext.rid && $scope.currentcontext.rid > 0) {
                actionName = 'billing/PatientPaymentDetails/UpdatePatientPaymentDetails';
            }
            $scope.item.PatientBillId = $scope.currentcontext.BillId || 0;
            // if ($scope.item.PatientBillId > 0) {
            //     if ($scope.currentcontext.AmountPaid < $scope.item.AmountPaid) {
            //         utl.Alert.showErrorMsg($translate.instant('billing.receipt-form.receiptamount-error.lbl'));
            //         return false;
            //     }
            //     $scope.item.ReceiptTypeId = 3;
            // }
            $scope.item.ReceiptStatusId = status;
            savehitcompleted = 1;
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getPharmacyPrintPreference = function() {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();

        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getEncounter();
            $scope.getItem();
            if ($scope.maxadvancecash == 1) {
                $scope.getPrevAdvances();
            }
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "PaymentType"
                },
                {
                    "Key": "CurrencyType"
                },
                {
                    "Key": "Department"
                },
                // { "Key": "ServiceItem" },
                // { "Key": "PackageName" },
                // { "Key": "Doctor" },
                {
                    "Key": "Bank"
                },
                {
                    "Key": "CardType"
                },
                {
                    "Key": "Terminal"
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    addFundFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout'];
})();