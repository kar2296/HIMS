import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.MRDMovementInstance, i.MRDMovementAttributes> {
    let MRDMovement = sequelize.define<i.MRDMovementInstance, i.MRDMovementAttributes>('MRDMovement', {
        Id: { type: DataTypes.BIGINT, field: 'FilemovementId', primaryKey: true, autoIncrement: true },
        TransactionId: { type: DataTypes.STRING, field: 'TransactionId' },
        BarcodeId: { type: DataTypes.STRING, field: 'BarcodeId' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        MRDFileStatusId: { type: DataTypes.BIGINT, field: 'MRDFileStatusId' },
        MRDMovementStatusId: { type: DataTypes.BIGINT, field: 'MRDMovementStatusId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
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
            tableName: 'mrdfilemovement',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (MRDMovement as any).associate = function (models: Models) {
        MRDMovement.belongsTo(models.Patient);
        MRDMovement.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        MRDMovement.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        MRDMovement.belongsTo(models.Department, { as: 'PatientDepartment', foreignKey: 'FromDepartmentId' });
        MRDMovement.belongsTo(models.Department, { as: 'FileLocation', foreignKey: 'ToDepartmentId' });
        MRDMovement.belongsTo(models.ReferenceValue, { as: 'MRDFileStatus', targetKey: 'ReferenceValueCodeId' });
        MRDMovement.belongsTo(models.ReferenceValue, { as: 'MRDMovementStatus', targetKey: 'ReferenceValueCodeId' });
    };

    return MRDMovement;
}
