(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClaimcoveringletterController', ClaimcoveringletterController);

    function ClaimcoveringletterController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        // $scope.currentcontext = {
        //     guarantorid: parseInt($stateParams.gid)
        // };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.GuarantorBillsinfo = modalConfig.params.GuarantorBillsinfo;
            if ($scope.currentcontext.GuarantorBillsinfo) {
                $scope.currentcontext.ClaimSubmissionDetailId = $scope.currentcontext.GuarantorBillsinfo.Id;
                $scope.currentcontext.ClaimSubmissionId = $scope.currentcontext.GuarantorBillsinfo.ClaimSubmissionId;
                $scope.currentcontext.IsClaimCoveringLetter = $scope.currentcontext.GuarantorBillsinfo.IsClaimCoveringLetter;
                if ($scope.currentcontext.GuarantorBillsinfo.PatientBill) {
                    $scope.currentcontext.guarantorid = $scope.currentcontext.GuarantorBillsinfo.PatientBill.GuarantorId;
                    $scope.currentcontext.GuarantorTypeId = $scope.currentcontext.GuarantorBillsinfo.PatientBill.GuarantorTypeId;
                    $scope.currentcontext.PatientId = $scope.currentcontext.GuarantorBillsinfo.PatientBill.PatientId;
                    $scope.currentcontext.EncounterId = $scope.currentcontext.GuarantorBillsinfo.PatientBill.EncounterId;
                    $scope.currentcontext.FacilityId = $scope.currentcontext.GuarantorBillsinfo.PatientBill.FacilityId;
                }
                if ($scope.currentcontext.GuarantorBillsinfo.Patient) {
                    $scope.currentcontext.PatientMRN = $scope.currentcontext.GuarantorBillsinfo.Patient.MRN;
                    $scope.currentcontext.PatientId = $scope.currentcontext.GuarantorBillsinfo.Patient.Id;
                    $scope.currentcontext.FirstName = $scope.currentcontext.GuarantorBillsinfo.Patient.FirstName;
                }

                if ($scope.currentcontext.GuarantorBillsinfo.ClaimSubmission) {
                    $scope.currentcontext.ClaimSubmissionStatusId = $scope.currentcontext.GuarantorBillsinfo.ClaimSubmission.ClaimSubmissionStatusId;
                    $scope.currentcontext.SubmittedOn = $scope.currentcontext.GuarantorBillsinfo.ClaimSubmission.SubmittedOn;
                    $scope.currentcontext.DispatchedOn = $scope.currentcontext.GuarantorBillsinfo.ClaimSubmission.DispatchedOn;
                }
            }
            // $scope.currentcontext.guarantorid = $scope.currentcontext.GuarantorBillsinfo[0].PatientBill.GuarantorId;
            // $scope.currentcontext.GuarantorTypeId = $scope.currentcontext.GuarantorBillsinfo[0].PatientBill.GuarantorTypeId;
            // $scope.currentcontext.PatientId = $scope.currentcontext.GuarantorBillsinfo[0].PatientBill.PatientId;
            // $scope.currentcontext.EncounterId = $scope.currentcontext.GuarantorBillsinfo[0].PatientBill.EncounterId;
            // $scope.currentcontext.FacilityId = $scope.currentcontext.GuarantorBillsinfo[0].PatientBill.FacilityId;
            // $scope.currentcontext.PatientMRN = $scope.currentcontext.GuarantorBillsinfo[0].Patient.MRN;
            // $scope.currentcontext.PatientId = $scope.currentcontext.GuarantorBillsinfo[0].Patient.Id;
            // $scope.currentcontext.ClaimSubmissionDetailId = $scope.currentcontext.GuarantorBillsinfo[0].Id;
            // $scope.currentcontext.ClaimSubmissionId = $scope.currentcontext.GuarantorBillsinfo[0].ClaimSubmissionId;
            // $scope.currentcontext.ClaimSubmissionStatusId = $scope.currentcontext.GuarantorBillsinfo[0].ClaimSubmission.ClaimSubmissionStatusId;
            // $scope.currentcontext.SubmittedOn = $scope.currentcontext.GuarantorBillsinfo[0].ClaimSubmission.SubmittedOn;
            // $scope.currentcontext.DispatchedOn = $scope.currentcontext.GuarantorBillsinfo[0].ClaimSubmission.DispatchedOn;
            // $scope.currentcontext.IsClaimCoveringLetter = $scope.currentcontext.GuarantorBillsinfo[0].IsClaimCoveringLetter;
            // $scope.currentcontext.FirstName = $scope.currentcontext.GuarantorBillsinfo[0].Patient.FirstName;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item = {
            Id: 0
        };
        $scope.item.GuarantorId = $scope.currentcontext.guarantorid;
        $scope.item.GuarantorTypeId = $scope.currentcontext.GuarantorTypeId;
        $scope.item.PatientId = $scope.currentcontext.PatientId;
        $scope.item.EncounterId = $scope.currentcontext.EncounterId;
        $scope.item.FacilityId = $scope.currentcontext.FacilityId;
        $scope.item.ClaimSubmissionId = $scope.currentcontext.ClaimSubmissionId;
        $scope.item.ClaimSubmissionStatusId = $scope.currentcontext.ClaimSubmissionStatusId;
        $scope.item.SubmittedOn = $scope.currentcontext.SubmittedOn;
        $scope.item.DispatchedOn = $scope.currentcontext.DispatchedOn;
        $scope.item.ClaimSubmissionDetailId = $scope.currentcontext.ClaimSubmissionDetailId;

        $scope.Details = [];

        function getNewItem() {
            var detail = {
                GuarantorId: $scope.currentcontext.guarantorid,
                Id: 0,
                Status: 1,
            };
            return detail;
        }

        $scope.addNewLineItem = function () {
            var detail = getNewItem();
            $scope.Details.push(detail);
        }
        $scope.IsNewChecklist = true;

        $scope.$parent.addNew = $scope.addNewLineItem;

        $scope.getCoveringletterheaderCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data;
            $scope.getCoveringletter();
        };

        $scope.getCoveringletterheader = function () {
            if ($scope.currentcontext.IsClaimCoveringLetter && $scope.currentcontext.IsClaimCoveringLetter == true) {
                var inputData = {
                    Params: [
                        {
                            Key: 8,
                            Value: $scope.currentcontext.ClaimSubmissionId
                        },
                        {
                            Key: 9,
                            Value: $scope.currentcontext.ClaimSubmissionDetailId
                        },
                        {
                            Key: 2,
                            Value: $scope.currentcontext.guarantorid
                        },
                        {
                            Key: 6,
                            Value: $scope.currentcontext.PatientId
                        },
                        {
                            Key: 7,
                            Value: $scope.currentcontext.EncounterId
                        },
                        // {
                        //     Key: 5,
                        //     Value: $scope.currentcontext.IsClaimCoveringLetter
                        // }
                    ]
                };
                var options = {
                    action: 'billing/ClaimCoveringletter/GetClaimCoveringletters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCoveringletterheaderCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getCoveringletterCallback = function (scope, data, options, hasError) {
            $scope.Details = data.Data || [];
            $scope.currentcontext.id = $scope.Details[0].ClaimCoveringletterId;
        };

        $scope.getCoveringletter = function () {
            if ($scope.currentcontext.IsClaimCoveringLetter && $scope.currentcontext.IsClaimCoveringLetter == true) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.guarantorid
                    },
                    // {
                    //     Key: 0,
                    //     Value: $scope.currentcontext.ClaimSubmissionDetailId
                    // },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.PatientId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.EncounterId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.IsClaimCoveringLetter
                    }
                    ]
                };
                var options = {
                    action: 'billing/ClaimCoveringletterDetails/GetClaimCoveringletterDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCoveringletterCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.backToList = function () {
            $state.go('app.guarantortab.general');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
            // $scope.getCoveringletter();
            // $scope.getItem();
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.Details) {
                var item = $scope.Details[idx];
                if (!item.ClaimCoveringletter) {
                    item.Id = 0;
                    item.GuarantorId = item.GuarantorId;
                    item.GuarantorTypeId = $scope.item.GuarantorTypeId;
                    item.GuarantorChecklistId = item.Id;
                    item.Title = item.Title;
                    item.PatientId = $scope.item.PatientId;
                    item.EncounterId = $scope.item.EncounterId;
                    item.FacilityId = $scope.item.FacilityId;
                    item.Data = utl.Formatter.getCurrentDate();
                    result.push(item);
                }
                if (item.ClaimCoveringletter) {
                    result.push(item);
                }
                // } else {
                //     if (item.Id && item.Status == 1) {
                //         result.push(item);
                //     }
                // }
            }
            return result;
        };
        // $scope.saveItem = function () {
        //     var Details = getLinesForSave();
        //     var inputData = { Data: Details };
        //     var options = {
        //         action: 'generalmaster/GuarantorChecklist/ManageGuarantorChecklist',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.saveItemCallback
        //     };
        //     utl.Http.doAction(options);
        // };
        $scope.saveItem = function () {

            var lines = getLinesForSave();

            var actionName = 'billing/ClaimCoveringletter/AddClaimCoveringletter';
            if ($scope.currentcontext.IsClaimCoveringLetter && $scope.currentcontext.IsClaimCoveringLetter == true) {
                actionName = 'billing/ClaimCoveringletter/UpdateClaimCoveringletter';
            }
            $scope.item.IsClaimCoveringLetter = true;
            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.Details = data.Data || [];
            // if (data.Data.length > 0) {
            //     $scope.IsNewChecklist = false;
            //     $scope.Details = data.Data;
            //     $scope.addNewLineItem();
            // }
            // else $scope.addNewLineItem();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.guarantorid && $scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.guarantorid }
                    ]
                };
                var options = {
                    action: 'generalmaster/GuarantorChecklist/GetGuarantorChecklists',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    ids: 1,
                },
            };
            var options = {
                action: 'billing/ClaimCoveringletter/PrintClaimCoveringletter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.opcoverprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    ids: 2,
                },
            };
            var options = {
                action: 'billing/ClaimCoveringletter/PrintClaimCoveringletter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.tpacoverprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    ids: 3,
                },
            };
            var options = {
                action: 'billing/ClaimCoveringletter/PrintClaimCoveringletter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
        }

        $scope.deleteDetail = function (item) {
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) !== lastidx) {
                var name = item.Title || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        }
        $scope.clear = function () {
            $scope.Details = [];
            $scope.addNewLineItem();
        }
        if ($scope.currentcontext.IsClaimCoveringLetter) {
            $scope.getCoveringletterheader();
        }
        else {
            $scope.getItem();
        }
    }

    ClaimcoveringletterController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();