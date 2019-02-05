# mira

[mira](https://github.com/qlik-oss/mira) is the service that discovers QIX Engines in an orchestration.

## Introduction

This chart bootstraps a mira service on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

If Kubernetes is using RBAC Authorization then mira will need to be configured with a service account that has view access to the Kubernetes API.
At least pod access is needed, more information from kubernetes will be provided if mira gets view access to the ReplicaSet and Deployment APIs as well.
For more information see [here](https://kubernetes.io/docs/reference/access-authn-authz/rbac/).

## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install --name my-release qlik/mira
```

The command deploys engine on the Kubernetes cluster in the default configuration.

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following tables lists the configurable parameters of the chart and their default values.

| Parameter               | Description                           | Default                                                    |
| ----------------------- | ----------------------------------    | ---------------------------------------------------------- |
| `image.repository` | Image name | `qlikcore/mira`|
| `image.tag` | Image version | `0.3.1` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `replicaCount` | Number of replicas |  `1` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | External port for mira | `9100` |
| `metrics.prometheus.enabled` | Prometheus metrics enablement | `true` |
| `rollbar.enabled` | Rollbar logging enablement | `false` |
| `mode` | Operation mode for mira | `kubernetes` |
| `rbac.create` | Create RBAC service account (if serviceAccount above not specified) | `false` |
| `serviceAccount.name` | Name of service account mira should use | `default` |
| `serviceAccount.create` | Create RBAC service account (if serviceAccount.name not specified) | `false` |
| `resources.requests.cpu` | CPU resource request | `0.1` |
| `resources.requests.memory` | Memory resource request | `70Mi` |
| `resources.limits.cpu` | CPU resource limit | `0.25` |
| `resources.limits.memory` | Memory resource limit | `120Mi` |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

```console
helm install --name my-release -f values.yaml qlik/mira
```

> **Tip**: You can use the default [values.yaml](values.yaml)
