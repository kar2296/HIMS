// Shared AngularJS <-> React glue for list screens rendered with MasterListScreen.
//
// An AngularJS list controller keeps its own lookups, getList()/getListCallback(), delete
// confirmation and navigation. It calls window.ReactListBridge.attach($scope, ...) once, after
// those functions exist, describing its columns, filters and row actions. attach() then:
//   * builds $scope.reactProps for <react-component name="MasterListScreen"> on every change;
//   * turns the screen's onAction(...) calls into the controller's own functions
//     ($scope.getList, $scope.addNew, $scope.handleEvents, ...);
//   * wraps getList/getListCallback (the originals still do the real work) so that
//       - only the answer to the latest list request is shown (fast filter changes used to let
//         an older answer replace the newer one),
//       - a loading state is shown and cleared again when the request fails,
//       - changing a filter or searching starts from page 1,
//       - an emptied last page (e.g. after deleting its only row) steps back one page.
// Exposed as window.ReactListBridge from main.tsx so lazily loaded controllers can use it.

export interface ListBridgeFilter {
  key: string;
  label: string;
  type?: 'select' | 'text' | 'date';
  options?: { Id: number; Text: string }[];
  allLabel?: string;
  placeholder?: string;
  /** Read the current value from the controller (select: id or -1; text: string; date: yyyy-MM-dd). */
  get: () => number | string;
  /** Write a new value into the controller. */
  set: (value: any) => void;
  /** false when set() itself reloads the list (e.g. via a dependent lookup); default true. */
  fetch?: boolean;
}

export interface ListBridgeRowAction { action: string; title: string; icon: string }

export interface ListBridgeOptions {
  id: string;
  vm: { gridConfig: { data?: any[]; pagerObj: { totalItems: number; currentPage: number; pageSize: number } } };
  labels: () => { title: string; searchPlaceholder?: string; addTooltip?: string; homeTooltip?: string; colActions: string };
  columns: () => { key: string; label: string }[];
  filters: () => ListBridgeFilter[];
  /** Cells and allowed actions for one row of vm.gridConfig.data. */
  row: (entity: any) => { cells: Record<string, string>; actions: ListBridgeRowAction[] };
  /** Optional header search box. */
  search?: { get: () => string; set: (value: string) => void };
  showAdd?: boolean;
  /** Called for the Home button; the button is shown only when this is given. */
  home?: () => void;
  headerActions?: () => ListBridgeRowAction[];
  onHeaderAction?: (action: string) => void;
  /** Called for an allowed row action; defaults to $scope.handleEvents(action, entity). */
  onRowAction?: (action: string, entity: any) => void;
  /** Lets a screen adjust the outgoing list request (e.g. fix parameter keys). */
  beforeListRequest?: (options: any) => void;
  /** Read the list rows from the controller when they are not in vm.gridConfig.data. */
  getRows?: () => any[];
}

declare const angular: any;

function errorMessage($translate: any, data: any): string | null {
  if (!data || !data.Error || !data.Error.Code) return null;
  const key = 'common.errors.' + data.Error.Code + '.lbl';
  const text = $translate.instant(key);
  return text !== key ? text : data.Error.Message || text;
}

export function attachListBridge($scope: any, utl: any, $translate: any, opts: ListBridgeOptions) {
  const vm = opts.vm;
  let loading = false;
  let loadingTimer: ReturnType<typeof setTimeout> | null = null;
  let requestNo = 0;

  const setLoading = (value: boolean) => {
    loading = value;
    if (loadingTimer) { clearTimeout(loadingTimer); loadingTimer = null; }
    if (value) {
      // Safety net: a request that fails without any response calls no callback.
      loadingTimer = setTimeout(() => $scope.$evalAsync(() => setLoading(false)), 60000);
    }
  };

  const rows = () => (opts.getRows ? opts.getRows() : vm.gridConfig.data) || [];

  const build = () => {
    const pager = vm.gridConfig.pagerObj;
    const labels = opts.labels();
    return {
      id: opts.id,
      labels: { ...labels, loading: 'Loading...', noRecords: 'No records found' },
      search: opts.search ? { value: opts.search.get() || '' } : undefined,
      filters: opts.filters().map((f) => ({
        key: f.key, label: f.label, type: f.type || 'select', options: f.options || [], allLabel: f.allLabel,
        placeholder: f.placeholder, value: f.get(),
      })),
      columns: opts.columns(),
      rows: rows().map((entity: any, index: number) => ({ index, ...opts.row(entity) })),
      pager: { totalItems: pager.totalItems || 0, currentPage: pager.currentPage || 1, pageSize: pager.pageSize || 25 },
      loading,
      showAdd: opts.showAdd !== false,
      showHome: !!opts.home,
      headerActions: opts.headerActions ? opts.headerActions() : [],
    };
  };

  $scope.reactProps = build();
  $scope.$watch(build, (props: any) => { $scope.reactProps = props; }, true);

  const fromFirstPage = () => {
    vm.gridConfig.pagerObj.currentPage = 1;
    $scope.getList();
  };

  // React events arrive outside a digest; run the change in one straight away so the screen
  // updates at once (or inside the digest that is already running).
  const inDigest = (fn: () => void) => {
    const phase = $scope.$root.$$phase;
    if (phase === '$apply' || phase === '$digest') fn(); else $scope.$apply(fn);
  };

  $scope.handleReactAction = (actionName: string, payload: any) => {
    payload = payload || {};
    inDigest(() => {
      switch (actionName) {
        case 'setSearch':
          if (opts.search) opts.search.set(payload.value);
          break;
        case 'search':
          fromFirstPage();
          break;
        case 'setFilter': {
          const filter = opts.filters().find((f) => f.key === payload.key);
          if (!filter) break;
          if (filter.type === 'text') {
            filter.set(payload.value); // text filters search on Enter, as before
            break;
          }
          vm.gridConfig.pagerObj.currentPage = 1;
          filter.set(payload.value);
          if (filter.fetch !== false) $scope.getList();
          break;
        }
        case 'page':
          vm.gridConfig.pagerObj.currentPage = payload.page;
          $scope.getList();
          break;
        case 'addNew':
          if (opts.showAdd !== false) $scope.addNew();
          break;
        case 'home':
          if (opts.home) opts.home();
          break;
        case 'headerAction':
          if (opts.onHeaderAction) opts.onHeaderAction(payload.action);
          break;
        case 'rowAction': {
          const entity = rows()[payload.index];
          if (!entity) break;
          const allowed = opts.row(entity).actions.map((a) => a.action);
          if (allowed.indexOf(payload.action) < 0) break;
          if (opts.onRowAction) opts.onRowAction(payload.action, entity);
          else $scope.handleEvents(payload.action, entity);
          break;
        }
      }
    });
  };

  const onListError = (data: any, options: any) => {
    $scope.$evalAsync(() => {
      if (options && options.listBridgeRequestNo !== requestNo) return; // failure of an older request
      setLoading(false);
      const message = errorMessage($translate, data);
      if (message) utl.Alert.showErrorMsg(message);
    });
  };

  const originalGetList = $scope.getList;
  $scope.getList = function (this: any, ...args: any[]) {
    const current = ++requestNo;
    setLoading(true);
    const originalDoAction = utl.Http.doAction;
    utl.Http.doAction = function (this: any, options: any, ...rest: any[]) {
      if (options) {
        options.listBridgeRequestNo = current;
        options.onError = onListError;
        if (opts.beforeListRequest) opts.beforeListRequest(options);
      }
      return originalDoAction.call(this, options, ...rest);
    };
    try {
      return originalGetList.apply(this, args);
    } finally {
      utl.Http.doAction = originalDoAction;
    }
  };

  const originalGetListCallback = $scope.getListCallback;
  $scope.getListCallback = function (this: any, scope: any, res: any, options: any, ...rest: any[]) {
    if (options && options.listBridgeRequestNo !== undefined && options.listBridgeRequestNo !== requestNo) {
      return; // answer to an older request
    }
    setLoading(false);
    const result = originalGetListCallback.call(this, scope, res, options, ...rest);
    const pager = vm.gridConfig.pagerObj;
    const total = pager.totalItems || 0;
    const lastPage = Math.max(1, Math.ceil(total / (pager.pageSize || 25)));
    if ((!res || !res.Data || res.Data.length === 0) && total > 0 && pager.currentPage > lastPage) {
      pager.currentPage = lastPage;
      $scope.getList();
    }
    return result;
  };
}

/** Same helpers the controllers need for date filters. */
export function toInputDate(value: any): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseInputDate(value: string): Date | null {
  const parts = String(value || '').split('-');
  if (parts.length !== 3) return null;
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return isNaN(date.getTime()) ? null : date;
}

export function translateOr($translate: any, key: string, fallback: string): string {
  const text = $translate.instant(key);
  return text && text !== key ? text : fallback;
}
