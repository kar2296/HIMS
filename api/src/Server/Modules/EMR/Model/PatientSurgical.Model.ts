import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientSurgicalInstance, i.PatientSurgicalAttributes> {
    let PatientSurgical = sequelize.define<i.PatientSurgicalInstance, i.PatientSurgicalAttributes>('PatientSurgical', {
        Id: { type: DataTypes.BIGINT, field: 'PatientSurgicalId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ProcedureTypeId: { type: DataTypes.BIGINT, field: 'ProcedureTypeId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        PatientSurgicalStatusId: { type: DataTypes.BIGINT, field: 'PatientSurgicalStatusId' },
        PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
        PerformedBy: { type: DataTypes.STRING, field: 'PerformedBy' },
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
            tableName: 'hims_patientsurgicals',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientSurgical as any).associate = function (models: Models) {
        PatientSurgical.belongsTo(models.Procedure, { foreignKey: 'ProcedureId' });
        PatientSurgical.belongsTo(models.ReferenceValue, { as: 'ProcedureType', targetKey: 'ReferenceValueCodeId' });
        PatientSurgical.belongsTo(models.ReferenceValue, { as: 'PatientSurgicalStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientSurgical;
}
