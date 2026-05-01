import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalytemasterInstance, i.AnalytemasterAttributes> {
    let Analytemaster = sequelize.define<i.AnalytemasterInstance, i.AnalytemasterAttributes>('Analytemaster', {
        Id: { type: DataTypes.BIGINT, field: 'AnalyteId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AnalyteTypeId: { type: DataTypes.BIGINT, field: 'AnalyteTypeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        AnalyteuomId: { type: DataTypes.STRING, field: 'AnalyteuomId' },
        Mnemonics: { type: DataTypes.STRING, field: 'Mnemonics' },
        Valuetype_e: { type: DataTypes.BIGINT, field: 'Valuetype_e' },
        Listofvalue: { type: DataTypes.STRING, field: 'Listofvalue' },
        Formula: { type: DataTypes.STRING, field: 'Formula' },
        Displayorder: { type: DataTypes.INTEGER, field: 'Displayorder' },
        Printorder: { type: DataTypes.INTEGER, field: 'Printorder' },
        Excludefromprint: { type: DataTypes.INTEGER, field: 'Excludefromprint' },
        Loinccode: { type: DataTypes.STRING, field: 'Loinccode' },
        Loincname: { type: DataTypes.STRING, field: 'Loincname' },
        Component: { type: DataTypes.STRING, field: 'Component' },
        Methodology: { type: DataTypes.STRING, field: 'Methodology' },
        SampletypeId: { type: DataTypes.BIGINT, field: 'SampletypeId' },
        Graphtype_e: { type: DataTypes.BIGINT, field: 'Graphtype_e' },
        Referencelink: { type: DataTypes.STRING, field: 'Referencelink' },
        Observation: { type: DataTypes.STRING, field: 'Observation' },
        Activefrom: { type: DataTypes.DATE, field: 'Activefrom' },
        Activeto: { type: DataTypes.DATE, field: 'Activeto' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsWrapResult: { type: DataTypes.BOOLEAN, field: 'IsWrapResult' },
        IsTemplates: { type: DataTypes.BOOLEAN, field: 'IsTemplates' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        IsExcelUpload: { type: DataTypes.BOOLEAN, field: 'IsExcelUpload' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'analytemaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Analytemaster as any).associate = function (models: Models) {
        Analytemaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Analytemaster.belongsTo(models.ReferenceValue, { as: 'AnalyteType', targetKey: 'ReferenceValueCodeId' });
        Analytemaster.belongsTo(models.ReferenceValue, { as: 'Analyteuom', targetKey: 'ReferenceValueCodeId' });
        Analytemaster.belongsTo(models.Sampletype, { foreignKey: 'SampletypeId' });
        Analytemaster.belongsToMany(models.Testmaster, { through: models.Testmasteranalytemap }); //correct the map da
        Analytemaster.hasMany(models.Analyterefmaster, { foreignKey: 'AnalyteId' });
        Analytemaster.hasMany(models.AnalyzerAnalyteMap, { foreignKey: 'AnalyteId' });
    };
    return Analytemaster;
}
