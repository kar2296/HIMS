import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.WorkOrderObservationInstance, i.WorkOrderObservationAttributes> {
    let WorkOrderObservation = sequelize.define<i.WorkOrderObservationInstance, i.WorkOrderObservationAttributes>('WorkOrderObservation', {
        Id: { type: DataTypes.BIGINT, field: 'WorkOrderObservationId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
        WorkOrderDetailId: { type: DataTypes.BIGINT, field: 'WorkOrderDetailId' },
        ObservationDate: { type: DataTypes.DATE, field: 'ObservationDate' },
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
            tableName: 'workorderobservations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return WorkOrderObservation;
}
