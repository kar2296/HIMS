import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientIdentityInstance, i.PatientIdentityAttributes> {
    let PatientIdentity = sequelize.define<i.PatientIdentityInstance, i.PatientIdentityAttributes>('PatientIdentity', {
        Id: { type: DataTypes.BIGINT, field: 'PatientIdentityId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientIdentityTypeId: { type: DataTypes.BIGINT, field: 'PatientIdentityTypeId' },
        IDNumber: { type: DataTypes.STRING, field: 'IDNumber' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        ImagePath: { type: DataTypes.STRING, field: 'ImagePath' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientidentities',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientIdentity as any).associate = function(models: Models) {
                    PatientIdentity.belongsTo(models.ReferenceValue, { as: 'PatientIdentityType', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientIdentity;
}
