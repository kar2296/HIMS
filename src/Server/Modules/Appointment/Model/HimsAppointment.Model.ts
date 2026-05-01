import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppointmentInstance, i.AppointmentAttributes> {
    let Appointment = sequelize.define<i.AppointmentInstance, i.AppointmentAttributes>('Appointment', {
        Id: { type: DataTypes.BIGINT, field: 'AppointmentId', primaryKey: true, autoIncrement: true },
        AppointmentTypeId: { type: DataTypes.BIGINT, field: 'AppointmentTypeId' },
        AppointmentStatusId: { type: DataTypes.BIGINT, field: 'AppointmentStatusId' },
        AppointmentDate: { type: DataTypes.DATE, field: 'AppointmentDate' },
        AppointmentCategoryId: { type: DataTypes.BIGINT, field: 'AppointmentCategoryId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        ResourceId: { type: DataTypes.BIGINT, field: 'ResourceId' },
        ResearchProjectId: { type: DataTypes.BIGINT, field: 'ResearchProjectId' },
        IsForceBooking: { type: DataTypes.BOOLEAN, field: 'IsForceBooking' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
        CancelledRemarks: { type: DataTypes.STRING, field: 'CancelledRemarks' },
        IsAssignedToUser: { type: DataTypes.BOOLEAN, field: 'IsAssignedToUser' },
        IsAssignedToGroup: { type: DataTypes.BOOLEAN, field: 'IsAssignedToGroup' },
        IsMRDFile: { type: DataTypes.BOOLEAN, field: 'IsMRDFile' },
        AssignedUserId: { type: DataTypes.BIGINT, field: 'AssignedUserId' },
        AssignedGroupId: { type: DataTypes.BIGINT, field: 'AssignedGroupId' },
        PatientGuarantorId: { type: DataTypes.BIGINT, field: 'PatientGuarantorId' },
        AssignedUserName: { type: DataTypes.STRING, field: 'AssignedUserName' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        ReferralTypeId: { type: DataTypes.BIGINT, field: 'ReferralTypeId' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        IsMrdFileRequest: { type: DataTypes.BOOLEAN, field: 'IsMrdFileRequest' },
        IsEmergency: { type: DataTypes.BOOLEAN, field: 'IsEmergency' },
        IsVirtualAppointments: { type: DataTypes.BOOLEAN, field: 'IsVirtualAppointments' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
        OrderConsultTypeId: { type: DataTypes.BIGINT, field: 'OrderConsultTypeId' },
        IsPaid: { type: DataTypes.BOOLEAN, field: 'IsPaid' },
        IsRescheduled: { type: DataTypes.BOOLEAN, field: 'IsRescheduled' },
        PaymentGatewayRefNo: { type: DataTypes.STRING, field: 'PaymentGatewayRefNo' },
        PaymentModeId: { type: DataTypes.BIGINT, field: 'PaymentModeId' },
        Amount: { type: DataTypes.BIGINT, field: 'Amount' },
        PaymentStatusId: { type: DataTypes.BIGINT, field: 'PaymentStatusId' },
        BankName: { type: DataTypes.STRING, field: 'BankName' },
        CancelorRescheduleComments: { type: DataTypes.STRING, field: 'CancelorRescheduleComments' },
        ApprovalNumber: { type: DataTypes.STRING, field: 'ApprovalNumber' },
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
            tableName: 'appointments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Appointment as any).associate = function (models: Models) {
        Appointment.belongsTo(models.Facility);
        Appointment.belongsTo(models.AppointmentCategory);
        Appointment.belongsTo(models.Patient);
        Appointment.belongsTo(models.Remark);
        Appointment.belongsTo(models.Referral);
        Appointment.belongsTo(models.PatientGuarantor);
        Appointment.belongsTo(models.Department);
        Appointment.hasMany(models.AppointmentDisplay);
        Appointment.belongsTo(models.User, { foreignKey: 'DoctorId' });
        Appointment.belongsTo(models.ResourceMaster, { foreignKey: 'ResourceId' });
        Appointment.belongsTo(models.VirtualOrder, { foreignKey: 'VirtualOrderId' });
        Appointment.belongsTo(models.ReferenceValue, { as: 'AppointmentStatus', targetKey: 'ReferenceValueCodeId' });
        Appointment.belongsTo(models.ReferenceValue, { as: 'AppointmentType', targetKey: 'ReferenceValueCodeId' });
        Appointment.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
        Appointment.belongsTo(models.ReferenceValue, { as: 'VisitType', targetKey: 'ReferenceValueCodeId' });
        Appointment.belongsTo(models.ReferenceValue, { as: 'PaymentMode', targetKey: 'ReferenceValueCodeId' });
        Appointment.belongsTo(models.ReferenceValue, {
            as: 'OrderConsultType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'OrderConsultTypeId'
        });
        Appointment.hasMany(models.Encounter);
        Appointment.hasMany(models.PatientTracker);
        Appointment.belongsTo(models.User, { as: 'UpdatedByUser', foreignKey: 'UpdatedBy' });
        Appointment.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    };
    return Appointment;
}
