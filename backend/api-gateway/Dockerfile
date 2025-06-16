# Image de base légère avec NGINX
FROM nginx:alpine

# Copie du fichier de configuration nginx.conf personnalisé
COPY nginx.conf /etc/nginx/nginx.conf

# Création du dossier pour les pages d'erreur personnalisées
RUN mkdir -p /usr/share/nginx/html

# Copie des pages d'erreur personnalisées
COPY error_pages/404.html /usr/share/nginx/html/404.html
COPY error_pages/50x.html /usr/share/nginx/html/50x.html

# Exposition du port 80 pour l'accès HTTP
EXPOSE 80

# Commande de démarrage du serveur NGINX
CMD ["nginx", "-g", "daemon off;"]
