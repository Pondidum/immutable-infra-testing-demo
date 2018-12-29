#! /bin/sh

sudo rm /etc/logstash/conf.d/*
sudo cp -r /tmp/src/* /etc/logstash/conf.d

# this will be in the UserData in the cfn stack, so that we don't have to
# have a different ami for each environment due to the Environment tag
# put this (from the #! onwards)
: '

#! /bin/bash

env_config="/etc/default/logstash"
env_name=$(echo "${Environment}" | tr '[:upper:]' '[:lower:]')

echo "ENVIRONMENT_NAME=$env_name" | sudo tee --append $env_config

echo "ES_URL=${ElasticUrl}" | sudo tee --append $env_config
echo "ES_USER=${ElasticUser}" | sudo tee --append $env_config
echo "ES_PASS=${ElasticPassword}" | sudo tee --append $env_config

sudo systemctl start logstash.service

'
