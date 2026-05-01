angular.module('uiGridModule', [
                                'ngSanitize', 
                                'ui.grid', 
                                'ui.grid.autoResize',
                                'ui.grid.cellNav', 
                                'ui.grid.edit', 
                                'ui.grid.resizeColumns', 
                                'ui.grid.pinning', 
                                'ui.grid.selection', 
                                'ui.grid.moveColumns', 
                                'ui.grid.exporter', 
                                'ui.grid.importer', 
                                'ui.grid.grouping', 
                                'ui.grid.pagination'])
    
    .factory('$$gridService', ['$rootScope', '$http', '$q', 'uiGridConstants', function ($rootScope, $http, $q, uiGridConstants) {
        return {
            cellTemplates : {
                defaultCell: '<div id="{{grid.appScope.config.name}}_{{col.field}}_{{rowRenderIndex}}" class="ui-grid-cell-contents grid-cell-{{col.colDef.type}}" ng-class="grid.appScope.getCellClass(row, col)" title="{{grid.appScope.getCellTooltip(row, col)}}" ng-click="grid.appScope.cellClick(row, col, $event, rowRenderIndex)">{{grid.appScope.getCellValue(row, col, rowRenderIndex)}}</div>',
                html: '<div id="{{grid.appScope.config.name}}_{{col.field}}_{{rowRenderIndex}}" class="ui-grid-cell-contents grid-cell-html" ng-class="grid.appScope.getCellClass(row, col)" title="{{grid.appScope.getCellTooltip(row, col)}}" ng-click="grid.appScope.cellClick(row, col, $event, rowRenderIndex)" ng-bind-html="grid.appScope.getCellValue(row, col, rowRenderIndex)" compile></div>',
                actions: '<div id="{{grid.appScope.config.name}}_{{col.field}}_{{rowRenderIndex}}" class="ui-grid-cell-contents grid-cell-actions"><a href="javascript:" ng-repeat="action in col.colDef.actions" id="{{grid.appScope.config.name}}_{{col.field}}_{{rowRenderIndex}}_{{action.id}}" ng-click="grid.appScope.actionCellActionClick(row, col, action, $event, rowRenderIndex)" class="{{action.iconCls}}" ng-class="grid.appScope.getActionCellClass(row, col, action)" ng-hide="action.hideFn ? action.hideFn(row, col, action) : false"><span ng-if="action.text && !action.iconCls" ng-bind="action.text"></span></a></div>'
            },
            
            getDefaultConfig: function(config, type) {
                
                config = this.defineDefaults(config);

                config = this.defineColumns(config);

                config = this.definePagination(config);
                
                config = this.defineSelection(config);

                config = this.defineSorting(config);

                config = this.defineFilter(config);

                var uiGridConfig = angular.copy(config);
                uiGridConfig.data = uiGridConfig.data ? uiGridConfig.data : []; 

                //remove unused stuffs
                delete uiGridConfig.pager;
                delete uiGridConfig.events;
                delete uiGridConfig.actions;

                return uiGridConfig;
            },

            defineDefaults: function(config) {
                config.enableHorizontalScrollbar = config.enableHorizontalScrollbar || uiGridConstants.scrollbars.NEVER;
                config.enableVerticalScrollbar   = config.enableVerticalScrollbar || uiGridConstants.scrollbars.NEVER;
                config.enableColumnMenus = false; 
                config.enableFiltering = config.useExternalFiltering = false
                
                config.enableGridMenu = (config.columnDefs.length > 1 && config.enableGridMenu !== false);
                config.gridMenuCustomItems = [];

                config.rowHeight = config.rowHeight || 30;
                config.showGridFooter = false;
                config.height = config.height || (config.rowHeight * 6);
                config.noDataText = config.noDataText || "No data to display";
                return config;
            },

            setHeaderTitle: function(config) {

                if (config.labels) {
                    var columns = config.options ? config.options.columnDefs : config.columnDefs;
                    angular.forEach(columns, function (col) {
                        col.displayName = config.labels[col.labelKey] || ((col.field == "Actions") ? "Actions" : "");
                    });

                    this.refreshGridOptions(config, "header");
                }

                return config;
            },

            refreshGridOptions: function(config, type) {
                switch(type) {
                    case "header":
                    case "column":
                        if(config && config.gridAPI) 
                            config.gridAPI.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                    break;

                    case "options":
                        if(config && config.gridAPI) 
                            config.gridAPI.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
                    break;
                }
            },

            getGridHeight: function(config) {
                if(config.autoHeight === true) {
                    var limitOrtotalRows = 5; 
                    if(config.pager) {
                        limitOrtotalRows = parseInt(config.pager.limit || 5);
                    }
                    
                    if(config.options.data){
                        var dataLength = config.options.data.length;
                        if(dataLength < limitOrtotalRows)
                             limitOrtotalRows = dataLength < 5 ? 5 : dataLength;
                    }
                    
                    return (limitOrtotalRows + 1) * parseInt(config.options.rowHeight || config.rowHeight) + "px";
                }
                else if(config.showAll) {
                    var length = 6;
                    var rowHeight = parseInt(config.options.rowHeight || config.rowHeight || 30); // your row height
                    var headerHeight = 30; // your header height  
                    if(config.options.data && config.options.data.length > 0){
                        length = config.options.data.length;
                        return (length * rowHeight) + headerHeight + "px";
                    }
                    else
                        return (length * rowHeight) + headerHeight + "px";
                }
                else
                {
                    //TODO: Clarify murugasen
                    return '420px';
                   //return (config.height || 400) +'px';
                }
            },

            defineColumns: function(config) {
                for(var key in config.columnDefs) {
                    //displaying same data in tooltip doesn't make any sense 
                    //config.columnDefs[key].cellTooltip = true;

                    var columnType = config.columnDefs[key].actions ? "actions" : config.columnDefs[key].type;
                    //TODO: Clarify JSK
                    if(!config.columnDefs[key].cellTemplate) {
                        config.columnDefs[key].cellTemplate = this.cellTemplates[columnType] || this.cellTemplates["defaultCell"];
                    }
                    //set defaults for actions columns
                    if(columnType === 'actions') {
                        config.columnDefs[key].enableSorting = false;
                        config.columnDefs[key].enableHiding = false;    
                    }    
                    
                    //don't allow users to hide first column in the table
                    if(key == 0)
                        config.columnDefs[key].enableHiding = false;
                }

                return this.setHeaderTitle(config);
            },

            definePagination: function(config) {
                if(!config.pager)
                    config.pager = { enabled: false, allowResize: false }
                
                config.pager.enabled = (config.pager.enabled === true)
                config.pager.allowResize = !(config.pager.allowResize === false)
                
                if(config.pager.enabled) {
                    config.pager.limit = config.pager.limit || 5,
                    config.pager.page = config.pager.page || 1;
                    config.pager.total = config.pager.page.total || 1;
                    config.pager.offset = (config.pager.page - 1) * config.pager.limit;
                    config.pager.supportedSizes = config.pager.allowResize ? (config.pager.supportedSizes || [5, 10, 25, 50]) : [];
                    
                    config.pager.getOffset = function() {
                        config.pager.offset = (config.pager.page - 1) * config.pager.limit;
                        return config.pager.offset;
                    }
                    
                    config.pager.getLimit = function() {
                        return config.pager.limit;
                    }
                    
                    config.pager.limitChanged = function() {
                        
                        var previousOffset = this.offset;

                        this.setTotalPages(this.totalRows || 0);
                        if(!this.setPage(Math.ceil(previousOffset / this.limit) + 1))
                            this.setPage(1);

                    }

                    config.pager.setTotalPages = function(totalRows) { 
                        config.pager.total = Math.ceil(totalRows / config.pager.limit);
                        if(config.pager.total == 0)
                            config.pager.total = 1;
                        config.pager.totalRows = totalRows;                        
                    }
                    
                    config.pager.setPage = function(pageNo, validate) { 
                        if(pageNo <= config.pager.total && pageNo > 0) {
                            if(!validate) {
                                config.pager.page = pageNo;
                                config.pager.offset = (config.pager.page - 1) * config.pager.limit;
                            }
                            config.pager.message = false;
                            return true; 
                        }
                        config.pager.message = "Invalid page number #" + pageNo;
                        return false
                    }
                }
                return config;
            },

            defineSelection: function(config){
                config.enableRowSelection = (config.enableRowSelection === true);
                if(config.enableRowSelection)
                    config.enableFullRowSelection = !(typeof config.enableFullRowSelection === "boolean" && config.enableFullRowSelection === false);

                config.enableRowHeaderSelection = (config.enableRowSelection && config.enableRowHeaderSelection === true);

                return config;
            },

            defineSorting: function(config, sortFields) {
                if(!sortFields) {
                    config.enableSorting = (config.enableSorting === true);
                    config.useExternalSorting = config.enableSorting;

                    return config;
                }
                else if (!config.isSortingDefined && sortFields.columns){
                     
                        config.isSortingDefined = true;

                        var columns = config.options ? config.options.columnDefs : config.columnDefs;
                        angular.forEach(sortFields.columns, function (field) {
                            angular.forEach(columns, function (col) {
                                if(typeof col.enableSorting ==  'undefined')
                                    col.enableSorting = false;

                                if(field == col.field)
                                    col.enableSorting = true;

                                if(sortFields.default && (field == sortFields.default.substring(1))) {
                                    col.sort = {
                                        direction : (sortFields.default.indexOf("+") != -1) ? uiGridConstants.ASC : uiGridConstants.DESC
                                    }
                                }
                            });
                        });

                        this.refreshGridOptions(config, "header");
                    
                }
            },

            defineFilter: function(config) {
                config.enableSearch = (config.enableSearch === true);   
                config.search ={};
                return config;
            },

            rePaint: function(config) {
                if(config && config.gridAPI)
                    config.gridAPI.grid.handleWindowResize();
            },

            setColumnVisibility: function(config, ops) {
                //ops = [{index:0-n, hide: true/false}]
                if(ops) {
                    for(var key in ops) {
                        var option = ops[key];
                        if(config.gridAPI.grid.columns[option.index])
                            config.gridAPI.grid.columns[option.index][option.hide == true ? "hideColumn": "showColumn"]();        
                    }
                    config.gridAPI.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                }
            }
        };
    }])

    .factory('$$gridActions', ['$rootScope', '$http', '$q', '$filter', function ($rootScope, $http, $q, $filter) {
        return {
            compareRows : function(scope, config, newRow, oldRow) {
                
                var isMatched;
                if(config.rowUniqueKeys && config.rowUniqueKeys.length) {
                    
                    for(var keyIndex in config.rowUniqueKeys) {
                        var uniqueKey = config.rowUniqueKeys[keyIndex];
                        
                        if(oldRow[uniqueKey] != newRow[uniqueKey])
                            break;
                        
                        isMatched = true;
                    }
                }
                else {
                    var newHashKey = newRow.$$hashKey, oldHashKey = oldRow.$$hashKey;
                    delete newRow.$$hashKey;
                    delete oldRow.$$hashKey;
                    
                    if(oldRow == newRow)
                        isMatched = true;
                    else if(JSON.stringify(oldRow) == JSON.stringify(newRow))
                        isMatched = true;
                    
                    if(!newRow.$$hashKey && newHashKey)
                        newRow.$$hashKey = newHashKey;
                    if(!oldRow.$$hashKey && oldHashKey)
                        oldRow.$$hashKey = oldHashKey;
                }
                
                return isMatched;
            },

            handleCellActions : function(scope, eventType, config, row, cell, ops, rowRenderIndex) {
                /*
                * Supported events
                    1. data - return value for cell
                    2. tooltip - return value for tooltip
                    3. click - column click handler
                    4. class - return column class
                */

                var rowEntity = (row && row.entity) ? row.entity : row;

                //select row on page nav.
                if(scope.isRowSelectionEnabled() && !row.isSelected && eventType == 'data' && config.selectedRows && config.selectedRows.length) {
                    for(var selectedIndex in config.selectedRows) {
                        var oldRow = config.selectedRows[selectedIndex];
                        if(this.compareRows(scope, config, rowEntity, oldRow) == true) {
                            //config.selectRow(row.entity);
                            row.isSelected =  true;
                            config.selectedRowsCount = config.getSelectedCount();
                        }
                    }
                }

                var rowIndex = -1;
                if(config.options.data)
                    rowIndex = (rowRenderIndex) ? rowRenderIndex : config.options.data.indexOf(rowEntity);
                
                //check subscriptions
                if(config.events && config.events.cell && typeof config.events.cell[eventType] == 'function')
                    return config.events.cell[eventType]('cell', eventType, config, rowEntity, cell, ops, rowIndex);

                var val = rowEntity[cell.field];
                switch(eventType) {
                    case "data":
                        if(val && (cell.colDef.type == 'date' || cell.colDef.dataType == 'date')) {
                            if(String(val).length <= 10)
                                val *= 1000;
                            
                            val = $filter('date')(val,'short');
                        }

                        return val;
                }
            },

            handleRowActions : function(scope, eventType, config, row, cell, ops, rowRenderIndex) {
                /*
                * Supported events
                    1. select - row selection change handler
                    2. action - action column event handler
                */

                var rowEntity = (row && row.entity) ? row.entity : row;
                
                if(eventType == 'select') {
                    //initialize or clear selected rows cache if its null or more than 1000
                    if(!config.selectedRows || config.selectedRows.length > 1000)
                        config.selectedRows = [];
                    
                    var selectedRows = ops.isBatch ? row : [row];
                    var storedRowsLength = config.selectedRows.length;
                    
                    for(var newIndex in selectedRows) {
                        var newRow =  selectedRows[newIndex];
                        
                        if(storedRowsLength > 0) {
                            var foundIndex = -1;
                            
                            for(var oldIndex = storedRowsLength - 1; oldIndex >= 0; oldIndex--) {
                                var oldRow = config.selectedRows[oldIndex];
                                
                                if(!oldRow)
                                    continue;

                                if(this.compareRows(scope, config, newRow.entity, oldRow)) {
                                    foundIndex =  oldIndex;
                                    break;
                                }
                            }
                        }
                        
                        if((storedRowsLength <=0 || foundIndex == -1) && newRow.isSelected) {
                            config.selectedRows.push(newRow.entity);
                        }
                        else if(foundIndex != -1) {
                            if(!row.isSelected)
                                config.selectedRows.splice(foundIndex, 1);
                            else
                                config.selectedRows[foundIndex] = newRow.entity;
                        }
                    }

                    config.selectedRowsCount = config.getSelectedCount();
                }
                        

                var rowIndex = -1;
                if(config.options.data)
                    rowIndex = (rowRenderIndex) ? rowRenderIndex : config.options.data.indexOf(rowEntity);

                //check subscriptions
                if(config.events && config.events.row && typeof config.events.row[eventType] == 'function')
                    return config.events.row[eventType]('row', eventType, config, rowEntity, cell, ops, rowIndex);
            },

            handleGridActions : function(scope, eventType, config, row, cell, ops) {
                /*
                * Supported events
                    1. data - return data for table
                    2. reload-data - event raised if module thinks fetching or reload is necessary 
                    3. sort - sort handler
                    4. filter - filter handler
                    5. footer - grid footer actions handler
                    6. rendered - one time event getting called on completion of component rendering
                */

                if(!config.cache)
                    config.cache = {};

                if(eventType != 'data') {
                    config.cache.gridEvent = {
                        type: eventType,
                        ops: ops
                    };
                }

                var rowEntity = (row && row.entity) ? row.entity : row;
                if(!ops)
                    ops = {};
              
                //check subscriptions
                if(config.events && config.events && typeof config.events[eventType] == 'function')
                    return config.events[eventType]('grid', eventType, config, rowEntity, cell, ops);

                switch(eventType) {
                    case "data":
                        return ops.data || config.data;

                    case "reload-data":
                        if(typeof config.dataAPI == 'function')
                            config.dataAPI(ops);
                        break;
                    
                    case "filter-data":
                        if(typeof config.dataAPI == 'function')
                            config.dataAPI(ops);
                        break;
                    
                    case "clear-filter":
                        if(typeof config.dataAPI == 'function')
                            config.dataAPI(ops);
                        break;
                    
                    case "sort":
                        ops.isSort = true;
                        ops.sortParam = [];
                        for(var i=0; i<ops.length; i++)
                            ops.sortParam.push( (ops[i].sort.direction == "desc" ? "-" : "+") + ops[i].field);
                        
                        config.dataAPI(ops);
                        break;
                        
                    case "rendered":
                        if(config.autoLoad && typeof config.dataAPI == 'function')
                            config.dataAPI(ops);
                        break;
                }
            }            
        };
    }])

    .directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
          scope.$watch(
            function(scope) {
              // watch the 'compile' expression for changes
              return scope.$eval(attrs.compile);
            },
            function(value) {
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);

              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
            }
        );
      };
    }])

    .directive('uiGridEx', ['$window', '$interval', '$$gridService', '$$gridActions', 'uiGridConstants', '$timeout', function($window, $interval, $$gridService, $$gridActions, uiGridConstants, $timeout) {
        var directiveConnfig = {
            restrict: "E",
            replace: false,
            transclude: false,
            scope:{
                config: "="
            },
            templateUrl : '../lib/uiGridWrapper/uiGridEx.html',
            link: function(scope, element){
                
                var rowsRenderedTimeout;
                // auto-dimension of cells (css) need to force align rows in all containers (left and right pinning)
                scope.alignContainers =  function alignContainers ( gridContainer , grid) {
                    var rows = angular.element(gridContainer + ' .ui-grid .ui-grid-render-container-body .ui-grid-row');
                    var pinnedRowsLeft = angular.element(gridContainer + ' .ui-grid .ui-grid-pinned-container-left .ui-grid-row');
                    var gridHasRightContainer = grid.hasRightContainer();
                    if (gridHasRightContainer) {
                        var pinnedRowsRight = angular.element(gridContainer + ' .ui-grid .ui-grid-pinned-container-right .ui-grid-row');
                    }

                    var bodyContainer = grid.renderContainers.body;

                    // get count columns pinned on left
                    var columnsPinnedOnLeft = grid.renderContainers.left.renderedColumns.length;

                    for(var r = 0; r < rows.length; r++) {
                        // Remove height CSS property to get new height if container resized (slidePanel)
                        var elementBody = angular.element(rows[r]).children('div');
                        elementBody.css('height', '');
                        var elementLeft = angular.element(pinnedRowsLeft[r]).children('div');
                        elementLeft.css('height', '');
                        if (gridHasRightContainer) {
                            var elementRight = angular.element(pinnedRowsRight[r]).children('div');
                            elementRight.css('height', '');
                        }

                        // GET Height when set in auto for each container
                        // BODY CONTAINER
                        var rowHeight = rows[r].offsetHeight;
                        // LEFT CONTAINER
                        var pinnedRowLeftHeight = 0;
                        if (columnsPinnedOnLeft) {
                            pinnedRowLeftHeight = pinnedRowsLeft[r].offsetHeight;
                        }
                        // RIGHT CONTAINER
                        var pinnedRowRightHeight = 0;
                        if (gridHasRightContainer) {
                            pinnedRowRightHeight = pinnedRowsRight[r].offsetHeight;
                        }
                        // LARGEST
                        var largest = Math.max(rowHeight, pinnedRowLeftHeight, pinnedRowRightHeight);

                        // Apply new row height in each container
                        elementBody.css('height', largest);
                        elementLeft.css('height', largest);
                        if (gridHasRightContainer) {
                            elementRight.css('height', largest);
                        }

                        // Apply new height in gridRow definition (used by scroll)
                        if(bodyContainer.visibleRowCache[r]){
                            bodyContainer.visibleRowCache[r].height = largest;
                        }
                    }
                };
                // END alignContainers()

                scope.watchers = {};
                scope.config.options = $$gridService.getDefaultConfig(scope.config);
                scope.getBodyStyle = function(force) {
                    if(!scope.gridBodyStyle || force === true)
                        scope.gridBodyStyle = { "height" : $$gridService.getGridHeight(scope.config)};
                    
                    return scope.gridBodyStyle;
                }
                
                //register ui-grid related events 
                scope.config.options.onRegisterApi = function( gridApi ) {
                    scope.config.gridAPI = gridApi;

                    if(scope.config.useExternalSorting) {
                        scope.config.gridAPI.core.on.sortChanged(scope, scope.handleSort);
                    }

                    if(scope.isRowSelectionEnabled()) {
                        scope.config.gridAPI.selection.on.rowSelectionChanged(scope, scope.handleSelection);
                        scope.config.gridAPI.selection.on.rowSelectionChangedBatch(scope, scope.handleSelection);
                    }

                    // ROWS RENDER
                    if(scope.config.autoRowHeight) {
                        scope.gridApi.core.on.rowsRendered(scope, function () {
                            // each rows rendered event (init, filter, pagination, tree expand)
                            // Timeout needed : multi rowsRendered are fired, we want only the last one
                            if (rowsRenderedTimeout) {
                                $timeout.cancel(rowsRenderedTimeout)
                            }
                            rowsRenderedTimeout = $timeout(function () {
                                scope.alignContainers('', scope.gridApi.grid);
                            });
                        });
                        // SCROLL END
                        scope.gridApi.core.on.scrollEnd(scope, function () {
                            scope.alignContainers('', scope.gridApi.grid);
                        });
                    }
                };

                //watchers
                scope.watchers.labels = scope.$watch('config.labels', function(value) {
                    if(value) {
                        $$gridService.setHeaderTitle(scope.config);
                    }
                });
				
                scope.watchers.data = scope.$watch('config.data', function(value) {
                    if(value) {
                        if(value.sortfields)
                            $$gridService.defineSorting(scope.config, value.sortfields);

                        var totalRows = null;
                        if(scope.config.totalKey)
                            totalRows = typeof(scope.config.totalKey) == 'function' ? scope.config.totalKey(value) : value[scope.config.totalKey];
                        else
                            totalRows = value.total;

                        if(!angular.isArray(value) && scope.config.dataKey && value[scope.config.dataKey])
                            value = value[scope.config.dataKey];
                        
                        value = $$gridActions.handleGridActions(scope, 'data', scope.config, null, null, {data: value});

                        if(value && angular.isArray(value)) {
                            
                            if(scope.config.pager.enabled) {
                                if(scope.config.pager.noTotalDefined) {
                                    if(totalRows == null || totalRows == undefined)
                                        totalRows = (scope.config.pager.offset + value.length + 2)
                                }

                                if(totalRows >= 0)
                                    scope.config.pager.setTotalPages(totalRows);
                                /*
                                //Note: will takeup later
                                if(scope.config.pager.limit && value.length > scope.config.pager.limit )
                                    value = value.splice(scope.config.pager.limit, (value.length - scope.config.pager.limit));
                                */    
                            }
                            
                            if(scope.isRowSelectionEnabled()) {
                                scope.config.skipSelectionEvent = true;
                                scope.config.clearSelection(!scope.config.cache.gridEvent || !scope.config.cache.gridEvent.ops.isPageNav);
                                delete scope.config.skipSelectionEvent;
                            }

                            scope.config.options.data = value;

                            if(scope.isRowSelectionEnabled() && scope.config.selectedRowsCount > 0 && scope.config.gridAPI.grid.rows && scope.config.gridAPI.grid.rows.length) {
                            $interval(function() {
                                                    var selectAll = true;
                                                    for(var rowIndex = 0; rowIndex < scope.config.gridAPI.grid.rows.length; rowIndex++){
                                                        var row = scope.config.gridAPI.grid.rows[rowIndex];
                                                        if(row.visible && !row.isSelected) {
                                                            selectAll = false;
                                                            break;
                                                        }
                                                    };

                                                    if(selectAll) {
                                                        scope.config.skipSelectionEvent = true;
                                                        scope.config.selectAllRows();
                                                        delete scope.config.skipSelectionEvent;
                                                    }
                                                }, 
                                    100, 1);
                            }

                            delete scope.config.cache.gridEvent;
   
                        }
                    } else {
                        if(scope.config.pager && scope.config.pager.enabled  && scope.config.pager.page == 1) {
                            scope.config.pager.setTotalPages(0);
                        }
                        scope.config.options.data = [];
                    }

                    //re calculate after loading data
                    scope.getBodyStyle(true);
                });
                
                scope.isRowSelectionEnabled = function() {
                    return (scope.config.options.enableRowSelection || scope.config.options.enableRowHeaderSelection);
                }

                scope.hasData = function() {
                    return (scope.config.options.data && scope.config.options.data.length);
                }
                
                scope.showFooter = function() {
                    return ((scope.config.actions && scope.config.actions.length > 0) || (scope.config.pager.enabled));
                }

                //events and customization
                scope.getCellClass = function(row, col) {
                    return $$gridActions.handleCellActions(scope, 'class', scope.config, row, col);
                };

                scope.getCellTooltip = function(row, col) {
                    return $$gridActions.handleCellActions(scope, 'tooltip', scope.config, row, col);
                };

                scope.getCellValue = function(row, col, rowIndex) {
                    return $$gridActions.handleCellActions(scope, 'data', scope.config, row, col, null, rowIndex);
                };

                scope.cellClick = function(row, col, event, rowIndex) {
                    return $$gridActions.handleCellActions(scope, 'click', scope.config, row, col, event, rowIndex);
                };

                scope.actionCellActionClick = function(row, col, action, event, rowIndex) {
                    action.$event = event;
                    return $$gridActions.handleRowActions(scope, 'action', scope.config, row, col, action, rowIndex);
                };

                scope.getActionCellClass = function(row, col, action) {
                    return $$gridActions.handleRowActions(scope, 'actionCls', scope.config, row, col, action);
                };

                //footer
                scope.footerAction = function(action) {
                    return $$gridActions.handleGridActions(scope, 'footer', scope.config, null, null, action);  
                };

                //sorting
                scope.handleSort = function(grid, ops) {
                    return $$gridActions.handleGridActions(scope, 'sort', scope.config, null, null, ops);  
                };                

                scope.handleSelection = function(row) {
                    if(!row || scope.config.skipSelectionEvent == true)
                        return;

                    var isBatch = angular.isArray(row) ? true : false;
                    //scope.config.selectedRowsCount = scope.config.getSelectedCount();
                    return $$gridActions.handleRowActions(scope, 'select', scope.config, row, null, {isBatch: isBatch});  
                };

                scope.config.options.isRowSelectable = function(row){
                    if(scope.isRowSelectionEnabled()) {
                        return $$gridActions.handleRowActions(scope, 'isSelectable', scope.config, row, null, null);  
                        $$gridService.refreshGridOptions(scope.config,"options");
                    }
                };     

                scope.config.getSelection = function() {
                    return scope.config.gridAPI.selection;
                };

                scope.config.selectAllRows = function() {
                    scope.config.gridAPI.selection.selectAllRows();
                };

                scope.config.clearSelection = function(byUser) {
                    scope.config.gridAPI.selection.clearSelectedRows();
                    if(byUser) scope.config.selectedRows = [];

                    scope.config.selectedRowsCount = scope.config.getSelectedCount();
                };
                
                scope.config.getSelectedCount = function() {
                    return scope.config.selectedRows ? scope.config.selectedRows.length : 0; 
                    //return scope.config.gridAPI.selection.getSelectedCount();
                };

                scope.config.selectRow = function(rowOrIndex, byUser) {
                    if(typeof rowOrIndex == 'number')
                        rowOrIndex = scope.config.options.data[rowOrIndex];

                    if(rowOrIndex)
                        $interval( function() { scope.config.gridAPI.selection.selectRow(rowOrIndex);}, 0, 1);
                };

                scope.config.unSelectRow = function(rowOrIndex) {
                    if(typeof rowOrIndex == 'number')
                        rowOrIndex = scope.config.options.data[rowOrIndex];

                    if(rowOrIndex)
                        scope.config.gridAPI.selection.unSelectRow(rowOrIndex);
                };

                scope.config.getSelectedRows = function(girdRow) {
                    return scope.config.selectedRows;
                    //return scope.config.gridAPI.selection[girdRow ? 'getSelectedGridRows': 'getSelectedRows']();
                }

                //Search
                scope.doSearch = function(event) {
                    var raiseEvent = false;
                    if(scope.config.enableSearch  && (event.keyCode == 13 || event.type === "click")){    
                    //if(scope.config.enableSearch && scope.config.search.text !="" && (event.keyCode == 13 || event.type === "click")){                     
                        scope.config.search.text = $.trim(scope.config.search.text);
                        scope.config.pager.setPage(1);
                        raiseEvent = true;
                    } 
                    if(raiseEvent)
                        return $$gridActions.handleGridActions(scope, 'filter-data', scope.config, null, null, {isSearch: true, eventType: 'filter'});
                }

                scope.clearSearch = function(event) {
                    var raiseEvent = false;
                    if(scope.config.enableSearch && scope.config.search.text != ""){                     
                        delete scope.config.search;
                        raiseEvent = true;
                    } 
                    if(raiseEvent)
                        return $$gridActions.handleGridActions(scope, 'clear-filter', scope.config, null, null, {isSearch: false, eventType: 'clear'});
                }                     

                //pager
                scope.gotTo = function(page, eventType) {
                    var raiseEvent = false;
                    switch(eventType) {
                        case "first":
                        case "last":
                            page = (eventType == 'first') ? (1) : (scope.config.pager.total);
                            scope.config.pager.setPage(page);
                            raiseEvent = true;
                            break;

                        case "prev":
                        case "next":
                            page = (eventType == 'next') ? (page+1) : (page-1);
                            if(page > 0 && page <= scope.config.pager.total) {
                                scope.config.pager.setPage(page);
                                raiseEvent = true;
                            }
                            break;

                        case "limit":
                            scope.config.pager.limitChanged();
                            raiseEvent = true;
                            scope.getBodyStyle(true);
                            break;
                    }
                    if(raiseEvent){
                        return $$gridActions.handleGridActions(scope, 'reload-data', scope.config, null, null, {isPageNav: true, eventType: eventType});  
                    }
                }
                
                //post renderer
                $interval(function() { $$gridActions.handleGridActions(scope, 'rendered', scope.config, null, null, {}) }, 1500, 1);
                
            }
        }
        return directiveConnfig;
    }]);
