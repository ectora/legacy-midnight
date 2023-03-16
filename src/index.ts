import Boot from './structures/utils/Boot';
import Config from './structures/utils/Config';
import { HttpsServer } from './structures/http';
import { SystemExecutor } from './structures/utils/Service';

// Handlers for specific HTTP routes
import { MiscellaneousHandler } from './structures/http/handler/MiscellaneousHandler';
import { GenericHandler } from './structures/http/handler/GenericHandler';
import { RegionHandler } from './structures/http/handler/RegionHandler';
Boot.init();

new SystemExecutor()
      .register(
            new HttpsServer(Config)
                  .register(new RegionHandler(Config))
                  .register(new MiscellaneousHandler())
                  .register(new GenericHandler())
      )
      .start(100);