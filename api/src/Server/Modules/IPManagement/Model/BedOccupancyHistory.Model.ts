import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BedOccupancyHistoryInstance, i.BedOccupancyHistoryAttributes> {
    let BedOccupancyHistory = sequelize.define<i.BedOccupancyHistoryInstance,
        i.BedOccupancyHistoryAttributes>('BedOccupancyHistory', {
            Id: { type: DataTypes.BIGINT, field: 'BedOccupancyHistoryId', primaryKey: true, autoIncrement: true },
            TransactionIdentifier: { type: DataTypes.STRING, field: 'TransactionIdentifier' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientId: { type: DataTypes.INTEGER, field: 'PatientId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            LocationId: { type: DataTypes.INTEGER, field: 'LocationId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            AdmissionDate: { type: DataTypes.DATE, field: 'AdmissionDate' },
            DischargeDate: { type: DataTypes.DATE, field: 'DischargeDate' },
            OccupancyStatusId: { type: DataTypes.BIGINT, field: 'OccupancyStatusId' },
            ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
            AdmitStatusId: { type: DataTypes.BIGINT, field: 'AdmitStatusId' },
            IsPrimaryBed: { type: DataTypes.BOOLEAN, field: 'IsPrimaryBed' },
            BillingStartDate: { type: DataTypes.DATE, field: 'BillingStartDate' },
            BillingEndDate: { type: DataTypes.DATE, field: 'BillingEndDate' },
            BillingAmount: { type: DataTypes.DECIMAL, field: 'BillingAmount' },
            IsDoubleOccupancy: { type: DataTypes.BOOLEAN, field: 'IsDoubleOccupancy' },
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
                tableName: 'bedoccupancyhistory',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (BedOccupancyHistory as any).associate = function (models: Models) {
        BedOccupancyHistory.belongsTo(models.Patient);
        BedOccupancyHistory.belongsTo(models.Encounter);
        BedOccupancyHistory.belongsTo(models.ServiceRateCategory);
        BedOccupancyHistory.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        BedOccupancyHistory.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        BedOccupancyHistory.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        BedOccupancyHistory.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        BedOccupancyHistory.belongsTo(models.User, { as: 'Created', foreignKey: 'CreatedBy' });
    };
    return BedOccupancyHistory;
}
