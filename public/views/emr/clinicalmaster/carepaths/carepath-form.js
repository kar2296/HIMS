(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('carepathFormController', carepathFormController);

    function carepathFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            Activefrom: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id)

        $scope.item.FilePath= null;
        $scope.currentcontext.file =  null;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
           //$scope.getImage();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/CarePath/GetCarePathById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getImageCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getImage = function() {
            var inputData = { FilePath: $scope.item.FilePath };
            var options = {
                action: 'clinicalmaster/CarePath/GetItemLogo',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.getImageCallback
            };
            utl.Http.doAction(options);
        }

        $scope.backToList = function() {
            $state.go('app.carepaths', { id: 0 });
        }
        $scope.clear = function() {
            $scope.item = {};
        }
        $scope.SaveandDraft = function() {
            $scope.item.ActiveStatusId = 1; 
            $scope.item.ActiveStatus = 'Draft'; //Draft            
            $scope.saveItem();
        }

        $scope.SaveandApprove = function() {
            $scope.item.ActiveStatus = 'Active' //Active            
            if ($scope.item.IsActive) {  
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof(data) == "number") {
                $state.go('app.carepathtab.details', { id: data, IsProfile: null, TestName: options.data.Data.Code + ' - ' + options.data.Data.Name, TestCode: options.data.Data.Name, });
            } else {
                $scope.backToList(); // Safer side added
            }
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/CarePath/AddCarePath';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/CarePath/UpdateCarePath';
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function(resp) { //upload function returns a promise
                        if (!(resp.data < 0)) {
                            $scope.saveItemCallback();
                        }
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getdiagnosisCallBack = function(scope, data, options, hasError) {
            $scope.diagnosis = data;
            $scope.item.Alos = $scope.diagnosis.LengthOfStay
        }
        $scope.getDiagnosis = function() {
            var options = {
                action: 'clinicalmaster/diagnosis/GetDiagnosisById',
                data: { Id: $scope.item.DiagnosisId },
                type: 'post',
                onComplete: $scope.getdiagnosisCallBack
            };
            utl.Http.doAction(options);
        }
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
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { Key: 'Department' , 
                        Request:{
                            Params:[{ Key:5,Value:2}]
                            
                        }},
                { "Key": "DiagnosisName" },
                { "Key": "Speciality" },
                { "Key": "CarePathType" },
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

    carepathFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();