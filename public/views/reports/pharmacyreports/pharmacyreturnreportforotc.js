(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyReturnReportforOTCController', PharmacyReturnReportforOTCController);

    function PharmacyReturnReportforOTCController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = utl.Formatter.getCurrentDate();
        $scope.currentfilter.ToBillDate = utl.Formatter.getCurrentDate();
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = -1;
        // $scope.currentfilter.UserId = utl.Session.getCurrentUserId();
        $scope.currentfilter.StoreMasterId = 0,
            $scope.PaymentOPReturn = [];


        $scope.PatientReturns = false;


        $scope.TotCashReturn = 0;
        $scope.TotCardReturn = 0;
        $scope.TotChequeOthersReturn = 0;
        $scope.TotReturn = 0;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Receipt Date", "Receipt Number", "Bill Number", "Patient Name", "Doctor Name", "Cash", "Card", "ChequeOthers"]
            let csvContent = JsonFields.join(",") + "\n";

            $scope.PaymentOPDueCollections = [];
            $scope.TotCashDue = 0;
            $scope.TotCardDue = 0;
            $scope.TotChequeOthersDue = 0;
            $scope.TotDues = 0;
            $scope.PaymentOPReturn = [];
            $scope.TotCashReturn = 0;
            $scope.TotCardReturn = 0;
            $scope.TotChequeOthersReturn = 0;
            $scope.TotReturn = 0;
            if (data && data.Data && data.Data.length > 0) {
                $scope.PatientReturns = true;
                var SNo = 1;
                for (var idx in data.Data) {
                    var PatientReturnBill = data.Data[idx];
                    if (!$scope.currentfilter.UserId || $scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientReturnBill.CreatedBy) {
                        var returnDt = PatientReturnBill.ReturnDateTime;
                        var returnnumber = PatientReturnBill.ReturnNumber;
                        var billDt = null;
                        var billnumber = '';
                        var drname = '';
                        if (PatientReturnBill.PatientBill) {
                            billDt = PatientReturnBill.PatientBill.BillDateTime;
                            billnumber = PatientReturnBill.PatientBill.BillNumber;
                        }
                        var PatientName = '';
                        var Status = '';
                        var Cash = 0;
                        var Card = 0;
                        var ChequeOthers = 0;
                        var Returnedby = '';

                        if (PatientReturnBill.PatientReturnStatus && PatientReturnBill.PatientReturnStatus.Description) {
                            Status = PatientReturnBill.PatientReturnStatus.Description;
                        }

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.Title && PatientReturnBill.Patient.Title.Description)
                            PatientName += PatientReturnBill.Patient.Title.Description;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.FirstName)
                            PatientName += ' ' + PatientReturnBill.Patient.FirstName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.LastName)
                            PatientName += ' ' + PatientReturnBill.Patient.LastName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.MRN)
                            PatientName += ' ' + PatientReturnBill.Patient.MRN;

                        if (!PatientName)
                            PatientName = PatientReturnBill.PatientName;

                        if (PatientReturnBill.User && PatientReturnBill.User.Title && PatientReturnBill.User.Title.Description)
                            drname += PatientReturnBill.User.Title.Description;

                        if (PatientReturnBill.User && PatientReturnBill.User.FirstName)
                            drname += ' ' + PatientReturnBill.User.FirstName;

                        if (PatientReturnBill.User && PatientReturnBill.User.LastName)
                            drname += ' ' + PatientReturnBill.User.LastName;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.Title && PatientReturnBill.ReturnedUser.Title.Description)
                            Returnedby += PatientReturnBill.ReturnedUser.Title.Description;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.FirstName)
                            Returnedby += ' ' + PatientReturnBill.ReturnedUser.FirstName;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.LastName)
                            Returnedby += ' ' + PatientReturnBill.ReturnedUser.LastName;


                        Cash = PatientReturnBill.ReturnAmount;
                        $scope.TotCashReturn += PatientReturnBill.ReturnAmount;
                        $scope.TotReturn += PatientReturnBill.ReturnAmount;

                        if ($scope.TotCashReturn > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReturnDt: returnDt,
                                Returnnumber: returnnumber,
                                BillNumber: billnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status,
                                MBillType: 2,
                                Returnedby: Returnedby
                            };
                            SNo++;
                            $scope.PaymentOPReturn.push(PaymentCollectionModel);
                        }
                    }
                }
            }


            $scope.PaymentOPReturn.forEach(function (rowArray) {
                var receiptdate = '';
                var receiptno = '';
                var billno = '';
                var patname = '';
                var drname = '';
                var cash = '';
                var card = '';
                var cheque = '';

                if (rowArray.ReceiptDt) {
                    receiptdate = utl.Formatter.getDateTimeString(rowArray.ReceiptDt);
                }
                if (rowArray.Receiptnumber) {
                    receiptno = rowArray.Receiptnumber;
                }
                if (rowArray.Billnumber) {
                    billno = rowArray.Billnumber;
                }

                if (rowArray.PatientName) {
                    patname = rowArray.PatientName;
                }

                if (rowArray.Drname) {
                    drname = rowArray.Drname;
                }
                if (rowArray.Cash) {
                    cash = rowArray.Cash;
                }
                if (rowArray.Card) {
                    card = rowArray.Card;
                }
                if (rowArray.ChequeOthers) {
                    cheque = rowArray.ChequeOthers;
                }

                csvContent += receiptdate + ',' + receiptno + ',' + billno + ',' + patname + ',' + drname + ',' + cash + ',' + card + ',' + cheque + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opduecollect-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 23, Value: [1, 2, 3, 4, 5] },
                    { Key: 4, Value: 3 },
                    {
                        Key: 22,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.StoreMasterId
                    }],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59');

            if (FrmDate || ToDate) {
                inputData.Params.push({
                    Key: 24,
                    Value: FrmDate
                })
                inputData.Params.push({
                    Key: 25,
                    Value: ToDate
                });
            }

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getOPReturnListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPReturn = [];
            $scope.TotCashReturn = 0;
            $scope.TotCardReturn = 0;
            $scope.TotChequeOthersReturn = 0;
            $scope.TotReturn = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientReturns = true;
                var SNo = 1;
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                } else {
                    $scope.StoreName = ''
                }
                if ($scope.currentfilter.UserId > 0) {
                    if (res.Data[0].CreatedUser.Title)
                        $scope.UserName = res.Data[0].CreatedUser.Title.Description;
                    if (res.Data[0].CreatedUser.FirstName)
                        $scope.UserName += ' ' + res.Data[0].CreatedUser.FirstName;
                    if (res.Data[0].CreatedUser.LastName)
                        $scope.UserName += ' ' + res.Data[0].CreatedUser.LastName;
                }
                for (var idx in res.Data) {
                    var PatientReturnBill = res.Data[idx];
                    if (!$scope.currentfilter.UserId || $scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientReturnBill.CreatedBy) {
                        var returnDt = PatientReturnBill.ReturnDateTime;
                        var returnnumber = PatientReturnBill.ReturnNumber;
                        var billDt = null;
                        var billnumber = '';
                        var drname = '';
                        if (PatientReturnBill.PatientBill) {
                            billDt = PatientReturnBill.PatientBill.BillDateTime;
                            billnumber = PatientReturnBill.PatientBill.BillNumber;
                        }
                        var PatientName = '';
                        var Status = '';
                        var Cash = 0;
                        var Card = 0;
                        var ChequeOthers = 0;
                        var Returnedby = '';

                        if (PatientReturnBill.PatientReturnStatus && PatientReturnBill.PatientReturnStatus.Description) {
                            Status = PatientReturnBill.PatientReturnStatus.Description;
                        }

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.Title && PatientReturnBill.Patient.Title.Description)
                            PatientName += PatientReturnBill.Patient.Title.Description;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.FirstName)
                            PatientName += ' ' + PatientReturnBill.Patient.FirstName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.LastName)
                            PatientName += ' ' + PatientReturnBill.Patient.LastName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.MRN)
                            PatientName += ' ' + PatientReturnBill.Patient.MRN;

                        if (!PatientName)
                            PatientName = PatientReturnBill.PatientName;

                        if (PatientReturnBill.User && PatientReturnBill.User.Title && PatientReturnBill.User.Title.Description)
                            drname += PatientReturnBill.User.Title.Description;

                        if (PatientReturnBill.User && PatientReturnBill.User.FirstName)
                            drname += ' ' + PatientReturnBill.User.FirstName;

                        if (PatientReturnBill.User && PatientReturnBill.User.LastName)
                            drname += ' ' + PatientReturnBill.User.LastName;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.Title && PatientReturnBill.ReturnedUser.Title.Description)
                            Returnedby += PatientReturnBill.ReturnedUser.Title.Description;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.FirstName)
                            Returnedby += ' ' + PatientReturnBill.ReturnedUser.FirstName;

                        if (PatientReturnBill.ReturnedUser && PatientReturnBill.ReturnedUser.LastName)
                            Returnedby += ' ' + PatientReturnBill.ReturnedUser.LastName;


                        Cash = PatientReturnBill.ReturnAmount;
                        $scope.TotCashReturn += PatientReturnBill.ReturnAmount;
                        $scope.TotReturn += PatientReturnBill.ReturnAmount;

                        if ($scope.TotCashReturn > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReturnDt: returnDt,
                                Returnnumber: returnnumber,
                                BillNumber: billnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                Status: Status,
                                MBillType: 2,
                                Returnedby: Returnedby
                            };
                            SNo++;
                            $scope.PaymentOPReturn.push(PaymentCollectionModel);
                        }
                    }
                }
            }

            try {
                $scope.TotCashReturn = ($scope.TotCashReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardReturn = ($scope.TotCardReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersReturn = ($scope.TotChequeOthersReturn).toFixed(2);
            } catch (e) { }

        };
        $scope.getOPReturnList = function () {
            var inputData = {
                Params: [
                    { Key: 23, Value: [1, 2, 3, 4, 5] },
                    { Key: 4, Value: 3 },
                    {
                        Key: 22,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 20,
                        Value: $scope.currentfilter.StoreMasterId
                    }],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };

            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59');

            if (FrmDate || ToDate) {
                inputData.Params.push({
                    Key: 24,
                    Value: FrmDate
                })
                inputData.Params.push({
                    Key: 25,
                    Value: ToDate
                });
            }

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPReturnListCallback
            };

            utl.Http.doAction(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.currentfilter.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            }
            $scope.getOPReturnList();
        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                // $scope.getList();
            }
        };

        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    StoreName: $scope.StoreName,
                    UserName: $scope.UserName,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                    StoreMaster: $scope.currentfilter.StoreMaster,
                },
                Params: [{ Key: 23, Value: [1, 2, 3, 4, 5] },
                { Key: 4, Value: 3 },
                ],
            };
            var options = {
                action: 'billing/patientreturns/PrintPharmacyReturnReportforOTC',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };




        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            // $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                }
            },]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();

    }

    PharmacyReturnReportforOTCController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();