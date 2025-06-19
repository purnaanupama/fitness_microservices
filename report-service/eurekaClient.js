const os = require('os');
const { Eureka } = require('eureka-js-client');

const PORT = process.env.PORT || 3000;
const HOSTNAME = os.hostname(); // Get the machine hostname dynamically

const client = new Eureka({
  instance: {
    app: 'REPORT-SERVICE',
    instanceId: `${HOSTNAME}:report-service:${PORT}`, // Consistent format
    hostName: HOSTNAME,
    ipAddr: '127.0.0.1',
    port: {
      '$': PORT,
      '@enabled': true,
    },
    vipAddress: 'report-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: 'localhost',
    port: 8761,
    servicePath: '/eureka/apps/',
  },
});

function registerWithEureka() {
  client.start((error) => {
    if (error) {
      console.error('Eureka registration failed:', error);
    } else {
      console.log('Report service registered with Eureka!');
    }
  });
}

module.exports = { registerWithEureka };
