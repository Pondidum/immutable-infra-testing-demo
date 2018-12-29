#! /bin/bash

# add elastic's package repository
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/6.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-6.x.list

# update all repositories
sudo apt-get update

# install openjdk and set environment variable
sudo apt-get install openjdk-8-jre -y
JAVA=$(readlink -f $(which java) | sed "s:bin/java::")
echo JAVA_HOME='"'$JAVA'"' | sudo tee --append /etc/environment

#install logstash
sudo apt-get install logstash -y

# add plugins
/usr/share/logstash/bin/logstash-plugin install logstash-filter-uuid
/usr/share/logstash/bin/logstash-plugin install logstash-filter-prune

# fire it up!
sudo systemctl enable logstash.service
