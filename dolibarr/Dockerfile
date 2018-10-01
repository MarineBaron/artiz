FROM php:7.1-apache

ENV DOLI_VERSION 8.0.2

COPY init/config/000-default.conf /etc/apache2/sites-available/000-default.conf

RUN set -ex; \
	apt-get update -q; \
	# install the packages we need
	apt-get install -y --no-install-recommends \
		rsync \
	; \
	# install the PHP extensions we need
	# see https://wiki.dolibarr.org/index.php/Dependencies_and_external_libraries
	apt-get install -y --no-install-recommends \
		libcurl4-openssl-dev \
		libfreetype6-dev \
		libjpeg-dev \
		libldap2-dev \
		libmagickcore-dev \
		libmagickwand-dev \
		libmcrypt-dev \
		libpng-dev \
		libpq-dev \
		libxml2-dev \
		unzip \
	; \
	rm -rf /var/lib/apt/lists/*; \
	debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"; \
	docker-php-ext-configure ldap --with-libdir="lib/$debMultiarch"; \
	docker-php-ext-configure gd --with-freetype-dir=/usr --with-png-dir=/usr --with-jpeg-dir=/usr; \
	docker-php-ext-install \
		gd \
		mysqli \
		pgsql \
		soap \
		zip \
	; \
    pecl install imagick; \
    docker-php-ext-enable imagick; \
    \
    chown -R www-data:root /var/www/html; \
    chmod -R g=u /var/www/html

# Get Dolibarr
ADD https://github.com/Dolibarr/dolibarr/archive/${DOLI_VERSION}.zip /tmp/dolibarr.zip
RUN set -ex; \
	unzip -q /tmp/dolibarr.zip -d /tmp/dolibarr; \
	rm /tmp/dolibarr.zip; \
	mkdir -p /usr/src/dolibarr; \
	cp -r /tmp/dolibarr/dolibarr-${DOLI_VERSION}/* /usr/src/dolibarr; \
	rm -rf /tmp/dolibarr; \
	chmod +x /usr/src/dolibarr/scripts/*

RUN if [ ! -d /usr/src/dolibarr/init ] ; then \
			mkdir /usr/src/dolibarr/init ; \
		fi

RUN if [ ! -d /usr/src/dolibarr/htdocs/custom ] ; then \
			mkdir /usr/src/dolibarr/htdocs/custom ; \
		fi

RUN if [ ! -d /usr/src/dolibarr/scripts/custom ] ; then \
			mkdir /usr/src/dolibarr/scripts/custom ; \
		fi

RUN a2enmod rewrite
RUN a2enmod headers

CMD ["apache2-foreground"]
