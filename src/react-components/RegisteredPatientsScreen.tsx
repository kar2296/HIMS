import React, { useState } from 'react';
import { Button } from './Button';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Card, FilterBar } from '../components/ui/Card';
import { SearchBox } from '../components/ui/SearchBox';

interface PatientRow {
  Id?: number;
  FirstName?: string;
  Age?: number | string;
  DOB?: string;
  City?: string;
  Mobile?: string;
}

interface PagerObj {
  totalItems?: number;
  currentPage?: number;
  startIndex?: number;
  pageSize?: number;
}

interface RegisteredPatientsScreenProps {
  reactProps?: {
    patientname?: string;
    canShowGrid?: boolean;
    gridData?: PatientRow[];
    pagerObj?: PagerObj;
  };
  onAction?: (actionName: string, payload?: any) => void;
}

// Matches the AngularJS 'date' filter format used by the original ngformatdate
// directive: {{dateVal | date : 'dd-MMM-yyyy'}}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDob(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

// React port of public/views/patientservices/registeredpatients/{registeredpatients.html,.js}
// (AngularJS controller: PatientServicesalreadyController).
// Pure presentational bridge component: the search box's live typing is local UI state
// (the original ng-model value was only ever read by getList() at search time, so this
// is behavior-preserving); every other interaction forwards to
// $scope.handleReactAction in the (hollowed) AngularJS controller, which still owns the
// real 'registration/patient/GetPatients' API call, filter/pager state, and navigation
// exactly as before. No new business logic, no direct API calls, no mock data -- rows
// render only from reactProps.gridData, which comes from the real backend response.
export const RegisteredPatientsScreen: React.FC<RegisteredPatientsScreenProps> = ({ reactProps, onAction }) => {
  const {
    patientname = '',
    canShowGrid = false,
    gridData = [],
    pagerObj = {},
  } = reactProps || {};

  const [searchValue, setSearchValue] = useState(patientname);

  const handleAction = (action: string, payload?: any) => {
    if (onAction) {
      onAction(action, payload);
    }
  };

  const runSearch = () => {
    handleAction('search', { value: searchValue });
  };

  const currentPage = pagerObj.currentPage || 1;
  const pageSize = pagerObj.pageSize || 25;
  // pagerObj.totalItems reflects the current page's row count (an existing quirk of the
  // original controller, not something this migration changes), so "Next" is only
  // offered when the page came back full -- the same information the original grid had.
  const hasNextPage = gridData.length >= pageSize;

  // NOTE: the design-system `Pagination` component derives its page window from a real
  // `totalItems` (totalPages = ceil(totalItems / pageSize)) and hides itself entirely when
  // that yields <=1 page. Because pagerObj.totalItems here is only the current page's row
  // count (the documented quirk above), feeding it into that component would mis-render or
  // hide the pager instead of reproducing the original's hasNextPage-driven Prev/Next. So
  // pagination intentionally stays hand-rolled here (already using the shared Button), and
  // only its container styling is left to Card below -- this does not change behavior.
  const columns: DataTableColumn<PatientRow>[] = [
    { key: 'name', header: 'Name', field: 'FirstName' },
    { key: 'age', header: 'Age', field: 'Age' },
    { key: 'dob', header: 'DOB', render: (row) => formatDob(row.DOB) },
    { key: 'city', header: 'City', field: 'City' },
    { key: 'mobile', header: 'Mobile', field: 'Mobile' },
  ];

  return (
    <>
      <header>
        <nav className="navbar navbar-default0">
          <div className="header">
            <div className="navbar-header col-sm-4 col-md-3">
              <button
                type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar1"
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="http://www.gloomsoft.com/">
                <img src="app/img/patientservices/logo.png" alt="logo" />
              </a>
            </div>
            <div className="head col-sm-7 col-md-6">
              <h2 className="bold text-center">PATIENT SERVICES</h2>
            </div>
            <div className="col-sm-1 col-md-3">
              <Button
                variant="primary"
                size="md"
                icon="fa-sign-out"
                className="pull-right logout"
                onClick={() => handleAction('logout')}
              >
                Logout
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <div className="container pd0">
        <div className="col-sm-12 pd0 main_box search">
          <section>
            <Card title="Search MRN">
              <FilterBar>
                <SearchBox
                  value={searchValue}
                  onChange={setSearchValue}
                  onSubmit={runSearch}
                  placeholder="Search.."
                />
                <Button type="button" variant="primary" size="md" onClick={runSearch}>
                  Search
                </Button>
              </FilterBar>
            </Card>
          </section>
        </div>
      </div>

      {canShowGrid && (
        <div className="container-fluid patientsearchprofilebg" id="patientsearchheight">
          <Card>
            <DataTable<PatientRow>
              columns={columns}
              rows={gridData}
              rowKey={(row) => row.Id ?? gridData.indexOf(row)}
              emptyText="No records found"
            />
            <div className="fooder-bg apperance_footer">
              <div className="row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handleAction('pageChange', { page: currentPage - 1 })}
                >
                  Prev
                </Button>
                <span>Page {currentPage}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => handleAction('pageChange', { page: currentPage + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="back clearfix">
        <img
          className="img-responsive"
          src="app/img/patientservices/redo.png"
          alt=""
          onClick={() => handleAction('home')}
        />
        <img
          className="img-responsive ps_home"
          src="app/img/patientservices/home.png"
          alt=""
          onClick={() => handleAction('pshome')}
        />
      </div>

      <div className="footer">
        <footer className="container-fluid bg-4 text-center">
          <p>
            &copy; &nbsp;
            <a href="http://www.gloomsoft.com/">Gloomsoft Technologies</a>
          </p>
        </footer>
      </div>
    </>
  );
};
