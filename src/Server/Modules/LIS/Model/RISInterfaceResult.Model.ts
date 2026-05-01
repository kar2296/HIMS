import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RISInterfaceResultInstance, i.RISInterfaceResultAttributes> {
    let RISInterfaceResult = sequelize.define<i.RISInterfaceResultInstance, i.RISInterfaceResultAttributes>('RISInterfaceResult', {
        Id: { type: DataTypes.BIGINT, field: 'RISResultId', primaryKey: true, autoIncrement: true },
        RISId: { type: DataTypes.BIGINT, field: 'RISId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        MRNNo: { type: DataTypes.STRING, field: 'MRNNo' },
        WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
        TestmasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        AnalyteCode: { type: DataTypes.STRING, field: 'AnalyteCode' },
        AnalyteId: { type: DataTypes.STRING, field: 'AnalyteId' },
        AnalyteName: { type: DataTypes.STRING, field: 'AnalyteName' },
        ResultValue: { type: DataTypes.STRING, field: 'ResultValue' },
        FullResultValue: { type: DataTypes.STRING, field: 'FullResultValue' },
        Approved: { type: DataTypes.BOOLEAN, field: 'Approved' },
        ApprovedById: { type: DataTypes.INTEGER, field: 'ApprovedById' },
        ApproveDt: { type: DataTypes.DATE, field: 'ApproveDt' },
        Rejected: { type: DataTypes.BOOLEAN, field: 'Rejected' },
        RejectedById: { type: DataTypes.INTEGER, field: 'RejectedById' },
        RejectedDt: { type: DataTypes.DATE, field: 'RejectedDt' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        insertedTo: { type: DataTypes.BOOLEAN, field: 'insertedTo' },
        RisInterfaceStatusId: { type: DataTypes.BIGINT, field: 'RisInterfaceStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DOB: { type: DataTypes.DATE, field: 'DOB' },
        Gender: { type: DataTypes.STRING, field: 'Gender' },
        Modality: { type: DataTypes.STRING, field: 'Modality' },
        Modality1: { type: DataTypes.STRING, field: 'Modality1' },
        VisitNo: { type: DataTypes.STRING, field: 'VisitNo' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        PatientType: { type: DataTypes.STRING, field: 'PatientType' },
        UpdatedByUser: { type: DataTypes.STRING, field: 'UpdatedByUser' },
        Priority: { type: DataTypes.STRING, field: 'Priority' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'risinterfaceresults',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    return RISInterfaceResult;
}
