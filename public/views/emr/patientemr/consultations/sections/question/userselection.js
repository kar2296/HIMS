(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('userselectionController', userselectionController);

    function userselectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.DocInfo = '';
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.modelkey = modalConfig.params.modelkey;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.onDoctorSelected = function(selectedDoc) {
            document.getElementById("docid").value = '';
            if ($scope.DocName) {
                $scope.DocName += ',' + selectedDoc.DoctorName;
            }
            if (!$scope.DocName) {
                $scope.DocName = selectedDoc.DoctorName;
            }
        }
        $scope.loadInfo = function() {
            $scope.confirmCallback({
                modelkey: $scope.currentcontext.modelkey,
                Notes: $scope.DocName,
            });
        }
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
                result = [selectedItem.DoctorName + '(' + selectedItem.Qualification + ',' + selectedItem.Speciality + ')'].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }, {
                    Key: 2,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }, {
                    Key: 5,
                    Value: 2
                }],
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
                if (item.Title) {
                    item.DoctorName = item.Title.Description;
                    if (item.FirstName) {
                        item.DoctorName += ' ' + item.FirstName;
                    }
                    if (item.LastName) {
                        item.DoctorName += ' ' + item.LastName;
                    }
                } else {
                    if (item.FirstName) {
                        item.DoctorName = item.FirstName;
                    }
                    if (item.LastName) {
                        item.DoctorName += ' ' + item.LastName;
                    }
                }
                item.Qualification = item.Qualification;
                if (item.Department) {
                    item.Speciality = item.Department.DepartmentName;
                }
            }
        }



        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "UserType"
            }, ];

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

    userselectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();