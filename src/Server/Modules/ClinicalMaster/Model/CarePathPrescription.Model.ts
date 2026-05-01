import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathPrescriptionInstance, i.CarePathPrescriptionAttributes> {
    let CarePathPrescription = sequelize.define<i.CarePathPrescriptionInstance,
        i.CarePathPrescriptionAttributes>('CarePathPrescription', {
            Id: { type: DataTypes.BIGINT, field: 'CarePathPrescriptionId', primaryKey: true, autoIncrement: true },
            CarePathId: { type: DataTypes.BIGINT, field: 'CarePathId' },
            DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
            DrugRouteId: { type: DataTypes.BIGINT, field: 'DrugRouteId' },
            DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
            GenericName: { type: DataTypes.STRING, field: 'GenericName' },
            GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
            DrugName: { type: DataTypes.STRING, field: 'DrugName' },
            Dosage: { type: DataTypes.STRING, field: 'Dosage' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            Duration: { type: DataTypes.INTEGER, field: 'Duration' },
            DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            IsGeneric: { type: DataTypes.BOOLEAN, field: 'IsGeneric' },
            IsManditory: { type: DataTypes.BOOLEAN, field: 'IsManditory' },
            ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'carepathprescriptions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePathPrescription as any).associate = function(models: Models) {
                    CarePathPrescription.belongsTo(models.GenericMaster, { foreignKey: 'GenericId' });
                    CarePathPrescription.belongsTo(models.DrugMaster, { foreignKey: 'DrugId' });
                    CarePathPrescription.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePathPrescription.belongsTo(models.ReferenceValue, { as: 'DrugFrequency', targetKey: 'ReferenceValueCodeId' });
                    CarePathPrescription.belongsTo(models.ReferenceValue, { as: 'DrugRoute', targetKey: 'ReferenceValueCodeId' });
                    CarePathPrescription.belongsTo(models.DrugFrequency, { foreignKey: 'DrugFrequencyId' });
               };
 return CarePathPrescription;
}
