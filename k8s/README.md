# Kubernetes deployment

k3s, one namespace, one nginx pod serving the built app, at <https://daddyrobot.ax-h.com> through
traefik with a cert-manager certificate. There is no state on the server: progress lives in each
browser's `localStorage`.

## Deploy

The image is published by the `container` workflow on every push to `main`.

```shell
# The namespace must be daddy-robot: the ingress names its middleware by namespace.
kubectl create namespace daddy-robot
kubectl -n daddy-robot apply -f ./daddy-robot
# Middleware before ingress, or traefik serves 500 until it appears.
kubectl -n daddy-robot apply -f ./redirect-http-https.yml
kubectl -n daddy-robot apply -f ./ingress.yml
kubectl -n daddy-robot rollout status deploy/daddy-robot
kubectl -n daddy-robot get certificate     # READY True within a minute or two
```

`daddyrobot.ax-h.com` is a public A record kept by the `ddns` CronJob from the `DOMAINS` list in its
ConfigMap. cert-manager solves HTTP-01, so a certificate stuck at `READY False` is almost always DNS.

## Checking it

```shell
curl -fsS https://daddyrobot.ax-h.com/healthz                                  # ok
curl -sS -o /dev/null -w '%{http_code}\n' http://daddyrobot.ax-h.com/healthz   # 308 to https
```

## The image

`ghcr.io/axle-h/daddy-robot:latest`, from the root `Dockerfile`: `nginx-unprivileged` serving
`dist/` on 8080. CI smoke-tests it read-only, non-root and with no capabilities, the way the
Deployment runs it, before pushing; every build is also tagged with its commit.

```shell
kubectl -n daddy-robot rollout restart deploy/daddy-robot   # pull :latest
kubectl -n daddy-robot set image deploy/daddy-robot daddy-robot=ghcr.io/axle-h/daddy-robot:<sha>
```

Nothing auto-deploys. The package is public; if it were ever private the pod sits in
`ImagePullBackOff` and the namespace needs an `imagePullSecret`.
