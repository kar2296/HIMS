import * as pdf from 'html-pdf';
import * as fs from 'fs';
export type PdfOptions = pdf.CreateOptions;
export type FileInfo = pdf.FileInfo;

export class HtmlToPdf {

    public static async CreatePdf(html: string, options: pdf.CreateOptions): Promise<pdf.FileInfo> {
        return new Promise<pdf.FileInfo>((resolver, reject) => {
            let callback = (err: Error, res: pdf.FileInfo) => {
                if (err) {
                    return reject(err);
                }
                return resolver(res);
            };
            HtmlToPdf.Create(html, options).toFile(callback);
        });
    }

    public static async CreatePdfFile(html: string, options: pdf.CreateOptions, fileName: string): Promise<pdf.FileInfo> {
        return new Promise<pdf.FileInfo>((resolver, reject) => {
            let callback = (err: Error, res: pdf.FileInfo) => {
                if (err) {
                    return reject(err);
                }
                return resolver(res);
            };
            HtmlToPdf.Create(html, options).toFile(fileName, callback);
        });
    }

    public static async CreatePdfStream(html: string, options: pdf.CreateOptions): Promise<fs.ReadStream> {
        return new Promise<fs.ReadStream>((resolver, reject) => {
            let callback = (err: Error, res: fs.ReadStream) => {
                if (err) {
                    return reject(err);
                }
                return resolver(res);
            };
            HtmlToPdf.Create(html, options).toStream(callback);
        });
    }

    public static async CreatePdfBuffer(html: string, options: pdf.CreateOptions): Promise<Buffer> {
        return new Promise<Buffer>((resolver, reject) => {
            let callback = (err: Error, res: Buffer) => {
                if (err) {
                    return reject(err);
                }
                return resolver(res);
            };
            HtmlToPdf.Create(html, options).toBuffer(callback);
        });
    }

    public static Create(html: string, options: pdf.CreateOptions): pdf.CreateResult {
        return pdf.create(html, options);
    }
}

/*
Usage: 1 - defalt File name - html-pdf-<number>.pdf
====================================================
let fileInfo = await HtmlToPdf.CreatePdf(template, option);


Usage: 2 -  File name need to pass
===================================
let fileInfo = await HtmlToPdf.CreatePdf(template, option, 'pdfFilename.pdf');
*/
