(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrincidentmanagementformController', emrincidentmanagementformController);

    function emrincidentmanagementformController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext = {};
        $scope.currentcontext.Id = modalConfig.params.id;

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            IncidentStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: utl.Session.getCurrentDepartmentId(),
            IncidentDate: utl.Formatter.getCurrentDate(),
            CreateDate: utl.Formatter.getCurrentDate(),
            CreateBy: utl.Session.getCurrentUserId(),
        };
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;

        $scope.Canshowassignbtn = true;
        $scope.Canshowcancelbtn = false;
        $scope.Canshowcompletebtn = false;
        $scope.backToList = function () {
            $state.go('app.IncidentManagementlist');
        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
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
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.FirstName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.FirstName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]
                }, { Key: 5, Value: 2 }],
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
                item.UserId = item.Id;
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }
        $scope.getMaxId = function () {
            if (!$scope.currentcontext.id) {
                var options = {
                    action: 'TaskManagement/IncidentManagement/GetMaxId',
                    data: {
                        Data: {}
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        }
        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }
        $scope.getMaxIdCallback = function (scope, data, options, hasError) {
            var StartingNr = '001';
            if (data)
                StartingNr = ZeroPadding(data, 3);
            $scope.prefix = '';
            StartingNr = 'TASK' + '' + StartingNr;
            if (StartingNr)
                $scope.item.TaskNo = StartingNr;
        }
        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            if ($scope.item.IncidentStatusId == 1) {
                $scope.Canshowassignbtn = true;
                $scope.Canshowcancelbtn = true;
                $scope.Canshowcompletebtn = true;
            }
            if ($scope.item.IncidentStatusId == 2) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
            }
            if ($scope.item.IncidentStatusId == 3) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
            }
            $scope.getMaxId();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.Id
                    }]
                };

                var options = {
                    action: 'TaskManagement/IncidentManagement/GetIncidentManagements',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.saveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if (!$scope.item.AssignedTo) {
            //     utl.Alert.showErrorMsg($translate.instant('Please Select Assign To'));
            //     return false;
            // }
            $scope.item.IncidentStatusId = 1;
            $scope.item.AssignedFrom = utl.Session.getCurrentUserId();
            $scope.item.AssignedFromDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'TaskManagement/IncidentManagement/AddIncidentManagement';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'TaskManagement/IncidentManagement/UpdateIncidentManagement';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getMaxId();
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "IncidentType"
                },
                {
                    "Key": "Priority"
                },
                {
                    Key: 'User',
                    Request: {
                        Params: [{ Key: 5, Value: 2 },
                        { Key: 3, Value: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12] }]

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

        $scope.initLookup();
    }

    emrincidentmanagementformController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();