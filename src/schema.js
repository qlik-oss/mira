const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat } = require('graphql');

function satisfies(entry, constraints) {
  let retval = true;
  const keys = Object.keys(constraints);

  keys.forEach((key) => {
    if (retval) {
      const expected = constraints[key];
      const actual = entry[key];

      if (typeof actual === 'undefined') {
        retval = false;
      } else if (Array.isArray(expected)) {
        retval = (expected.indexOf(actual) !== -1);
      } else if (typeof expected === 'boolean' || typeof actual === 'boolean') {
        retval = expected.toString().toLowerCase() === actual.toString().toLowerCase();
      } else if ((typeof expected === 'string')
        && (expected.indexOf('>') === 0)
        && !isNaN(expected.substring(1))) {
        const expectedNumber = expected.substring(1);
        retval = (actual > expectedNumber);
      } else if (typeof expected === 'string' &&
        expected.indexOf('<') === 0 &&
        !isNaN(expected.substring(1))) {
        const expectedNumber = expected.substring(1);
        retval = actual < expectedNumber;
        // eslint-disable-next-line eqeqeq
      } else if (actual != expected) {
        retval = false;
      }
    }
  });
  return retval;
}


const QixEngineType = new GraphQLObjectType({
  name: 'QixEngine',
  description: 'A Qix Engine',
  fields: () => ({
    version: {
      type: GraphQLString,
      description: 'QIX Engine version',
    },
    ipAddress: {
      type: GraphQLString,
      description: 'IP address to use when connecting to the QIX Engine',
    },
    port: {
      type: GraphQLInt,
      description: 'Port number to use when connecting to the QIX Enginee',
    },
    healthy: {
      type: GraphQLBoolean,
      description: 'The QIX Engine is up and running and healthy',
    },
    started: {
      type: GraphQLString,
      description: 'ISO timestamp when the QIX Engine service was started',
    },
    memCommitted: {
      type: GraphQLFloat,
      description: 'Total amount of committed memory for the QIX Engine process',
    },
    memAllocated: {
      type: GraphQLFloat,
      description: 'Total amount of allocated memory (committed + reserved)',
    },
    memFree: {
      type: GraphQLFloat,
      description: 'Total amount of free memory (minimum of free virtual and physical memory)',
    },
    cpuTotal: {
      type: GraphQLFloat,
      description: 'Percentage of the CPU used by the engine, averaged over a time period of 30 seconds',
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    engine: {
      type: new GraphQLList(QixEngineType),
      args: {
        version: {
          type: GraphQLString,
        },
        ipAddress: {
          type: GraphQLString,
        },
        port: {
          type: GraphQLInt,
        },
        healthy: {
          type: GraphQLBoolean,
        },
        started: {
          type: GraphQLString,
        },
        memCommitted: {
          type: GraphQLString,
        },
        memAllocated: {
          type: GraphQLString,
        },
        memFree: {
          type: GraphQLString,
        },
        cpuTotal: {
          type: GraphQLString,
        },
      },
      // engineDiscovery is passed as context obj.
      resolve: async (parentValue, args, ctx) => {
        const engines = await ctx.list();
        return engines.filter(engine => satisfies(engine, args));
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: queryType,
});

