# Guide de déploiement : `candidate-service` (Spring Boot + MySQL + MinIO) avec Docker

## 1. Prérequis

Avant de commencer, assure-toi d'avoir :

- **Java 17+** (pour builder le projet si besoin)
- **Maven 3.8.8** (pour builder le projet si besoin)
- **Docker** ([Installer Docker Desktop](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** (inclus dans Docker Desktop)
- **Un terminal** (cmd, PowerShell, ou terminal Linux/Mac)

---

## 2. Étapes de build

> **Si le JAR existe déjà dans `target/`, tu peux passer cette étape.**

```sh
# Place-toi dans le dossier du microservice
cd backend/service-candidats

# Compile et package le projet (génère le JAR dans target/)
./mvnw clean package
# ou sous Windows
mvnw.cmd clean package
```

---

## 3. Lancement avec Docker

### a. Vérifie/édite les fichiers de configuration

#### **application.yml** (exemple)
```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:mysql://mysql-candidates:3306/recrusmart_candidates
    username: root
    password: anass
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
    baseline-on-migrate: true

jwt:
  secret: VOTRE_SECRET_32_CARACTÈRES
```

#### **docker-compose.yml** (exemple)
```yaml
services:
  mysql-candidates:
    image: mysql:8
    environment:
      MYSQL_DATABASE: recrusmart_candidates
      MYSQL_USER: root
      MYSQL_PASSWORD: anass
      MYSQL_ROOT_PASSWORD: anass
    ports:
      - "3308:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  candidate-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8082:8082"
    depends_on:
      - mysql-candidates
      - minio
    environment:
      SPRING_PROFILES_ACTIVE: default

volumes:
  mysql_data:
  minio_data:
```

#### **Dockerfile** (exemple)
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/candidate-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### b. Lancer les conteneurs

```sh
# Place-toi dans le dossier où se trouve le docker-compose.yml
cd backend/service-candidats

# Arrête et supprime les anciens conteneurs (optionnel mais recommandé)
docker-compose down

# Lance tout (build si besoin)
docker-compose up --build
```

---

## 🔄 Redémarrage du projet

Voici trois façons de redémarrer le microservice `candidate-service` selon tes besoins :

### 🔁 1. Redémarrage simple
Pour relancer rapidement les conteneurs sans les reconstruire ni perdre de données :

```sh
# Redémarre tous les services définis dans docker-compose.yml
# (utile après un changement de config ou pour relancer après un crash)
docker-compose restart
```

### 🔄 2. Rebuild complet
Pour reconstruire les images Docker (par exemple après modification du code ou du Dockerfile) :

```sh
# Arrête et supprime les conteneurs, puis rebuild et relance tout
docker-compose down
# Puis
docker-compose up --build
```

### 🧹 3. Nettoyage total
Pour tout remettre à zéro (y compris les données MySQL et MinIO) :

```sh
# Arrête, supprime les conteneurs ET les volumes (toutes les données seront perdues)
docker-compose down -v
```

> **Astuce :** Utilise le nettoyage total si tu veux repartir d'une base propre ou si tu rencontres des problèmes de persistance de données.

---

## 4. Liens utiles pour tester

- **API Spring Boot (actuator health)**  
  [http://localhost:8082/actuator/health](http://localhost:8082/actuator/health)

- **MinIO Console**  
  [http://localhost:9001](http://localhost:9001)  
  (Identifiants par défaut : `minio` / `minio123`)

- **MySQL**  
  - Hôte : `localhost`
  - Port : `3308`
  - Utilisateur : `root`
  - Mot de passe : `anass`
  - Base : `recrusmart_candidates`

---

## 5. Erreurs fréquentes et solutions

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| `Connection refused` MySQL | Mauvais host/port ou MySQL pas prêt | Vérifie que l'URL JDBC est `mysql-candidates:3306` dans le yml, et que le mot de passe correspond à celui du compose. Redémarre le service après quelques secondes si besoin. |
| `No migrations found` Flyway | Pas de scripts de migration | Ajoute tes scripts dans `src/main/resources/db/migration` si tu utilises Flyway. |
| `MinIO not accessible` | Mauvais port ou credentials | Vérifie les ports dans le compose et les identifiants. |
| `Port already in use` | Port déjà utilisé sur ta machine | Change le port exposé dans le compose (ex: `8083:8082` si 8082 est pris). |
| `docker-compose up` échoue à cause d'un conteneur existant | Conflit de nom de conteneur | `docker-compose down` ou `docker rm <nom_conteneur>` pour nettoyer. |
| Problème de droits sur les volumes | Permissions sur Windows/Linux | Supprime les volumes (`docker volume rm ...`) ou lance Docker en admin. |

---

## 6. Arrêter et nettoyer

```sh
# Arrêter les conteneurs
docker-compose down

# Supprimer les volumes (optionnel, efface les données MySQL/MinIO)
docker-compose down -v
```

---

## 7. Conseils

- Pour voir les logs :  
  `docker-compose logs -f candidate-service`
- Pour accéder à MySQL en ligne de commande :  
  `docker exec -it <id_mysql_container> mysql -u root -p`
- Pour relancer uniquement le service Spring Boot après un changement de code (si rebuild du jar) :  
  `docker-compose up --build candidate-service`

---

## 8. Ressources utiles

- [Documentation Spring Boot Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation MinIO](https://min.io/docs/minio/linux/index.html)
- [Flyway Migration](https://flywaydb.org/documentation/)

---