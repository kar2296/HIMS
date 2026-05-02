(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemPerformingDoctorListController', serviceItemPerformingDoctorListController);

    function serviceItemPerformingDoctorListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {};
        vm.details = [];
        $scope.currentfilter = {};
        $scope.currentcontext = {};
        $scope.currentcontext.serviceitemid = parseInt($stateParams.id);
        $scope.item.ServiceItemId = $scope.currentcontext.serviceitemid;

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                ShareTypeId: 2,
                FacilityId: utl.Session.getCurrentFacilityId(),
                // DoctorName: '',
                DoctorShare: '',
                VisitTypeId: -1,
                Status: 1,
                StatusId: true
            };

            vm.items.push(lineItem);
            vm.details = vm.items;
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            // $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: $scope.item.ServiceItemId
                }],
                PageContext: {
                    PageSize: 400,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/ServiceItemPerformingDoctor/GetServiceItemPerformingDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.calcDrShare = function (item) {
            if (item.ShareTypeId == 2) {
                item.DoctorShare = (item.DoctorShareValue / 100) * item.Rate;
            }
            if (item.ShareTypeId == 1) {
                item.DoctorShare = item.DoctorShareValue;
            }
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        $scope.addteamSelection = function () {
            utl.Modal.open('app.addteamSelection', {
                params: {
                    serviceId: $scope.currentcontext.serviceitemid,
                },
                confirmCallback: $scope.addLineItems
            });
        };

        $scope.addLineItems = function (data) {
            if (data && data.length > 0) {
                for (var dx in data) {
                    var docInfo = data[dx];
                    var lineItem = {
                        Id: 0,
                        ServiceRateCategoryId: docInfo.ServiceRateCategoryId,
                        Rate: docInfo.Rate,
                        DoctorId: docInfo.DoctorId,
                        DoctorName: docInfo.DoctorName,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        ShareTypeId: docInfo.ShareTypeId,
                        DoctorShareValue: docInfo.DoctorShareValue,
                        TeamId: docInfo.TeamId,
                        VisitTypeId: 1,
                        Status: 1,
                        StatusId: true
                    };
                    vm.items.push(lineItem);
                }
                $scope.calcDocShare();
            }
        };

        $scope.dispdocTeam = function (item) {
            if (item.IsDisplayAllDoctors) {
                $scope.item.SelectedTeamId = item.TeamId;
            }
        }

        $scope.calcDocShare = function () {
            for (var jdx in vm.items) {
                var item = vm.items[jdx];
                if (item.ShareTypeId == 2) {
                    item.DoctorShare = (item.DoctorShareValue / 100) * item.Rate;
                }
                if (item.ShareTypeId == 1) {
                    item.DoctorShare = item.DoctorShareValue;
                }
            }
        }
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            //$scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.DoctorName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        vm.doctorcontrolconfig = {
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
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.TDSId = selectedItem.TDSId;
                if (selectedItem.GstMaster) {
                    $scope.item.TDSPercentage = selectedItem.GstMaster.GstName;
                    $scope.item.TDSPercAmount = selectedItem.GstMaster.GstPercentage;
                }
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality, vm.doctorcontrolconfig.rowdata.TDSId
                ].join(' ');
            }
            $scope.item.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
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
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        };

        $scope.OnSelectDoctor = function (idx, item) {
            var lastIndex = vm.items.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();

                console.log(item.SelectedItem);
                var DocObj = item.SelectedItem;
                if (DocObj != null) {
                    item.DoctorName = '';
                    item.DoctorId = DocObj.Id;
                    item.DoctorName = DocObj.DoctorName;
                    // if (DocObj.Title)
                    //     item.DoctorName = DocObj.Title.Description;
                    // if (DocObj.FirstName)
                    //     item.DoctorName += ' ' + DocObj.FirstName;
                    // if (DocObj.LastName)
                    //     item.DoctorName += ' ' + DocObj.LastName;
                }
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };


        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'clinicalmaster/ServiceItemPerformingDoctor/ManageServiceItemPerformingDoctor',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                // var validrate = false;
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.DoctorId) {
                    continue;
                } else if (item.FacilityId == -1 || !item.DoctorShare || item.VisitTypeId == -1) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.DoctorShare) {
                    if ($scope.item.SelectedTeamId == item.TeamId) {
                        item.IsDisplayAllDoctors = true;
                    } else {
                        item.IsDisplayAllDoctors = true;
                    }

                    item.ServiceItemId = $scope.currentcontext.serviceitemid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "Team"
                },
                {
                    "Key": "VisitType"
                }
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

    serviceItemPerformingDoctorListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();