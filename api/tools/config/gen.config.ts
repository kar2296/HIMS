import {ProjectConfig} from './project.config';

export class GenConfig extends ProjectConfig {

    TEMPLATE_DIR = `${this.TOOLS_DIR}/generator/templates`;
    GEN_CODE_DIR = `${this.TOOLS_DIR}/generator/code`;

    MODULE_TEMPLATE_BASEPATH = `${this.TEMPLATE_DIR}/Module`;
    MODEL_TEMPLDATE_FILE = `${this.TEMPLATE_DIR}/model.hbr`;
    BO_TEMPLDATE_FILE = `${this.TEMPLATE_DIR}/bo.hbr`;
    SERVICE_TEMPLDATE_FILE = `${this.TEMPLATE_DIR}/service.hbr`;
    WEB_TEMPLATE_BASEPATH = `${this.TEMPLATE_DIR}/UI`;

    GEN_CODE_MODULE_DIR = `${this.GEN_CODE_DIR}/Modules`;
    GEN_CODE_MODEL_DIR = `${this.GEN_CODE_DIR}/model`;
    GEN_CODE_BO_DIR = `${this.GEN_CODE_DIR}/bo`;
    GEN_CODE_SERVICE_DIR = `${this.GEN_CODE_DIR}/service`;
    GEN_CODE_WEB_DIR = `${this.GEN_CODE_DIR}/web`;

    constructor() {
        super();
    }
}
