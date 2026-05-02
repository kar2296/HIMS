(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newborndetailsFormController', newborndetailsFormController);

    function newborndetailsFormController($scope, $interval, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            // Id:0,
            EncounterId: utl.Session.getEncounterId(),
            DeliveryDate: utl.Formatter.getCurrentDate(),
            isl: false,

        };


        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;
        if ($scope.item.EncounterId && $scope.item.EncounterId > 0) {
            $scope.item.encounter = utl.Session.getPatientEncounter();
            $scope.item.DoctorId = $scope.item.encounter.DoctorId;

        }
        // // $scope.currentcontext.encounterid = parseInt($stateParams.EncounterId);

        $scope.getItemCallback = function (scope, data, options, hasError) {

            $scope.item = data;
            // if (data.NewBornStatusId == 2)
            //     $scope.item.isl = true;

            $scope.item.DeliveryDate = utl.Formatter.getCurrentDate();
            $scope.applyVisibilityRules();
        };


        $scope.getItem = function (pageNo) {

            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/newborndetail/GetNewBornDetailById',
                    data: { Id: $scope.currentcontext.id, PatientId: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.setFocusTitle();
            }
        };
        $scope.setFocusTitle = function () {
            if ($scope.currentcontext.id <= 0) {
                $scope.startinterval = $interval(function () {
                    $scope.callTitleFocus();
                }, 1000);
            }
        }
        $scope.callTitleFocus = function () {
            if ($scope.currentcontext.id <= 0) {
                console.log("test print by ");
                var uiSelect = angular.element(document.getElementById('gender'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }
            $interval.cancel($scope.startinterval);
        }
        $scope.backToList = function () {

            $state.go('patientemr.newborn');

        };
        $scope.save = function () {
            $scope.item.NewBornStatusId = 1;
            $scope.saveItem();
        };
        $scope.saveactive = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.NewBornStatusId = 2;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.newborndetails-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

            // $scope.saveItem();
        };
        $scope.saveItemCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            loadData();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'emr/newborndetail/AddNewBornDetail';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/newborndetail/UpdateNewBornDetail';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            $scope.item = {
            };
        };
        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowSaveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canhistoryBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandActiveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
                $scope.canShowPrintBtn = false;

            }
            else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;

                if ($scope.item.NewBornStatusId == 1) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowSaveandActiveBtn = true;
                    $scope.canShowPrintBtn = false;

                }
                // Bill Completed
                if ($scope.item.NewBornStatusId == 2) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandActiveBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowprintBtn = true;

                    // $scope.canShowViewReceipt = true;
                }
                  if ($scope.item.NewBornStatusId == 3) {
                    $scope.canShowSaveBtn = false;
                    $scope.canShowClearBtn = false;
                    $scope.canShowSaveandActiveBtn = false;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowprintBtn = true;

                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled


            }
        };

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();


        function loadData() {
            $scope.getItem();
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $scope.getItem();
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/newborndetail/PrintNewBornDetail',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }


        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Gender" },
                { "Key": "ModeOfDelivery" },
                { "Key": "NewBornStatus" },
                { "Key": "CongentialAnomalies" },
                { "Key": "JellyCordCutBy" },
                { "Key": "JellyCordType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 10,
                            Value: 1
                        }]
                    }
                },
                { "Key": "Stools" },
                { "Key": "RhFactor" },
                { "Key": "PatencyOfAnus" },
                { "Key": "BloodGroup" },
                { "Key": "Urine" },
                { "Key": "WeightUnits" },
                { "Key": "HEIGHTUNITS" },
                { "Key": "BirthOutCome" },
                { "Key": "Respiration" },
                { "Key": "MuscleTone" },
                { "Key": "Reflexes" },
                { "Key": "HeartRate" },
                { "Key": "Colour" },
                { "Key": "DeliveryComplications" },
                { "Key": "CordBloodFor" },




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

    newborndetailsFormController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl'];

})();