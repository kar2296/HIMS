import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SequenceMastersInstance, i.SequenceMastersAttributes> {
    let SequenceMasters = sequelize.define<i.SequenceMastersInstance, i.SequenceMastersAttributes>('SequenceMasters', {
        Id: { type: DataTypes.BIGINT, field: 'SequenceId', primaryKey: true, autoIncrement: true },
        SeqName: { type: DataTypes.STRING, field: 'SeqName' },
        TableName: { type: DataTypes.STRING, field: 'TableName' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        SeqPrefix: { type: DataTypes.STRING, field: 'SeqPrefix' },
        SeqSuffix: { type: DataTypes.STRING, field: 'SeqSuffix' },
        SeqStartId: { type: DataTypes.BIGINT, field: 'SeqStartId' },
        SeqLastId: { type: DataTypes.BIGINT, field: 'SeqLastId' },
        SeqBaseId: { type: DataTypes.BIGINT, field: 'SeqBaseId' },
        IsDailyReset: { type: DataTypes.BOOLEAN, field: 'IsDailyReset' },
        SeqIncSize: { type: DataTypes.INTEGER, field: 'SeqIncSize' },
        SeqBlockSize: { type: DataTypes.INTEGER, field: 'SeqBlockSize' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        IdFormat: { type: DataTypes.STRING, field: 'IdFormat' },
        Timestamp: { type: DataTypes.DATE, field: 'Timestamp' },
        ReseedInterval: { type: DataTypes.INTEGER, field: 'ReseedInterval' },
        LastReseedDate: { type: DataTypes.DATE, field: 'LastReseedDate' },
        CollectionId: { type: DataTypes.BIGINT, field: 'CollectionId' },
        OwnerOrganisationId: { type: DataTypes.BIGINT, field: 'OwnerOrganisationId' },
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
            tableName: 'sequencemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (SequenceMasters as any).associate = function (models: Models) {
        SequenceMasters.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
    };
    return SequenceMasters;
}
