import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDietNbmInstance, i.PatientDietNbmAttributes> {
    let PatientDietNbm = sequelize.define<i.PatientDietNbmInstance, i.PatientDietNbmAttributes>('PatientDietNbm', {
        Id: { type: DataTypes.BIGINT, field: 'PatientNBMId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        PatientDietNbmTypeId: { type: DataTypes.BIGINT, field: 'PatientDietNbmTypeId' },
        InvokedBy: { type: DataTypes.INTEGER, field: 'InvokedBy' },
        InvokedOn: { type: DataTypes.DATE, field: 'InvokedOn' },
        RevokedBy: { type: DataTypes.INTEGER, field: 'RevokedBy' },
        RevokedOn: { type: DataTypes.DATE, field: 'RevokedOn' },
        PatientDietNbmStatusId: { type: DataTypes.BIGINT, field: 'PatientDietNbmStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'patientdietnbm',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientDietNbm as any).associate = function(models: Models) {
                    PatientDietNbm.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'InvokedBy' });
                    PatientDietNbm.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'RevokedBy' });

                };
 return PatientDietNbm;
}
