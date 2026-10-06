import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ShoulderAssessmentInstance, i.ShoulderAssessmentAttributes> {
    let ShoulderAssessment = sequelize.define<i.ShoulderAssessmentInstance, i.ShoulderAssessmentAttributes>('ShoulderAssessment', {
       Id: { type: DataTypes.BIGINT, field: 'ShoulderAssessmentId', primaryKey: true, autoIncrement: true  },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       Content: { type: DataTypes.STRING, field: 'Content' },
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
            tableName: 'shoulderassessments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ShoulderAssessment as any).associate = function(models: Models) {
               return;
                };
 return ShoulderAssessment;
}
