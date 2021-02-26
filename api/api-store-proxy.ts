/*
 * API proxy for https://api.store
 * to be used via ajax calls from www.nedluzimstatu.cz (prod_ and nedluzimstatu.ceskodigital.net (dev) (limited by CORS headers)
 * 
 * @param API_STORE_TOKEN requires API token in env
 * @see doc&examples https://github.com/chimurai/http-proxy-middleware
 */

import * as express from 'express';
import { createProxyMiddleware, Filter, Options, RequestHandler } from 'http-proxy-middleware';
import { NowRequest, NowResponse } from "@now/node";

const app = express();
const apiKey = process.env.API_STORE_TOKEN as string;

if (typeof apiKey == 'undefined' || apiKey === null) {
    console.log('ERROR: env API_STORE_TOKEN is missing');
    process.exit(1);
}
const corsAllowedOrigins = ["https://www.nedluzimstatu.cz", "https://nedluzimstatu.ceskodigital.net"];
const corsAllowedHeaders = "Origin, X-Requested-With, Content-Type, Accept";
const httpCacheControl = "public, max-age=3600";
const proxyTimeout = 8000;

function setCors(proxyRes, req, res) {
    let origin = req.headers.origin;
    let theOrigin = (corsAllowedOrigins.indexOf(origin) >= 0) ? origin : corsAllowedOrigins[0];
    proxyRes.headers["Access-Control-Allow-Origin"] = theOrigin;
    proxyRes.headers["Access-Control-Allow-Headers"] = corsAllowedHeaders;
    proxyRes.headers["Cache-Control"] = httpCacheControl;
}

function errorResponse(err, req, res) {
	console.log(err)
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end('Something went wrong. Please try again later.' + err);
}

// Create proxy instance outside of request handler function to avoid unnecessary re-creation

const spadovostApi = createProxyMiddleware({ 
    target: 'https://api.apitalks.store/apitalks.com/spadovost',
    changeOrigin: true,
    proxyTimeout: proxyTimeout,
    timeout: proxyTimeout+5,
    headers: {
      'x-api-key': apiKey,
    },
    // rewrite query string to api filter
    pathRewrite: function (path, req: Request) {
	var query = (<any>req).query;
	var filter = '';
	if (typeof query.kod_obce !== 'undefined' && !isNaN(query.kod_obce)) {
	    filter = filter + ',"where":%7B"KOD_OBCE": ' + query.kod_obce + '%7D'
	} else if (typeof query.kod_momc !== 'undefined' && !isNaN(query.kod_momc)) {
	    filter = filter + ',"where":%7B"KOD_MOMC": ' + query.kod_momc + '%7D'
	} else {
	    filter = filter + ',"where":%7B"KOD_OBCE": ' + '0' + '%7D' // default, returns not found
	}
	var newPath = path.replace(/\?*.*$/, '?filter=%7B%22limit%22:2'+filter+'%7D');
	console.log('path:'+newPath);
	return newPath;
    },
    onProxyRes: setCors,
    onError: errorResponse,
});

export default function (req, res) {
    spadovostApi(req, res, (result) => {
        if (result instanceof Error) {
            throw result;
        }

        throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`);
    });
};

const ovmApi = createProxyMiddleware({
    target: 'https://api.apitalks.store',
    changeOrigin: true,
    proxyTimeout: proxyTimeout,
    timeout: proxyTimeout+5,
    headers: {
      'x-api-key': apiKey,
    },
    pathRewrite: function (path, req: Request) {
	// strip all query string not to allow filters etc.
	var newPath = path.replace(/\?.*$/, '?');
	console.log('path:'+newPath);

        // TODO check presence of uid in url?
	console.log('path:'+newPath);
	return newPath;
    },
    onProxyRes: setCors,
    onError: errorResponse,
});

export default function (req, res) {
    ovmApi(req, res, (result) => {
        if (result instanceof Error) {
            throw result;
        }
        throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`);
    });
};
