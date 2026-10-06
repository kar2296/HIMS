import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalyserTemplateInstance, i.AnalyserTemplateAttributes> {
    let AnalyserTemplate = sequelize.define<i.AnalyserTemplateInstance, i.AnalyserTemplateAttributes>('AnalyserTemplate', {
        Id: { type: DataTypes.BIGINT, field: 'AnalyserTemplateId', primaryKey: true, autoIncrement: true },
        AnalyteId: { type: DataTypes.INTEGER, field: 'AnalyteId' },
        GenderId: { type: DataTypes.INTEGER, field: 'GenderId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        NoOfPendingServices: { type: DataTypes.INTEGER, field: 'NoOfPendingServices' },
        AnalyserTemplateTypeId: { type: DataTypes.INTEGER, field: 'AnalyserTemplateTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            timestamps: true,
            tableName: 'analysernormaltemplate',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AnalyserTemplate as any).associate = function (models: Models) {
        AnalyserTemplate.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AnalyserTemplate.belongsTo(models.ReferenceValue, { as: 'AnalyserTemplateType', targetKey: 'ReferenceValueCodeId' });
        AnalyserTemplate.belongsTo(models.ReferenceValue, { as: 'Gender', targetKey: 'ReferenceValueCodeId' });
    };
    return AnalyserTemplate;
}
