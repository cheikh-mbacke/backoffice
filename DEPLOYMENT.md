# 🚀 Déploiement Backoffice - Hotel Shift Handover

## 📋 Vue d'ensemble

Ce document explique comment déployer le backoffice React sur `backoffice.consignespro.com` en utilisant Docker et GitHub Actions.

## 🏗️ Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                backoffice.consignespro.com                 │
├─────────────────────────────────────────────────────────────┤
│  Nginx (Port 443)                                          │
│  ├── /api/* → Backend (Port 3002)                         │
│  └── /* → Backoffice (Port 8082)                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des fichiers

```
backoffice/
├── Dockerfile                 # Image Docker pour le backoffice
├── docker-compose.prod.yml    # Configuration Docker Compose
├── nginx.conf                 # Configuration Nginx interne
├── .github/workflows/deploy.yml # Workflow GitHub Actions
└── DEPLOYMENT.md              # Ce fichier
```

## 🔧 Configuration

### Variables d'environnement

Le backoffice utilise les variables suivantes :

```bash
VITE_API_URL=https://api.consignespro.com
NODE_ENV=production
```

### Configuration Nginx

Le déploiement met à jour automatiquement la configuration Nginx existante pour ajouter :

- **Backoffice** : `backoffice.consignespro.com/` → `localhost:8082`
- **API** : `api.consignespro.com/` → `localhost:3002`

## 🚀 Déploiement automatique

### Prérequis

1. **Secrets GitHub** configurés :

   - `SERVER_HOST` : Adresse IP du serveur
   - `SERVER_USER` : Utilisateur SSH
   - `VPS_SSH_KEY` : Clé privée SSH
   - `DOCKER_REGISTRY_TOKEN` : Token GitHub Container Registry

2. **Serveur** :
   - Docker et Docker Compose installés
   - Nginx configuré
   - Certificats SSL Let's Encrypt

### Processus de déploiement

1. **Push sur main/master** → Déclenche le workflow
2. **Build Docker** → Construction de l'image backoffice
3. **Push Registry** → Upload vers GitHub Container Registry
4. **Deploy Server** → Déploiement sur le serveur
5. **Update Nginx** → Mise à jour de la configuration

## 🧪 Tests locaux

### Avec Docker

```bash
# Construire l'image Docker
docker build -t hotel-shift-backoffice:latest .

# Déployer localement avec Docker Compose
docker compose -f docker-compose.prod.yml up -d

# Voir les logs
docker compose -f docker-compose.prod.yml logs backoffice

# Nettoyer
docker compose -f docker-compose.prod.yml down
docker rmi hotel-shift-backoffice:latest
```

### Avec Vite (développement)

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 🔍 Vérification du déploiement

### URLs de test

- **Backoffice** : https://backoffice.consignespro.com
- **API Health** : https://api.consignespro.com/health
- **API Auth** : https://api.consignespro.com/api/v1/auth/login

### Commandes de vérification

```bash
# Vérifier les conteneurs
docker ps

# Vérifier les logs
docker logs hotel-shift-backoffice-prod

# Tester la connectivité
curl -I https://backoffice.consignespro.com
curl -I https://api.consignespro.com/health
```

## 🛠️ Dépannage

### Problèmes courants

1. **Conteneur ne démarre pas**

   ```bash
   docker logs hotel-shift-backoffice-prod
   ```

2. **Erreur Nginx**

   ```bash
   nginx -t
   systemctl status nginx
   ```

3. **Problème de certificat SSL**
   ```bash
   certbot certificates
   ```

### Logs utiles

```bash
# Logs Nginx
tail -f /var/log/nginx/backoffice.consignespro.com.access.log
tail -f /var/log/nginx/backoffice.consignespro.com.error.log

# Logs Docker
docker logs hotel-shift-backoffice-prod -f

# Logs système
journalctl -u nginx -f
```

## 📊 Monitoring

### Health checks

- **Backoffice** : `curl http://localhost:8082`
- **API** : `curl http://localhost:3002/health`
- **SSL** : `curl -I https://backoffice.consignespro.com`

### Métriques

- **Uptime** : Monitoring externe recommandé
- **Performance** : Logs Nginx pour les temps de réponse
- **Erreurs** : Logs d'erreur Nginx et Docker

## 🔄 Rollback

En cas de problème, le déploiement sauvegarde automatiquement la configuration précédente :

```bash
# Restaurer la configuration Nginx
sudo cp /etc/nginx/sites-enabled/backoffice.consignespro.com.backup /etc/nginx/sites-enabled/backoffice.consignespro.com
sudo nginx -t && sudo systemctl reload nginx

# Redémarrer l'ancienne version
cd /opt/hotel-shift-backoffice
docker compose -f docker-compose.prod.yml down
# Utiliser l'ancienne image ou redéployer
```

## 📝 Notes importantes

1. **Ports utilisés** :

   - Backoffice : 8082 (interne)
   - API : 3002 (interne)
   - Nginx : 443 (externe)

2. **Sécurité** :

   - Rate limiting sur l'API
   - Headers de sécurité
   - HTTPS obligatoire

3. **Performance** :
   - Cache Nginx pour les assets statiques
   - Compression gzip
   - Optimisation des images Docker

## 🆘 Support

En cas de problème :

1. Vérifier les logs
2. Tester la connectivité
3. Vérifier la configuration Nginx
4. Contacter l'équipe de développement
