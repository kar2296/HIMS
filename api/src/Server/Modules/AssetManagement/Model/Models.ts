import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        Asset: SequelizeStatic.Model<i.AssetInstance, i.AssetAttributes>;
        EquipmentList: SequelizeStatic.Model<i.EquipmentListInstance, i.EquipmentListAttributes>;
        AssetWarranty: SequelizeStatic.Model<i.AssetWarrantyInstance, i.AssetWarrantyAttributes>;
        AssetMaintanance: SequelizeStatic.Model<i.AssetMaintananceInstance, i.AssetMaintananceAttributes>;
        AssetAccessories: SequelizeStatic.Model<i.AssetAccessoriesInstance, i.AssetAccessoriesAttributes>;
        AssetDocument: SequelizeStatic.Model<i.AssetDocumentInstance, i.AssetDocumentAttributes>;
        AssetTransfer: SequelizeStatic.Model<i.AssetTransferInstance, i.AssetTransferAttributes>;
        ServiceRequest: SequelizeStatic.Model<i.ServiceRequestInstance, i.ServiceRequestAttributes>;
        AssetAudit: SequelizeStatic.Model<i.AssetAuditInstance, i.AssetAuditAttributes>;
        AssetAuditDetail: SequelizeStatic.Model<i.AssetAuditDetailInstance, i.AssetAuditDetailAttributes>;
        EscalationMatrix: SequelizeStatic.Model<i.EscalationMatrixInstance, i.EscalationMatrixAttributes>;
        GatePass: SequelizeStatic.Model<i.GatePassInstance, i.GatePassAttributes>;
        AssetDispose: SequelizeStatic.Model<i.AssetDisposeInstance, i.AssetDisposeAttributes>;
        AssetInsurance: SequelizeStatic.Model<i.AssetInsuranceInstance, i.AssetInsuranceAttributes>;
        Preferences: SequelizeStatic.Model<i.PreferencesInstance, i.PreferencesAttributes>;
        NewAssetRequest: SequelizeStatic.Model<i.NewAssetRequestInstance, i.NewAssetRequestAttributes>;
    }
}
