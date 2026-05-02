(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnPatientVitalsController', cnPatientVitalsController);

    function cnPatientVitalsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.Vitallist = [];
        $scope.currentcontext = {};
        $scope.currentcontext.SelectAll = false;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext.pid = modalConfig.params.pid;
        $scope.currentcontext.cid = modalConfig.params.cid;
        $scope.currentcontext.IsPatientCondition = false;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.SelectAllItems = function () {
            if ($scope.currentcontext.SelectAll) {
                for (var idx in $scope.items) {
                    var item = $scope.items[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = true;
                    }
                }
            } else {
                for (var idx in $scope.items) {
                    var item = $scope.items[idx];
                    if (!item.ConsultationId ||
                        item.ConsultationId != null ||
                        item.ConsultationId < 0) {
                        item.Select = false;
                    }
                }
            }
        };

        $scope.selectedvitals = function (idx, data) {
            for (var idx1 in data) {
                var detail = data[idx1];
                if (item.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!item.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                }
            }
        }
        $scope.saveToNotes = function () {
            var resultitems = getSelectedItems();
            if (resultitems && resultitems.length > 0) {
                var actionName = 'emr/patientvital/ManagePatientVitals';
                var options = {
                    action: actionName,
                    data: {
                        Data: resultitems
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg('Required any one Vital selection...');
                return false;
            }
        }

        $scope.saveItemCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        function getSelectedItems() {
            var resultitems = [];
            for (var idx in $scope.currentcontext.groupedData) {
                var item = $scope.currentcontext.groupedData[idx];
                for (var jx in item) {
                    var vital = item[jx];
                    if (!vital.ConsultationId ||
                        vital.ConsultationId != null ||
                        vital.ConsultationId < 0) {
                        if (item.Select && vital.Id) {
                            var data = {
                                Id: vital.Id,
                                ConsultationId: $scope.currentcontext.cid
                            }
                            resultitems.push(data);
                        }
                    }
                }
            }
            return resultitems;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            var vitals = [];
            for (var vdx in res.Data) {
                var consdata = res.Data[vdx];
                if (!consdata.ConsultationId) {
                    vitals.push(consdata);
                }
            };
            for (var idx in vitals) {
                var vital = vitals[idx];
                vitals[idx].PerformedDate = utl.Formatter.getDateTimeString(vitals[idx].PerformedDate);
                switch (vital.VitalId) {
                    case 1: //height
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "'" + vitalvalues[1] + "\"";
                        }
                        break;
                    case 8: //BP
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "/" + vitalvalues[1];
                        }
                        break;
                    default:
                        break;
                }
            }
            var finalData = [];
            var headerData = _.uniqBy(vitals, 'VitalName');
            var groupedData = _.groupBy(vitals, 'GroupId');
            for (var groupKey in groupedData) {
                var vitaldata = groupedData[groupKey];
                var tr = [];
                tr.push({
                    ColVal: vitaldata[0].PerformedDate
                });
                for (var header in headerData) {
                    var td = _.find(vitaldata, {
                        VitalName: headerData[header].VitalName
                    });
                    var vitalValue = '';
                    var Id = 0;
                    var ConsultationId = 0;
                    var Select = false;
                    var cnDisabled = false;

                    if (td.ConsultationId) {
                        vitalValue = td.VitalValue + ' ' + td.UOM;
                        Id = td.Id;
                        ConsultationId = td.ConsultationId;
                        Select = false;
                        cnDisabled = true
                    }
                    if (!td.ConsultationId) {
                        vitalValue = td.VitalValue + ' ' + td.UOM;
                        Id = td.Id;
                        ConsultationId = td.ConsultationId;
                        Select = true;
                        cnDisabled = false
                    }
                    tr.push({
                        ColVal: vitalValue,
                        Id: Id,
                        ConsultationId: ConsultationId,
                        Select: Select,
                        cnDisabled: cnDisabled
                    });
                }
                finalData.push(tr);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;
            console.log(finalData);
            for (var idx in $scope.currentcontext.groupedData) {
                var groupeditem = $scope.currentcontext.groupedData[idx];
                for (var jx in groupeditem) {
                    var items = groupeditem[jx];
                    items.Select = false;
                    items.cnDisabled = false;
                    if (items.ConsultationId > 0) {
                        items.cnDisabled = true;
                    }
                }
            }

        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {}

        $scope.getList();
    }

    cnPatientVitalsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();