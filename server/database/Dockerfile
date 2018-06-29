FROM mariadb:10.3.7

# Copy the database schema to the /data directory
ADD schema.sql /docker-entrypoint-initdb.d/

RUN chmod 777 docker-entrypoint-initdb.d/schema.sql


ENV MYSQL_DATABASE=newspaper_site
ENV MYSQL_ALLOW_EMPTY_PASSWORD=1

EXPOSE 3306
