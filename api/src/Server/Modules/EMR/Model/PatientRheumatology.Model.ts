import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientRheumatologyInstance, i.PatientRheumatologyAttributes> {
    let PatientRheumatology = sequelize.define<i.PatientRheumatologyInstance, i.PatientRheumatologyAttributes>('PatientRheumatology', {
       Id: { type: DataTypes.BIGINT, field: 'PatientRheumatologyId', primaryKey: true, autoIncrement: true  },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       Name: { type: DataTypes.STRING, field: 'Name' },
       PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
       PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
       Annotations: { type: DataTypes.STRING, field: 'Annotations' },
       RheumatologyStatusId: { type: DataTypes.BIGINT, field: 'RheumatologyStatusId' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            classMethods: {},
            timestamps: true,
            tableName: 'patientrheumatology',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (PatientRheumatology as any).associate = function(models: Models) {
            PatientRheumatology.belongsTo(models.ReferenceValue, { as: 'RheumatologyStatus', targetKey: 'ReferenceValueCodeId' });
        };

    return PatientRheumatology;
}
