var https = require('https');
var appsettings = require('./appsettings.json');

// Constants
var COMMUNITY_MEMBER_ROLE_TYPE_ID = 'f79a55da-7c76-4600-a809-0f62ca9971d9';

// retrieve appsettings
var resource = appsettings.Resource;
var clientId = appsettings.ClientId;
var clientSecret = appsettings.ClientSecret;
var tenantId = appsettings.TenantId;
var apiVersion = appsettings.ApiVersion;
var communityId = appsettings.CommunityId;
var success = true;
var errorCap = {};

var checkTokenExpired = function (client) {
  return client.getToken(clientId, clientSecret, resource).catch(function (err) {
    throw err;
  });
};

var refreshToken = function (res, client) {
  var obj = res.data;
  client.token = obj.access_token;
  client.tokenExpires = obj.expires_on;
};

var dumpEvent = function (elem) {
  console.log(
    'Order: ' +
      elem.Order +
      ', Tau: ' +
      elem.Tau +
      ', Radians: ' +
      elem.Radians +
      ', Sin: ' +
      elem.Sin +
      ', Cos: ' +
      elem.Cos +
      ', Tan: ' +
      elem.Tan +
      ', Sinh: ' +
      elem.Sinh +
      ', Cosh: ' +
      elem.Cosh +
      ', Tanh:' +
      elem.Tanh
  );
};

var dumpEventTarget = function (elem) {
  console.log(
    'Order: ' +
      elem.Order +
      ', TauTarget: ' +
      elem.TauTarget +
      ', RadiansTarget: ' +
      elem.RadiansTarget +
      ', SinTarget: ' +
      elem.SinTarget +
      ', CosTarget: ' +
      elem.CosTarget +
      ', TanTarget: ' +
      elem.TanTarget +
      ', SinhTarget: ' +
      elem.SinhTarget +
      ', CoshTarget: ' +
      elem.CoshTarget +
      ', TanhTarget:' +
      elem.TanhTarget
  );
};

var dumpEvents = function (obj) {
  console.log('Total events found: ' + obj.length);
  obj.forEach(function (elem, index) {
    if (!elem.Order) {
      elem.Order = 0;
    }
    console.log(
      'Order: ' +
        elem.Order +
        ', Tau: ' +
        elem.Tau +
        ', Radians: ' +
        elem.Radians +
        ', Sin: ' +
        elem.Sin +
        ', Cos: ' +
        elem.Cos +
        ', Tan: ' +
        elem.Tan +
        ', Sinh: ' +
        elem.Sinh +
        ', Cosh: ' +
        elem.Cosh +
        ', Tanh:' +
        elem.Tanh
    );
  });
};

var dumpStreamViewMap = function (obj) {
  obj.Properties.forEach(function (elem, index) {
    if (elem.TargetId) {
      console.log(elem.SourceId + ' => ' + elem.TargetId);
    } else {
      console.log(elem.SourceId + ' => Not mapped');
    }
  });
};

var logError = function (err) {
  if(success){
    console.log('TenantId:' + tenantId)
    console.log('NamespaceId:' + sampleNamespaceId)
  }
  success = false;
  errorCap = err;
  if (typeof err.statusCode !== 'undefined' && err.statusCode === 302) {
    console.log('Sds Object already present in the Service\n');
    console.trace();
  } else {
    console.trace();
    console.log(err.message);
    console.log(err.stack);
    if(err.options !== 'undefined'){
      console.log(err.options.headers['Operation-Id']);
    }
    throw err;
  }
};

var app = function (request1, response) {
  if (request1 != null) {
    if (request1.url === '/favicon.ico') {
      return;
    }
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    response.write('Sds Service Operations Begun!\n');
    response.write('Check the console for updates');
  }

  console.log(
    '------------------------------------------------------------------------------------\n' +
      '  _________    .___      _______             .___               __        \n' +
      ' /   _____/  __| _/______\\      \\   ____   __| _/____          |__| ______\n' +
      ' \\_____  \\  / __ |/  ___//   |   \\ /  _ \\ / __ |/ __ \\         |  |/  ___/\n' +
      ' /        \\/ /_/ |\\___ \\/    |    (  <_> ) /_/ \\  ___/         |  |\\___ \\ \n' +
      '/_______  /\\____ /____  >____|__  /\\____/\\____ |\\___  > /\\ /\\__|  /____  >\n' +
      '        \\/      \\/    \\/        \\/            \\/    \\/  \\/ \\______|    \\/ \n' +
      '------------------------------------------------------------------------------------\n'
  );

  var sdsObjs = require('./SdsObjects.js');
  var clientObj = require('./SdsClient.js');
  var waveDataObj = require('./WaveData.js');

  var sampleNamespaceId = appsettings.NamespaceId;
  var sampleTypeId = 'WaveData_SampleType_NodeJS';
  var compoundTypeId = 'SampleType_Compound_NodeJS';
  var sampleStreamId = 'WaveData_SampleStream_NodeJS';
  var sampleStreamSecondaryId = 'SampleStream_Secondary_NodeJS';
  var sampleStreamIdCompound = 'SampleStream_Compound_NodeJS';
  var sampleStreamViewId = 'WaveData_SampleStreamView_NodeJS';
  var targetTypeId = 'TargetTypeId_NodeJS';
  var targetIntegerTypeId = 'TargetIntegerTypeId_NodeJS';
  var manualStreamViewId = 'WaveData_ManualStreamView_NodeJS';

  Object.freeze(sdsObjs.sdsTypeCode);
  Object.freeze(sdsObjs.sdsBoundaryType);
  Object.freeze(sdsObjs.sdsStreamMode);

  // define basic SdsTypes
  var doubleType = new sdsObjs.SdsType({
    Id: 'doubleType',
    SdsTypeCode: sdsObjs.sdsTypeCode.Double,
  });
  var intType = new sdsObjs.SdsType({
    Id: 'intType',
    SdsTypeCode: sdsObjs.sdsTypeCode.Int32,
  });

  // define properties
  var orderProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Order',
    SdsType: intType,
    IsKey: true,
  });
  var radiansProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Radians',
    SdsType: doubleType,
  });
  var tauProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Tau',
    SdsType: doubleType,
  });
  var sinProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Sin',
    SdsType: doubleType,
  });
  var cosProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Cos',
    SdsType: doubleType,
  });
  var tanProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Tan',
    SdsType: doubleType,
  });
  var sinhProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Sinh',
    SdsType: doubleType,
  });
  var coshProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Cosh',
    SdsType: doubleType,
  });
  var tanhProperty = new sdsObjs.SdsTypeProperty({
    Id: 'Tanh',
    SdsType: doubleType,
  });

  var id1 = 'Order';
  var id2 = 'Multiplier';
  var compound1 = new sdsObjs.SdsTypeProperty({
    Id: id1,
    SdsType: intType,
    IsKey: true,
    Order: 1,
  });
  var compound2 = new sdsObjs.SdsTypeProperty({
    Id: id2,
    SdsType: intType,
    IsKey: true,
    Order: 2,
  });

  //create an SdsType for WaveData Class
  var sampleType = new sdsObjs.SdsType({
    Id: sampleTypeId,
    Name: 'WaveDataJs',
    Description: 'This is a sample Sds type for storing WaveData type events',
    SdsTypeCode: sdsObjs.sdsTypeCode.Object,
    Properties: [
      orderProperty,
      tauProperty,
      radiansProperty,
      sinProperty,
      cosProperty,
      tanProperty,
      sinhProperty,
      coshProperty,
      tanhProperty,
    ],
  });

  //create an SdsType for WaveData Class using a compound index
  var compoundType = new sdsObjs.SdsType({
    Id: compoundTypeId,
    Name: compoundTypeId,
    Description: 'This is a sample Sds type for storing WaveData type events',
    SdsTypeCode: sdsObjs.sdsTypeCode.Object,
    Properties: [
      compound1,
      compound2,
      tauProperty,
      radiansProperty,
      sinProperty,
      cosProperty,
      tanProperty,
      sinhProperty,
      coshProperty,
      tanhProperty,
    ],
  });

  var client = new clientObj.SdsClient(resource, apiVersion);

  // Step 1
  var getClientToken = client
    .getToken(clientId, clientSecret, resource)
    .catch(function (err) {
      throw err;
    });

  var nowSeconds = function () {
    return Date.now() / 1000;
  };

  // create an SdsType
  var createType = getClientToken
    .then(
      // Step 2
      function (res) {
        console.log('\nCreating an SdsType');
        refreshToken(res, client);
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.createType(tenantId, sampleNamespaceId, sampleType);
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.createType(tenantId, sampleNamespaceId, sampleType);
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  //create an SdsStream
  var sampleStream = new sdsObjs.SdsStream({
    Id: sampleStreamId,
    Name: 'WaveStreamJs',
    Description: 'A Stream to store the WaveDatan Sds types events',
    TypeId: sampleTypeId,
  });

  var createStream = createType
    .then(
      // Step 3
      function (res) {
        console.log('Creating an SdsStream');
        // create SdsStream
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.createStream(
                tenantId,
                sampleNamespaceId,
                sampleStream
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.createStream(tenantId, sampleNamespaceId, sampleStream);
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // insert data
  var event = [];
  var evt = null;

  // insert a single event
  var insertValue = createStream
    .then(
      // Step 4
      function (res) {
        console.log('Inserting data');
        evt = waveDataObj.NextWave(2.0, 0);
        event.push(evt);
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.insertEvents(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                event
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.insertEvents(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            event
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // insert multiple events
  var events = [];
  var evt1 = null;
  var evtCount = 2;
  var mutliplier = 2;
  var callback = null;
  var totalEvents = 20;

  var buildEvents = function () {
    if (evtCount < totalEvents) {
      evt1 = waveDataObj.NextWave(mutliplier, evtCount);
      events.push(evt1);
      evtCount += 2;
      buildEvents();
    } else {
      callback();
    }
  };

  var createRandomEvents = insertValue
    .then(function (res) {
      var prom = new Promise(function (resolve, reject) {
        callback = resolve;
        buildEvents();
      });
      return prom;
    })
    .catch(function (err) {
      logError(err);
    });

  var insertMultipleValues = createRandomEvents
    .then(function () {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.insertEvents(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              events
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.insertEvents(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          events
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // get last event
  var getLastValue = insertMultipleValues
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            console.log('Getting latest event');
            return client.getLastValue(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getLastValue(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printLastValue = getLastValue
    .then(function (res) {
      var lastEvent = res.data;
      dumpEvent(lastEvent);
    })
    .catch(function (err) {
      logError(err);
    });

  // get all events
  var getWindowEvents = printLastValue
    .then(
      // Step 5
      function (res) {
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              console.log('\nGetting all events');
              return client.getWindowValues(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0,
                180
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getWindowValues(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0,
            180
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printWindowEvents = getWindowEvents
    .then(function (res) {
      var allEvents = res.data;
      dumpEvents(allEvents);
      return allEvents;
    })
    .catch(function (err) {
      logError(err);
    });

  // get all events in table format
  var getWindowEventsTable = printWindowEvents
    .then(
      // Step 6
      function (res) {
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              console.log('\nGetting all events');
              return client.getWindowValuesTable(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0,
                180
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getWindowValuesTable(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0,
            180
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printWindowEventsTable = getWindowEventsTable
    .then(function (res) {
      var allEvents = res.data;
      console.log('\nValues in table format');
      console.log(JSON.stringify(allEvents));
      return allEvents;
    })
    .catch(function (err) {
      logError(err);
    });

  // update one event
  var updateEvent = printWindowEventsTable
    .then(
      // Step 7
      function (res) {
        // update the first value
        event = [];
        evt = res[0];
        evt = waveDataObj.NextWave(4.0, 0);
        event.push(evt);
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              console.log('\nUpdating events');
              return client.updateEvents(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                event
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.updateEvents(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            event
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // if updating single value successful, then create a list of new values to insert
  createRandomEvents = updateEvent
    .then(function (res) {
      mutliplier = 4.0;
      events = [];
      evtCount = 2;
      var prom = new Promise(function (resolve, reject) {
        callback = resolve;
        totalEvents = 40;
        buildEvents();
      });
      return prom;
    })
    .catch(function (err) {
      logError(err);
    });

  // if creating a list of new values successful, then update values in the stream
  var updateEvents = createRandomEvents
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateEvents(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              events
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateEvents(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          events
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // get updated events
  getWindowEvents = updateEvents
    .then(function (res) {
      console.log('\nGetting updated events');
      // get updated values
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getWindowValues(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              0,
              180
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getWindowValues(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          0,
          180
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printUpdateEvents = getWindowEvents
    .then(function (res) {
      var updatedEvents = res.data;
      dumpEvents(updatedEvents);
      return updatedEvents;
    })
    .catch(function (err) {
      logError(err);
    });

  // replace events
  var currentEvents;
  //replace one event
  var replaceEvent = printUpdateEvents
    .then(
      // Step 8
      function (res) {
        console.log('\nReplacing events');
        var event = [];
        var replaceEvent = waveDataObj.NextWave(2.0, 0);
        currentEvents = res;
        event.push(replaceEvent);

        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.replaceEvents(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                event
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.replaceEvents(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            event
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // if updating single value successful, then create a list of new values to insert
  var createReplaceEvents = replaceEvent
    .then(function (res) {
      multiplier = 20.0;
      var events = [];
      evtCount = 2;
      var prom = new Promise(function (resolve, reject) {
        callback = resolve;
        totalEvents = 40;
        buildEvents();
      });
      return prom;
    })
    .catch(function (err) {
      logError(err);
    });

  //replace multiple events
  var replaceEvents = createReplaceEvents
    .then(function (res) {
      var replaceEvents = events;
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.replaceEvents(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              replaceEvents
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.replaceEvents(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          replaceEvents
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // get replaced events
  var getReplacedEvents = replaceEvents
    .then(
      // Step 9
      function (res) {
        console.log('Getting replaced events');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getWindowValues(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0,
                180
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getWindowValues(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0,
            180
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printReplaceEvents = getReplacedEvents
    .then(function (res) {
      var updatedEvents = res.data;
      dumpEvents(updatedEvents);
    })
    .catch(function (err) {
      logError(err);
    });

  // get interpolated events
  var getInterpolatedEvents = printReplaceEvents
    .then(
      // Step 9
      function (res) {
        console.log('\nGetting interpolated events');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getRangeValuesInterpolated(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                5,
                32,
                4
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getRangeValuesInterpolated(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            5,
            32,
            4
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printInterpolatedEvents = getInterpolatedEvents
    .then(function (res) {
      var updatedEvents = res.data;
      console.log('Interpolated events');
      dumpEvents(updatedEvents);
    })
    .catch(function (err) {
      logError(err);
    });

  // get filtered events
  var getFilteredEvents = printInterpolatedEvents
    .then(
      // Step 10
      function (res) {
        console.log('\nGetting filtered events');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getWindowValues(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0,
                50
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getWindowValues(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0,
            50
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printFilteredEvents = getFilteredEvents
    .then(function (res) {
      var updatedEvents = res.data;
      console.log('Filtered events');
      dumpEvents(updatedEvents);
    })
    .catch(function (err) {
      logError(err);
    });

  // get sampled values
  var getSampledValues = printFilteredEvents
    .then(
      // Step 11
      function (res) {
        console.log('\nGetting sampled values');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getSampledValues(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0,
                40,
                4,
                'sin'
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getSamples(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0,
            40,
            4,
            'sin'
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printSampledValues = getSampledValues
    .then(function (res) {
      var sampledValues = res.data;
      console.log('Sampled values');
      dumpEvents(sampledValues);
    })
    .catch(function (err) {
      logError(err);
    });

  // Property Overrides
  var getRangeEvents = printSampledValues
    .then(
      // Step 12
      function (res) {
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getRangeValues(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                '1',
                0,
                3,
                'False',
                sdsObjs.sdsBoundaryType.ExactOrCalculated
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getRangeValues(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            '1',
            0,
            3,
            'False',
            sdsObjs.sdsBoundaryType.ExactOrCalculated
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // create a Property Override
  var propertyOverride = new sdsObjs.SdsPropertyOverride({
    SdsTypePropertyId: 'Radians',
    InterpolationMode: sdsObjs.sdsStreamMode.Discrete,
  });
  var propertyOverrides = [propertyOverride];

  var printDefaultBehavior = getRangeEvents.then(function (res) {
    var obj = res.data;
    foundEvents = obj;
    console.log(
      '\nSds can interpolate or extrapolate data at an index location where data does not explicitly exist.'
    );
    console.log(
      "\nDefault (Continuous) requesting data starting at index location '1', where we have not entered data, Sds will interpolate a value for each property:"
    );
    obj.forEach(function (elem) {
      console.log(
        'Order: ' +
          elem.Order +
          ', Radians: ' +
          elem.Radians +
          ', Cos : ' +
          elem.Cos
      );
    });
  });

  // update stream
  var updateStream = printDefaultBehavior
    .then(function (res) {
      sampleStream.PropertyOverrides = propertyOverrides;
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateStream(
              tenantId,
              sampleNamespaceId,
              sampleStream
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateStream(tenantId, sampleNamespaceId, sampleStream);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  getRangeEvents = updateStream
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getRangeValues(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              '1',
              0,
              3,
              'False',
              sdsObjs.sdsBoundaryType.ExactOrCalculated
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getRangeValues(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          '1',
          0,
          3,
          'False',
          sdsObjs.sdsBoundaryType.ExactOrCalculated
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print stepwise results
  var printResultEvent = getRangeEvents.then(function (res) {
    var obj = res.data;
    foundEvents = obj;
    console.log(
      '\nWe can override this behavior on a property by property basis, here we override the Radians property instructing Sds not to interpolate.'
    );
    console.log('\nSds will now return the default value for the data type:');
    obj.forEach(function (elem) {
      console.log(
        'Order: ' +
          elem.Order +
          ', Radians: ' +
          elem.Radians +
          ', Cos: ' +
          elem.Cos
      );
    });
    return obj;
  });

  // SdsStreamViews
  var streamViewMessage = printResultEvent.then(
    // Step 13
    function (res) {
      console.log('\nSdsStreamViews');
      console.log('Here is some of our data as it is stored on the server:');
      res.forEach(function (elem) {
        console.log(
          'Sin: ' + elem.Sin + ', Cos: ' + elem.Cos + ', Tan: ' + elem.Tan
        );
      });
    }
  );

  // create properties for our target types
  var orderTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'OrderTarget',
    SdsType: intType,
    IsKey: true,
  });
  var radiansTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'RadiansTarget',
    SdsType: doubleType,
  });
  var tauTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'TauTarget',
    SdsType: doubleType,
  });
  var sinTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'SinTarget',
    SdsType: doubleType,
  });
  var cosTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'CosTarget',
    SdsType: doubleType,
  });
  var tanTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'TanTarget',
    SdsType: doubleType,
  });
  var sinhTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'SinhTarget',
    SdsType: doubleType,
  });
  var coshTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'CoshTarget',
    SdsType: doubleType,
  });
  var tanhTargetProperty = new sdsObjs.SdsTypeProperty({
    Id: 'TanhTarget',
    SdsType: doubleType,
  });

  var sinInt = new sdsObjs.SdsTypeProperty({ Id: 'SinInt', SdsType: intType });
  var cosInt = new sdsObjs.SdsTypeProperty({ Id: 'CosInt', SdsType: intType });
  var tanInt = new sdsObjs.SdsTypeProperty({ Id: 'TanInt', SdsType: intType });

  // build additional types to define our targets
  var integerType = new sdsObjs.SdsType({
    Id: targetIntegerTypeId,
    Name: 'WaveDataTargetIntegersJs',
    Description:
      "This is a sample Sds type for storing a StreamView of WaveData's sin, cos and tan properties as Integers",
    SdsTypeCode: sdsObjs.sdsTypeCode.Object,
    Properties: [orderTargetProperty, tanInt, cosInt, sinInt],
  });

  var targetType = new sdsObjs.SdsType({
    Id: targetTypeId,
    Name: 'WaveDataTargetJs',
    Description:
      'This is a sample Sds type for storing a StreamView of WaveData type events',
    SdsTypeCode: sdsObjs.sdsTypeCode.Object,
    Properties: [
      orderTargetProperty,
      tauTargetProperty,
      radiansTargetProperty,
      sinTargetProperty,
      cosTargetProperty,
      tanTargetProperty,
      sinhTargetProperty,
      coshTargetProperty,
      tanhTargetProperty,
    ],
  });

  // create target types on server
  var createTargetType = streamViewMessage
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.createType(tenantId, sampleNamespaceId, targetType);
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.createType(tenantId, sampleNamespaceId, targetType);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var createTargetIntegerType = createTargetType
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.createType(tenantId, sampleNamespaceId, integerType);
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.createType(tenantId, sampleNamespaceId, integerType);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // build a StreamView to map our sample type to our target type, as the properties are in the same order and of the same type Sds will do the mapping automatically
  var autoStreamView = new sdsObjs.SdsStreamView({
    Id: sampleStreamViewId,
    Name: 'MapSampleTypeToATargetType',
    TargetTypeId: targetTypeId,
    SourceTypeId: sampleTypeId,
  });

  // create StreamView on the server
  var createAutoStreamView = createTargetIntegerType
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.createStreamView(
              tenantId,
              sampleNamespaceId,
              autoStreamView
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.createStreamView(
          tenantId,
          sampleNamespaceId,
          autoStreamView
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // create SdsStreamViewProperties to explicitly map source property to target property
  var sinStreamViewProperty = new sdsObjs.SdsStreamViewProperty({
    SourceId: 'Sin',
    TargetId: 'SinInt',
  });
  var cosStreamViewProperty = new sdsObjs.SdsStreamViewProperty({
    SourceId: 'Cos',
    TargetId: 'CosInt',
  });
  var tanStreamViewProperty = new sdsObjs.SdsStreamViewProperty({
    SourceId: 'Tan',
    TargetId: 'TanInt',
  });

  // build a StreamView using SdsStreamViewProperties
  var manualStreamView = new sdsObjs.SdsStreamView({
    Id: manualStreamViewId,
    Name: 'MapSampleTypeToATargetType',
    TargetTypeId: targetIntegerTypeId,
    SourceTypeId: sampleTypeId,
    Properties: [
      sinStreamViewProperty,
      cosStreamViewProperty,
      tanStreamViewProperty,
    ],
  });

  // create the StreamView on the server
  var createManualStreamView = createAutoStreamView
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.createStreamView(
              tenantId,
              sampleNamespaceId,
              manualStreamView
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.createStreamView(
          tenantId,
          sampleNamespaceId,
          manualStreamView
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // get range of values specifying our StreamView
  var getRangeStreamViewEvents = createManualStreamView
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getRangeValues(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              '1',
              0,
              3,
              'False',
              sdsObjs.sdsBoundaryType.ExactOrCalculated,
              autoStreamView.Id
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getRangeValues(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          '1',
          0,
          3,
          'False',
          sdsObjs.sdsBoundaryType.ExactOrCalculated,
          autoStreamView.Id
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print results
  var dumpStreamViewEvent = getRangeStreamViewEvents
    .then(function (res) {
      var obj = res.data;
      console.log(
        "\nSpecifying a StreamView with an SdsType of the same shape returns values that are automatically mapped to the target SdsType's properties:"
      );
      obj.forEach(function (elem) {
        console.log(
          'SinTarget: ' +
            elem.SinTarget +
            ', CosTarget: ' +
            elem.CosTarget +
            ', TanTarget: ' +
            elem.TanTarget
        );
      });
    })
    .catch(function (err) {
      logError(err);
    });

  // get range of values specifying our integer StreamView
  var getRangeIntegerStreamViewEvents = getRangeStreamViewEvents
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getRangeValues(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              '1',
              0,
              3,
              'False',
              sdsObjs.sdsBoundaryType.ExactOrCalculated,
              manualStreamViewId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getRangeValues(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          '1',
          0,
          3,
          'False',
          sdsObjs.sdsBoundaryType.ExactOrCalculated,
          manualStreamViewId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print results
  var dumpIntegerStreamViewEvent = getRangeIntegerStreamViewEvents
    .then(function (res) {
      var obj = res.data;
      console.log(
        '\nSdsStreamViews can also convert certain types of data, here we return integers where the original values were doubles:'
      );
      obj.forEach(function (elem) {
        console.log(
          'SinInt: ' +
            elem.SinInt +
            ', CosInt: ' +
            elem.CosInt +
            ', TanInt: ' +
            elem.TanInt
        );
      });
    })
    .catch(function (err) {
      logError(err);
    });

  // request maps
  var getAutoSdsStreamViewMap = dumpIntegerStreamViewEvent
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStreamViewMap(
              tenantId,
              sampleNamespaceId,
              sampleStreamViewId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStreamViewMap(
          tenantId,
          sampleNamespaceId,
          sampleStreamViewId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print map
  var dumpMapResult = getAutoSdsStreamViewMap
    .then(function (res) {
      var obj = res.data;
      console.log(
        '\nWe can query Sds to return the SdsStreamViewMap for our SdsStreamView, here is the one generated automatically:'
      );
      dumpStreamViewMap(obj);
    })
    .catch(function (err) {
      logError(err);
    });

  var getManualSdsStreamViewMap = dumpMapResult
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStreamViewMap(
              tenantId,
              sampleNamespaceId,
              manualStreamViewId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStreamViewMap(
          tenantId,
          sampleNamespaceId,
          manualStreamViewId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print map
  dumpMapResult = getManualSdsStreamViewMap
    .then(function (res) {
      var obj = res.data;
      console.log(
        '\nHere is our explicit mapping, note SdsStreamViewMap will return all properties of the Source Type, even those without a corresponding Target property:'
      );
      dumpStreamViewMap(obj);
    })
    .catch(function (err) {
      logError(err);
    });

  var getFirstValueSV = dumpMapResult
    .then(
      // Step 14
      function (res) {
        console.log(
          'We will now update the stream type based on the streamview'
        );
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getFirstValue(
                tenantId,
                sampleNamespaceId,
                sampleStreamId
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getFirstValue(
            tenantId,
            sampleNamespaceId,
            sampleStreamId
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printFirstValueSV = getFirstValueSV
    .then(function (res) {
      console.log('\nReminder of FirstValue:');
      dumpEvent(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getFirstS = printFirstValueSV
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printFirstS = getFirstS
    .then(function (res) {
      console.log('\nReminder of Stream def:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var updateStreamType = printFirstS
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateStreamType(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              sampleStreamViewId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateStreamType(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          sampleStreamViewId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var getFirstValueSV2 = updateStreamType
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getFirstValue(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getFirstValue(
          tenantId,
          sampleNamespaceId,
          sampleStreamId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printFirstValueSV2 = getFirstValueSV2
    .then(function (res) {
      console.log('\nNew FirstValue:');
      dumpEventTarget(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getFirstS2 = printFirstValueSV2
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printFirstS2 = getFirstS2
    .then(function (res) {
      console.log('\nNew Stream def:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getTypes = printFirstS2
    .then(
      // Step 15
      function (res) {
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getTypes(tenantId, sampleNamespaceId, '', 0, 100);
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getTypes(tenantId, sampleNamespaceId, '', 0, 100);
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var printTypes = getTypes
    .then(function (res) {
      console.log('\nTypes:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getTypesQuery = printTypes
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getTypes(
              tenantId,
              sampleNamespaceId,
              'Id:*Target*',
              0,
              100
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getTypes(
          tenantId,
          sampleNamespaceId,
          'Id:*Target*',
          0,
          100
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printTypesQuery = getTypesQuery
    .then(function (res) {
      console.log('\nTypes after Query:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  // tags and metadata
  var createTags = printTypesQuery
    .then(
      // Step 16
      function (res) {
        console.log("\nLet's add some Tags and Metadata to our stream:");
        var tags = ['waves', 'periodic', '2018', 'validated'];
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.updateTags(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                tags
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.updateTags(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            tags
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  var createMetadata = createTags
    .then(function (res) {
      var metadata = {
        Region: 'North America',
        Country: 'Canada',
        Province: 'Quebec',
      };
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateMetadata(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              metadata
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateMetadata(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          metadata
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var getTags = createMetadata
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getTags(tenantId, sampleNamespaceId, sampleStreamId);
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getTags(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print tags
  var printTags = getTags
    .then(function (res) {
      var obj = res.data;
      console.log('\nTags now associated with ' + sampleStreamId + ':');
      obj.forEach(function (elem, index) {
        console.log(elem);
      });
    })
    .catch(function (err) {
      logError(err);
    });

  // get metadata
  var getMetadata = printTags
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getMetadata(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              ''
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getMetadata(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          ''
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print metadata
  var printMetadata = getMetadata
    .then(function (res) {
      console.log('\nMetadata now associated with ' + sampleStreamId + ':');
      var obj = res.data;
      console.log('Metadata key Region: ' + obj['Region']);
      console.log('Metadata key Country: ' + obj['Country']);
      console.log('Metadata key Province: ' + obj['Province']);
    })
    .catch(function (err) {
      logError(err);
    });

  // update metadata
  var patchMetadata = printMetadata
    .then(function (res) {
      // Step 17
      console.log("\nLet's make some changes to the metadata on our stream:");
      var patch = [
        { op: 'remove', path: '/Region' },
        { op: 'replace', path: '/Province', value: 'Ontario' },
        { op: 'add', path: '/City', value: 'Toronto' },
      ];
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.patchMetadata(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              patch
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.patchMetadata(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          patch
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // print updated metadata
  var printMetadata2 = patchMetadata
    .then(function (res) {
      console.log('\nMetadata now associated with ' + sampleStreamId + ':');
      var obj = res.data;
      console.log('Metadata key Country: ' + obj['Country']);
      console.log('Metadata key Province: ' + obj['Province']);
      console.log('Metadata key City: ' + obj['City']);
    })
    .catch(function (err) {
      logError(err);
    });

  let prevStep = printMetadata2;
  // Community steps
  if (communityId) {
    // Step 18
    var getTenantRoles = prevStep.then(
      // getting tenant roles
      function (res) {
        console.log('\nGetting tenant roles');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getTenantRoles(tenantId);
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getTenantRoles(tenantId);
        }
      }
    );

    var shareStream = getTenantRoles.then(
      // sharing stream to community
      function (res) {
        var role = res.data.find(
          (r) =>
            r.RoleTypeId === COMMUNITY_MEMBER_ROLE_TYPE_ID &&
            r.CommunityId === communityId
        );
        console.log('\nFound community member Id:');
        console.log(role.Id);

        console.log('\nSharing stream to community');
        var patch = [
          {
            op: 'add',
            path: '/RoleTrusteeAccessControlEntries/-',
            value: {
              AccessRights: 1,
              AccessType: 0,
              Trustee: { ObjectId: role.Id, TenantId: null, Type: 'Role' },
            },
          },
        ];
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.patchStreamAccessControl(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                patch
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.patchStreamAccessControl(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            patch
          );
        }
      }
    );

    // Step 19
    var searchCommunity = shareStream.then(
      // searching the community
      function (res) {
        console.log('\nSearching the community');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getCommunityStreams(
                tenantId,
                communityId,
                sampleStreamId
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getCommunityStreams(
            communityId,
            sampleStreamId
          );
        }
      }
    );

    // Step 20
    var getCommunityData = searchCommunity.then(
      // getting stream data from the community stream
      function (res) {
        console.log('\nFound matching streams:');
        for (var stream of res.data) {
          console.log(stream.Id);
        }

        console.log('\nGetting stream data from the community stream');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.getLastValueSelf(res.data[0].Self);
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.getLastValueSelf(res.data[0].Self);
        }
      }
    );

    var printCommunityData = getCommunityData.then(
      // print community data
      function (res) {
        console.log('\nRetrieved last value:');
        console.log(res.data);
      }
    );

    prevStep = printCommunityData;
  }

  // delete an event
  var deleteOneEvent = prevStep
    .then(
      // Step 21
      function (res) {
        console.log('\nDeleting values from the SdsStream');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.deleteEvent(
                tenantId,
                sampleNamespaceId,
                sampleStreamId,
                0
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.deleteEvent(
            tenantId,
            sampleNamespaceId,
            sampleStreamId,
            0
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // delete all events
  var deleteWindowEvents = deleteOneEvent
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.deleteWindowEvents(
              tenantId,
              sampleNamespaceId,
              sampleStreamId,
              0,
              198
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.deleteWindowEvents(
          tenantId,
          sampleNamespaceId,
          sampleStreamId,
          0,
          198
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  //create an SdsStream with secondary index
  var sampleStreamWithSecondaryIndex = new sdsObjs.SdsStream({
    Id: sampleStreamSecondaryId,
    Name: sampleStreamSecondaryId,
    Description: 'A Stream to store the WaveDatan Sds types events',
    TypeId: sampleTypeId,
    Indexes: [
      {
        SdsTypePropertyId: 'Radians',
      },
    ],
  });

  var createSecondaryStream = deleteWindowEvents
    .then(
      // Step 22
      function (res) {
        console.log('Creating an SdsStream with a secondary index');
        // create SdsStream
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.createStream(
                tenantId,
                sampleNamespaceId,
                sampleStreamWithSecondaryIndex
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.createStream(
            tenantId,
            sampleNamespaceId,
            sampleStreamWithSecondaryIndex
          );
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  // get metadata
  var getSecondaryStream = createSecondaryStream
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamSecondaryId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(
          tenantId,
          sampleNamespaceId,
          sampleStreamSecondaryId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printSecondaryStream = getSecondaryStream
    .then(function (res) {
      if (res.data['Indexes'].length != 1)
        throw 'Indexes not right.  Secondary index expected';
    })
    .catch(function (err) {
      logError(err);
    });

  // Modifying an existing stream with a secondary index.

  var getOriginalStream = printSecondaryStream
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var updateOriginalStream = getOriginalStream
    .then(function (res) {
      var stream = res.data;
      stream['Indexes'] = [{ SdsTypePropertyId: 'RadiansTarget' }];
      console.log('\n New original Stream:');
      console.log(JSON.stringify(stream));
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateStream(tenantId, sampleNamespaceId, stream);
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateStream(tenantId, sampleNamespaceId, stream);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var getOriginalStream2 = updateOriginalStream
    .then(function (res) {
      console.log('\nResponse from update of index on original stream:');
      console.log(res.data);
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(tenantId, sampleNamespaceId, sampleStreamId);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printOriginalStream = getOriginalStream2
    .then(function (res) {
      console.log('\nOriginal Stream with secondary index:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getSecondaryStreamAgain = printOriginalStream
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamSecondaryId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(
          tenantId,
          sampleNamespaceId,
          sampleStreamSecondaryId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var updateSecondaryStream = getSecondaryStreamAgain
    .then(function (res) {
      var stream = res.data;
      stream['Indexes'] = [];
      console.log('\nNew Secondary Stream:');
      console.log(JSON.stringify(stream));
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.updateStream(tenantId, sampleNamespaceId, stream);
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.updateStream(tenantId, sampleNamespaceId, stream);
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var getSecondaryStreamAgain2 = updateSecondaryStream
    .then(function (res) {
      console.log('\nResponse from update of index on secondary stream:');
      console.log(res.data);
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.getStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamSecondaryId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getStream(
          tenantId,
          sampleNamespaceId,
          sampleStreamSecondaryId
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printSecondaryStreamAfterUpdate = getSecondaryStreamAgain2
    .then(function (res) {
      console.log('\nSecondary Stream with no secondary index:');
      console.log(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  // Adding Compound Index Type
  var createCompoundType = printSecondaryStreamAfterUpdate
    .then(
      // Step 23
      function (res) {
        console.log('Creating an SdsType with a compound index');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              return client.createType(
                tenantId,
                sampleNamespaceId,
                compoundType
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          return client.createType(tenantId, sampleNamespaceId, compoundType);
        }
      }
    )
    .catch(function (err) {
      logError(err);
    });

  //create an SdsStream
  var sampleStreamCompoundIndex = new sdsObjs.SdsStream({
    Id: sampleStreamIdCompound,
    Name: sampleStreamIdCompound,
    Description: 'A Stream to store the WaveData Sds types events',
    TypeId: compoundTypeId,
  });

  var createCompoundStreamFromType = createCompoundType
    .then(function (res) {
      console.log('Creating an SdsStream from Type with a compound index');
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.createStream(
              tenantId,
              sampleNamespaceId,
              sampleStreamCompoundIndex
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.createStream(
          tenantId,
          sampleNamespaceId,
          sampleStreamCompoundIndex
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // Step 24

  var event2 = [];

  var insertValue1 = createCompoundStreamFromType
    .then(function (res) {
      console.log('Inserting data');
      evt = waveDataObj.NextWaveCompound(1, 10);
      event2.push(evt);
      evt = waveDataObj.NextWaveCompound(2, 2);
      event2.push(evt);
      evt = waveDataObj.NextWaveCompound(3, 1);
      event2.push(evt);
      evt = waveDataObj.NextWaveCompound(10, 3);
      event2.push(evt);
      evt = waveDataObj.NextWaveCompound(10, 8);
      event2.push(evt);
      evt = waveDataObj.NextWaveCompound(10, 10);
      event2.push(evt);
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            return client.insertEvents(
              tenantId,
              sampleNamespaceId,
              sampleStreamIdCompound,
              event2
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.insertEvents(
          tenantId,
          sampleNamespaceId,
          sampleStreamIdCompound,
          event2
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  // get last event
  var getLastValue2 = insertValue1
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            console.log('Getting latest event');
            return client.getLastValue(
              tenantId,
              sampleNamespaceId,
              sampleStreamIdCompound
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getLastValue(
          tenantId,
          sampleNamespaceId,
          sampleStreamIdCompound
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printLastValue2 = getLastValue2
    .then(function (res) {
      console.log('\nLastValue:');
      dumpEvent(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  var getFirstValue = printLastValue2
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            console.log('Getting first event');
            return client.getFirstValue(
              tenantId,
              sampleNamespaceId,
              sampleStreamIdCompound
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getFirstValue(
          tenantId,
          sampleNamespaceId,
          sampleStreamIdCompound
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printFirstValue = getFirstValue
    .then(function (res) {
      console.log('\nFirstValue:');
      dumpEvent(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  // get all events
  var getWindowEvents2 = printFirstValue
    .then(function (res) {
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            console.log('\nGetting all events');
            return client.getWindowValues(
              tenantId,
              sampleNamespaceId,
              sampleStreamIdCompound,
              '2|1',
              '10|8'
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        return client.getWindowValues(
          tenantId,
          sampleNamespaceId,
          sampleStreamIdCompound,
          '2|1',
          '10|8'
        );
      }
    })
    .catch(function (err) {
      logError(err);
    });

  var printWindowEvents2 = getWindowEvents2
    .then(function (res) {
      console.log('\nWindow Value:');
      dumpEvents(res.data);
    })
    .catch(function (err) {
      logError(err);
    });

  // One catch to rule all the errors
  var testFinished = printWindowEvents2
    .then(function (res) {
      //console.log("All values deleted successfully!");
    })
    .catch(function (err) {
      logError(err);
    });

  // cleanup of namespace
  var cleanup = testFinished
    .finally(
      // Step 25
      // delete the stream
      function () {
        console.log('Cleaning up');
        console.log('Deleting the stream');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              client.deleteStream(
                tenantId,
                sampleNamespaceId,
                sampleStreamIdCompound
              );
              client.deleteStream(
                tenantId,
                sampleNamespaceId,
                sampleStreamSecondaryId
              );
              return client.deleteStream(
                tenantId,
                sampleNamespaceId,
                sampleStreamId
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          client.deleteStream(
            tenantId,
            sampleNamespaceId,
            sampleStreamIdCompound
          );
          client.deleteStream(
            tenantId,
            sampleNamespaceId,
            sampleStreamSecondaryId
          );
          return client.deleteStream(
            tenantId,
            sampleNamespaceId,
            sampleStreamId
          );
        }
      }
    )
    .finally(function () {
      console.log('Deleting the StreamViews');
      if (client.tokenExpires < nowSeconds) {
        return checkTokenExpired(client)
          .then(function (res) {
            refreshToken(res, client);
            client.deleteStreamView(
              tenantId,
              sampleNamespaceId,
              sampleStreamViewId
            );
            return client.deleteStreamView(
              tenantId,
              sampleNamespaceId,
              manualStreamViewId
            );
          })
          .catch(function (err) {
            logError(err);
          });
      } else {
        client.deleteStreamView(
          tenantId,
          sampleNamespaceId,
          sampleStreamViewId
        );
        return client.deleteStreamView(
          tenantId,
          sampleNamespaceId,
          manualStreamViewId
        );
      }
    })
    .finally(
      // delete the types
      function () {
        console.log('Deleting the types');
        if (client.tokenExpires < nowSeconds) {
          return checkTokenExpired(client)
            .then(function (res) {
              refreshToken(res, client);
              client.deleteType(tenantId, sampleNamespaceId, compoundTypeId);
              client.deleteType(
                tenantId,
                sampleNamespaceId,
                targetIntegerTypeId
              );
              client.deleteType(tenantId, sampleNamespaceId, targetTypeId);
              return client.deleteType(
                tenantId,
                sampleNamespaceId,
                sampleTypeId
              );
            })
            .catch(function (err) {
              logError(err);
            });
        } else {
          client.deleteType(tenantId, sampleNamespaceId, compoundTypeId);
          client.deleteType(tenantId, sampleNamespaceId, targetIntegerTypeId);
          client.deleteType(tenantId, sampleNamespaceId, targetTypeId);
          return client.deleteType(tenantId, sampleNamespaceId, sampleTypeId);
        }
      }
    )
    .then(function () {
      if (!success) {
        console.log('An error occured!\n' + errorCap);
        process.exit(1);
      }
      console.log('done');
    })
    .catch(
      // log the call that failed
      function (err) {
        console.log('An error occured!\n' + err);
        process.exit(1);
      }
    );

  if (request1 != null) {
    response.end();
  }

  if (!success) {
    throw errorCap;
  }

  return cleanup;
};

//if you want to run a server
var toRun = function () {
  https.createServer(app).listen(8080);
};

process.argv = process.argv.slice(2);
if (require.main === module) {
  app.apply(process.argv);
}

module.exports = app;
