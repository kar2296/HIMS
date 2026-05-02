(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterDiagnosisMapFormController', testmasterDiagnosisMapFormController);

    function testmasterDiagnosisMapFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            Activefrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.testmasterid = parseInt($stateParams.id);
        $scope.currentcontext.id = parseInt($stateParams.tstdiagnosisid);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

            if ($scope.item.Activefrom == null)
                $scope.item.Activefrom = new Date();

            $scope.setDiagnosisSelected($scope.item.DiagnosisCodeSchemeId);

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'lis/testmaster/GetTestdiagnosismappingById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.testmastertab.testdiagnosismappings');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.TestmasterId = $scope.currentcontext.testmasterid;
            var actionName = 'lis/testmaster/AddTestdiagnosismapping';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/testmaster/UpdateTestdiagnosismapping';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //autosearch related code Starts for Diagnosis 
        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DiagnosisName', field: 'DiagnosisName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Version', field: 'Version', datatype: 'string', headercls: 'td-Version', fieldcls: 'td-Version' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-Speciality', fieldcls: 'td-Speciality' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {

            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')' + selectedItem.Version].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName,
                vm.diagnosiscontrolconfig.rowdata.DiagnosisVersionId, vm.diagnosiscontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
                item.Version = item.DiagnosisVersion.Description;
                item.Speciality = item.Speciality;
            }
        }
        //autosearch related code ends for Diagnosis  

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DiagnosisCodeScheme" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.diagnosisLookupCallback = function (scope, data, options, hasError) {
            $scope.lookup.Diagnosis = hasError ? {} : data.Diagnosis;
        }

        $scope.onDiagnosisSelected = function (selectedItem) {
            //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key 
            //whatever property your list has.
            //console.log(selectedItem);

            if (selectedItem.Id > 0) {
                var inputData = [
                    // {
                    //     "Key": "Diagnosis", "Request": {
                    //         "Params": [{ 'Key': 3, 'Value': selectedItem.Id }],
                    //     }
                    // }
                ];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.diagnosisLookupCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.setDiagnosisSelected = function (selectedItem) {
            //do selectedItem.PropertyName like selectedItem.Name or selectedItem.Key 
            //whatever property your list has.
            //console.log(selectedItem);

            if (selectedItem > 0) {
                var inputData = [
                    {
                        "Key": "Diagnosis", "Request": {
                            "Params": [{ 'Key': 3, 'Value': selectedItem }],
                        }
                    }
                ];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.diagnosisLookupCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.initLookup();
    }

    testmasterDiagnosisMapFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();