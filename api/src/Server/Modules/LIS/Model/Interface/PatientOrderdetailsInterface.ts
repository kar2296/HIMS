import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientOrderdetailsAttributes extends IAttributes {
    Id: number;
    Encountersorderid: number;
    Displayseqid: number;
    Patientid: number;
    Groupid: number;
    Testid: number;
    Categoryname: string;
    Testname: string;
    Testdesc: string;
    Testtypee: number;
    Diagnosisid: number;
    Testprice: number;
    Testpricecurcode: string;
    Testpricecode: string;
    Testcost: number;
    Testcostcurcode: string;
    Testcostcode: string;
    Taxid: number;
    Taxcost: number;
    Isorderede: number;
    DoctorId: number;
    DoctorName: string;
    Ordertolocation: number;
    Orderlocationid: number;
    Orderstatuse: number;
    Orderprioritye: number;
    Testinstruction: string;
    Isalertrequirede: number;
    Isprocessede: number;
    Repeatfrequency: string;
    Indication: string;
    Isuseprevioussample: number;
    Reason: string;
    Extoid: string;
    Profilename: string;
    Packagename: string;
    Masterobjecttypee: number;
    Masterid: number;
    Testcode: string;
    Departmentid: number;
    Subdepartmentid: number;
    Quantity: number;
    Scheduledate: Date;
    Resultestimateddate: Date;
    Iscancelede: number;
    Canceledbyid: number;
    Canceleddatetime: Date;
    Primaryinsid: number;
    Secondaryinsid: number;
    Scheduleddate: Date;
    Referrarshare: number;
    Iscalculategst: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientOrderdetailsInstance extends Instance<PatientOrderdetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientOrderdetailsAttributes;
}
