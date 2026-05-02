(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RecommentdationController', RecommentdationController);

    function RecommentdationController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = [];

        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
        };
        $scope.currentcontext = {
            id: 0
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;


        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.currentcontext.id = res.Data[0].Id;
                $scope.item.IsSurgery = res.Data[0].IsSurgery;
                $scope.item.IsAdmission = res.Data[0].IsAdmission;
                $scope.item.ProcedureId = res.Data[0].ProcedureId;
                $scope.item.Comments = res.Data[0].Comments;
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        //autosearch related code starts for SurgeryName
        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Procedure Name', field: 'ProcedureName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.SurgeryName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            //Search only nurse
            var inputData = {
                Params: [
                    // { Key: 3, Value: 10 }
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

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }
        //autosearch related code ends for SurgeryName

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            // $scoope.item.TokenStatusId == 1 && $scoope.item.TokenNo == 0
            if (!utl.Validator.validate($scope)) {
                return;
            }

            // var actionName = 'Appointment/AppointmentDisplay/AddAppointmentDisplay';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'Appointment/AppointmentDisplay/UpdateAppointmentDisplay';
            // }
            $scope.item.Id = $scope.currentcontext.id;
            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Department" },
                // { "Key": "TokenStatus" },
                // { "Key": "DisplayNo" },
                // { "Key": "OPDRoom" },
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
    RecommentdationController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();