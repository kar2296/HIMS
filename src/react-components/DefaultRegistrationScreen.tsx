import React from 'react';
import { Button } from './Button';
import { PageHeader } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { spacing } from '../components/ui/tokens';

interface DefaultRegistrationScreenProps {
  onAction?: (actionName: string) => void;
}

// React port of public/views/patientservices/defaultregistration/{defaultregistration.html,.js}
// (AngularJS controller: PatientServicesDefaultController).
// Pure presentational bridge component: every click just forwards the action name to
// $scope.handleReactAction in the (hollowed) AngularJS controller, which still owns
// navigation ($state.go) and logout (utl.Http.doAction) exactly as before. No new
// business logic, no direct API calls, no new functionality.
export const DefaultRegistrationScreen: React.FC<DefaultRegistrationScreenProps> = ({ onAction }) => {
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <>
      <header>
        <nav className="navbar navbar-default0">
          <div className="header">
            <div className="navbar-header col-sm-4 col-md-3">
              {/*
                Bootstrap collapse toggle (data-toggle/data-target), not an action-dispatch
                control -- left as a native button rather than swapped for the design-system
                Button so the mobile-nav collapse behavior (and its icon-bar markup, which
                Button does not render) keeps working exactly as before.
              */}
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
              <a className="navbar-brand" href="http://www.gloomsofttechnologies.com/">
                {/* Same (pre-existing, already-missing) asset path as the original template */}
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

      <div className="row page-header">
        <div className="col-sm-12">
          <div className="col-sm-4 col-md-6 col-lg-6">
            <PageHeader title="Registration" />
          </div>
        </div>
      </div>

      <div className="container pd0">
        <div className="bodycontent clearfix">
          <div className="col-sm-6 button_content">
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <Button
                  variant="primary"
                  size="lg"
                  icon="fa-chevron-right"
                  iconPosition="right"
                  onClick={() => handleAction('newregistration')}
                >
                  New Registration
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  icon="fa-chevron-right"
                  iconPosition="right"
                  onClick={() => handleAction('registeredpatients')}
                >
                  Registered Patients
                </Button>
                {/*
                  Book Appointments / Appointment Status: in the original AngularJS template
                  these two buttons have no ng-click at all -- they are visually present but
                  inert. Preserved exactly as-is (no onClick), not invented as new functionality.
                */}
                <Button variant="danger" size="lg" icon="fa-chevron-right" iconPosition="right">
                  Book Appointments
                </Button>
                <Button variant="warning" size="lg" icon="fa-chevron-right" iconPosition="right">
                  Appointment Status
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="back clearfix" onClick={() => handleAction('home')}>
        <img className="img-responsive" src="app/img/patientservices/redo.png" alt="" />
        <img
          className="img-responsive ps_home"
          src="app/img/patientservices/home.png"
          alt=""
          onClick={(e) => {
            e.stopPropagation();
            handleAction('pshome');
          }}
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
