import { IApplicationConfig } from './BaseConfig';
import { join } from 'path';

export const AppConfig: IApplicationConfig = {
    AppBase: '/',
    HttpsCertificatepath: process.env.WEB_SSL_CERTIFICATE_PATH ? join(__dirname, process.env.WEB_SSL_CERTIFICATE_PATH) : '',
    HttpsKeypath: process.env.WEB_SSL_KEY_PATH ? join(__dirname, process.env.WEB_SSL_KEY_PATH) : '',
    IsHttpsEnabled: !!process.env.WEB_SSL_CERTIFICATE_PATH,
    DefaultPageSize: Number(process.env.APP_DEFAULT_PAGE_SIZE),
    ApiPort: Number(process.env.WEB_PORT),
    WebBasePath: '',
    DocsBasepath: '/docs',
    WebStaticFile: {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['htm', 'html'],
        index: ['index.html', 'index.htm'],
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res: any, path: string, stat: string) {
            res.set('x-timestamp', Date.now().toString());
        }
    },
    UploadFilePath: process.env.WEB_UPLOAD_FILE_PATH,
    WEB_UI_PATH: process.env.WEB_UI_PATH,
    UploadExternalFilePath: process.env.WEB_UPLOAD_EXTERNAL_FILE_PATH,
    LogoUploadExternalFilePath: process.env.WEB_Facility_Logo_UPLOAD_FILE_PATH,
    ExternalMRDUploadFilePath: process.env.WEB_EXTERNAL_MRD_UPLOAD_FILE_PATH
};
