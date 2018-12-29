#! /bin/bash

# link the current conf into logstash
sudo rm -rf /etc/logstash/conf.d
sudo ln -s /vagrant/src /etc/logstash/conf.d

logstash_config="/etc/default/logstash"
environment_config="/etc/environment"

echo 'ENVIRONMENT_NAME="vagrant"' | sudo tee --append $logstash_config
echo "ES_URL=http://localhost:9200" | sudo tee --append $logstash_config
echo "ES_USER=logstash" | sudo tee --append $logstash_config
echo "ES_PASS=keep_it_stashy" | sudo tee --append $logstash_config

# clone the config into the environment so that manually running the service works
cat $logstash_config >> $environment_config
source $environment_config

sudo systemctl start logstash.service
