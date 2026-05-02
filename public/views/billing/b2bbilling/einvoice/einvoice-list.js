(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('einvoiceListController', einvoiceListController);

    function einvoiceListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.currentcontext = {};
        $scope.Facility = {};
        $scope.canShowDMPrintBtn = false;
        $scope.currentfilter = {
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
            DueApprovedById: -1,
            TotalAmount: 0,
        };
        $scope.Details = [];
        $scope.OPPatientBills = [];
        var PatientBillIds = Array();
        $scope.currentcontext.selectallchk = true;

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.PatientOPBills) {
                $scope.PatientOPBills[idx].select = chk;
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        };

        $scope.patientChange = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentfilter.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getopBillsCallback = function (scope, data, options, hasError) {
            $scope.PatientOPBills = [];
            for (var pdx in data.Data) {
                var item = data.Data[pdx];
                item.NetAmount = item.BillAmount - item.BillDiscount;
                item.NetAmount = Math.round(item.NetAmount);
                $scope.PatientOPBills.push(item);
            }

            $scope.SelectAll($scope.currentcontext.selectallchk);
            $scope.canShowDMPrintBtn = true;
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
        };

        //E-Invoice Posting
        $scope.eInvoicePost = () => {
            if (!$scope.selectedPatient) {
                utl.Alert.showErrorMsg('Please choose a patient.');
                return;
            }

            if (!$scope.item.EmployerId) {
                utl.Alert.showErrorMsg('Please Enter Employee ID.');
                return;
            }

            if ($scope.item.Services.length <= 0) {
                utl.Alert.showErrorMsg('Atleast one service should add.');
                return;
            }

            // const extenstionData = [
            //     { url: 'EmployerId', valueString: $scope.item.EmployerId }, // TBD
            //     { url: 'schemeType', valueString: 2 }, // TBD
            //     { url: 'subProduct', valueString: 5 }, // TBD
            //     { url: 'Admitted', valueString: $scope.item.Admitted ? 1 : 0 },
            //     { url: 'WoundCondition', valueString: 1 }, // TBD
            //     { url: 'InjuredBodyPart', valueString: $scope.item.InjuredBodyPart ? $scope.item.InjuredBodyPart : null }, // TBD :: need master for this item
            //     { url: 'IsDisable', valueString: $scope.item.IsDisable ? 1 : 0 },
            //     { url: 'IsDead', valueString: $scope.item.IsDead ? 1 : 0 },
            //     { url: 'AccidentDescription', valueString: $scope.item.IsDead ? 1 : 0 },
            //     { url: 'ReasonOfSickness', valueString: $scope.item.ReasonOfSickness ? 1 : 0 },
            //     { url: 'DischargeType', valueString: $scope.item.DischargeType },
            //     { url: 'DischargeSummary', valueString: $scope.item.DischargeSummary },
            //     { url: 'DischargeDate', valueString: $scope.item.DischargeDate ? $scope.item.DischargeDate : null },
            //     { url: 'Cancer', valueString: $scope.item.Cancer ? 1 : 0 },
            //     { url: 'HIV', valueString: $scope.item.HIV ? 1 : 0 },
            //     { url: 'HeartAttack', valueString: $scope.item.HeartAttack ? 1 : 0 },
            //     { url: 'HighBp', valueString: $scope.item.HighBp ? 1 : 0 },
            //     { url: 'Diabetes', valueString: $scope.item.Diabetes ? 1 : 0 }
            // ];

            const diagnosisData = [];

            if ($scope.item.Diagnosis.length > 0) {
                $scope.item.Diagnosis.forEach((dig, key) => {
                    diagnosisData.push(
                        {
                            sequence: (key + 1),
                            diagnosisCodeableConcept: {
                                coding: [
                                    {
                                        code: dig.Code
                                    }
                                ]
                            },
                            type: [
                                {
                                    text: "icd_0" // TBD
                                }
                            ]
                        }
                    )
                })
            }

            const items = [];
            let totalAmt = 0; // TBD

            $scope.item.Services.forEach((item, key) => {
                totalAmt = totalAmt + item.NetAmount;
                items.push(
                    {
                        sequence: (key + 1),
                        category: {
                            text: "service" // TBD
                        },
                        productOrService: {
                            text: item.ServiceCode
                        },
                        quantity: {
                            value: item.Quantity
                        },
                        unitPrice: {
                            value: item.NetAmount
                        }
                    }
                )
            })


            const supportingInfo = [];

            if ($scope.item.ClinicalDocuments.length > 0) {
                $scope.item.ClinicalDocuments.forEach((doc, key) => {
                    supportingInfo.push(
                        {
                            category: {
                                coding: [{
                                    code: "attachment",
                                    display: "Attachment"
                                }
                                ],
                                text: "attachment"
                            },
                            valueAttachment: {
                                contentType: "application/pdf",
                                creation: doc.CreatedAt,
                                data: doc.Base64Content,
                                hash: "",
                                title: doc.Name
                            }
                        }
                    )
                })
            }

            // const clainRequestBody = {
            //     resourceType: 'Claim',
            //     type: {
            //         text: 0
            //     },
            //     billablePeriod: {
            //         start: new Date(), // TBD
            //         end: new Date() // TBD
            //     },
            //     created: new Date(), // TBD
            //     enterer: {
            //         reference: 'Practitioner/' // TBD
            //     },
            //     facility: {
            //         reference: 'Location/' // TBD
            //     },
            //     provider: {
            //         reference: 'PractitionerRole/' // TBD
            //     },
            //     extension: extenstionData,
            //     diagnosis: diagnosisData,
            //     item: items,
            //     total: {
            //         value: totalAmt
            //     },
            //     patient: {
            //         reference: 'Patient/'+$scope.selectedPatient.MRN, // TBD
            //     },
            //     supportingInfo: supportingInfo
            // }
            const einvoiceRequestBody = {
                "Version": "1.1",
                "TranDtls": {
                    "TaxSch": "GST",
                    "SupTyp": "B2B",
                    // "RegRev": "Y",
                    // "EcmGstin": null,
                    // "IgstOnIntra": "N"
                },
                "DocDtls": {
                    "Typ": "INV",
                    "No": "DOC/105",
                    "Dt": utl.Formatter.getCurrentDate()
                },

                "BuyerDtls": {
                    "Gstin": $scope.Facility.GSTIn,
                    "LglNm": $scope.Facility.Text,
                    "TrdNm": $scope.Facility.Text,
                    //"Pos": $scope.Facility.PinCode,
                    "Addr1": $scope.Facility.AddressLine1,
                    //"Addr2": "kuvempu layout",
                    "Loc": $scope.Facility.City,
                    "Pin": $scope.Facility.PinCode,
                    "Stcd": $scope.Facility.StateId,
                    "Ph": $scope.Facility.Mobile,
                    "Em": $scope.Facility.Email
                },
                "SellerDtls": {
                    "Gstin": $scope.Guarantor.GSTIn,
                    "LglNm": $scope.Guarantor.GuarantorName,
                    "TrdNm": $scope.Guarantor.GuarantorName,
                    "Addr1": $scope.Guarantor.AddressLine1,
                    //"Addr2": "kuvempu layout",
                    "Loc": $scope.Guarantor.City,
                    "Pin": $scope.Guarantor.PinCode,
                    "Stcd": $scope.Guarantor.StateId,
                    "Ph": $scope.Guarantor.Mobile,
                    "Em": $scope.Guarantor.Email
                },
                "DispDtls": {
                    "Nm": "ABC company pvt ltd",
                    "Addr1": "7th block, kuvempu layout",
                    "Addr2": "kuvempu layout",
                    "Loc": "Banagalore",
                    "Pin": 562160,
                    "Stcd": "29"
                },
                "ShipDtls": {
                    "Gstin": "29AWGPV7107B1Z1",
                    "LglNm": "CBE company pvt ltd",
                    "TrdNm": "kuvempu layout",
                    "Addr1": "7th block, kuvempu layout",
                    "Addr2": "kuvempu layout",
                    "Loc": "Banagalore",
                    "Pin": 562160,
                    "Stcd": "29"
                },
                "EwbDtls": {
                    "TransId": "12AWGPV7107B1Z1",
                    "TransName": "XYZ EXPORTS",
                    "TransMode": "1",
                    "Distance": 100,
                    "TransDocNo": "DOC01",
                    "TransDocDt": "18/08/2020",
                    "VehNo": "ka123456",
                    "VehType": "R"
                },
                "ExpDtls": {
                    "ShipBNo": "A-248",
                    "ShipBDt": "01/08/2020",
                    "CntCode": "AE",
                    "ForCur": "AED",
                    "Port": "INABG1",
                    "RefClm": "N",
                    "ExpDuty": 0
                },
                "ExpDtls": {
                    "ShipBNo": "A-248",
                    "ShipBDt": "01/08/2020",
                    "CntCode": "AE",
                    "ForCur": "AED",
                    "Port": "INABG1",
                    "RefClm": "N",
                    "ExpDuty": 0
                },
                "ItemList": [
                    {
                        "AttribDtls": [
                            {
                                "Nm": "Rice",
                                "Val": "10000"
                            }
                        ],
                        "PrdSlNo": "12345",
                        "OrgCntry": null,
                        "OrdLineRef": null,
                        "TotItemVal": 20790.19,
                        "OthChrg": 0,
                        "StateCesNonAdvlAmt": 0,
                        "StateCesAmt": 0,
                        "StateCesRt": 0,
                        "CesNonAdvlAmt": 0,
                        "CesAmt": 0,
                        "CesRt": 0,
                        "SgstAmt": 1113.76,
                        "CgstAmt": 1113.76,
                        "IgstAmt": 0,
                        "Qty": 100.345,
                        "AssAmt": 18562.67,
                        "PreTaxVal": 0,
                        "Discount": 0.07,
                        "TotAmt": 18562.74,
                        "UnitPrice": 883.94,
                        "Unit": "BAG",
                        "FreeQty": 10,
                        "GstRt": 12,
                        "Barcde": "123456",
                        "BchDtls": {
                            "Nm": "123456",
                            "ExpDt": "01/08/2020",
                            "WrDt": "01/09/2020"
                        },
                        "HsnCd": "1001",
                        "IsServc": "N",
                        "PrdDesc": "Rice",
                        "SlNo": "1"
                    },
                    {
                        "AttribDtls": [
                            {
                                "Nm": "Rice",
                                "Val": "10000"
                            }
                        ],
                        "PrdSlNo": "12345",
                        "OrgCntry": null,
                        "OrdLineRef": null,
                        "TotItemVal": 3225.6,
                        "OthChrg": 0,
                        "StateCesNonAdvlAmt": 0,
                        "StateCesAmt": 0,
                        "StateCesRt": 0,
                        "CesNonAdvlAmt": 0,
                        "CesAmt": 0,
                        "CesRt": 0,
                        "SgstAmt": 172.8,
                        "CgstAmt": 172.8,
                        "IgstAmt": 0,
                        "Qty": 12,
                        "AssAmt": 2880,
                        "PreTaxVal": 0,
                        "Discount": 0,
                        "TotAmt": 2880,
                        "UnitPrice": 240,
                        "Unit": "PCS",
                        "FreeQty": 0,
                        "GstRt": 12,
                        "Barcde": null,
                        "BchDtls": {
                            "Nm": "123456",
                            "ExpDt": "01/08/2020",
                            "WrDt": "01/09/2020"
                        },
                        "HsnCd": "9405",
                        "IsServc": "N",
                        "PrdDesc": null,
                        "SlNo": "2"
                    }
                ],
                "ValDtls": {
                    "AssVal": 21442.67,
                    "CgstVal": 1286.56,
                    "SgstVal": 1286.56,
                    "IgstVal": 0,
                    "CesVal": 0,
                    "StCesVal": 0,
                    "RndOffAmt": 0,
                    "TotInvVal": 24015.79,
                    "TotInvValFc": 0,
                    "Discount": 0,
                    "OthChrg": 0
                },
                "PayDtls": {
                    "Nm": "ABCDE",
                    "AccDet": "5697389713210",
                    "Mode": "Cash",
                    "FinInsBr": "SBIN11000",
                    "CrTrn": "test",
                    "PayInstr": "Gift",
                    "PayTerm": "100",
                    "DirDr": "test",
                    "CrDay": 100,
                    "PaidAmt": 10000,
                    "PaymtDue": 5000
                },
                "RefDtls": {
                    "InvRm": "TEST",
                    "PrecDocDtls": [
                        {
                            "InvNo": "DOC/002",
                            "InvDt": "01/08/2020",
                            "OthRefNo": "123456"
                        }
                    ],
                    "ContrDtls": [
                        {
                            "RecAdvDt": "01/08/2020",
                            "RecAdvRefr": "Doc/003",
                            "TendRefr": "Abc001",
                            "ContrRefr": "Co123",
                            "ExtRefr": "Yo456",
                            "ProjRefr": "Doc-456",
                            "PORefr": "Doc-789",
                            "PORefDt": "01/08/2020"
                        }
                    ],
                    "DocPerdDtls": {
                        "InvStDt": "01/08/2020",
                        "InvEndDt": "01/09/2020"
                    }
                },
                "AddlDocDtls": [
                    {
                        "Url": "https://einv-apisandbox.nic.in",
                        "Docs": "Test Doc",
                        "Info": "Document Test"
                    }],
                "billablePeriod": {
                        "start": $scope.currentfilter.FromBillDate,
                        "end": $scope.currentfilter.ToBillDate
                    },
                    "created": "2021-09-13 11:00:39",
                    "enterer": {
                        "reference": "Practitioner/D57FEF4C-0D8B-4AF1-B0F6-6460800B38D0"
                    },
                    "facility": {
                        "reference": "Location/FBF918E2-3963-4254-A462-410046CD5603"
                    },
                    "provider": {
                        "reference": "PractitionerRole/71171AE6-5FD0-466E-AA33-225C3BAF8081"
                    },
                    "extension": [
                        {


                            "url": "EmployerId",
                            "valueString": "550802O930000365"
                        },
                        {
                            "url": "schemeType",
                            "valueString": 2
                        },

                        {
                            "url": "subProduct",
                            "valueString": 5
                        },

                        {
                            "url": "Admitted",
                            "valueString": "1"
                        },

                        {
                            "url": "WoundCondition",
                            "valueString": "1"
                        },

                        {
                            "url": "InjuredBodyPart",
                            "valueString": "LEG"
                        },

                        {
                            "url": "IsDisable",
                            "valueString": "1"
                        },

                        {
                            "url": "IsDead",
                            "valueString": "1"
                        },

                        {
                            "url": "AccidentDescription",
                            "valueString": "Not good driver"
                        },

                        {
                            "url": "ReasonOfSickness",
                            "valueString": "Dont know"
                        },

                        {
                            "url": "DischargeType",
                            "valueString": "Normal"
                        },

                        {
                            "url": "DischargeSummary",
                            "valueString": "Take care and eat soup"
                        },

                        {
                            "url": "DischargeDate",
                            "valueString": "09/02/2023"
                        },

                        {
                            "url": "Cancer",
                            "valueString": "1"
                        },

                        {
                            "url": "HIV",
                            "valueString": "1"
                        },

                        {
                            "url": "HeartAttack",
                            "valueString": "1"
                        },

                        {
                            "url": "HighBp",
                            "valueString": "1"
                        },

                        {
                            "url": "Diabetes",
                            "valueString": "1"
                        }
                    ],
                    "diagnosis": [
                        {
                            "sequence": 1,
                            "diagnosisCodeableConcept": {
                                "coding": [
                                    {
                                        "code": "A09"
                                    }
                                ]
                            },
                            "type": [
                                {
                                    "text": "icd_0"
                                }
                            ]
                        }
                    ],


                    "item": [
                        {
                            "sequence": 1,
                            "category": {
                                "text": "service"
                            },
                            "productOrService": {
                                "text": "PO10"
                            },
                            "quantity": {
                                "value": "1"
                            },
                            "unitPrice": {
                                "value": "200"
                            }
                        },
                        {
                            "sequence": 2,
                            "category": {
                                "text": "service"
                            },
                            "productOrService": {
                                "text": "RADO5"
                            },
                            "quantity": {
                                "value": "1"
                            },
                            "unitPrice": {
                                "value": "400"
                            }
                        },
                        {
                            "sequence": 3,
                            "category": {
                                "text": "service"
                            },
                            "productOrService": {
                                "text": "PO08"
                            },
                            "quantity": {
                                "value": "1"
                            },
                            "unitPrice": {
                                "value": "500"
                            }
                        },
                        {
                            "sequence": 4,
                            "category": {
                                "text": "service"
                            },
                            "productOrService": {
                                "text": "RADO5"
                            },
                            "quantity": {
                                "value": "1"
                            },
                            "unitPrice": {
                                "value": "400"
                            }
                        }
                    ],
                    "total": {
                        "value": 1500
                    },
                    "patient": {
                        "reference": "Patient/54AE01EF-0C84-4EBC-8BE7-60363003D1DD"
                    }
            };

            var options = {
                action: 'Visit/Visit/generateEInvoice',
                data: einvoiceRequestBody,
                type: 'post',
                onComplete: $scope.eInvoiceResponse
            };

            utl.Http.doAction(options);
            // const hash = btoa("samajikfhir:j29Ppb00CYfkkmkEce7m");
            // console.log(clainRequestBody, $scope.item.Diagnosis, hash);

            // const options = {
            //     url: 'https://demoimis.ssf.gov.np/api/api_fhir_r4/Claim/',
            //     method: "POST",
            //     data: clainRequestBody,
            //     headers: {
            //         'remote-user': 'samajik',
            //         'Authorization': 'Basic '+hash
            //     }
            // };

            // $http(options).then(function (response) {
            //     console.log(response, 'SSf-Clain');
            // });
        }

        $scope.eInvoiceResponse = function (scope, data, options, hasError) {
            console.log(data, 'Eligibity Response data');
            console.log(hasError, 'Eligibity Response hasError');
        }

        $scope.getopipBills = function () {

            var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    // {
                    //     Key: 12,
                    //     Value: $scope.currentfilter.PatientId
                    // },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 20,
                        Value: [1, 2, 3]
                    },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 17,
                        Value: FromDate
                    },
                    {
                        Key: 18,
                        Value: ToDate
                    },
                    {
                        Key: 71,
                        Value: true
                    },
                    // {
                    //     Key: 21,
                    //     Value: false
                    // },
                    {
                        Key: 72,
                        Value: true
                    }
                ],

            };

            var options = {
                action: 'billing/PatientBills/GetPatientTaxableBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getopBillsCallback
            };

            utl.Http.doAction(options);
            // } else {
            //     utl.Alert.showSuccessMsg('Successful');
            // }
        };

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientOPBills) {
                if ($scope.PatientOPBills[idx].select) {
                    currentSelection.push($scope.PatientOPBills[idx]);
                }
            }
            return currentSelection;
        }

        $scope.einvoice_form = function () {
            $state.go('app.einvoiceform');
        }

        $scope.Print = function () {
            $scope.Details = getSelectionRows();
            var ids = [];
            for (var idx in $scope.Details) {
                var currentBill = $scope.Details[idx];
                ids.push(currentBill.Id);
            }
            if (ids.length > 0) {
                var actionName = 'billing/patientbills/PrintConsolidatedOPbilldetails';
                var options = {
                    action: actionName,
                    data: {
                        Data: ids
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.dmPrintForPharmacyBillsWithReturn = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');
                return false;
            } else {
                PatientBillIds = [];
                PatientReturnIds = [];
                var selectedRows = getSelectionRows();
                for (var index in selectedRows) {
                    PatientBillIds.push(selectedRows[index].Id);
                }
                var selectedRowsForReturn = getSelectionRowsForReturn();
                for (var index1 in selectedRowsForReturn) {
                    PatientReturnIds.push(selectedRowsForReturn[index1].Id);
                }
                var inputData = {
                    Data: {
                        PatientBillIds: PatientBillIds,
                        PatientReturnIds: PatientReturnIds,
                        PatientId: $scope.currentfilter.PatientId
                    }
                };
                var options = {
                    action: 'billing/patientbills/DMPrintPharmacyBillsWithReturn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintForPharmacyBillsWithReturnCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintForPharmacyBillsWithReturnCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintDataForSalesWithReturn(data);
            $scope.printPharmacyConsolidatedBill(dmPrintInput);
        };

        function preparePrintDataForSalesWithReturn(data) {
            console.log('preparePrintDataForSalesWithReturn starts');

            var vIPOPNO = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vPAddressLine1 = '';
            var vPAddressLine2 = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vGuarantorName = '';

            if (data.PatientData) {
                if (data.PatientData.Title) vPTitle = data.PatientData.Title.Description;
                if (data.PatientData.FirstName) vPFirstName = data.PatientData.FirstName;
                if (data.PatientData.LastName) vPLastName = data.PatientData.LastName;
                if (data.PatientData.MRN) vMRN = data.PatientData.MRN;
                if (data.PatientData.Age) vAge = '' + data.PatientData.Age;
                if (data.PatientData.DOB) vDOB = '' + data.PatientData.DOB;
                if (data.PatientData.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientData.DOB);
                if (data.PatientData.Gender) vGender = '' + data.PatientData.Gender.Description;
                if (data.PatientData.AddressLine1) vPAddressLine1 = data.PatientData.AddressLine1;
                if (data.PatientData.AddressLine2) vPAddressLine2 = data.PatientData.AddressLine2;
            }

            if (data.Encounter) vIPOPNO = '' + data.Encounter.VisitIdentifier;
            if (data.Encounter) vDrName = '' + data.Encounter.DoctorName;
            if (data.Encounter.PatientGuarantor) {
                if (data.Encounter.PatientGuarantor.GuarantorName) vGuarantorName = '' + data.Encounter.PatientGuarantor.GuarantorName;
            }

            var dmPrintInput = {};
            dmPrintInput.header = {
                PatientName: vPTitle +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                DrName: vDrName,
                AgeGender: vAge + ' Y / ' + vGender,
                Address: vPAddressLine1 + ',' + vPAddressLine2
            };
            var TotalSalesAmount = 0;
            var TotalReturnAmount = 0;
            var TotalAmount = 0;
            var TinNo = '';
            var LicenseNo = '';

            dmPrintInput.PharmacyBills = [];
            var islno = 1;
            for (var index in data.PharmacyBillsDetails) {
                var PharmacyBill = data.PharmacyBillsDetails[index];
                var BillNumber = PharmacyBill.BillNumber;
                //var BillDateTime = PharmacyBill.BillDateTime;

                var BillDate = utl.Formatter.getDateString(PharmacyBill.BillDateTime);
                var BillDateTime = new Date(PharmacyBill.BillDateTime);
                var Minutes = BillDateTime.getMinutes();
                var Hours = BillDateTime.getHours();
                var Meridiem = 'AM';
                if (Hours > 12 || Hours == 12) {
                    Meridiem = 'PM';
                    Hours = Hours - 12;
                }
                if (Hours < 10) {
                    Hours = '0' + Hours;
                }
                if (Minutes < 10) {
                    Minutes = '0' + Minutes;
                }
                var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;
                var BillDateWithTime = BillDate + ' ' + BillTime;


                var BillAmount = PharmacyBill.BillAmount.toFixed(2);
                var BillDiscount = PharmacyBill.BillDiscount.toFixed(2);
                var RoundOffValue = PharmacyBill.RoundOffValue.toFixed(2);
                var BillNetAmount = BillAmount - BillDiscount;
                BillNetAmount = Math.round(BillNetAmount);
                BillNetAmount = BillNetAmount.toFixed(2);
                var vBillDoctorName = PharmacyBill.DoctorName;
                var vBillDoctorId = PharmacyBill.DoctorId;
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vCTitle = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCreatedUser = '';

                TotalSalesAmount = TotalSalesAmount + PharmacyBill.BillAmount;
                if (TinNo == '' || TinNo == undefined || TinNo == null) {
                    TinNo = PharmacyBill.StoreMaster.TinNo;
                }
                if (LicenseNo == '' || LicenseNo == undefined || LicenseNo == null) {
                    LicenseNo = PharmacyBill.StoreMaster.LicenseNo;
                }

                if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                    if (PharmacyBill.GuarantorMaster) {
                        if (PharmacyBill.GuarantorMaster.GuarantorName) vGuarantorName = '' + PharmacyBill.GuarantorMaster.GuarantorName;
                    }
                }

                if (vBillDoctorName == '' || vBillDoctorName == undefined || vBillDoctorName == null) {
                    if (PharmacyBill.User) {
                        if (PharmacyBill.User.Title) vUTitle = PharmacyBill.User.Title.Description;
                        if (PharmacyBill.User.FirstName) vUFirstName = PharmacyBill.User.FirstName;
                        if (PharmacyBill.User.LastName) vULastName = PharmacyBill.User.LastName;
                        vBillDoctorName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
                    }
                }
                if (PharmacyBill.CreatedUser) {
                    if (PharmacyBill.CreatedUser.Title) vCTitle = PharmacyBill.CreatedUser.Title.Description;
                    if (PharmacyBill.CreatedUser.FirstName) vCFirstName = PharmacyBill.CreatedUser.FirstName;
                    if (PharmacyBill.CreatedUser.LastName) vCLastName = PharmacyBill.CreatedUser.LastName;
                    vCreatedUser = vCTitle + '.' + vCFirstName + ' ' + vCLastName;
                }

                var SalesDetail = {
                    ispace: ' ',
                    slno: islno++,
                    BillNumber: BillNumber,
                    BillDateTime: BillDateTime,
                    BillAmount: BillAmount,
                    BillDiscount: BillDiscount,
                    RoundOffValue: RoundOffValue,
                    BillNetAmount: BillNetAmount,
                    BillDoctorName: vBillDoctorName,
                    BillDoctorId: vBillDoctorId,
                    CreatedUser: vCreatedUser,
                    BillDateWithTime: BillDateWithTime
                };

                dmPrintInput.PharmacyBills.push(SalesDetail);
            }

            dmPrintInput.PharmacyReturns = [];
            var IsDisplayReturns = true;
            var islno1 = 1;
            if (data.PharmacyReturnDetails.length > 0) {
                for (var index1 in data.PharmacyReturnDetails) {
                    var PharmacyReturn = data.PharmacyReturnDetails[index1];

                    var ReturnNumber = PharmacyReturn.ReturnNumber;
                    //var ReturnDateTime = PharmacyReturn.ReturnDateTime;

                    var ReturnDate = utl.Formatter.getDateString(PharmacyReturn.ReturnDateTime);
                    var ReturnDateTime = new Date(PharmacyReturn.ReturnDateTime);
                    var ReturnMinutes = ReturnDateTime.getMinutes();
                    var ReturnHours = ReturnDateTime.getHours();
                    var ReturnMeridiem = 'AM';
                    if (ReturnHours > 12 || ReturnHours == 12) {
                        ReturnMeridiem = 'PM';
                        ReturnHours = ReturnHours - 12;
                    }
                    if (ReturnHours < 10) {
                        ReturnHours = '0' + ReturnHours;
                    }
                    if (ReturnMinutes < 10) {
                        ReturnMinutes = '0' + ReturnMinutes;
                    }
                    var ReturnTime = ReturnHours + ':' + ReturnMinutes + ' ' + ReturnMeridiem;
                    var ReturnDateWithTime = ReturnDate + ' ' + ReturnTime;

                    var BillNumberAgainstReturn = PharmacyReturn.BillNumber;
                    //var BillDateTimeAgainstReturn = PharmacyReturn.BillDateTime;

                    var BillDateAgainstReturn = utl.Formatter.getDateString(PharmacyReturn.BillDateTime);
                    var BillDateTimeAgainstReturn = new Date(PharmacyReturn.BillDateTime);
                    var MinutesAgainstReturn = BillDateTimeAgainstReturn.getMinutes();
                    var HoursAgainstReturn = BillDateTimeAgainstReturn.getHours();
                    var MeridiemAgainstReturn = 'AM';
                    if (HoursAgainstReturn > 12 || HoursAgainstReturn == 12) {
                        MeridiemAgainstReturn = 'PM';
                        HoursAgainstReturn = HoursAgainstReturn - 12;
                    }
                    if (HoursAgainstReturn < 10) {
                        HoursAgainstReturn = '0' + HoursAgainstReturn;
                    }
                    if (MinutesAgainstReturn < 10) {
                        MinutesAgainstReturn = '0' + MinutesAgainstReturn;
                    }
                    var BillTimeAgainstReturn = HoursAgainstReturn + ':' + MinutesAgainstReturn + ' ' + MeridiemAgainstReturn;
                    var BillDateWithTimeAgainstReturn = BillDateAgainstReturn + ' ' + BillTimeAgainstReturn;

                    if (PharmacyReturn.ReturnAmount == 0 && PharmacyReturn.GrossAmount > 0) {
                        PharmacyReturn.ReturnAmount = PharmacyReturn.GrossAmount;
                    }

                    var ReturnAmount = PharmacyReturn.ReturnAmount.toFixed(2);
                    var DiscountAmount = PharmacyReturn.DiscountAmount.toFixed(2);
                    var RoundOffValue = PharmacyReturn.RoundOffValue.toFixed(2);
                    var ReturnNetAmount = ReturnAmount - DiscountAmount;
                    ReturnNetAmount = Math.round(ReturnNetAmount);
                    ReturnNetAmount = ReturnNetAmount.toFixed(2);
                    var vReturnDoctorId = PharmacyReturn.DoctorId;
                    var vReturnDoctorName = ''
                    var vReturnUTitle = '';
                    var vReturnUFirstName = '';
                    var vReturnULastName = '';
                    var vReturnCTitle = '';
                    var vReturnCFirstName = '';
                    var vReturnCLastName = '';
                    var vReturnCreatedUser = '';

                    TotalReturnAmount = TotalReturnAmount + PharmacyReturn.ReturnAmount;

                    if (PharmacyReturn.User) {
                        if (PharmacyReturn.User.Title) vReturnUTitle = PharmacyReturn.User.Title.Description;
                        if (PharmacyReturn.User.FirstName) vReturnUFirstName = PharmacyReturn.User.FirstName;
                        if (PharmacyReturn.User.LastName) vReturnULastName = PharmacyReturn.User.LastName;
                        vReturnDoctorName = (vReturnUTitle + '.' + vReturnUFirstName + ' ' + vReturnULastName);
                    }

                    if (PharmacyReturn.CreatedUser) {
                        if (PharmacyReturn.CreatedUser.Title) vReturnCTitle = PharmacyReturn.CreatedUser.Title.Description;
                        if (PharmacyReturn.CreatedUser.FirstName) vReturnCFirstName = PharmacyReturn.CreatedUser.FirstName;
                        if (PharmacyReturn.CreatedUser.LastName) vReturnCLastName = PharmacyReturn.CreatedUser.LastName;
                        vReturnCreatedUser = vReturnCTitle + '.' + vReturnCFirstName + ' ' + vReturnCLastName;
                    }

                    var ReturnDetail = {
                        ispace: ' ',
                        slno1: islno1++,
                        ReturnNumber: ReturnNumber,
                        ReturnDateTime: ReturnDateTime,
                        BillNumberAgainstReturn: BillNumberAgainstReturn,
                        BillDateTimeAgainstReturn: BillDateTimeAgainstReturn,
                        ReturnAmount: ReturnAmount,
                        DiscountAmount: DiscountAmount,
                        RoundOffValue: RoundOffValue,
                        ReturnNetAmount: ReturnNetAmount,
                        ReturnDoctorId: vReturnDoctorId,
                        vReturnDoctorName: vReturnDoctorName,
                        vReturnCreatedUser: vReturnCreatedUser,
                        ReturnDateWithTime: ReturnDateWithTime,
                        BillDateWithTimeAgainstReturn: BillDateWithTimeAgainstReturn
                    };

                    dmPrintInput.PharmacyReturns.push(ReturnDetail);
                }
            } else {
                IsDisplayReturns = false;
            }

            TotalSalesAmount = Math.round(TotalSalesAmount);
            TotalSalesAmount = TotalSalesAmount.toFixed(2);
            TotalReturnAmount = Math.round(TotalReturnAmount);
            TotalReturnAmount = TotalReturnAmount.toFixed(2);
            TotalAmount = TotalSalesAmount - TotalReturnAmount;
            TotalAmount = Math.round(TotalAmount);
            TotalAmount = TotalAmount.toFixed(2);

            dmPrintInput.summary = {
                TotalSalesAmount: TotalSalesAmount,
                TotalReturnAmount: TotalReturnAmount,
                TotalAmount: TotalAmount,
                IsDisplayReturns: IsDisplayReturns,
                TinNo: TinNo,
                LicenseNo: LicenseNo,
                GuarantorName: vGuarantorName
            };

            console.log('preparePrintDataForSalesWithReturn ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print starts */
        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');

                return false;
            } else {

                var selectedRows = getSelectionRows();
                for (var idx in selectedRows) {
                    var options = {
                        action: 'billing/patientbills/DMPrintPatientBills',
                        data: selectedRows[idx],
                        type: 'post',
                        onComplete: $scope.dmPrintCallback
                    };
                }
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printPharmacyBillDetails(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');
            var dmAllPrintInput = [];
            var selectedRows = getSelectionRows();
            for (var idx in selectedRows) {
                var currentBill = selectedRows[idx];
                var vIPOPNO = '';
                var vGST = '';
                var vPTitle = '';
                var vPFirstName = '';
                var vPLastName = '';
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vTinNo = '';
                var vMRN = '';
                var vAge = '';
                var vDOB = '';
                var vFDOB = '';
                var vGender = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCTitle = '';
                var vDrName = '';
                var vStoreheading1 = '';
                var vStoreheading2 = '';
                var vStoreheading3 = '';
                var vStoreheading4 = '';

                if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
                if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;



                if (currentBill.User) {
                    if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                    if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                    if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
                    vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName)
                }
                if (currentBill.CreatedUser) {
                    if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                    if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                    if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
                }
                if (currentBill.Patient) {
                    if (currentBill.Patient.Title) vPTitle = currentBill.Patient.Title.Description;
                    if (currentBill.Patient.FirstName) vPFirstName = currentBill.Patient.FirstName;
                    if (currentBill.Patient.LastName) vPLastName = currentBill.Patient.LastName;
                    if (currentBill.Patient.MRN) vMRN = currentBill.Patient.MRN;
                    if (currentBill.Patient.Age) vAge = '' + currentBill.Patient.Age;
                    if (currentBill.Patient.DOB) vDOB = '' + currentBill.Patient.DOB;
                    if (currentBill.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(currentBill.Patient.DOB);
                    if (currentBill.Patient.Gender) vGender = '' + currentBill.Patient.Gender.Description;
                } else {
                    if (currentBill.Title)
                        vPTitle = currentBill.Title.Description;
                    vPFirstName = currentBill.PatientName;
                    if (currentBill.Age)
                        vAge = '' + currentBill.Age;
                    if (currentBill.Gender)
                        vGender = '' + currentBill.Gender.Description;
                    if (currentBill.DoctorName)
                        vDrName = '' + currentBill.DoctorName;
                }



                if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;


                var vPayTypeId = -1;

                if (currentBill.PatientPaymentDetails)
                    for (var idxpy in currentBill.PatientPaymentDetails)
                        vPayTypeId = currentBill.PatientPaymentDetails[idxpy].PaymentTypeId;

                if (data.PrintData.heading1)
                    vStoreheading1 = data.PrintData.heading1
                if (data.PrintData.heading2)
                    vStoreheading2 = data.PrintData.heading2
                if (data.PrintData.heading3)
                    vStoreheading3 = data.PrintData.heading3
                if (data.PrintData.heading4)
                    vStoreheading4 = data.PrintData.heading4

                var dmPrintInput = {};
                dmPrintInput.header = {
                    prescribedby: vDrName || '',
                    licenseno: '' + currentBill.StoreMaster.LicenseNo,
                    billno: '' + currentBill.BillNumber,
                    patientname: vPTitle + '.' +
                        vPFirstName + ' ' + vPLastName,
                    GstNo: vGST,
                    TinNo: vTinNo,
                    MRN: vMRN,
                    Age: vAge,
                    DOB: vDOB,
                    FDOB: vFDOB,
                    Gender: vGender,
                    IPOPNO: vIPOPNO,
                    billdate: utl.Formatter.getDateTimeString(currentBill.BillDateTime),
                    // addressline: currentBill.Patient.AddressLine1,
                    // state: currentBill.Patient.State,
                    // city: currentBill.Patient.City,
                    // pincode: '' + currentBill.Patient.Pincode || '',
                    totalamount: currentBill.BillAmount,
                    totDiscont: currentBill.BillDiscount,
                    totroundoff: currentBill.RoundOffValue,
                    totpaidamt: currentBill.PaidAmount,
                    billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                    paytypeid: vPayTypeId || -1,
                    vStoreheading1: vStoreheading1,
                    vStoreheading2: vStoreheading2,
                    vStoreheading3: vStoreheading3,
                    vStoreheading4: vStoreheading4
                };

                dmPrintInput.lines = [];
                var islno = 1;
                for (var idx1 in currentBill.PatientBillDetails) {
                    var billDetail = currentBill.PatientBillDetails[idx1];
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 4) {
                        batchid = batchid.substring(0, 4);
                    }

                    var cgstamt = billDetail.CGstAmount.toFixed(2);
                    var sgstamt = billDetail.SGstAmount.toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        mrp: billDetail.Rate.toFixed(2),
                        value: billDetail.NetAmountBeforeGST.toFixed(2),
                        cgstper: billDetail.CGstPercentage,
                        cgstamt: cgstamt,
                        sgstper: billDetail.SGstPercentage,
                        sgstamt: sgstamt,
                        totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                        amount: billDetail.Amount.toFixed(2),
                        mfr: manu,
                        netamount: billDetail.NetAmount.toFixed(2)
                    };

                    dmPrintInput.lines.push(detail);
                }

                dmAllPrintInput.push(dmPrintInput);
            }
            console.log('preparePrintData ends');
            return dmAllPrintInput;
        }
        /* Pharmacy dotmatrix print ends */

        $scope.getFacilityCallback = function (scope, data, options, hasError) {
            $scope.Facility = data.Data[0];
        };

        $scope.getFacility = function (pageNo) {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'SystemSettings/Facility/GetFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };
            utl.Http.doAction(options);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // if($scope.lookup.Facility[1]) {
            //     $scope.Facility = $scope.lookup.Facility[1];
            // }
            // console.log($scope.Facility);

            var InPatientSaleType = {
                Code: "Credit-InPatient",
                Id: 6,
                IsDefault: true,
                Language: null,
                Text: "Credit InPatient"
            }
            $scope.lookup["PharmacySaleType"].push(InPatientSaleType);
            $scope.getFacility();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PharmacySaleType"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "BillType"
            },
            {
                "Key": "Facility",
                "Request": {
                    "Params": [{ 'Key': 0, 'Value': utl.Session.getCurrentFacilityId() }]
                }
            },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPharmacyPrintPreference = function () {
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

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    einvoiceListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();