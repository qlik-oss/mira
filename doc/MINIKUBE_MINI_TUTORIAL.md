# Minikube - A Mini Tutorial for Mira

For development and testing purposes, `minikube` is the fastest and most convenient way to get started with Mira in a Kubernetes environment.

This page provides a minimal tutorial to get started with `minikube` and `kubectl` on your developer machine. This tutorial is by no means complete, but can hopefully provide a good starting point to get up and running with Mira on Kubernetes and to follow the Mira deployment examples in the [README.md](../README.md).

## Install the tools

Both `kubectl` and `minikube` need to be installed. This should be pretty straight-forward by following the instructions at

- kubectl - https://kubernetes.io/docs/tasks/tools/install-kubectl/
- minikube - https://kubernetes.io/docs/getting-started-guides/minikube/

It is recommended to have both these executables on your `PATH`.

## Starting the minikube VM

`minikube` is used to set up a local, single-node Kubernetes cluster on a dev machine. Note that `minikube` assumes that a virtualization hypervisor is enabled, for example HyperV on Windows.

### On Windows using HyperV

On Windows it is convenient to use HyperV once it has been enabled in BIOS. A HyperV virtual switch must be configured of type `External`.

Start the single-node cluster with

```sh
$ minikube start --vm-driver="hyperv" --memory=1024 --hyperv-virtual-switch="MainSwitchEth"
```

Note how the HyperV hypervisor is specified with the `--vm-driver=="hyperv"` option and how the HyperV virtual switch is provided in the `--hyperv-virtual-switch="MainSwitchEth"` option. You can use any name for the virtual switch, as long as it matches your HyperV configuration.

You should see output like

```sh
Starting local Kubernetes v1.7.0 cluster...
Starting VM...
Getting VM IP address...
Moving files into cluster...
Setting up certs...
Starting cluster components...
Connecting to cluster...
Setting up kubeconfig...
Kubectl is now configured to use the cluster.
```

### On Mac using ???

_This section remains to be written._

## Verifying cluster connectivity

Note on the last line in the output from running `minikube` that `kubectl` was automatically configured to communicate with the created cluster.

You can verify this with

```sh
$ minikube ip
```

followed by

```sh
$ kubectl cluster-info
```

The IP addresses in the output from these two commands should match.

### Providing Docker Hub credentials as a secret

In order for the Kubernetes server to be able to pull Docker images under access control from Docker Hub, the cluster must be configured with credentials in a secret object. For public Docker images this is not needed.

Create the secret named `dockerhub` with the command below (replace `<USERNAME>`, `<PASSWORD>`, and `<EMAIL>` with actual values).

**NOTE!** - Observe the intentional leading space character in the command. This is to avoid that the credentials end up in the command history. At least `bash` supports this and it is recommended to have it configured in this way.

```sh
$  kubectl create secret docker-registry dockerhub --docker-server=https://index.docker.io/v1/ --docker-username=<USERNAME> --docker-password=<PASSWORD> --docker-email=<EMAIL>
```

In a Kubernetes deployment file, the secret can then be used for to specify `imagePullSecrets` as follows (parts left out for brevity)

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  ...
spec:
  ...
    spec:
      containers:
        ...
      imagePullSecrets:
        - name: dockerhub
```
