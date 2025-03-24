declare module "swagger-ui-express" {
    import { RequestHandler } from "express";
    function serve(req: any, res: any, next: any): void;
    function setup(
        swaggerDoc: any,
        opts?: {
            explorer?: boolean;
            swaggerOptions?: any;
            customCss?: string;
            customJs?: string;
            customfavIcon?: string;
            customSiteTitle?: string;
        }
    ): RequestHandler;
}
