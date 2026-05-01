import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDispenseReturnInstance, i.PatientDispenseReturnAttributes> {
    let PatientDispenseReturn = sequelize.define<i.PatientDispenseReturnInstance,
        i.PatientDispenseReturnAttributes>('PatientDispenseReturn', {
            Id: { type: DataTypes.BIGINT, field: 'PatientDispenseReturnId', primaryKey: true, autoIncrement: true },
            PatientStockReturnId: { type: DataTypes.BIGINT, field: 'PatientStockReturnId' },
            PatientReturnNumber: { type: DataTypes.STRING, field: 'PatientReturnNumber' },
            DispenseReturnNumber: { type: DataTypes.STRING, field: 'DispenseReturnNumber' },
            DispenseReturnDateTime: { type: DataTypes.DATE, field: 'DispenseReturnDateTime' },
            DispenseReturnTypeId: { type: DataTypes.BIGINT, field: 'DispenseReturnTypeId' },
            ReturnReceivedBy: { type: DataTypes.INTEGER, field: 'ReturnReceivedBy' },
            ReturnedValue: { type: DataTypes.DECIMAL, field: 'ReturnedValue' },
            ReceivedValue: { type: DataTypes.DECIMAL, field: 'ReceivedValue' },
            OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
            ReceivedCounterId: { type: DataTypes.BIGINT, field: 'ReceivedCounterId' },
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
            DispenseReturnStatusId: { type: DataTypes.BIGINT, field: 'DispenseReturnStatusId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
            OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
            LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
            RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
            NetPatientAmount: { type: DataTypes.DECIMAL, field: 'NetPatientAmount' },
            NetInsuranceAmount: { type: DataTypes.DECIMAL, field: 'NetInsuranceAmount' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
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
                tableName: 'patientdispensereturns',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientDispenseReturn as any).associate = function (models: Models) {
        PatientDispenseReturn.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientDispenseReturn.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDispenseReturn.belongsTo(models.StoreMaster, { as: 'ReceivedStore', foreignKey: 'StoreMasterId' });
        PatientDispenseReturn.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientDispenseReturn.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientDispenseReturn.belongsTo(models.ReferenceValue, { as: 'DispenseReturnStatus', targetKey: 'ReferenceValueCodeId' });
        PatientDispenseReturn.belongsTo(models.ReferenceValue, { as: 'DispenseReturnType', targetKey: 'ReferenceValueCodeId' });
        PatientDispenseReturn.belongsTo(models.ReferenceValue, { as: 'DispenseReturnPriority', targetKey: 'ReferenceValueCodeId' });
        PatientDispenseReturn.belongsTo(models.User, { as: 'ReturnReceivedUser', foreignKey: 'ReturnReceivedBy' });
        PatientDispenseReturn.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PatientDispenseReturn.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientDispenseReturn.belongsTo(models.PatientStockReturns, { foreignKey: 'PatientStockReturnId' });
        PatientDispenseReturn.hasMany(models.PatientDispenseReturnDetails);
    };

    return PatientDispenseReturn;
}
