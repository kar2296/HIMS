(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreOperativeCheckListFormController', PreOperativeCheckListFormController);

    function PreOperativeCheckListFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, lodash, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {
            PreOperativeChecklistStatusId: 1
        };
        $scope.CheckListDetails = [];
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.IsCompleted = false;
        // $scope.currentcontext.encounter = utl.Session.getPatientEncounter();

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.currentcontext.context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        //Sign related code starts
        $scope.openSignModal = function () {
            utl.Modal.open('sign-modal', {
                params: {},
                confirmCallback: refreshSign
            }
            );
        }

        function refreshSign(signatureData) {
            $scope.item.signimagedata = signatureData;
            if (signatureData) {
                $scope.item.signdata = signatureData.split(',')[1];
            }
        }
        //back

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Sign related code ends
        function loadChekList() {
            for (var idx in $scope.lookup.CheckListCategory) {
                var CheckListCategory = $scope.lookup.CheckListCategory[idx];
                var CheckLists = [];
                for (var i in $scope.lookup.CheckLists) {
                    var item = $scope.lookup.CheckLists[i];
                    if (item.CheckListCategoryId == CheckListCategory.Id) {
                        item.CheckListMasterId = item.Id;
                        item.Id = 0;
                        CheckLists.push(item)
                    }
                }
                CheckListCategory.CheckLists = CheckLists;
                if (CheckLists.length != 0) {
                    $scope.CheckListDetails.push(CheckListCategory);
                }
            }
        }
        $scope.getDetailCallback = function (scope, data, options, hasError) {
            $scope.CheckListDetails = data.Data.reduce(function (res, currentValue) {
                if (res.indexOf(currentValue.CheckListCategory.Description) === -1) {
                    res.push(currentValue.CheckListCategory.Description);
                }
                return res;
            }, []).map(function (CheckListCategory) {
                return {
                    CheckListCategory: CheckListCategory,
                    CheckLists: data.Data.filter(function (_el) {
                        return _el.CheckListCategory.Description === CheckListCategory;
                    }).map(function (_el) { return _el })
                }
            });
            $scope.buttonVisibility();
        }
        $scope.getDetail = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/PreOperativeChecklistDetails/GetPreOperativeChecklistDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailCallback
                };

                utl.Http.doAction(options);
            }
        }
        $scope.buttonVisibility = function () {
            if ($scope.item.PreOperativeChecklistStatusId == 1) {
                $scope.EnableSave = true;
                $scope.EnableApprove = true;
                $scope.EnableReview = false;
                $scope.EnableClear = true;
            }
            else if ($scope.item.PreOperativeChecklistStatusId == 2) {
                $scope.EnableSave = false;
                $scope.EnableApprove = false;
                $scope.EnableReview = true;
                $scope.EnableClear = false;
            }
            else if ($scope.item.PreOperativeChecklistStatusId == 3) {
                $scope.EnableSave = false;
                $scope.EnableApprove = false;
                $scope.EnableReview = false;
                $scope.EnableClear = false;
            }
        }
        $scope.clear = function () {
            $scope.CheckListDetails = [];
            loadChekList();
        }
        //GetUserSignPic
        $scope.getUserSignPicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.SignPhoto = data;
        };

        $scope.getUserSignPic = function () {
            if ($scope.item.SignPath) {
                var inputData = { SignPath: $scope.item.SignPath };
                var options = {
                    action: 'emr/PreOperativeChecklist/GetCheckListSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getDetail();
            $scope.getUserSignPic();
            $scope.IsCompleted = true;
        }
        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/PreOperativeChecklist/GetPreOperativeChecklistById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        }
        $scope.custom_sort = function (a, b) {
            return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
        }
        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            $scope.Encounter = data.Data[0];
        }
        $scope.getEncounter = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.item.PatientId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.ismodal)
                inputData.Params = [{ Key: 0, Value: $scope.item.EncounterId }];
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        }
        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.CheckListDetails) {
                var CheckListCategory = $scope.CheckListDetails[idx];
                for (var i in CheckListCategory.CheckLists) {
                    var item = CheckListCategory.CheckLists[i];
                    item.CheckListCategoryId = item.CheckListCategoryId;
                    item.CheckListMasterId = item.CheckListMasterId;
                    item.CheckListTypeId = 1;
                    item.RatingId = item.RatingId || -1;
                    item.PreOperativeChecklistStatusId = $scope.item.PreOperativeChecklistStatusId;
                    result.push(item);
                }
            }
            return result;
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else
                $state.go('patientemr.preoperativechecklists');
        }
        $scope.confirmation = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure do you want to Complete this CheckList',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.review,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.incidentservicerequest', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.previousincident = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openList(0);
        }

        $scope.openList = function (Id) {
            utl.Modal.open('app.incidentservicerequests', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.incident = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.savedraft = function () {
            $scope.saveItem(1);
        }
        $scope.saveapprove = function () {
            $scope.saveItem(2);
        }
        $scope.review = function () {
            $scope.saveItem(3);
        }
        $scope.saveItem = function (StatusId) {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            $scope.item.PreOperativeChecklistStatusId = StatusId;
            $scope.item.EncounterId = $scope.Encounter.Id;
            $scope.item.FacilityId = 1;
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.WardId = $scope.Encounter.WardId;
            $scope.item.RoomId = $scope.Encounter.RoomId;
            $scope.item.BedId = $scope.Encounter.BedId;
            $scope.item.CheckListTypeId = 1;
            if ($scope.item.PreOperativeChecklistStatusId == 2)
                $scope.item.CheckListOn = utl.Formatter.getCurrentDate();
            if ($scope.item.PreOperativeChecklistStatusId == 3) {
                $scope.item.ReviewedBy = utl.Session.getCurrentUserId();
                $scope.item.ReviewedOn = utl.Formatter.getCurrentDate();
            }
            $scope.item.Details = getLinesForSave();

            var actionName = 'emr/PreOperativeChecklist/AddPreOperativeChecklist';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PreOperativeChecklist/UpdatePreOperativeChecklist';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadChekList();
            $scope.getEncounter();
            $scope.getItem();
            $scope.buttonVisibility();
            //set default while adding alone
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "YesNo", Default: false },
                { "Key": "CheckListCategory", Default: false },
                { "Key": "CheckLists", Default: false }
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

    PreOperativeCheckListFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', 'lodash', '$uibModalInstance', 'modalConfig'];

})();