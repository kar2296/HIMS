import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientOrdersAttributes extends IAttributes {
    Id: number;
    Encounterid: number;
    Patientid: number;
    Ordertypee: number;
    Encounterconsultationid: number;
    Ordernumber: string;
    Orderrequestdate: Date;
    Orderscheduledate: Date;
    DoctorId: number;
    DoctorName: string;
    Orderstatuse: number;
    Ordercompletedate: Date;
    Orderprioritye: number;
    ParentDeptId: number;
    Ordertolocation: number;
    Orderlocationid: number;
    Patientmrnid: string;
    Accessionnumber: string;
    Externallabid: number;
    Hisorderid: string;
    Sourcetypee: number;
    Referredid: number;
    Referredby: string;
    Ordernotes: string;
    Ordercomments: string;
    Billingstatuse: number;
    Orderpackageid: number;
    Orderpackagename: number;
    Billingid: number;
    Billamount: number;
    Billdate: Date;
    Resultestimatedate: Date;
    Groupid: number;
    Reason: string;
    Extoid: string;
    Datatemplateid: number;
    Instanceidentifier: string;
    Billtype: number;
    Primaryinsid: number;
    Secondaryinsid: number;
    Scheduleddate: Date;
    Orderauthorizedbyid: number;
    Orderauthorizedbyname: string;
    Orderauthorizeddate: Date;
    Bedid: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientOrdersInstance extends Instance<PatientOrdersAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientOrdersAttributes;
}
