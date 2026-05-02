(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dummyIPLabOrderController', dummyIPLabOrderController);

    function dummyIPLabOrderController($scope, $stateParams, $state, $timeout, $translate, utl, $filter) {
        var vm = this;
        $scope.Encounter = [];
        $scope.Investigation = [];
        $scope.SubDepartment = [];
        $scope.txtSearch = '';
        $scope.lookup = {};
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            TypeId: 1,
            AdmissionDate: utl.Formatter.getCurrentDate(),
            TransactionDate: utl.Formatter.getCurrentDate(),
        };
        $scope.item = {};

        $scope.getList = function () {
            var fromdt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd 00:00:00');
            var todt = $filter('date')($scope.currentcontext.AdmissionDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 6,
                        Value: $scope.currentcontext.DepartmentId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 50,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            if (fromdt && todt) {
                inputData.Params.push({
                    Key: 16,
                    Value: [fromdt, todt]
                });
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data;
            for (var idx in $scope.Encounter) {
                var enc = $scope.Encounter[idx];
                enc.Status = 0;
            }
        }

        // TestMaster AutoSearch
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'Name',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Type',
                    field: 'Sampletype',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                },
                {
                    header: 'Department',
                    field: 'Department',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
                {
                    header: 'Price',
                    field: 'Price',
                    datatype: 'string',
                    headercls: 'td-price',
                    fieldcls: 'td-price'
                },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.testtype
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 8,
                        Value: {
                            'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId
                        }
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.testcontrolconfig.searchbyid == true) {
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

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                item.Department = item.Department.DepartmentName;
                if (item.SampletypeId > 0) {
                    item.Sampletype = item.Sampletype.Name;
                }
            }
        }

        $scope.testChanged = function (idx, item) {

            for (var itmidx in $scope.Investigation) {
                var idxdata = $scope.Investigation[itmidx];
                if (idxdata.Status == 1 && idxdata.TestId == item.TestId) {
                    var msg = " Selected Item Aleady Exist ";
                    utl.Alert.showErrorMsg(msg);
                    return;
                }
            }
            item.SelectedItem.Id = 0; // Don't Remove
            item.SelectedItem.Status = 1;
            item.SelectedItem.TestId = item.TestId;
            item.SelectedItem.TestCode = item.SelectedItem.Code;
            item.SelectedItem.RequestDate = $scope.currentcontext.TransactionDate;
            item.SelectedItem.IsOrderable = true;
            item.SelectedItem.IsDirectBill = null;
            item.SelectedItem.OrderTypeId = item.TESTMASTERTYPId;
            item.SelectedItem.TestTypeId = item.TESTMASTERTYPId;
            item.SelectedItem.TestName = item.SelectedItem.Description;
            item.SelectedItem.TestDescription = item.SelectedItem.Description;
            if (item.SelectedItem.Description.length > 35) {
                item.SelectedItem.Description = item.SelectedItem.Description.substring(0, 34);
            }
            $scope.Investigation.push(item.SelectedItem);
            $scope.GetSubDeptinfo();
        }

        $scope.GetSubDeptinfo = function () {
            var Investigation_SubDept_Group = groupByMulti($scope.Investigation, ['SubDepartmentId']);
            $scope.TotalFreeCount = 0;
            $scope.SubDepartment = [];
            for (var idx in Investigation_SubDept_Group) {
                var subdept = Investigation_SubDept_Group[idx];
                for (var idx1 in subdept) {
                    var subdeptname = subdept[idx1];
                    var subdeptitem = {
                        DepartmentName: subdeptname.SubDepartment.DepartmentName,
                        FreeCount: subdept.length
                    };
                    $scope.TotalFreeCount += subdept.length;
                    $scope.SubDepartment.push(subdeptitem);
                    break;
                }
            }
        }

        $scope.deleteInvestigation = function (indx, item) {
            item.Status = 0;
            /* REMOVE DELETED ITEMS */
            var AcutalItems = $scope.Investigation;
            $scope.Investigation = [];
            for (var itemidx in AcutalItems) {
                if (AcutalItems[itemidx].Status == 1) {
                    $scope.Investigation.push(AcutalItems[itemidx]);
                }
            }
            /* REMOVE DELETED ITEMS */
            $scope.GetSubDeptinfo();
        }

        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };


        $scope.saveAndApprove = function () {
            if ($scope.checkMandatory()) {
                var Encounter = $scope.Encounter;
                $scope.Encounter = [];
                for (var idx in Encounter) {
                    var enc = Encounter[idx];
                    if (enc.Status == 1) {
                        enc.EncounterId = enc.Id;
                        enc.BillingStatusId = 2;
                        enc.OrderFromId = enc.DepartmentId;
                        enc.OrderToId = 8;
                        enc.OrderPriorityId = 1;
                        enc.FacilityId = $scope.currentcontext.FacilityId;
                        enc.OrderStatusId = 1;
                        enc.OrderTotal = 0;
                        $scope.Encounter.push(enc);
                    }
                }
                var actionName = 'registration/patient/DummyIPOrderCreation';
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            TransactionDate: $filter('date')($scope.currentcontext.TransactionDate, 'yyyy-MM-dd 00:00:00'),
                            Headers: $scope.Encounter,
                            Details: $scope.Investigation
                        }
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.checkMandatory = function () {
            var today = new Date();
            if ($scope.currentcontext.TransactionDate > today) {
                var msg = "Transaction date should not be a future date";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            var NoInPatient = true;
            var NoInvestigation = true;
            for (var idx in $scope.Encounter) {
                var enc = $scope.Encounter[idx];
                if (enc.Status == 1) {
                    NoInPatient = false;
                    console.log(enc.PatientId);
                }
            }
            for (var idx in $scope.Investigation) {
                var enc = $scope.Investigation[idx];
                if (enc.Status == 1) {
                    NoInvestigation = false;
                    console.log(enc.PatientId);
                }
            }
            if (NoInPatient) {
                var msg = "Select Any one InPatient from the InPatient List";
                utl.Alert.showErrorMsg(msg);
                return false;
            }
            if (NoInvestigation) {
                var msg = "Raise Any one Investigation";
                utl.Alert.showErrorMsg(msg);
                return false;
            }

            return true;

        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $timeout(function () {
                $scope.Investigation = [];
                $scope.SubDepartment = [];
                $scope.TotalFreeCount = 0;
                $scope.getList();
            }, 1000);
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup["Type"] = [{
                Id: 1,
                Text: "Manual"
            }, {
                Id: 2,
                Text: "Automatic"
            }];
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 1
                    }, {
                        Key: 5,
                        Value: 2
                    }, {
                        Key: 9,
                        Value: true
                    }]
                }
            }, ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    dummyIPLabOrderController.$inject = ['$scope', '$stateParams', '$state', '$timeout', '$translate', 'utl', '$filter'];

})();