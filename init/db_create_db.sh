#!/bin/bash

POSTGRES_CONTAINER=$1
POSTGRES_USER=$2

ARTIZ_USER=$3
ARTIZ_DATABASE=$4


echo "==== Db create DB"
echo "> Création de la db"
docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER dropdb --if-exists $ARTIZ_DATABASE
docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER createdb --owner=$ARTIZ_USER $ARTIZ_DATABASE
echo ">> La base de données "$ARTIZ_DATABASE" a été créée pour le user "$ARTIZ_USER
