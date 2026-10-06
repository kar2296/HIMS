import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureInstance, i.ProcedureAttributes> {
    let Procedure = sequelize.define<i.ProcedureInstance, i.ProcedureAttributes>('Procedure', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureId', primaryKey: true, autoIncrement: true },
        ProcedureCodeSchemeId: { type: DataTypes.BIGINT, field: 'ProcedureCodeSchemeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ProcedureVersionId: { type: DataTypes.BIGINT, field: 'ProcedureVersionId' },
        CodeRegionId: { type: DataTypes.BIGINT, field: 'CodeRegionId' },
        Speciality: { type: DataTypes.STRING, field: 'Speciality' },
        Equipments: { type: DataTypes.STRING, field: 'Equipments' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        BodySite: { type: DataTypes.STRING, field: 'BodySite' },
        ProcedureTypeId: { type: DataTypes.BIGINT, field: 'ProcedureTypeId' },
        ProcedureOperationTypeId: { type: DataTypes.BIGINT, field: 'ProcedureOperationTypeId' },
        Duration: { type: DataTypes.STRING, field: 'Duration' },
        ProcedureCategoryId: { type: DataTypes.BIGINT, field: 'ProcedureCategoryId' },
        ProcedureSubCategoryId: { type: DataTypes.BIGINT, field: 'ProcedureSubCategoryId' },
        AnaesthesiaTypeId: { type: DataTypes.BIGINT, field: 'AnaesthesiaTypeId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsBillable: { type: DataTypes.BOOLEAN, field: 'IsBillable' },
        IsFreeText: { type: DataTypes.BOOLEAN, field: 'IsFreeText' },
        IsCathlabProcedures: { type: DataTypes.BOOLEAN, field: 'IsCathlabProcedures' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        TechniqueId: { type: DataTypes.STRING, field: 'TechniqueId' },
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
            tableName: 'procedures',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Procedure as any).associate = function (models: Models) {
        Procedure.belongsTo(models.ReferenceValue, { as: 'ProcedureVersion', targetKey: 'ReferenceValueCodeId' });
        Procedure.belongsTo(models.ReferenceValue, { as: 'ProcedureType', targetKey: 'ReferenceValueCodeId' });
        Procedure.belongsTo(models.ReferenceValue, {
            as: 'ProcedureCategory', targetKey: 'ReferenceValueCodeId'
        });
        Procedure.belongsTo(models.ReferenceValue, {
            as: 'ProcedureSubCategory', targetKey: 'ReferenceValueCodeId'
        });
        Procedure.belongsTo(models.ReferenceValue, {
            as: 'ProcedureTechnique',
            foreignKey: 'TechniqueId', targetKey: 'ReferenceValueCodeId'
        });
        Procedure.belongsTo(models.ReferenceValue, { as: 'ProcedureOperationType', targetKey: 'ReferenceValueCodeId' });
        Procedure.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Procedure.belongsTo(models.Speciality, { as: 'Department', foreignKey: 'Speciality' });
    };
    return Procedure;
}
