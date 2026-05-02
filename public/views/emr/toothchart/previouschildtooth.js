(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prevChildToothChartController', prevChildToothChartController);

    function prevChildToothChartController($scope, $interval, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.currentcontext.pid = $stateParams.pid;
        $scope.currentcontext.eid = $stateParams.eid;
        $scope.Patientteeth = [];
        $scope.items = [];
        $scope.LastToothId = '';
        $scope.Encounters = [];

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = [];
            for (var idx in res.Data) {
                var index = $scope.Patientteeth.indexOf(res.Data[idx].ToothImgId);
                if (index <= -1) {
                    var toothid = (res.Data[idx].ToothImgId);
                    $scope.currentcontext.Implant = res.Data[idx].Implant;
                    $scope.currentcontext.Crack = res.Data[idx].Crack;
                    $scope.currentcontext.PerioSurgery = res.Data[idx].PerioSurgery;
                    $scope.currentcontext.MissingTooth = res.Data[idx].MissingTooth;
                    $scope.currentcontext.Crown = res.Data[idx].Crown;
                    $scope.currentcontext.Braces = res.Data[idx].Braces;
                    $('#' + toothid).attr('style', 'fill: #9a9191d1;outline:2px solid #f30532;');
                    $scope.Patientteeth.push(toothid);
                    $scope.LoadItem(res.Data[idx].Id, toothid);
                }
            }
            $scope.LastToothId = '';
            $scope.currentcontext.Implant = '';
            $scope.currentcontext.Crack = '';
            $scope.currentcontext.PerioSurgery = '';
            $scope.currentcontext.MissingTooth = '';
            $scope.currentcontext.Crown = '';
            $scope.currentcontext.Braces = '';
            $scope.getEncountersByPId();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.eid
                },{
                    Key: 6,
                    Value: 2
                } ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientToothChart/GetPatientToothCharts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.PreviousDetails = function(encinfo) {

        }

        $scope.getEncountersByPIdCallback = function (scope, data, options, hasError) {
            if (data && data.Data && data.Data.length > 0) {
                for(var idx in data.Data) {
                    $scope.Encounters.push(data.Data[idx]);
                }
            }
        };

        $scope.getEncountersByPId = function () {
            if ($scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: $scope.currentcontext.pid },
                        { Key: 35, Value: true }
                    ]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getEncountersByPIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.LoadItem = function (ToothChartId, toothid) {
            var itemdata = {};
            itemdata.ToothChartTypeId = 2;
            itemdata.Id = ToothChartId;
            itemdata.PatientId = $scope.currentcontext.pid;
            itemdata.EncounterId = $scope.currentcontext.eid;
            itemdata.FacilityId = utl.Session.getCurrentFacilityId();
            itemdata.EncounterTypeId = 0;
            itemdata.ToothChartDatetime = new Date();
            itemdata.ToothImgId = toothid;
            itemdata.Implant = $scope.currentcontext.Implant;
            itemdata.Crack = $scope.currentcontext.Crack;
            itemdata.PerioSurgery = $scope.currentcontext.PerioSurgery;
            itemdata.MissingTooth = $scope.currentcontext.MissingTooth;
            itemdata.Crown = $scope.currentcontext.Crown;
            itemdata.Braces = $scope.currentcontext.Braces;
            itemdata.Status = 1;
            $scope.items.push(itemdata);
        }

        $scope.changerect = function (toothid) {

        }

        $scope.View = function (toothid) {
            $scope.Update($scope.LastToothId);
            $scope.LastToothId = toothid;
            for (var idx in $scope.items) {
                if ($scope.items[idx] && $scope.items[idx].ToothImgId == toothid) {
                    var itemdata = $scope.items[idx];
                    $scope.currentcontext.Implant = itemdata.Implant;
                    $scope.currentcontext.Crack = itemdata.Crack;
                    $scope.currentcontext.PerioSurgery = itemdata.PerioSurgery;
                    $scope.currentcontext.MissingTooth = itemdata.MissingTooth;
                    $scope.currentcontext.Crown = itemdata.Crown;
                    $scope.currentcontext.Braces = itemdata.Braces;
                }
            }
        }

        $scope.AddItem = function (toothid) {
            var itemdata = {};
            itemdata.ToothChartTypeId = 2;
            itemdata.Id = 0;
            itemdata.PatientId = $scope.currentcontext.pid;
            itemdata.EncounterId = $scope.currentcontext.eid;
            itemdata.FacilityId = utl.Session.getCurrentFacilityId();
            itemdata.EncounterTypeId = 0;
            itemdata.ToothChartDatetime = new Date();
            itemdata.ToothImgId = toothid;
            itemdata.Implant = $scope.currentcontext.Implant;
            itemdata.Crack = $scope.currentcontext.Crack;
            itemdata.PerioSurgery = $scope.currentcontext.PerioSurgery;
            itemdata.MissingTooth = $scope.currentcontext.MissingTooth;
            itemdata.Crown = $scope.currentcontext.Crown;
            itemdata.Braces = $scope.currentcontext.Braces;
            itemdata.Status = 1;
            $scope.items.push(itemdata);
        }

        $scope.RemoveItem = function (toothid) {
            for (var idx in $scope.items) {
                if ($scope.items[idx] && $scope.items[idx].ToothImgId == toothid) {
                    $scope.items[idx].Status = 2;
                }
            }
            $scope.LastToothId = '';
            $scope.currentcontext.Implant = '';
            $scope.currentcontext.Crack = '';
            $scope.currentcontext.PerioSurgery = '';
            $scope.currentcontext.MissingTooth = '';
            $scope.currentcontext.Crown = '';
            $scope.currentcontext.Braces = '';
        }

        $scope.Update = function (toothid) {
            for (var idx in $scope.items) {
                if ($scope.items[idx] && $scope.items[idx].ToothImgId == toothid) {
                    var itemdata = $scope.items[idx];
                    itemdata.Implant = $scope.currentcontext.Implant;
                    itemdata.Crack = $scope.currentcontext.Crack;
                    itemdata.PerioSurgery = $scope.currentcontext.PerioSurgery;
                    itemdata.MissingTooth = $scope.currentcontext.MissingTooth;
                    itemdata.Crown = $scope.currentcontext.Crown;
                    itemdata.Braces = $scope.currentcontext.Braces;
                }
            }
        }

        $scope.save = function () {
            if ($scope.items.legth <= 0) {
                var Msg = 'Select any one tooth';
                utl.Alert.showErrorMsg(Msg);
                return;
            }
            $scope.Update($scope.LastToothId);
            var actionName = 'emr/PatientToothChart/AddPatientToothChart';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.items
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }



        $scope.print = function () {

            var offScreen = document.getElementById('tooth-chart');

            // Clone off-screen element
            var clone = hiddenClone(offScreen);

            // Use clone with htm2canvas and delete clone
            html2canvas(clone, {
                onrendered: function (canvas) {
                    //document.body.appendChild(canvas);
                    //document.body.removeChild(clone);
                    var data = canvas.toDataURL();
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("ChildTooth_Chart.pdf");

                    document.body.removeChild(clone);
                    //document.body.removeChild(canvas);
                }
            });
        }

        function hiddenClone(element) {
            // Create clone of element
            var clone = element.cloneNode(true);

            // Position element relatively within the
            // body but still out of the viewport
            var style = clone.style;
            style.position = 'relative';
            style.top = window.innerHeight + 'px';
            style.left = 0;
            style.fontSize = "25px";
            style.fontWeight = "bold";
            style.fontColor = "black";

            // Append clone to body and return the clone
            document.body.appendChild(clone);
            return clone;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.backToList = function () {

        }

        $scope.getList();
    }

    prevChildToothChartController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();