import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientIntakeOutputInstance, i.PatientIntakeOutputAttributes> {
    let PatientIntakeOutput = sequelize.define<i.PatientIntakeOutputInstance, i.PatientIntakeOutputAttributes>('PatientIntakeOutput', {
       Id: { type: DataTypes.BIGINT, field: 'PatientIntakeOutputId', primaryKey: true, autoIncrement: true  },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       IntakeOutputTime: { type: DataTypes.DATE, field: 'IntakeOutputTime' },
       IntakeOutputTypeId: { type: DataTypes.BIGINT, field: 'IntakeOutputTypeId' },
       IntakeTypeId: { type: DataTypes.BIGINT, field: 'IntakeTypeId' },
       IntakeVolume: { type: DataTypes.BIGINT, field: 'IntakeVolume' },
       OutputTypeId: { type: DataTypes.BIGINT, field: 'OutputTypeId' },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       OutputVolume: { type: DataTypes.BIGINT, field: 'OutputVolume' },
       Signatory: { type: DataTypes.STRING, field: 'Signatory' },
       CapturedBy: { type: DataTypes.BIGINT, field: 'CapturedBy' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
        IntakeOutputStatusId: { type: DataTypes.INTEGER, field: 'IntakeOutputStatusId' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientintakeoutputs',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientIntakeOutput as any).associate = function (models: Models) {
        PatientIntakeOutput.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientIntakeOutput.belongsTo(models.Encounter);
                    PatientIntakeOutput.belongsTo(models.ReferenceValue, { as: 'IntakeOutputType', targetKey: 'ReferenceValueCodeId' });
                    PatientIntakeOutput.belongsTo(models.ReferenceValue, { as: 'IntakeType', targetKey: 'ReferenceValueCodeId' });
                    PatientIntakeOutput.belongsTo(models.ReferenceValue, { as: 'IntakeOutputStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientIntakeOutput.belongsTo(models.ReferenceValue, { as: 'OutputType', targetKey: 'ReferenceValueCodeId' });
                    PatientIntakeOutput.belongsTo(models.User, { as: 'CapturedById', foreignKey: 'CapturedBy' });
                };
 return PatientIntakeOutput;
}
