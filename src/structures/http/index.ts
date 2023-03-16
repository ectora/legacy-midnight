import { fastify, FastifyReply, FastifyRequest } from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";
import type { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from "http2";
import { ServiceBase, Executor } from '../utils/Service';
import Config from '../../structures/utils/Config';
import gradientString from 'gradient-string';

import fs from 'fs';
import path from 'path';
import Logger from "../utils/Logger";
import { version } from "../../../package.json";

export type HttpRequest<RouteInterface extends RouteGenericInterface = RouteGenericInterface> = FastifyRequest<
      RouteInterface,
      Http2SecureServer,
      Http2ServerRequest
>;

export type HttpResponse<RouteInterface extends RouteGenericInterface = RouteGenericInterface> = FastifyReply<
      Http2SecureServer,
      Http2ServerRequest,
      Http2ServerResponse,
      RouteInterface
>;

export class HttpsServer extends ServiceBase<Executor> {
      readonly http;

      constructor(readonly config: typeof Config) {
            super();

            this.config = config;
            this.http = fastify({
                  http2: true,
                  https: {
                        allowHTTP1: true,
                        key: fs.readFileSync(path.join(process.cwd(), 'src/resources/tls/server.key')),
                        cert: fs.readFileSync(path.join(process.cwd(), 'src/resources/tls/server.crt'))
                  }
            });
      }

      protected setup(service: Executor): void {
            service.once(async () => {
                  const host = this.config.HTTP.HOST;
                  const port = this.config.HTTP.PORT;

                  this.http.get('/', (req, res) => {
                        const html = fs.readFileSync(path.resolve(process.cwd(), 'src/resources/webstatic/index.html'))
                              .toString('binary').replace('{ver}', version);
                        res.header('Content-Type', 'text/html').send(Buffer.from(html));
                  });

                  this.http.get('/info', (req, res) => res.send({
                        ip: req.ip, remote: req.socket.localAddress,
                        agent: req.headers["user-agent"]
                  }));

                  this.http.get('*', (req, res) => res.send({ retcode: 0, msg: "" }));

                  Logger.info(`<HttpServer>: Listening on port ${port}`);
                  await this.http.listen({ host, port });
            });

            service.end(async () => await this.http.close());
      }
}

export abstract class HttpHandler extends ServiceBase<HttpsServer> {}