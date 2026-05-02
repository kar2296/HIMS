import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClinicalRemarkInstance, i.ClinicalRemarkAttributes> {
    let ClinicalRemark = sequelize.define<i.ClinicalRemarkInstance, i.ClinicalRemarkAttributes>('ClinicalRemark', {
        Id: { type: DataTypes.BIGINT, field: 'ClinicalRemarkId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ClinicalRemarks: { type: DataTypes.STRING, field: 'ClinicalRemarks' },
        ClinicalRemarkTypeId: { type: DataTypes.BIGINT, field: 'ClinicalRemarkTypeId' },
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
            tableName: 'clinicalremarks',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ClinicalRemark as any).associate = function(models: Models) {
                    ClinicalRemark.belongsTo(models.Facility);
                    ClinicalRemark.belongsTo(models.ReferenceValue, { as: 'ClinicalRemarkType', targetKey: 'ReferenceValueCodeId' });
                    ClinicalRemark.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return ClinicalRemark;
}
