import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientProcedureInstance, i.PatientProcedureAttributes> {
    let PatientProcedure = sequelize.define<i.PatientProcedureInstance, i.PatientProcedureAttributes>('PatientProcedure', {
        Id: { type: DataTypes.BIGINT, field: 'PatientProcedureId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ProcedureTypeId: { type: DataTypes.BIGINT, field: 'ProcedureTypeId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PatientProcedureStatusId: { type: DataTypes.BIGINT, field: 'PatientProcedureStatusId' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
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
            tableName: 'patientprocedures',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientProcedure as any).associate = function(models: Models) {
                    PatientProcedure.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
                    PatientProcedure.belongsTo(models.User, { foreignKey: 'PerformedBy' });
                    PatientProcedure.belongsTo(models.ReferenceValue, { as: 'ProcedureType', targetKey: 'ReferenceValueCodeId' });
                    PatientProcedure.belongsTo(models.ReferenceValue, { as: 'PatientProcedureStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientProcedure;
}
