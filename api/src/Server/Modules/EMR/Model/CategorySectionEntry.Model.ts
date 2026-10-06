import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CategorySectionEntryInstance, i.CategorySectionEntryAttributes> {
    let CategorySectionEntry = sequelize.define<i.CategorySectionEntryInstance, i.CategorySectionEntryAttributes>('CategorySectionEntry', {
        Id: { type: DataTypes.BIGINT, field: 'CategorySectionEntryId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        IPCasesheetId: { type: DataTypes.BIGINT, field: 'IPCasesheetId' },
        IPCasesheetAt: { type: DataTypes.DATE, field: 'IPCasesheetAt' },
        IPCasesheetUserId: { type: DataTypes.INTEGER, field: 'IPCasesheetUserId' },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        PhysioRegisterId: { type: DataTypes.BIGINT, field: 'PhysioRegisterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId' },
        CategoryKey: { type: DataTypes.STRING, field: 'CategoryKey' },
        ConceptKey: { type: DataTypes.STRING, field: 'ConceptKey' },
        TermKey: { type: DataTypes.STRING, field: 'TermKey' },
        ResultValue: { type: DataTypes.STRING, field: 'ResultValue' },
        ResultBinary: { type: DataTypes.STRING, field: 'ResultBinary' },
        ResultPath: { type: DataTypes.STRING, field: 'ResultPath' },
        EntryDate: { type: DataTypes.DATE, field: 'EntryDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ResultValueJSON: { type: DataTypes.STRING, field: 'ResultValueJSON' },
        TermName: { type: DataTypes.STRING, field: 'TermName' },
        ResultValueRichText: { type: DataTypes.STRING, field: 'ResultValueRichText' },
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
            tableName: 'categorysectionentries',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (CategorySectionEntry as any).associate = function(models: Models) {
            CategorySectionEntry.belongsTo(models.Category,
                { foreignKey: 'CategoryKey', as: 'Category', targetKey: 'CategoryIdentifier' });
            CategorySectionEntry.belongsTo(models.Concept,
                { foreignKey: 'ConceptKey', as: 'Concept', targetKey: 'ConceptIdentifier' });
        CategorySectionEntry.belongsTo(models.User,
            { foreignKey: 'CreatedBy', as: 'CreatedUser' });
        CategorySectionEntry.belongsTo(models.Encounter,
            { foreignKey: 'EncounterId' });
        };



    return CategorySectionEntry;
}
