import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AdmissionRequestInstance, i.AdmissionRequestAttributes> {
    let AdmissionRequest = sequelize.define<i.AdmissionRequestInstance, i.AdmissionRequestAttributes>('AdmissionRequest', {
        Id: { type: DataTypes.BIGINT, field: 'PatientAdmissionRequestId', primaryKey: true, autoIncrement: true },
        RequestIdentifier: { type: DataTypes.STRING, field: 'RequestIdentifier' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        AdvisedDateTime: { type: DataTypes.DATE, field: 'AdvisedDateTime' },
        AdvisedDoctorId: { type: DataTypes.BIGINT, field: 'AdvisedDoctorId' },
        AdvisedDepartmentId: { type: DataTypes.BIGINT, field: 'AdvisedDepartmentId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        AdmissionReasonId: { type: DataTypes.BIGINT, field: 'AdmissionReasonId' },
        OtherReasons: { type: DataTypes.STRING, field: 'OtherReasons' },
        AdmissionRequestTypeId: { type: DataTypes.INTEGER, field: 'AdmissionRequestTypeId' },
        OtherType: { type: DataTypes.STRING, field: 'OtherType' },
        SurgProceduresNotes: { type: DataTypes.STRING, field: 'SurgProceduresNotes' },
        BloodReqId: { type: DataTypes.BIGINT, field: 'BloodReqId' },
        BloodReqNotes: { type: DataTypes.STRING, field: 'BloodReqNotes' },
        ExpectedStayDuration: { type: DataTypes.STRING, field: 'ExpectedStayDuration' },
        ExpectedCost: { type: DataTypes.DECIMAL, field: 'ExpectedCost' },
        PayerId: { type: DataTypes.BIGINT, field: 'PayerId' },
        OtherPayers: { type: DataTypes.STRING, field: 'OtherPayers' },
        NurseInstruction: { type: DataTypes.STRING, field: 'NurseInstruction' },
        OtherInstruction: { type: DataTypes.STRING, field: 'OtherInstruction' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        AdmissionRequestStatusId: { type: DataTypes.INTEGER, field: 'AdmissionRequestStatusId' },
        PriorityId: { type: DataTypes.INTEGER, field: 'PriorityId' },
        AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
        ExceptedDisDate: { type: DataTypes.DATE, field: 'ExceptedDisDate' },
        ALOS: { type: DataTypes.INTEGER, field: 'ALOS' },
        LocationId: { type: DataTypes.INTEGER, field: 'LocationId' },
        WardId: { type: DataTypes.INTEGER, field: 'WardId' },
        RoomId: { type: DataTypes.INTEGER, field: 'RoomId' },
        BedId: { type: DataTypes.INTEGER, field: 'BedId' },
        ServiceRateCategoryId: { type: DataTypes.INTEGER, field: 'ServiceRateCategoryId' },
        Attachment: { type: DataTypes.STRING, field: 'Attachment' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientadmissionrequest',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AdmissionRequest as any).associate = function (models: Models) {
        AdmissionRequest.belongsTo(models.Facility);
        AdmissionRequest.belongsTo(models.Patient);
        AdmissionRequest.belongsTo(models.ServiceRateCategory);
        AdmissionRequest.belongsTo(models.Diagnosis);
        AdmissionRequest.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        AdmissionRequest.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        AdmissionRequest.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        AdmissionRequest.belongsTo(models.User, { as: 'AdvisedDoctor', foreignKey: 'AdvisedDoctorId' });
        AdmissionRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'AdmissionRequestType', targetKey: 'ReferenceValueCodeId' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'AdmittingRequestReason',
        foreignKey: 'AdmissionReasonId', targetKey: 'ReferenceValueCodeId' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'YesNo', foreignKey: 'BloodReqId', targetKey: 'ReferenceValueCodeId' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'Payer', foreignKey: 'PayerId', targetKey: 'ReferenceValueCodeId' });
        AdmissionRequest.belongsTo(models.ReferenceValue, { as: 'AdmissionRequestStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return AdmissionRequest;
}
