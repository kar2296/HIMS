import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TestdiagnosismappingInstance, i.TestdiagnosismappingAttributes> {
    let Testdiagnosismapping = sequelize.define<i.TestdiagnosismappingInstance, i.TestdiagnosismappingAttributes>('Testdiagnosismapping', {
        Id: { type: DataTypes.BIGINT, field: 'TestdiagnosismapId', primaryKey: true, autoIncrement: true },
        TestMasterId: { type: DataTypes.BIGINT, field: 'TestmasterId' },
        DiagnosisCodeTypeId: { type: DataTypes.BIGINT, field: 'DiagnosisCodeTypeId' },
        DiagnosisCodeSchemeId: { type: DataTypes.INTEGER, field: 'DiagnosisCodeSchemeId' },
        DiagnosisId: { type: DataTypes.BIGINT, field: 'DiagnosisId' },
        DiagnosisName: { type: DataTypes.STRING, field: 'Diagnosisname' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ActiveFrom: { type: DataTypes.DATE, field: 'Activefrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'Activeto' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'testdiagnosismapping',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Testdiagnosismapping as any).associate = function(models: Models) {
                    Testdiagnosismapping.belongsTo(models.Diagnosis, { as: 'Diagnosis', foreignKey: 'DiagnosisId' });
                    Testdiagnosismapping.belongsTo(models.ReferenceValue, { as: 'DiagnosisCodeScheme', targetKey: 'ReferenceValueCodeId' });
                    Testdiagnosismapping.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Testdiagnosismapping;
}
