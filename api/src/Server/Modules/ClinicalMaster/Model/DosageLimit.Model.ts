import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DosageLimitInstance, i.DosageLimitAttributes> {
    let DosageLimit = sequelize.define<i.DosageLimitInstance, i.DosageLimitAttributes>('DosageLimit', {
        Id: { type: DataTypes.BIGINT, field: 'DosageLimitId', primaryKey: true, autoIncrement: true },
        DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        DrugAgeGroupId: { type: DataTypes.BIGINT, field: 'DrugAgeGroupId' },
        UpperLimit: { type: DataTypes.STRING, field: 'UpperLimit' },
        LowerLimit: { type: DataTypes.STRING, field: 'LowerLimit' },
        MaximumDosagePerDay: { type: DataTypes.STRING, field: 'MaximumDosagePerDay' },
        BodyWeight: { type: DataTypes.STRING, field: 'BodyWeight' },
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
            tableName: 'dosagelimits',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DosageLimit as any).associate = function(models: Models) {
                    DosageLimit.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
                    DosageLimit.belongsTo(models.ReferenceValue, { as: 'DrugAgeGroup', targetKey: 'ReferenceValueCodeId' });
                };
 return DosageLimit;
}
