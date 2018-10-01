#!/bin/bash

POSTGRES_CONTAINER=$1
POSTGRES_USER=$2

ARTIZ_DATABASE=$3

DIR_DB_BACKUP='../db/backup/'
FILE_TO_RESTORE=$4


echo "==== Db restore DB"
# create dump to restore from dump + put all dolibarr ids ans keys to null
declare -a files=(${FILE_TO_RESTORE} remove-dolibarr-id)


if [ -f restore.sql ]
then
  rm restore.sql
fi

for file in "${files[@]}"
do
  gunzip ${DIR_DB_BACKUP}${file}.sql.gz
  cat ${DIR_DB_BACKUP}${file}.sql >> restore.sql
  gzip ${DIR_DB_BACKUP}${file}.sql
done

docker container exec --user $POSTGRES_USER -i $(docker-compose ps -q $POSTGRES_CONTAINER) psql -v ON_ERROR_STOP=1 --username $POSTGRES_USER < restore.sql

rm restore.sql
echo ">> La base de données "$ARTIZ_DATABASE" a été restaurée."
