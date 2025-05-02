pipeline {
    agent any

    environment {
        REPO_URL = 'https://github.com/TirthMesariya/Krinik.in.git'
        REPO_DIR = 'Krinik.in'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: "${REPO_URL}", branch: 'main'
            }
        }

        stage('Install Git') {
            steps {
                sh 'sudo apt-get update'
                sh 'sudo apt-get install -y git'
            }
        }

        stage('Install Docker') {
            steps {
                sh '''
                    sudo apt-get update
                    sudo apt-get install -y \
                      ca-certificates \
                      curl \
                      gnupg \
                      lsb-release
                      
                    curl -fsSL https://get.docker.com | sudo sh
                    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                    sudo usermod -aG docker $USER
                '''
            }
        }

        stage('Build & Run Docker Container') {
            steps {
                dir("${REPO_DIR}") {
                    sh 'sudo docker compose -f docker-compose.yml up -d --build'
                }
            }
        }
    }

    post {
        failure {
            echo 'Build failed!'
        }
        success {
            echo 'Build and deployment successful!'
        }
    }
}
