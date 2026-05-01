import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RemarkInstance, i.RemarkAttributes> {
    let Remark = sequelize.define<i.RemarkInstance, i.RemarkAttributes>('Remark', {
        Id: { type: DataTypes.BIGINT, field: 'RemarkId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        RemarkTypeId: { type: DataTypes.BIGINT, field: 'RemarkTypeId' },
        ScreenId: { type: DataTypes.BIGINT, field: 'ScreenId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
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
            tableName: 'remarks',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Remark as any).associate = function(models: Models) {
                    Remark.belongsTo(models.Facility);
                    Remark.belongsTo(models.Screen);
                    Remark.belongsTo(models.ReferenceValue, { as: 'RemarkType', targetKey: 'ReferenceValueCodeId' });
                    Remark.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return Remark;
}
