import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';

declare global {
    interface Models {
        AdmissionRequest: SequelizeStatic.Model<i.AdmissionRequestInstance, i.AdmissionRequestAttributes>;
        BedHousekeeping: SequelizeStatic.Model<i.BedHousekeepingInstance, i.BedHousekeepingAttributes>;
        BedTransportation: SequelizeStatic.Model<i.BedTransportationInstance, i.BedTransportationAttributes>;
        BedTransfer: SequelizeStatic.Model<i.BedTransferInstance, i.BedTransferAttributes>;
        BedOccupancyHistory: SequelizeStatic.Model<i.BedOccupancyHistoryInstance, i.BedOccupancyHistoryAttributes>;
        Bedtransportationlog: SequelizeStatic.Model<i.BedtransportationlogInstance, i.BedtransportationlogAttributes>;
        BedHousekeepinglog: SequelizeStatic.Model<i.BedHousekeepinglogInstance, i.BedHousekeepinglogAttributes>;
        PatientAdmissionLog: SequelizeStatic.Model<i.PatientAdmissionLogInstance, i.PatientAdmissionLogAttributes>;
        PatientAdmissionRequestLog: SequelizeStatic.Model<i.PatientAdmissionRequestLogInstance, i.PatientAdmissionRequestLogAttributes>;
        PatientStockRequests: SequelizeStatic.Model<i.PatientStockRequestsInstance, i.PatientStockRequestsAttributes>;
        PatientStockRequestDetails: SequelizeStatic.Model<i.PatientStockRequestDetailsInstance, i.PatientStockRequestDetailsAttributes>;
        PatientDischargeEvent: SequelizeStatic.Model<i.PatientDischargeEventInstance, i.PatientDischargeEventAttributes>;
        BedReservationDetail: SequelizeStatic.Model<i.BedReservationDetailInstance, i.BedReservationDetailAttributes>;
        FileRequest: SequelizeStatic.Model<i.FileRequestInstance, i.FileRequestAttributes>;
        FileIssue: SequelizeStatic.Model<i.FileIssueInstance, i.FileIssueAttributes>;
        PatientStockReturns: SequelizeStatic.Model<i.PatientStockReturnsInstance, i.PatientStockReturnsAttributes>;
        PatientStockReturnDetails: SequelizeStatic.Model<i.PatientStockReturnDetailsInstance, i.PatientStockReturnDetailsAttributes>;
        MRDLocation: SequelizeStatic.Model<i.MRDLocationInstance, i.MRDLocationAttributes>;
        MRDMovement: SequelizeStatic.Model<i.MRDMovementInstance, i.MRDMovementAttributes>;
        MRDFileAttachments: SequelizeStatic.Model<i.MRDFileAttachmentInstance, i.MRDFileAttachmentAttributes>;
        MRDFiles: SequelizeStatic.Model<i.MRDFilesInstance, i.MRDFilesAttributes>;
        IPFileRequest: SequelizeStatic.Model<i.IPFileRequestInstance, i.IPFileRequestAttributes>;
        PatientSickLeaveForm: SequelizeStatic.Model<i.PatientSickLeaveFormInstance, i.PatientSickLeaveFormAttributes>;
        IPClearence: SequelizeStatic.Model<i.IPClearenceInstance, i.IPClearenceAttributes>;
    }
}
