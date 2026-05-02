import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TemplateMasterDetailInstance, i.TemplateMasterDetailAttributes> {
    let TemplateMasterDetail = sequelize.define<i.TemplateMasterDetailInstance, i.TemplateMasterDetailAttributes>('TemplateMasterDetail', {
        Id: { type: DataTypes.BIGINT, field: 'TemplateMasterDetailId', primaryKey: true, autoIncrement: true },
        TemplateMasterId: { type: DataTypes.BIGINT, field: 'TemplateMasterId' },
        TemplateTypeId: { type: DataTypes.BIGINT, field: 'TemplateTypeId' },
        ItemId: { type: DataTypes.BIGINT, field: 'ItemId' },
        DrugGenericId: { type: DataTypes.BIGINT, field: 'DrugGenericId' },
        DrugGenericName: { type: DataTypes.STRING, field: 'DrugGenericName' },
        DisplayName: { type: DataTypes.STRING, field: 'DisplayName' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Morning: { type: DataTypes.STRING, field: 'Morning' },
        Noon: { type: DataTypes.STRING, field: 'Noon' },
        Night: { type: DataTypes.STRING, field: 'Night' },
        Duration: { type: DataTypes.INTEGER, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        DrugInstructionId: { type: DataTypes.BIGINT, field: 'DrugInstructionId' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        TestTypeId: { type: DataTypes.BIGINT, field: 'TestTypeId' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        TestInstruction: { type: DataTypes.STRING, field: 'TestInstruction' },
        ClinicalData: { type: DataTypes.STRING, field: 'ClinicalData' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
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
            tableName: 'hims_templatemasterdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return TemplateMasterDetail;
}
