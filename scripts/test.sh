#! /bin/bash

sudo systemctl stop logstash

temp_path="/tmp/test"
test_source="/vagrant/test/acceptance"

sudo rm -rf "$temp_path/*"
sudo mkdir -p $temp_path
sudo cp -r /vagrant/src/* $temp_path
sudo cp $test_source/*.conf $temp_path

find $test_source/* -type d | while read test_path; do
    echo "Running $(basename $test_path) tests..."

    sudo /usr/share/logstash/bin/logstash \
        "--path.settings" "/etc/logstash" \
        "--path.config" "$temp_path" \
        < "$test_path/input.log"

    sudo touch "$temp_path/output.log"   # create it if it doesnt exist (dropped logs etc.)
    sudo rm -f "$test_path/result.log"
    sudo mv "$temp_path/output.log" "$test_path/result.log"

    echo "$(basename $test_path) tests done"
done

sudo systemctl start logstash
