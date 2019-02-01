const request = require('supertest');

module.exports = {
  KubeConfig: class {
    constructor() { this.numberOfCalls = 0; }

    loadFromCluster() { } // eslint-disable-line

    makeApiClient() {
      if (this.numberOfCalls === 0) {
        this.numberOfCalls += 1;
        return {
          listReplicaSetForAllNamespaces: async () => {
            const res = await request('http://localhost:8001').get('/apis/apps/v1/replicasets');
            return { body: res.body };
          },
          listDeploymentForAllNamespaces: async () => {
            const res = await request('http://localhost:8001').get('/apis/apps/v1/deployments');
            return { body: res.body };
          },
          listNamespacedReplicaSet: async () => {
            const res = await request('http://localhost:8001').get('/apis/apps/v1/namespaces/my-namespace/replicasets');
            return { body: res.body };
          },
          listNamespacedDeployment: async () => {
            const res = await request('http://localhost:8001').get('/apis/apps/v1/namespaces/my-namespace/deployments');
            return { body: res.body };
          },
        };
      }
      return {
        listPodForAllNamespaces: async () => {
          const res = await request('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine');
          return { body: res.body };
        },
        listNamespacedPod: async () => {
          const res = await request('http://localhost:8001').get('/api/v1/namespaces/my-namespace/pods?labelSelector=qix-engine');
          return { body: res.body };
        },
      };
    }
  },
};
