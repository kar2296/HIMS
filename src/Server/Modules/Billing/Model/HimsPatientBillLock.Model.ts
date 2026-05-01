import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientBillLockInstance, i.PatientBillLockAttributes> {
    let PatientBillLock = sequelize.define<i.PatientBillLockInstance, i.PatientBillLockAttributes>('PatientBillLock', {
        Id: { type: DataTypes.BIGINT, field: 'PatientBillLockId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.INTEGER, field: 'EncounterId' },
        PatientId: { type: DataTypes.INTEGER, field: 'PatientId' },
        LockedBy: { type: DataTypes.INTEGER, field: 'LockedBy' },
        UnLockedBy: { type: DataTypes.INTEGER, field: 'UnLockedBy' },
        LockedOn: { type: DataTypes.DATE, field: 'LockedOn' },
        ReleasedOn: { type: DataTypes.DATE, field: 'ReleasedOn' },
        LockStatusId: { type: DataTypes.INTEGER, field: 'LockStatusId' },
        LockTypeId: { type: DataTypes.INTEGER, field: 'LockTypeId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        UnLockComments: { type: DataTypes.STRING, field: 'UnLockComments' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientbilllock',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientBillLock as any).associate = function(models: Models) {
                    PatientBillLock.belongsTo(models.User, { as: 'LockedUser', foreignKey: 'LockedBy' });
                    PatientBillLock.belongsTo(models.User, { as: 'UnLockedUser', foreignKey: 'UnLockedBy' });
                    PatientBillLock.belongsTo(models.ReferenceValue, { as: 'LockType', targetKey: 'ReferenceValueCodeId' });
                    PatientBillLock.belongsTo(models.ReferenceValue, { as: 'LockStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientBillLock;
}
