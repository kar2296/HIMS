(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDietnbmListController', patientDietnbmListController);

    function patientDietnbmListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;

        if ($scope.item.EncounterId && $scope.item.EncounterId > 0) {
            $scope.item.encounter = utl.Session.getPatientEncounter();
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.applyVisibilityRules()
        };

        $scope.getList = function () {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.pid },
                        { Key: 2, Value: 1 },

                    ],

                };

                var options = {
                    action: 'emr/patientdietnbm/GetPatientDietNbms',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.getenListCallback = function (scope, data, options, hasError) {

            vm.engridConfig.data = data.Data;
            vm.engridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.applyVisibilityRules()

        };

        $scope.getenList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: 2 },

                ]
            };

            var options = {
                action: 'emr/patientdietnbm/GetPatientDietNbms',
                data: inputData,
                type: 'post',
                onComplete: $scope.getenListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getTpnListCallback = function (scope, data, options, hasError) {

            vm.tpngridConfig.data = data.Data;
            vm.tpngridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.applyVisibilityRules()

        };

        $scope.getTpnList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: 3 },

                ]
            };

            var options = {
                action: 'emr/patientdietnbm/GetPatientDietNbms',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTpnListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.invoke = function () {
            $scope.item.InvokedBy = utl.Session.getCurrentUserId();
            $scope.item.InvokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 1;

            $scope.item.PatientDietNbmStatusId = 1;
            // Draft
            $scope.saveItem({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, InvokedBy: $scope.item.InvokedBy, InvokedOn: $scope.item.InvokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.revoke = function () {

            $scope.item.RevokedBy = utl.Session.getCurrentUserId();
            $scope.item.RevokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 1;

            $scope.item.PatientDietNbmStatusId = 2;
            // Draft
            $scope.saveItem({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, RevokedBy: $scope.item.RevokedBy, RevokedOn: $scope.item.RevokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.invokeen = function () {
            $scope.item.InvokedBy = utl.Session.getCurrentUserId();
            $scope.item.InvokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 2;

            $scope.item.PatientDietNbmStatusId = 1; // Draft



            $scope.saveEnItems({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, InvokedBy: $scope.item.InvokedBy, InvokedOn: $scope.item.InvokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.revokeen = function () {
            $scope.item.RevokedBy = utl.Session.getCurrentUserId();
            $scope.item.RevokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 2;

            $scope.item.PatientDietNbmStatusId = 2;
            // Draft
            $scope.saveEnItems({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, RevokedBy: $scope.item.RevokedBy, RevokedOn: $scope.item.RevokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.invoketpn = function () {
            $scope.item.InvokedBy = utl.Session.getCurrentUserId();
            $scope.item.InvokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 3;

            $scope.item.PatientDietNbmStatusId = 1; // Draft



            $scope.SaveTpnItems({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, InvokedBy: $scope.item.InvokedBy, InvokedOn: $scope.item.InvokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.revoketpn = function () {
            $scope.item.RevokedBy = utl.Session.getCurrentUserId();
            $scope.item.RevokedOn = utl.Formatter.getCurrentDate();
            $scope.item.PatientDietNbmTypeId = 3;

            $scope.item.PatientDietNbmStatusId = 2;
            // Draft
            $scope.SaveTpnItems({ PatientId: $scope.item.PatientId, EncounterId: $scope.item.EncounterId, RevokedBy: $scope.item.RevokedBy, RevokedOn: $scope.item.RevokedOn, PatientDietNbmStatusId: $scope.item.PatientDietNbmStatusId, PatientDietNbmTypeId: $scope.item.PatientDietNbmTypeId });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.item.PatientDietNbmTypeId == 1) {
                $scope.getList();
            }
            if ($scope.item.PatientDietNbmTypeId == 2) {
                $scope.getenList();
            }
            if ($scope.item.PatientDietNbmTypeId == 3) {
                $scope.getTpnList();
            }
        };

        $scope.saveItem = function (data) {

            var actionName = 'emr/patientdietnbm/AddPatientDietNbm';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientdietnbm/UpdatePatientDietNbm';
                data.Id = $scope.currentcontext.id;
            }
            var options = {
                action: actionName,
                data: { Data: data },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };
        $scope.saveEnItems = function (data) {
            var actionName = 'emr/patientdietnbm/AddPatientDietNbm';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientdietnbm/UpdatePatientDietNbm';
                data.Id = $scope.currentcontext.id;

            }

            var options = {
                action: actionName,
                data: { Data: data },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SaveTpnItems = function (data) {
            var actionName = 'emr/patientdietnbm/AddPatientDietNbm';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientdietnbm/UpdatePatientDietNbm';
                data.Id = $scope.currentcontext.id;
            }

            var options = {
                action: actionName,
                data: { Data: data },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.applyVisibilityRules = function () {
            if ($scope.currentcontext.id <= 0) {

                $scope.caninvokebtn = true;
                $scope.canrevokebtn = false;
                $scope.caninvokeenbtn = true;
                $scope.canrevokeenbtn = false;
                $scope.caninvoketpnbtn = true;
                $scope.canrevoketpnbtn = false;
            } else {
                $scope.caninvokebtn = true;
                $scope.canrevokebtn = false;
                $scope.caninvokeenbtn = true;
                $scope.canrevokeenbtn = false;
                $scope.caninvoketpnbtn = true;
                $scope.canrevoketpnbtn = false;

                if ($scope.item.PatientDietNbmStatusId == 1 && $scope.item.PatientDietNbmTypeId == 1) {
                    $scope.caninvokebtn = false;
                    $scope.canrevokebtn = true;
                }
                if ($scope.item.PatientDietNbmStatusId == 2 && $scope.item.PatientDietNbmTypeId == 1) {
                    $scope.caninvokebtn = true;
                    $scope.canrevokebtn = false;
                }
                if ($scope.item.PatientDietNbmStatusId == 1 && $scope.item.PatientDietNbmTypeId == 2) {
                    $scope.caninvokeenbtn = false;
                    $scope.canrevokeenbtn = true;
                }
                if ($scope.item.PatientDietNbmStatusId == 2 && $scope.item.PatientDietNbmTypeId == 2) {
                    $scope.caninvokeenbtn = true;
                    $scope.canrevokeenbtn = false;
                }
                if ($scope.item.PatientDietNbmStatusId == 1 && $scope.item.PatientDietNbmTypeId == 3) {
                    $scope.caninvoketpnbtn = false;
                    $scope.canrevoketpnbtn = true;
                }
                if ($scope.item.PatientDietNbmStatusId == 2 && $scope.item.PatientDietNbmTypeId == 3) {
                    $scope.caninvoketpnbtn = true;
                    $scope.canrevoketpnbtn = false;
                }

            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') { } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);

            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: " InvokedBy", displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl') },

                {
                    field: "InvokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "RevokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "InvokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.InvokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.InvokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RevokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.RevokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.RevokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        vm.engridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: " InvokedBy", displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl') },

                {
                    field: "InvokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "RevokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "InvokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.InvokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.InvokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RevokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.RevokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.RevokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };

        vm.tpngridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: " InvokedBy", displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl') },

                {
                    field: "InvokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.CreatedUser'> </span>" +
                    "<span  ng-if='row.entity.CreatedUser'>{{row.entity.CreatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "RevokedBy",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.Title.Description }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.FirstName }}</span>" +
                    "<span  ng-if='row.entity.UpdatedUser'> </span>" +
                    "<span  ng-if='row.entity.UpdatedUser'>{{row.entity.UpdatedUser.LastName}}</span>" +
                    "</div>"

                },
                {
                    field: "InvokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.invokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.InvokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.InvokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "RevokedOn",
                    displayName: $translate.instant('patientemr.patientdietnbm-list.revokeddate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.RevokedOn | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.RevokedOn| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getenList();
            $scope.getTpnList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "SurgeryType" },
                { "Key": "Procedure" },
                { "Key": "OTRequestStatus" }

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

    patientDietnbmListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();