#!/bin/bash

POSTGRES_CONTAINER=$1
POSTGRES_USER=$2

ARTIZ_USER=$3
ARTIZ_PASSWORD=$4

echo "==== Db create USER"
echo "> Création du user"
docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER sh -c "if ! psql -t -c '\du' | cut -d \| -f 1 | grep -qw '$ARTIZ_USER'; then createuser -d $ARTIZ_USER; psql -c \"ALTER USER $ARTIZ_USER WITH ENCRYPTED PASSWORD '$ARTIZ_PASSWORD';\";fi"
echo ">> L'utilisateur "$ARTIZ_USER" a été créé avec le mot de passe "$ARTIZ_PASSWORD
