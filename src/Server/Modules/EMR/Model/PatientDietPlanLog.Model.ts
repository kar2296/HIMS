import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDietPlanLogInstance, i.PatientDietPlanLogAttributes> {
    let PatientDietPlanLog = sequelize.define<i.PatientDietPlanLogInstance, i.PatientDietPlanLogAttributes>('PatientDietPlanLog', {
        Id: { type: DataTypes.BIGINT, field: 'PatientDietPlanlogId', primaryKey: true, autoIncrement: true },
        PatientDietPlanId: { type: DataTypes.BIGINT, field: 'PatientDietPlanId' },
        PatientDietPlanStatusId: { type: DataTypes.BIGINT, field: 'PatientDietPlanStatusId' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
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
            tableName: 'patientdietplanlog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return PatientDietPlanLog;
}
