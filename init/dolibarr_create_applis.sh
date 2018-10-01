#!/bin/bash

DOLIBARR_PORT=$1 # port dolibarr
ARTIZ_BACK_PORT=$2 # port back

POSTGRES_CONTAINER=$3 # container postgres
POSTGRES_USER=$4

ARTIZ_USER=$5 # utilisateur artiz postgres (login)
ARTIZ_DATABASE=$6 # database artiz

DOLIBARR_DATABASE_PREFIX=$7
DOLIBARR_ADMIN_LOGIN=$8 # administrateur dolibarr (identique pour toutes les instances)
DOLIBARR_ADMIN_PASSWORD=$9 # administrateu dolibarr (password)
DOLIBARR_MODULES=${10} # modules to activate

WWW_USER_ID=${11}
WWW_GROUP_ID=${12}

ARTIZ_BACK_CONTAINER=${13}

ARTIZ_BACK_URL=${ARTIZ_BACK_CONTAINER}':3000/api'

echo "==== Dolibarr create applis"

# dolibarr
# get artisans in bdd
ARTISANS=$(docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER psql -v ON_ERROR_STOP=1 --username $ARTIZ_USER --dbname $ARTIZ_DATABASE -c "COPY(SELECT string_agg(username, ' ') FROM \"Users\" WHERE role='artisan') TO STDOUT")

for artisan in ${ARTISANS}
  do
    echo ">> Artisan: "${artisan}
    dolibarr_artisan_db=${DOLIBARR_DATABASE_PREFIX}${artisan}
    # supprime la base de sonnées dolibarr associée à l'artisan
    docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER dropdb --if-exists ${dolibarr_artisan_db}
    echo "> "${dolibarr_artisan_db}" supprimée"
    # création de l'appli dolibarpour l'artisan
    docker-compose exec dolibarr /usr/src/dolibarr/init/dolibarr_create.sh $WWW_USER_ID $WWW_GROUP_ID $DOLIBARR_PORT $ARTIZ_BACK_URL $POSTGRES_CONTAINER ${dolibarr_artisan_db} $ARTIZ_USER $ARTIZ_DATABASE $DOLIBARR_ADMIN_LOGIN $DOLIBARR_ADMIN_PASSWORD $DOLIBARR_MODULES $artisan
    # echo "> appli http://localhost:"${DOLIBARR_PORT}"/"${artisan}"/htdocs créée (login/password = "${$DOLIBARR_ADMIN_LOGIN}"/"${$DOLIBARR_ADMIN_PASSWORD}")"
    echo "> appli créée"
    # copie de la clé dolibarr dans la db
    key=$(docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER psql -v ON_ERROR_STOP=1 --username $ARTIZ_USER --dbname $dolibarr_artisan_db -c "COPY(SELECT api_key FROM llx_user WHERE login='$DOLIBARR_ADMIN_LOGIN') TO STDOUT")
    docker-compose exec --user $POSTGRES_USER -T $POSTGRES_CONTAINER psql -v ON_ERROR_STOP=1 --username $ARTIZ_USER --dbname $ARTIZ_DATABASE -c "UPDATE \"Users\" SET erpapikey='$key' WHERE username='$artisan'"
    echo "> clé dolibarr copiée"
done
