import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDispenseInstance, i.PatientDispenseAttributes> {
    let PatientDispense = sequelize.define<i.PatientDispenseInstance, i.PatientDispenseAttributes>('PatientDispense', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDispenseId', primaryKey: true, autoIncrement: true },
        PatientStockRequestId: { type: DataTypes.BIGINT, field: 'PatientStockRequestId' },
        PatientRequestNumber: { type: DataTypes.STRING, field: 'PatientRequestNumber' },
        DispenseNumber: { type: DataTypes.STRING, field: 'DispenseNumber' },
        DispenseDateTime: { type: DataTypes.DATE, field: 'DispenseDateTime' },
        DispensedBy: { type: DataTypes.INTEGER, field: 'DispensedBy' },
        DispenseTypeId: { type: DataTypes.BIGINT, field: 'DispenseTypeId' },
        DispensePriorityId: { type: DataTypes.BIGINT, field: 'DispensePriorityId' },
        DispensedValue: { type: DataTypes.DECIMAL, field: 'DispensedValue' },
        DispensedCounterId: { type: DataTypes.BIGINT, field: 'DispensedCounterId' },
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        TotalNetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'TotalNetAmountBeforeGst' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDateTime: { type: DataTypes.DATE, field: 'ApprovedDateTime' },
        DispenseStatusId: { type: DataTypes.BIGINT, field: 'DispenseStatusId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
        OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        WardId: { type: DataTypes.BIGINT, field: 'WardId' },
        RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
        BedId: { type: DataTypes.BIGINT, field: 'BedId' },
        OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
        RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        NetPatientAmount: { type: DataTypes.DECIMAL, field: 'NetPatientAmount' },
        NetInsuranceAmount: { type: DataTypes.DECIMAL, field: 'NetInsuranceAmount' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientdispenses',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientDispense as any).associate = function (models: Models) {
        PatientDispense.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientDispense.belongsTo(models.SurgeryEntry, { foreignKey: 'OTRegisterId' });
        PatientDispense.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDispense.belongsTo(models.StoreMaster, { as: 'DispenseStore', foreignKey: 'StoreMasterId' });
        PatientDispense.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientDispense.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientDispense.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientDispense.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientDispense.belongsTo(models.ReferenceValue, { as: 'DispenseStatus', targetKey: 'ReferenceValueCodeId' });
        //PatientDispense.belongsTo(models.ReferenceValue, { as: 'DispenseType', targetKey: 'ReferenceValueCodeId' });
        //PatientDispense.belongsTo(models.ReferenceValue, { as: 'DispensePriority', targetKey: 'ReferenceValueCodeId' });
        PatientDispense.belongsTo(models.User, { as: 'DispensedUser', foreignKey: 'DispensedBy' });
        PatientDispense.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PatientDispense.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientDispense.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientDispense.belongsTo(models.PatientStockRequests, { foreignKey: 'PatientStockRequestId' });
        PatientDispense.hasMany(models.PatientDispenseDetails);
    };

    return PatientDispense;
}
