(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('virtualhealthcareDashboardController', virtualhealthcareDashboardController);

    function virtualhealthcareDashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};
        $scope.VirtualCategory = [];

        function getSectionPath() {
            return "app/views/patientportal/newdashboard/sections/";
        }

        $scope.GetVirtualctgryimgCallback = function (scope, data, options, hasError) {
            var ctgryid = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };

        $scope.GetVirtualctgryimg = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualctgryimgCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadImages() {
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.Imagepath) {
                    $scope.GetVirtualctgryimg(item);
                }
            }
        }
        $scope.getVirtualCategoryCallback = function (scope, res, options, hasError) {
            $scope.VirtualCategory = res.Data || [];
            loadImages();
        };
        $scope.getVirtualCategory = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVirtualCategoryCallback
            };

            utl.Http.doAction(options);
        };

        $scope.sections = [];

        $scope.videoconference = function () {
            $state.go('patientportal.videoconference');
        }
        $scope.myhealthrecord = function () {
            $state.go('patientportal.portalmyhealthrecord');
        }
        $scope.myhistory = function () {
            $state.go('patientportal.docappointment');
        }
        $scope.pendings = function () {
            $state.go('patientportal.portalordertrackingtab.portalpendingorder');
        }
        $scope.successstory = function () {
            $state.go('patientportal.successstory');
        }
        $scope.medicineorder = function () {
            $state.go('patientportal.medicineordertab.prescriptionupload', {
                patientid: $scope.currentcontext.pid,
            });
        }
        $scope.ordermedicine = function () {
            $state.go('patientportal.medcinie-order', {
                patientid: $scope.currentcontext.pid,
            });
        }
        $scope.getvirtualsubcategory = function (items) {
            $state.go('patientportal.virtualsubcategoryselection', {
                categoryid: items.Id,
                ctgryInfo: items
            });
        };

        $scope.getVirtualCategory();
    }

    virtualhealthcareDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();