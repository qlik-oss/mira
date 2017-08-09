# Minikube - A Mini Tutorial for Mira

For development and testing purposes, `minikube` is probaly the fastest and most convenient way to get started with Mira in a Kubernetes environment.

This page provides a minimal tutorial to get started with `minikube` and `kubectl` on your developer machine. This tutorial is by no means complete, but can hopefully provide a good starting point to gete up and running with Mira on Kubernetes.

## Install the tools

Both `kubectl` and `minikube` need to be installed. This should be pretty straight-forward by following the instructions at

- kubectl - https://kubernetes.io/docs/tasks/tools/install-kubectl/
- minikube - https://kubernetes.io/docs/getting-started-guides/minikube/

It is recommended to have both these executables on your `PATH`.

## Starting the minikube VM

Minikube is used to set up a local, single-node Kubernetes cluster on a dev machine. Note that `minikube` assumes that a virtualization hypervisor is enabled on the local machine, for example HyperV on Windows.

### On Windows using HyperV

On Windows it is convenient to use HyperV once it has been enabled in BIOS. A HyperV virtual switch must be configured with type `External`. Here it is assumed that this virtual switch is named `MainSwitchEth`.

Start the single-node cluster with

```sh
$ minikube start --vm-driver="hyperv" --memory=1024 --hyperv-virtual-switch="MainSwitchEth"
```

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


### Verifying cluster connectivity

Note, on the last output line, when running `minikube`, that `kubectl` was automatically configured to communicate with the created cluster.

You can verify this with

```sh
$ minikube ip
10.88.4.252

$ kubectl cluster-info
Kubernetes master is running at https://10.88.4.252:8443

```

`kubectl` can be configured to communicate with any Kubernetes server. Since the IP addresses natches in the output above, `kubectl` is set to go.

