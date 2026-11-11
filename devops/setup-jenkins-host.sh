#!/usr/bin/env bash
# Ubuntu 22.04/24.04: installs Java 17, Jenkins, Docker, Node 20, Maven and gives Jenkins Docker access.
set -e
sudo apt-get update
sudo apt-get install -y fontconfig openjdk-17-jdk maven git curl ca-certificates gnupg
# Docker (official convenience script) + compose plugin
curl -fsSL https://get.docker.com | sudo sh
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs
# Jenkins LTS
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt-get update && sudo apt-get install -y jenkins
# IMPORTANT: let the jenkins user talk to Docker, then restart Jenkins so the group applies
sudo usermod -aG docker jenkins
sudo systemctl enable --now docker jenkins
sudo systemctl restart jenkins
echo "Initial admin password:"; sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "Open http://localhost:8080"
