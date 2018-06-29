FROM php:7.2-apache

# install composer
RUN echo 'y' | apt-get update && \
    echo 'y' | apt-get install git

# install PDO
RUN docker-php-ext-install pdo pdo_mysql

# just so I don't have to everytime I want to debug
RUN echo 'y' | apt-get install neovim;

RUN curl -sS https://getcomposer.org/installer | php \
        && mv composer.phar /usr/local/bin/ \
        && ln -s /usr/local/bin/composer.phar /usr/local/bin/composer

WORKDIR /var/www/

COPY ./database /var/database
RUN chown -R www-data:www-data ../database/

COPY . /var/www/
RUN composer install --no-interaction
ENV PATH="~/.composer/vendor/bin:./vendor/bin:${PATH}"

RUN chown -R www-data:www-data /var/www

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2

RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf # enable htacess

# site root is public/
RUN sed -i 's/<Directory \/var\/www\/>/<Directory \/var\/www\/public\/>/' /etc/apache2/apache2.conf
RUN sed -i 's/\/var\/www\/html/\/var\/www\/public\//' /etc/apache2/sites-available/000-default.conf

RUN a2enmod rewrite headers
RUN service apache2 restart

ONBUILD RUN /var/www/initialize-fake-db

EXPOSE 80
EXPOSE 443
