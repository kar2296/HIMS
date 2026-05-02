export interface Screen {
    Title: string;
    ControllerName : string;
    InitAction: any;
    FetchAction: any;
    AddAction: any;
    EditAction: any;
    DeleteAction: any;
    GridConfig: any;
    FilterConfig: any;
    Localization : any;
}

export interface FormScreen {
    Title: string;
    ControllerName : string;
    InitAction: any;
    FetchAction: any;
    AddAction: any;
    UpdateAction: any;
    ParentScreen: any;
    Panels: any;
    Localization : any;
}

export interface MapFormScreen {
    Title: string;
    ControllerName : string;
    InitAction: any;
    FetchAction: any;
    MapAction: any;
    ParentScreen: any;
    MapControl: any;
    Localization : any;
}

export interface ScreenMeta {
    Name: string;
    Type : string;
}
export interface Module {
    ModuleName: string;
    Screens: Array<ScreenMeta>;
}
export interface Context {
    Modules: Array<Module>;
}

