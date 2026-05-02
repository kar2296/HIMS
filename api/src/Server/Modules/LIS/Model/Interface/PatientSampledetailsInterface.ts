import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientSampledetailsAttributes extends IAttributes {
    Id: number;
    Encountersorderid: number;
    Externalsampledid: string;
    Externalsamplecollectorname: string;
    Sampledid: string;
    Samplecollectedbyid: number;
    Estimatedsamplingdatetime: Date;
    Actualsamplingdatetime: Date;
    Samplereceiveddatetime: Date;
    Samplereceivedbyid: number;
    Samplereceivedbyname: string;
    Collectionarea: string;
    Drawsiteid: number;
    Sampletypeid: number;
    Containertypeid: number;
    Colorcode: string;
    Departments: string;
    Samplesharingstatuse: number;
    Labelgenerationcount: number;
    Workareaid: number;
    Issampleinusee: number;
    Lastattendedbyid: number;
    Lastattendeddatetime: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
    Extoid: string;
    Tests: string;
    Issecondarye: number;
    Orderprioritye: number;
    Transporttemperaturee: number;
    Comments: string;
}

export interface PatientSampledetailsInstance extends Instance<PatientSampledetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientSampledetailsAttributes;
}
