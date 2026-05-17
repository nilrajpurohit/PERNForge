# Kubernetes Production Deployment Guide
## React TS + Node.js + Nginx + PostgreSQL + Redis

---

# Architecture Overview

```text
                    Internet
                        |
                 +---------------+
                 |   Ingress     |
                 | NGINX Ingress |
                 +---------------+
                        |
          --------------------------------
          |                              |
   +-------------+              +---------------+
   |  Frontend   |              |   Backend     |
   | React + Nginx| <---------> | Node.js API   |
   +-------------+              +---------------+
                                         |
                       -----------------------------------
                       |                                 |
               +---------------+               +---------------+
               | PostgreSQL DB |               |     Redis     |
               | StatefulSet   |               |   Deployment  |
               +---------------+               +---------------+
```

---

# 1. Create Namespace

## namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
```

## Apply

```bash
kubectl apply -f namespace.yaml
```

---

# 2. Create StorageClass

## storageclass.yaml

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage

provisioner: kubernetes.io/aws-ebs

reclaimPolicy: Retain

volumeBindingMode: WaitForFirstConsumer
```

## Apply

```bash
kubectl apply -f storageclass.yaml
```

---

# 3. PostgreSQL StatefulSet

## postgres-secret.yaml

```yaml
apiVersion: v1
kind: Secret

metadata:
  name: postgres-secret
  namespace: production

type: Opaque

stringData:
  POSTGRES_USER: admin
  POSTGRES_PASSWORD: strongpassword
  POSTGRES_DB: appdb
```

---

## postgres-service.yaml

```yaml
apiVersion: v1
kind: Service

metadata:
  name: postgres
  namespace: production

spec:
  clusterIP: None

  selector:
    app: postgres

  ports:
  - port: 5432
```

---

## postgres-statefulset.yaml

```yaml
apiVersion: apps/v1
kind: StatefulSet

metadata:
  name: postgres
  namespace: production

spec:
  serviceName: postgres

  replicas: 1

  selector:
    matchLabels:
      app: postgres

  template:
    metadata:
      labels:
        app: postgres

    spec:
      containers:
      - name: postgres

        image: postgres:16

        ports:
        - containerPort: 5432

        envFrom:
        - secretRef:
            name: postgres-secret

        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data

        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"

          limits:
            cpu: "500m"
            memory: "1Gi"

        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - admin

          initialDelaySeconds: 10
          periodSeconds: 5

        livenessProbe:
          tcpSocket:
            port: 5432

          initialDelaySeconds: 30
          periodSeconds: 10

  volumeClaimTemplates:
  - metadata:
      name: postgres-storage

    spec:
      accessModes:
      - ReadWriteOnce

      storageClassName: fast-storage

      resources:
        requests:
          storage: 10Gi
```

---

# 4. Redis Deployment

## redis-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: redis
  namespace: production

spec:
  replicas: 1

  selector:
    matchLabels:
      app: redis

  template:
    metadata:
      labels:
        app: redis

    spec:
      containers:
      - name: redis

        image: redis:7

        ports:
        - containerPort: 6379

        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"

          limits:
            cpu: "250m"
            memory: "256Mi"

        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping

        livenessProbe:
          tcpSocket:
            port: 6379
```

---

## redis-service.yaml

```yaml
apiVersion: v1
kind: Service

metadata:
  name: redis
  namespace: production

spec:
  selector:
    app: redis

  ports:
  - port: 6379
    targetPort: 6379
```

---

# 5. Backend Deployment

## backend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: backend
  namespace: production

spec:
  replicas: 3

  selector:
    matchLabels:
      app: backend

  template:
    metadata:
      labels:
        app: backend

    spec:
      serviceAccountName: backend-sa

      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100

            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - backend

              topologyKey: kubernetes.io/hostname

      containers:
      - name: backend

        image: myrepo/backend:v1

        ports:
        - containerPort: 3000

        env:
        - name: DB_HOST
          value: postgres

        - name: REDIS_HOST
          value: redis

        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"

          limits:
            cpu: "500m"
            memory: "512Mi"

        readinessProbe:
          httpGet:
            path: /health
            port: 3000

        livenessProbe:
          httpGet:
            path: /health
            port: 3000

        startupProbe:
          httpGet:
            path: /health
            port: 3000

          failureThreshold: 30
          periodSeconds: 10
```

---

## backend-service.yaml

```yaml
apiVersion: v1
kind: Service

metadata:
  name: backend
  namespace: production

spec:
  selector:
    app: backend

  ports:
  - port: 80
    targetPort: 3000
```

---

# 6. Frontend Deployment

## frontend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: frontend
  namespace: production

spec:
  replicas: 2

  selector:
    matchLabels:
      app: frontend

  template:
    metadata:
      labels:
        app: frontend

    spec:
      containers:
      - name: frontend

        image: myrepo/frontend:v1

        ports:
        - containerPort: 80

        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"

          limits:
            cpu: "250m"
            memory: "256Mi"

        readinessProbe:
          httpGet:
            path: /
            port: 80

        livenessProbe:
          httpGet:
            path: /
            port: 80
```

---

## frontend-service.yaml

```yaml
apiVersion: v1
kind: Service

metadata:
  name: frontend
  namespace: production

spec:
  selector:
    app: frontend

  ports:
  - port: 80
    targetPort: 80
```

---

# 7. Install NGINX Ingress Controller

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace
```

---

# 8. Configure Ingress

## ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: app-ingress
  namespace: production

spec:
  ingressClassName: nginx

  rules:
  - host: myapp.example.com

    http:
      paths:
      - path: /
        pathType: Prefix

        backend:
          service:
            name: frontend
            port:
              number: 80

      - path: /api
        pathType: Prefix

        backend:
          service:
            name: backend
            port:
              number: 80
```

---

# 9. Network Policies

## default-deny.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: default-deny
  namespace: production

spec:
  podSelector: {}

  policyTypes:
  - Ingress
  - Egress
```

---

## allow-backend-postgres.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: allow-backend-postgres
  namespace: production

spec:
  podSelector:
    matchLabels:
      app: postgres

  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend

    ports:
    - protocol: TCP
      port: 5432
```

---

## allow-backend-redis.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy

metadata:
  name: allow-backend-redis
  namespace: production

spec:
  podSelector:
    matchLabels:
      app: redis

  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend

    ports:
    - protocol: TCP
      port: 6379
```

---

# 10. RBAC Configuration

## serviceaccount.yaml

```yaml
apiVersion: v1
kind: ServiceAccount

metadata:
  name: backend-sa
  namespace: production
```

---

## role.yaml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role

metadata:
  name: backend-role
  namespace: production

rules:
- apiGroups: [""]
  resources: ["pods"]

  verbs:
  - get
  - list
```

---

## rolebinding.yaml

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding

metadata:
  name: backend-rolebinding
  namespace: production

subjects:
- kind: ServiceAccount
  name: backend-sa
  namespace: production

roleRef:
  kind: Role
  name: backend-role
  apiGroup: rbac.authorization.k8s.io
```

---

# 11. Helm Chart Example

## values.yaml

```yaml
auth:
  username: admin
  password: strongpassword
  database: appdb

primary:
  persistence:
    enabled: true
    size: 10Gi

resources:
  requests:
    cpu: 250m
    memory: 512Mi
```

---

## Install PostgreSQL Helm Chart

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami

helm install postgres bitnami/postgresql \
  -f values.yaml \
  -n production
```

---

# 12. CronJob

## cronjob-backup.yaml

```yaml
apiVersion: batch/v1
kind: CronJob

metadata:
  name: db-backup
  namespace: production

spec:
  schedule: "0 2 * * *"

  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup

            image: postgres:16

            command:
            - /bin/sh
            - -c

            args:
            - pg_dump -h postgres -U admin appdb > /backup/app.sql

          restartPolicy: OnFailure
```

---

# 13. Apply Everything

```bash
kubectl apply -f namespace.yaml

kubectl apply -f storageclass.yaml

kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f postgres-statefulset.yaml

kubectl apply -f redis-deployment.yaml
kubectl apply -f redis-service.yaml

kubectl apply -f serviceaccount.yaml
kubectl apply -f role.yaml
kubectl apply -f rolebinding.yaml

kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

kubectl apply -f ingress.yaml

kubectl apply -f default-deny.yaml
kubectl apply -f allow-backend-postgres.yaml
kubectl apply -f allow-backend-redis.yaml

kubectl apply -f cronjob-backup.yaml
```

---

# 14. Validation Commands

## Pods

```bash
kubectl get pods -n production
```

## Services

```bash
kubectl get svc -n production
```

## PVCs

```bash
kubectl get pvc -n production
```

## Ingress

```bash
kubectl get ingress -n production
```

## Logs

```bash
kubectl logs <pod-name> -n production
```

## Describe

```bash
kubectl describe pod <pod-name> -n production
```

---

# 15. Production Best Practices

- Use HTTPS/TLS with Ingress
- Store secrets in Vault or SealedSecrets
- Enable HorizontalPodAutoscaler
- Configure PodDisruptionBudget
- Use Prometheus + Grafana monitoring
- Enable centralized logging
- Use rolling updates
- Add CI/CD pipelines
- Enable backup and restore strategy
- Run containers as non-root users

---

# Recommended Deployment Order

1. Namespace
2. StorageClass
3. Secrets
4. PostgreSQL
5. Redis
6. RBAC
7. Backend
8. Frontend
9. Ingress Controller
10. Ingress
11. Network Policies
12. CronJobs
13. Monitoring
14. Autoscaling

---