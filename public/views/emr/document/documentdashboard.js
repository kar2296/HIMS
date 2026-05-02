(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('documentdashboardController', documentdashboardController);

    function documentdashboardController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentfilter = {
            patientname: '',
            visitdate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.groupedDocuments = {};

        $scope.getSummaryCallback = function (scope, res, options, hasError) {
            $scope.documentsummary = res.Data.map(doc => ({
                DocumentType: doc.DocumentTypeId,
                DocumentAttachmentType: doc.DocumentAttachmentType, 
                DocumentCount: 1,
                TotalAmount: doc.TotalAmount || 0
            }));
            $scope.groupDocumentsByType();
        };

        $scope.groupDocumentsByType = function () {
            $scope.groupedDocuments = {};

            $scope.documentsummary.forEach(function (doc) {
                const documentCount = Number(doc.DocumentCount) || 0;
                const totalAmount = Number(doc.TotalAmount) || 0;

                if (!$scope.groupedDocuments[doc.DocumentType]) {
                    $scope.groupedDocuments[doc.DocumentType] = {
                        DocumentType: doc.DocumentType,
                        DocumentAttachmentType: doc.DocumentAttachmentType,
                        DocumentCount: 0,
                        TotalAmount: 0
                    };
                }
                $scope.groupedDocuments[doc.DocumentType].DocumentCount += documentCount;
                $scope.groupedDocuments[doc.DocumentType].TotalAmount += totalAmount;
            });

            $scope.groupedDocumentsArray = Object.values($scope.groupedDocuments);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            var startOfMonth = new Date();
            startOfMonth.setDate(1);
            var endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

            $scope.documentlist = res.Data.filter(function (document) {
                var expiryDate = new Date(document.ExpiryDate);
                return expiryDate >= startOfMonth && expiryDate <= endOfMonth;
            });
        };

        $scope.getList = function () {
            var startOfMonth = new Date();
            startOfMonth.setDate(1);
            var endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
            var From = $filter('date')(startOfMonth, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')(endOfMonth, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: $scope.currentfilter.DocumentStatusId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ]
            };

            var options = {
                action: 'emr/Document/GetDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSummaryList = function () {
            var From = $filter('date')($scope.currentfilter.StartDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.EndDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: $scope.currentfilter.DocumentStatusId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ]
            };

            var options = {
                action: 'emr/Document/GetDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSummaryCallback
            };

            utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList();
        $scope.getSummaryList();
    }

    documentdashboardController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();
