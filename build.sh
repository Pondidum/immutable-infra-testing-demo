#! /bin/bash

# configure
security_group_id="sg-xxxxxxxxxxx" # allow ssh
subnet_id="subnet-xxxxxxxxxxxx" # internal / same as this machines
keypair_name="VerificationKey" # make sure you have the private key...

# build!
packer_log=$(packer build logstash.json | tee /dev/tty)
ami_id=$(echo "$packer_log" | tail -n 1 | sed 's/.*\(ami.*\)/\1/')

# provision
read -r -d '' userdata <<-'EOF'
#! /bin/bash

env_config="/etc/default/logstash"

echo "ENVIRONMENT_NAME=verify" | sudo tee --append $env_config
echo "ES_URL=http://localhost:9200" | sudo tee --append $env_config
echo "ES_USER=logstash" | sudo tee --append $env_config
echo "ES_PASS=you_shall_not" | sudo tee --append $env_config
echo "JAEGER_URL=http://localhost:9411/api/v2/spans"| sudo tee --append $env_config
EOF

json=$(aws ec2 run-instances \
    --image-id "$ami_id" \
    --instance-type t2.small \
    --key-name "$keypair_name" \
    --region eu-west-1 \
    --subnet-id "$subnet_id" \
    --security-group-ids "$security_group_id" \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=logstash-verification}]' \
    --user-data "$userdata")

instance_id=$(echo "$json" | jq -r .Instances[0].InstanceId)
private_ip=$(echo "$json" | jq -r .Instances[0].PrivateIpAddress)

echo "Instance ID: $instance_id, IP: $private_ip"

LOGSTASH_ADDRESS="$private_ip"
LOGSTASH_SSH="ubuntu"
LOGSTASH_KEYPATH="~/.ssh/id_rsa"

# test
npm run test

# destroy
aws ec2 terminate-instances \
    --instance-ids "$instance_id"

echo "Build Finished"
echo "AMI: $ami_id"
