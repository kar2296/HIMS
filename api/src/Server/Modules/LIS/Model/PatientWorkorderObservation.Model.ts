import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientWorkorderObservationInstance, i.PatientWorkorderObservationAttributes> {
    let PatientWorkorderObservation
        = sequelize.define<i.PatientWorkorderObservationInstance, i.PatientWorkorderObservationAttributes>('PatientWorkorderObservation', {
            Id: { type: DataTypes.BIGINT, field: 'ObservationId', primaryKey: true, autoIncrement: true },
            OrderdetailId: { type: DataTypes.BIGINT, field: 'OrderdetailId' },
            EncounterorderId: { type: DataTypes.BIGINT, field: 'EncounterorderId' },
            DisplayOrder: { type: DataTypes.BIGINT, field: 'DisplayOrder' },
            Observations: { type: DataTypes.STRING, field: 'Observations' },
            ObservationType: { type: DataTypes.BIGINT, field: 'ObservationType' },
            ObservationDid: { type: DataTypes.BIGINT, field: 'ObservationDid' },
            ObservationName: { type: DataTypes.STRING, field: 'ObservationName' },
            MCH: { type: DataTypes.STRING, field: 'MCH' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            Reason: { type: DataTypes.STRING, field: 'Reason' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'patientworkorderobservation',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });



    return PatientWorkorderObservation;
}
