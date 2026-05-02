(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClinicalFormController', ClinicalFormController);

    function ClinicalFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.Data = [];
         $scope.currentfilter = {
            ClinicalDecisionId: 1,
            ClinicalFunctionId:1,

        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);



        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            vm.gridConfig.data = $scope.gridData;
            //$scope.applyFilter();
        };

        $scope.getDetails = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [

                    ]
                };

                var options = {
                    action: 'AssetManagement/AssetAuditDetail/GetAssetAuditDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('app.clinicalmanagement');
        }


       var check=[];
      $scope.getbutton=function(button, value){
           {
              check.push(value)

          }


$scope.item.Content=$scope.item.Content +','+check.join(',');
      }

        // TestMaster AutoSearch
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Type', field: 'Sampletype', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                // { header: 'Price', field: 'Price', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
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
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.TestName + '(' + selectedItem.TestCode + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;

            var inputData = {
                Params: [
                    // { Key: 3, Value: $scope.item.TESTMASTERTYPId },
                    { Key: 6, Value: 2 },
                    // { Key: 8, Value: { 'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId } }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                item.TestCode = item.Code;
                item.TestName = item.Name;
                // item.DrugType = item.DrugType.Description;
                // if (item.GenericMaster)
                //     item.GenericMaster = item.GenericMaster.GenericName;
                // if (item.DrugForm)
                //     item.DrugForm = item.DrugForm.Description;
                // item.DrugFrequency = item.DrugFrequency.Name;

            }
        }

         $scope.getTest = function () {
            $scope.Test = $scope.item.selectedItem;
            $scope.item.TestCode = $scope.Test.Code;
            $scope.item.TestName = $scope.Test.Name;
        };
        //procedure autosearch related code starts -
        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-procedurename' },
                { header: 'Procedure Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            presearch: presearchprocedureitem,
            formatdisplay: formatselectedprocedureitem,
            postsearch: postsearchprocedureitem
        };

        function formatselectedprocedureitem() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName].join(' ');
                $scope.item.Code = selectedItem.Code;

            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.ProcedureName,
                vm.procedurecontrolconfig.rowdata.Code,

                ].join(' ');
            }
            return result;
        }

        function presearchprocedureitem() {
            var query = vm.procedurecontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 5, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedureitem() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureName = item.ProcedureName;
                item.Code = item.Code;

            }
        }
        //procedure autosearch related code ends -

 //immunization autosearch related code starts -
        vm.immunizationcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Immunization Name', field: 'ImmunizationName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-immunizationname' },
                { header: 'Description', field: 'Description', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/Immunization/GetImmunizations',
            presearch: presearchimmunizationitem,
            formatdisplay: formatselectedimmunizationitem,
            postsearch: postsearchimmunizationitem
        };

        function formatselectedimmunizationitem() {
            var selectedItem = vm.immunizationcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ImmunizationName].join(' ');
                $scope.item.Code = selectedItem.Description;

            } else if (vm.immunizationcontrolconfig.rowdata) {
                result = [vm.immunizationcontrolconfig.rowdata.ImmunizationName,
                vm.immunizationcontrolconfig.rowdata.Description,

                ].join(' ');
            }
            return result;
        }

        function presearchimmunizationitem() {
            var query = vm.immunizationcontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 5, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.immunizationcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.immunizationcontrolconfig.searchparams = inputData;
        }

        function postsearchimmunizationitem() {
            for (var idx in vm.immunizationcontrolconfig.result) {
                var item = vm.immunizationcontrolconfig.result[idx];
                item.ImmunizationName = item.ImmunizationName;
                item.Description = item.Description;

            }
        }
        //immunization autosearch related code ends -


 //drugmaster autosearch related code starts -
        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Drug Name', field: 'DrugName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-drugname' },
                { header: 'Drug Code', field: 'DrugCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            presearch: presearchdrugitem,
            formatdisplay: formatselecteddrugitem,
            postsearch: postsearchdrugitem
        };

        function formatselecteddrugitem() {
            var selectedItem = vm.drugcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DrugName].join(' ');
                $scope.item.DrugCode = selectedItem.DrugCode;

            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugName,
                vm.drugcontrolconfig.rowdata.DrugCode,

                ].join(' ');
            }
            return result;
        }

        function presearchdrugitem() {
            var query = vm.drugcontrolconfig.query;

            //Search only active
            var inputData = {
                Params: [
                    //  { Key: 2, Value: $scope.item.AssetName },
                    // { Key: 5, Value: $scope.item.AssetId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.drugcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrugitem() {
            for (var idx in vm.drugcontrolconfig.result) {
                var item = vm.drugcontrolconfig.result[idx];
                item.DrugName = item.DrugName;
                item.DrugCode = item.DrugCode;

            }
        }
        //drugmaster autosearch related code ends -
        $scope.save = function () {
            if ($scope.currentcontext.id == 0) { $scope.item.AuditStatusId = 1; }

            $scope.saveItem();
        };
        $scope.saveAndAudit = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AuditStatusId = 3;
            $scope.saveItem();
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetails();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'SystemSettings/facility/GetFacilityById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
        };
        $scope.clear = function () {
            $scope.item = {};
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/AssetAudit/AddAssetAudit';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/AssetAudit/UpdateAssetAudit';
            }
            var inputData = { Header: $scope.item, Details: $scope.gridData };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

 $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ClinicalDecision" },
                { "Key": "ClinicalFunction" },
                 { "Key": "PatientStatus" },
                 { "Key": "Gender" },
                            ];

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

    ClinicalFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();