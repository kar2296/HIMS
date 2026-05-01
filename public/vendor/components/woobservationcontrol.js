(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('woobservationcontrolCtrl', ['utl', '$scope', '$timeout', '$translate', 'Upload',
			function (utl, $scope, $timeout, $translate, Upload) {
				var cvm = this;

				cvm.item = {
					Comments : ''
				};

				$scope.$watch('cvm.config',
					function (newValue) {
						if (newValue) {
							cvm.getList();
						}
					});

				cvm.saveItemCallback = function (scope, data, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
					cvm.item.Comments = '';
					cvm.getList();
				};

				//save item 
				cvm.saveItem = function () {

					cvm.item.PatientId = cvm.config.patientid;
					cvm.item.WorkOrderId = cvm.config.workorderid;
					cvm.item.WorkOrderDetailId = cvm.config.workorderdetailid;

					var actionName = 'lis/WorkOrderObservation/AddWorkOrderObservation';
				
					var options = {
						action: actionName,
						data: {Data : cvm.item },
						type: 'post',
						onComplete: cvm.saveItemCallback
					};
					utl.Http.doAction(options);

				}

				//get list
				cvm.getListCallback = function (scope, res, options, hasError) {
					cvm.gridConfig.data = res.Data;
				}
				cvm.getList = function () {

					var inputData = {
						Params: [
							{ Key: 1, Value: cvm.config.patientid },
							{ Key: 3, Value: cvm.config.workorderdetailid }
						],
						PageContext: {
							PageSize: 1000,
							PageNumber: 1
						}
					};

					var options = {
						action: 'lis/WorkOrderObservation/GetWorkOrderObservations',
						data: inputData,
						type: 'post',
						onComplete: cvm.getListCallback
					};
					utl.Http.doAction(options);
				}

				//Delete
				cvm.deleteItemCallback = function (scope, data, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
					cvm.getList();
				};

				cvm.onDeleteConfirmed = function (deleteId) {
					var options = {
						action: 'lis/WorkOrderObservation/DeleteWorkOrderObservation',
						data: { Id: deleteId },
						type: 'post',
						onComplete: cvm.deleteItemCallback
					};
					utl.Http.doAction(options);
				}

				$scope.canShowAction = function(actionType, entity) {
					if(cvm.config.readonly == true) {
						return false;
					}
					return true;
				}

				// $scope.handleEvents = function (actionType, row) {

				// 	if (actionType == 'delete') {
				// 		utl.Dialog.confirmDelete(cvm.onDeleteConfirmed, row.entity.Id);
				// 	}
				// }
				$scope.handleEvents = function (actionType, entity) {
					if (actionType == 'delete') {
						utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
					}
				}

				cvm.gridConfig = {
					columnDefs: [
						{ field: "ObservationDate", displayName: $translate.instant('lis.observationcontrol.observationdate.lbl'),
							cellTemplate: "<ngformatdate datetime-val='entity.ObservationDate'></ngformatdate>" },
						{ field: "Comments", displayName: $translate.instant('lis.observationcontrol.comments.lbl') },
						{
							field: "Id",
							displayName: $translate.instant('common.actions_col.lbl'),
							cellTemplate: '<div class="ui-grid-cell-contents">\
							  <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
							</div>',
							handleEvent: $scope.handleEvents,
						}
						// {
						// 	field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
						// 	cellTemplate: 'conditionActionTemplate.html',
						// 	actions: [
						// 		{ actiontype: 'delete', display: 'common.deleteaction.lbl' },
						// 	]
						// }
					],
					data: []
				};

				cvm.init = function () {
				}

				//caution : base method, please don't modifiy
				cvm.$onInit = function () {
					$timeout(cvm.init, 100);
				}
			}])
		.component('woobservationcontrol', {
			bindings: {
				config: "="
			},
			controller: 'woobservationcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/woobservationcontrol.html'
		})

})();