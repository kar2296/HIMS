import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientStockReturnsInstance, i.PatientStockReturnsAttributes> {
    let PatientStockReturns = sequelize.define<i.PatientStockReturnsInstance,
        i.PatientStockReturnsAttributes>('PatientStockReturns', {
            Id: { type: DataTypes.BIGINT, field: 'PatientStockReturnId', primaryKey: true, autoIncrement: true },
            PatientStockRequestId: { type: DataTypes.BIGINT, field: 'PatientStockRequestId' },
            PatientReturnNumber: { type: DataTypes.STRING, field: 'PatientReturnNumber' },
            PatientReturnDateTime: { type: DataTypes.DATE, field: 'PatientReturnDateTime' },
            PatientReturnTypeId: { type: DataTypes.BIGINT, field: 'PatientReturnTypeId' },
            PatientReturnSubTypeId: { type: DataTypes.BIGINT, field: 'PatientReturnSubTypeId' },
            PatientReturnStatusId: { type: DataTypes.BIGINT, field: 'PatientReturnStatusId' },
            PatientReturnPriorityId: { type: DataTypes.BIGINT, field: 'PatientReturnPriorityId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
            PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            GuarantorName: { type: DataTypes.BIGINT, field: 'GuarantorName' },
            LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            ToStoreId: { type: DataTypes.BIGINT, field: 'ToStoreId' },
            ToStoreName: { type: DataTypes.STRING, field: 'ToStoreName' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
            TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
            TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
            TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
            CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
            ReturnedBy: { type: DataTypes.INTEGER, field: 'ReturnedBy' },
            ReturnedDate: { type: DataTypes.DATE, field: 'ReturnedDate' },
            ReturnerComments: { type: DataTypes.STRING, field: 'ReturnerComments' },
            AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
            AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
            AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
            ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
            RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
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
            tableName: 'patientstockreturns',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientStockReturns as any).associate = function (models: Models) {
        PatientStockReturns.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientStockReturns.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientStockReturns.belongsTo(models.ReferenceValue, {
            as: 'PatientReturnPriority',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientStockReturns.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreId' });
        PatientStockReturns.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientStockReturns.belongsTo(models.Encounter);
        PatientStockReturns.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientStockReturns.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientStockReturns.belongsTo(models.ReferenceValue,
            { as: 'PatientReturnStatus', targetKey: 'ReferenceValueCodeId' });
        PatientStockReturns.belongsTo(models.ReferenceValue,
            { as: 'PatientReturnType', targetKey: 'ReferenceValueCodeId' });
        PatientStockReturns.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientStockReturns.belongsTo(models.User, { as: 'ReturnedUser', foreignKey: 'ReturnedBy' });
        PatientStockReturns.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PatientStockReturns.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        PatientStockReturns.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientStockReturns.hasMany(models.PatientStockReturnDetails);
    };

    return PatientStockReturns;
}
