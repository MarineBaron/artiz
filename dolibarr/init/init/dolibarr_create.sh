#!/bin/bash
echo $*

WWW_USER_ID=$1
WWW_GROUP_ID=$2

DOLIBARR_PORT=$3
ARTIZ_BACK_URL=$4

PHP_INI_DATE_TIMEZONE='UTC'
PHP_MEMORY_LIMIT=256M
PHP_MAX_UPLOAD=20M
PHP_MAX_EXECUTION_TIME=300

ARTISAN=${12}
DOLI_URL_ROOT='http://localhost:'${DOLIBARR_PORT}'/'${ARTISAN}'/htdocs/'

DOLI_DB_HOST=$5
DOLI_DB_PORT=5432
DOLI_DB_NAME=$6
DOLI_DB_PREFIX=llx_
DOLI_DB_USER=$7
DOLI_DB_PASSWORD=$8
DOLI_DB_TYPE=pgsql
DOLI_DB_CHARACTER_SET=utf8
DOLI_DB_COLLATION=utf8_unicode_ci
DOLI_DB_ROOT_LOGIN=$7
DOLI_DB_ROOT_PASSWORD=$8

DOLI_ADMIN_LOGIN=$9
DOLI_ADMIN_PASSWORD=${10}
DOLI_MODULES=${11}

DOLI_AUTH=dolibarr
DOLI_LDAP_HOST='127.0.0.1'
DOLI_LDAP_PORT=389
DOLI_LDAP_VERSION=3
DOLI_LDAP_SERVERTYPE=openldap
DOLI_LDAP_LOGIN_ATTRIBUTE=uid
DOLI_LDAP_DN=''
DOLI_LDAP_FILTER=''
DOLI_LDAP_ADMIN_LOGIN=''
DOLI_LDAP_ADMIN_PASS=''
DOLI_LDAP_DEBUG=0

DOLI_HTTPS=0
DOLI_PROD=0
DOLI_NO_CSRF_CHECK=0

DOLI_DIR_HTML=/var/www/html/${ARTISAN}/htdocs
DOLI_DIR_DOCUMENTS=/var/www/documents/${ARTISAN}
DOLI_DIR_SCRIPTS=/var/www/html/${ARTISAN}/scripts



# version_greater A B returns whether A > B
function version_greater() {
	[[ "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1" ]];
}

# return true if specified directory is empty
function directory_empty() {
	[ -n "$(find "$1"/ -prune -empty)" ]
}


function run_as() {
	if [[ $EUID -eq 0 ]]; then
		su - www-data -s /bin/bash -c "$1"
	else
		bash -c "$1"
	fi
}

set -e;


usermod -u $WWW_USER_ID www-data
groupmod -g $WWW_GROUP_ID www-data

if [ ! -d ${DOLI_DIR_HTML} ]; then
	mkdir -p ${DOLI_DIR_HTML}
fi

if [ ! -d ${DOLI_DIR_DOCUMENTS} ]; then
	mkdir -p ${DOLI_DIR_DOCUMENTS}
fi


if [ ! -d ${DOLI_DIR_SCRIPTS} ]; then
	mkdir -p ${DOLI_DIR_SCRIPTS}
fi

chown -R www-data:www-data ${DOLI_DIR_HTML}

chown -R www-data:www-data ${DOLI_DIR_SCRIPTS}
chown -R www-data:www-data ${DOLI_DIR_DOCUMENTS}


if [ ! -f /usr/local/etc/php/php.ini ]; then
	cat <<EOF > /usr/local/etc/php/php.ini
date.timezone = "${PHP_INI_DATE_TIMEZONE}"
memory_limit = "${PHP_MEMORY_LIMIT}"
upload_max_filesize = "${PHP_MAX_UPLOAD}"
max_execution_time = "${PHP_MAX_EXECUTION_TIME}"
sendmail_path = /usr/sbin/sendmail -t -i
EOF
fi

if [ ! -d ${DOLI_DIR_HTML}/conf ]; then
	mkdir -p ${DOLI_DIR_HTML}/conf
fi

# Create a default config
if [ ! -f ${DOLI_DIR_HTML}/conf/conf.php ]; then
	cat <<EOF > ${DOLI_DIR_HTML}/conf/conf.php
<?php
// Config file for Dolibarr ${DOLI_VERSION} ($(date --iso-8601=seconds))
// ###################
// # Main parameters #
// ###################
\$dolibarr_main_url_root='${DOLI_URL_ROOT}';
\$dolibarr_main_document_root='${DOLI_DIR_HTML}';
\$dolibarr_main_url_root_alt='/custom';
\$dolibarr_main_document_root_alt='${DOLI_DIR_HTML}/custom';
\$dolibarr_main_data_root='${DOLI_DIR_DOCUMENTS}';
\$dolibarr_main_db_host='${DOLI_DB_HOST}';
\$dolibarr_main_db_port='${DOLI_DB_PORT}';
\$dolibarr_main_db_name='${DOLI_DB_NAME}';
\$dolibarr_main_db_prefix='${DOLI_DB_PREFIX}';
\$dolibarr_main_db_user='${DOLI_DB_USER}';
\$dolibarr_main_db_pass='${DOLI_DB_PASSWORD}';
\$dolibarr_main_db_type='${DOLI_DB_TYPE}';
\$dolibarr_main_db_character_set='${DOLI_DB_CHARACTER_SET}';
\$dolibarr_main_db_collation='${DOLI_DB_COLLATION}';
// ##################
// # Login          #
// ##################
\$dolibarr_main_authentication='${DOLI_AUTH}';
\$dolibarr_main_auth_ldap_host='${DOLI_LDAP_HOST}';
\$dolibarr_main_auth_ldap_port='${DOLI_LDAP_PORT}';
\$dolibarr_main_auth_ldap_version='${DOLI_LDAP_VERSION}';
\$dolibarr_main_auth_ldap_servertype='${DOLI_LDAP_SERVERTYPE}';
\$dolibarr_main_auth_ldap_login_attribute='${DOLI_LDAP_LOGIN_ATTRIBUTE}';
\$dolibarr_main_auth_ldap_dn='${DOLI_LDAP_DN}';
\$dolibarr_main_auth_ldap_filter ='${DOLI_LDAP_FILTER}';
\$dolibarr_main_auth_ldap_admin_login='${DOLI_LDAP_ADMIN_LOGIN}';
\$dolibarr_main_auth_ldap_admin_pass='${DOLI_LDAP_ADMIN_PASS}';
\$dolibarr_main_auth_ldap_debug='${DOLI_LDAP_DEBUG}';
// ##################
// # Security       #
// ##################
\$dolibarr_main_prod='${DOLI_PROD}';
\$dolibarr_main_force_https='${DOLI_HTTPS}';
\$dolibarr_main_restrict_os_commands='mysqldump, mysql, pg_dump, pgrestore';
\$dolibarr_nocsrfcheck='${DOLI_NO_CSRF_CHECK}';
\$dolibarr_main_cookie_cryptkey='$(openssl rand -hex 32)';
\$dolibarr_mailing_limit_sendbyweb='0';
EOF

	chown www-data:www-data ${DOLI_DIR_HTML}/conf/conf.php
	chmod 766 ${DOLI_DIR_HTML}/conf/conf.php
fi

# Detect installed version (docker specific solution)
installed_version="0.0.0~unknown"
if [ -f ${DOLI_DIR_DOCUMENTS}/install.version ]; then
	installed_version=$(cat ${DOLI_DIR_DOCUMENTS}/install.version)
fi
image_version=${DOLI_VERSION}

if version_greater "$installed_version" "$image_version"; then
	echo "Can't start Dolibarr because the version of the data ($installed_version) is higher than the docker image version ($image_version) and downgrading is not supported. Are you sure you have pulled the newest image version?"
	exit 1
fi

# Initialize image
if version_greater "$image_version" "$installed_version"; then
	echo "Dolibarr initialization..."
	if [[ $EUID -eq 0 ]]; then
		rsync_options="-rlDog --chown www-data:www-data"
	else
		rsync_options="-rlD"
	fi

	#cp -r /usr/src/dolibarr/scripts /var/www/
	rsync $rsync_options --delete --exclude /conf/ --exclude /custom/ --exclude /theme/ /usr/src/dolibarr/htdocs/ ${DOLI_DIR_HTML}/

	for dir in conf custom; do
		if [ ! -d ${DOLI_DIR_HTML}/"$dir" ] || directory_empty ${DOLI_DIR_HTML}/"$dir"; then
			rsync $rsync_options --include /"$dir"/ --exclude '/*' /usr/src/dolibarr/htdocs/ ${DOLI_DIR_HTML}/
		fi
	done

	# The theme folder contains custom and official themes. We must copy even if folder is not empty, but not delete content either
	for dir in theme; do
		rsync $rsync_options --include /"$dir"/ --exclude '/*' /usr/src/dolibarr/htdocs/ ${DOLI_DIR_HTML}/
	done

	rsync $rsync_options --delete /usr/src/dolibarr/scripts/ ${DOLI_DIR_SCRIPTS}/


	if [ "$installed_version" != "0.0.0~unknown" ]; then
		# Call upgrade scripts if needed
		# https://wiki.dolibarr.org/index.php/Installation_-_Upgrade#With_Dolibarr_.28standard_.zip_package.29
		echo "Dolibarr upgrade from $installed_version to $image_version..."

		if [ -f ${DOLI_DIR_DOCUMENTS}/install.lock ]; then
			rm ${DOLI_DIR_DOCUMENTS}/install.lock
		fi

		base_version=(${installed_version//./ })
		target_version=(${image_version//./ })

		run_as "cd ${DOLI_DIR_HTML}/install/ && php upgrade.php ${base_version[0]}.${base_version[1]}.0 ${target_version[0]}.${target_version[1]}.0"
		run_as "cd ${DOLI_DIR_HTML}/install/ && php upgrade2.php ${base_version[0]}.${base_version[1]}.0 ${target_version[0]}.${target_version[1]}.0"
		run_as "cd ${DOLI_DIR_HTML}/install/ && php step5.php ${base_version[0]}.${base_version[1]}.0 ${target_version[0]}.${target_version[1]}.0"

		echo 'This is a lock file to prevent use of install pages (generated by container entrypoint)' > ${DOLI_DIR_DOCUMENTS}/install.lock
		chown www-data:www-data ${DOLI_DIR_DOCUMENTS}/install.lock
		chmod 400 ${DOLI_DIR_DOCUMENTS}/install.lock
	elif [ ! -f ${DOLI_DIR_DOCUMENTS}/install.lock ]; then
			# Create forced values for first install
			cat <<EOF > ${DOLI_DIR_HTML}/install/install.forced.php
<?php
// Forced install config file for Dolibarr ${DOLI_VERSION} ($(date --iso-8601=seconds))
/** @var bool Hide PHP informations */
\$force_install_nophpinfo = true;
/** @var int 1 = Lock and hide environment variables, 2 = Lock all set variables */
\$force_install_noedit = 2;
/** @var string Information message */
\$force_install_message = 'Dolibarr installation';
/** @var string Data root absolute path (documents folder) */
\$force_install_main_data_root = '${DOLI_DIR_DOCUMENTS}';
/** @var bool Force HTTPS */
\$force_install_mainforcehttps = !empty('${DOLI_HTTPS}');
/** @var string Database name */
\$force_install_database = '${DOLI_DB_NAME}';
/** @var string Database driver (mysql|mysqli|pgsql|mssql|sqlite|sqlite3) */
\$force_install_type = '${DOLI_DB_TYPE}';
/** @var string Database server host */
\$force_install_dbserver = '${DOLI_DB_HOST}';
/** @var int Database server port */
\$force_install_port = '${DOLI_DB_PORT}';
/** @var string Database tables prefix */
\$force_install_prefix = '${DOLI_DB_PREFIX}';
/** @var string Database username */
\$force_install_databaselogin = '${DOLI_DB_USER}';
/** @var string Database password */
\$force_install_databasepass = '${DOLI_DB_PASSWORD}';
/** @var bool Force database user creation */
\$force_install_createuser = false;
/** @var bool Force database creation */
\$force_install_createdatabase = !empty('${DOLI_DB_ROOT_LOGIN}');
/** @var string Database root username */
\$force_install_databaserootlogin = '${DOLI_DB_ROOT_LOGIN}';
/** @var string Database root password */
\$force_install_databaserootpass = '${DOLI_DB_ROOT_PASSWORD}';
/** @var string Dolibarr super-administrator username */
\$force_install_dolibarrlogin = '${DOLI_ADMIN_LOGIN}';
/** @var bool Force install locking */
\$force_install_lockinstall = true;
/** @var string Enable module(s) (Comma separated class names list) */
\$force_install_module = '${DOLI_MODULES}';
EOF

base_version=(${installed_version//./ })
target_version=(${image_version//./ })

# step1 = creation de la bdd & des documents
run_as "cd ${DOLI_DIR_HTML}/install/ && php ${DOLI_DIR_HTML}/install/step1.php set fr_FR > html_1"
# step2 = création des tables
run_as "cd ${DOLI_DIR_HTML}/install/ && php ${DOLI_DIR_HTML}/install/step2.php set fr_FR > html_2"
# step5 = création de l'admin user
run_as "cd ${DOLI_DIR_HTML}/install/ && php ${DOLI_DIR_HTML}/install/step5.php ${base_version[0]}.${base_version[1]}.0 ${target_version[0]}.${target_version[1]}.0 fr_FR set ${DOLI_ADMIN_LOGIN} ${DOLI_ADMIN_PASSWORD} ${DOLI_ADMIN_PASSWORD} > html_5"

# creation du fichier de lock
echo 'This is a lock file to prevent use of install pages (generated by init.sh)' > ${DOLI_DIR_DOCUMENTS}/install.lock
chown -R www-data:www-data ${DOLI_DIR_DOCUMENTS}
chmod -R 755 ${DOLI_DIR_DOCUMENTS}
chmod 400 ${DOLI_DIR_DOCUMENTS}/install.lock
# initialisation de mycompany & api_key
run_as "cd ${DOLI_DIR_SCRIPTS}/custom/init/ && php ${DOLI_DIR_SCRIPTS}/custom/init/company-init.php ${DOLI_ADMIN_LOGIN} ${ARTISAN}"
run_as "cd ${DOLI_DIR_SCRIPTS}/custom/init/ && php ${DOLI_DIR_SCRIPTS}/custom/init/user-update-api-key.php ${DOLI_ADMIN_LOGIN}"
run_as "cd ${DOLI_DIR_SCRIPTS}/custom/init/ && php ${DOLI_DIR_SCRIPTS}/custom/init/comartiz-init.php ${DOLI_ADMIN_LOGIN} ${ARTIZ_BACK_URL}"
	fi
fi

if [ -f ${DOLI_DIR_DOCUMENTS}/install.lock ]; then
	echo $image_version > ${DOLI_DIR_DOCUMENTS}/install.version
fi

#exec "$@"
