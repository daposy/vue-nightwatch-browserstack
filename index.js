module.exports = (api) => {
  api.registerCommand(
    'test:browserstack',
    {
      description: 'Run automated tests through BrowserStack',
      usage: 'vue-cli-service test:browesrstack [options]',
      options: {},
      details: {}
    },
    (args) => {
      try {
        const serverPromise = args.url ? Promise.resolve({ url: args.url }) : api.service.run('serve');
        return serverPromise.then(({ server, url }) => {
          process.env.VUE_DEV_SERVER_URL = url;
                
          const nightwatch = require('nightwatch');
          const browserstack = require('browserstack-local');

          nightwatch.bs_local = bs_local = new browserstack.Local();
          bs_local.start({
            'key': process.env.BROWSERSTACK_ACCESS_KEY,
          }, 
          (error) => {
            if (error) {
              throw error;
            }
            
            console.log('Connected. Now testing...');
            return nightwatch.cli((argv) => {
              return nightwatch.CliRunner(argv)
                .setup(null, () => {
                  // Code to stop browserstack local after end of parallel test
                  bs_local.stop(function(){});
                  server.close();
                })
                .runTests(() => {
                  // Code to stop browserstack local after end of single test
                  bs_local.stop(function(){});
                  server.close();
                }
              );
            })
          });
          
          
        });
      }
      catch (error) {
        console.log('There was an error while starting the test runner:\n\n');
        process.stderr.write(error.stack + '\n');
        process.exit(2);
      }
    }
  );
}
