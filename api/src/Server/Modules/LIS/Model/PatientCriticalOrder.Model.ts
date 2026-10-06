import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientCriticalOrderInstance, i.PatientCriticalOrderAttributes> {
    let PatientCriticalOrder = sequelize.define<i.PatientCriticalOrderInstance, i.PatientCriticalOrderAttributes>('PatientCriticalOrder', {
        Id: { type: DataTypes.BIGINT, field: 'PatientCriticalOrderId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
        PatientOrderDetailId: { type: DataTypes.BIGINT, field: 'PatientOrderDetailId' },
        PatientWorkOrderId: { type: DataTypes.BIGINT, field: 'PatientWorkOrderId' },
        PatientWorkOrderDetailId: { type: DataTypes.BIGINT, field: 'PatientWorkOrderDetailId' },
        TestId: { type: DataTypes.BIGINT, field: 'TestId' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteId' },
        AnalyteName: { type: DataTypes.STRING, field: 'AnalyteName' },
        Resultvalue: { type: DataTypes.STRING, field: 'Resultvalue' },
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
            tableName: 'hims_patientcriticalorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientCriticalOrder as any).associate = function (models: Models) {
        PatientCriticalOrder.belongsTo(models.Patient);
        PatientCriticalOrder.belongsTo(models.PatientOrder, { foreignKey: 'PatientOrderId' });
        PatientCriticalOrder.belongsTo(models.PatientOrderDetail, { foreignKey: 'PatientOrderDetailId' });
        PatientCriticalOrder.belongsTo(models.PatientWorkorder, { foreignKey: 'PatientWorkOrderId' });
        PatientCriticalOrder.belongsTo(models.PatientWorkorderdetails, { foreignKey: 'PatientWorkOrderDetailId' });

    };
    return PatientCriticalOrder;
}
