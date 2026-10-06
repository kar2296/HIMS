import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientCommentInstance, i.PatientCommentAttributes> {
    let PatientComment = sequelize.define<i.PatientCommentInstance, i.PatientCommentAttributes>('PatientComment', {
        Id: { type: DataTypes.BIGINT, field: 'PatientCommentsId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        CommentsTypeId: { type: DataTypes.BIGINT, field: 'CommentsTypeId' },
        CommentOn: { type: DataTypes.DATE, field: 'CommentOn' },
        CommentBy: { type: DataTypes.BIGINT, field: 'CommentBy' },
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
            tableName: 'patientcomments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientComment as any).associate = function (models: Models) {
        PatientComment.belongsTo(models.ReferenceValue, { as: 'CommentsType', targetKey: 'ReferenceValueCodeId' });
        PatientComment.belongsTo(models.User, { as: 'CommentUser', foreignKey: 'CommentBy' });
    };
    return PatientComment;
}
