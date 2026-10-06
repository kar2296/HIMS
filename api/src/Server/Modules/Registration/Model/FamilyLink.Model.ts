import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FamilyLinkInstance, i.FamilyLinkAttributes> {
    let FamilyLink = sequelize.define<i.FamilyLinkInstance, i.FamilyLinkAttributes>('FamilyLink', {
        Id: { type: DataTypes.BIGINT, field: 'FamilyLinkId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        MemberId: { type: DataTypes.BIGINT, field: 'MemberId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        Age: { type: DataTypes.BIGINT, field: 'Age' },
        Gender: { type: DataTypes.STRING, field: 'Gender' },
        MRN: { type: DataTypes.STRING, field: 'MRN' },
        RelationshipId: { type: DataTypes.BIGINT, field: 'RelationshipId' },
        NationalId: { type: DataTypes.BIGINT, field: 'NationalId' },
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
            tableName: 'familylinks',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FamilyLink as any).associate = function(models: Models) {
                    FamilyLink.belongsTo(models.Encounter, { as: 'PatientEncounter', foreignKey: 'MemberId', targetKey: 'PatientId' });
                };
 return FamilyLink;
}
