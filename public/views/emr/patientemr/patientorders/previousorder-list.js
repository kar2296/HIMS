(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousOrderListController', previousOrderListController);

    /**
     * "Previous Orders" popup opened from the order form: every order of the patient (newest first)
     * with its services. Read-only.
     */
    function previousOrderListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        $scope.items = [];
        $scope.currentcontext = {
            pid: modalConfig.params.pid,
            loading: true,
            error: false,
            search: ''
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;

        var byNewest = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        };

        var statusText = function (status) {
            return (status && (status.DisplayName || status.Description)) || '';
        };

        /** Badge colour for an order / line status. */
        $scope.statusTone = function (status) {
            var text = statusText(status).toLowerCase();
            if (!text) return 'neutral';
            if (text.indexOf('cancel') >= 0 || text.indexOf('reject') >= 0) return 'danger';
            if (/complet|approv|releas|bill|deliver|result/.test(text)) return 'success';
            if (/pending|hold|partial|draft/.test(text)) return 'warning';
            return 'info';
        };
        $scope.statusText = statusText;

        $scope.doctorName = function (order) {
            var u = order.User;
            if (u && (u.FirstName || u.LastName)) {
                var title = u.Title && typeof u.Title === 'object' ? (u.Title.Description || u.Title.Text || '') : u.Title;
                return [title, u.FirstName, u.LastName].filter(Boolean).join(' ');
            }
            return order.DoctorName || '';
        };

        $scope.toggleCanShowDetails = function (clickedItem) {
            angular.forEach($scope.items, function (item) {
                item.CanShowDetails = item.Id === clickedItem.Id ? !item.CanShowDetails : false;
            });
        };

        /** Case-insensitive match on order number, test code / name, department or doctor. */
        $scope.matches = function (order) {
            var q = ($scope.currentcontext.search || '').trim().toLowerCase();
            if (!q) return true;
            var haystack = [order.OrderNumber, order.OrderTo && order.OrderTo.DepartmentName, $scope.doctorName(order), order.testNames]
                .join(' ').toLowerCase();
            return haystack.indexOf(q) >= 0;
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.loading = false;
            if (hasError || !res) {
                $scope.currentcontext.error = true;
                $scope.items = [];
                return;
            }
            var data = (res.Data || []).slice().sort(byNewest);
            angular.forEach(data, function (order, idx) {
                var details = order.PatientOrderDetails || [];
                order.lineCount = details.length;
                order.testNames = details.map(function (d) { return d.TestName; }).filter(Boolean).join(', ');
                order.CanShowDetails = idx === 0;
            });
            $scope.items = data;
        };

        $scope.getList = function () {
            $scope.currentcontext.loading = true;
            $scope.currentcontext.error = false;
            utl.Http.doAction({
                action: 'emr/patientorder/GetPatientOrders',
                data: {
                    Params: [{ Key: 2, Value: $scope.currentcontext.pid }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                },
                type: 'post',
                onComplete: $scope.getListCallback,
                onError: function () {
                    $scope.currentcontext.loading = false;
                    $scope.currentcontext.error = true;
                    $scope.items = [];
                }
            });
        };

        $scope.handleEvents = function (actionType, row) { };

        $scope.getList();
    }

    previousOrderListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
