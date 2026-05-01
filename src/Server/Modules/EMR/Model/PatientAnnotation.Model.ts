import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAnnotationInstance, i.PatientAnnotationAttributes> {
    let PatientAnnotation = sequelize.define<i.PatientAnnotationInstance, i.PatientAnnotationAttributes>('PatientAnnotation', {
       Id: { type: DataTypes.BIGINT, field: 'PatientAnnotationId', primaryKey: true, autoIncrement: true  },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       AnnotationTypeId: { type: DataTypes.BIGINT, field: 'AnnotationTypeId' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
       PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
       AnnotationStatusId: { type: DataTypes.BIGINT, field: 'AnnotationStatusId' },
       FilePath: { type:DataTypes.STRING, field: 'FilePath'},
       IsPHR: { type: DataTypes.BOOLEAN, field: 'IsPHR' },
       Annotations: { type: DataTypes.STRING, field: 'Annotations' },
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
            tableName: 'patientannotations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientAnnotation as any).associate = function(models: Models) {
                    PatientAnnotation.belongsTo(models.ReferenceValue, { as: 'AnnotationType', targetKey: 'ReferenceValueCodeId' });
                    PatientAnnotation.belongsTo(models.ReferenceValue, { as: 'AnnotationStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientAnnotation.belongsTo(models.User, { foreignKey: 'PerformedBy' });
                };
 return PatientAnnotation;
}
