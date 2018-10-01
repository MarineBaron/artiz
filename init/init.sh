#!/bin/bash

ADMINER_PORT=8080 # port adminer
ARTIZ_FRONT_PORT=8081 # port artiz front
ARTIZ_BACK_PORT=8082 # port artiz back
DOLIBARR_PORT=8083 # port dolibarr

POSTGRES_CONTAINER=db # container postgres
POSTGRES_USER=postgres

ARTIZ_USER=artiz # utilisateur artiz postgres (login)
ARTIZ_PASSWORD=artiz # utilisateur artiz postgres (password)
ARTIZ_DATABASE=artiz # database artiz

DB_RESTORE_FILE=db # file to restore (HOST/bd/backup/.sql.gz)

DOLIBARR_CONTAINER=dolibarr # container dolibarr

DOLIBARR_DATABASE_PREFIX=dolibarr_
DOLIBARR_ADMIN_LOGIN=artiz # administrateur dolibarr (identique pour toutes les instances)
DOLIBARR_ADMIN_PASSWORD=artiz # administrateu dolibarr (password)
DOLIBARR_MODULES='modSociete,modPropale,modApi,modComArtiz,modSyslog'

WWW_USER_ID=33
WWW_GROUP_ID=33

ARTIZ_BACK_CONTAINER=artiz-back

# db
./db_create_user.sh $POSTGRES_CONTAINER $POSTGRES_USER $ARTIZ_USER $ARTIZ_PASSWORD
./db_create_db.sh $POSTGRES_CONTAINER $POSTGRES_USER $ARTIZ_USER $ARTIZ_DATABASE

# artiz (restore data)
./artiz_restore_db.sh $POSTGRES_CONTAINER $POSTGRES_USER $ARTIZ_DATABASE $DB_RESTORE_FILE

# dolibarr create applications for all ARTISANS
./dolibarr_create_applis.sh $DOLIBARR_PORT $ARTIZ_BACK_PORT $POSTGRES_CONTAINER $POSTGRES_USER $ARTIZ_USER $ARTIZ_DATABASE $DOLIBARR_DATABASE_PREFIX $DOLIBARR_ADMIN_LOGIN $DOLIBARR_ADMIN_PASSWORD $DOLIBARR_MODULES $WWW_USER_ID $WWW_GROUP_ID $ARTIZ_BACK_CONTAINER
