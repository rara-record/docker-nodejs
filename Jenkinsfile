pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "thanhlam2k4/nodejs_app"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Git Pulling Code') {
            steps {
                echo 'Pulling code from GitHub.....'
                git 'https://github.com/Thanhlam43k4/Dockerize-Application-with-Database-MySQL.git'
            }
        }

        stage('Build Docker image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Testing') {
            steps {
                echo 'Testing stage .....'
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub_id', url: 'https://index.docker.io/v1/') {
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to Production') {
            steps {
                sshagent(['prod-server-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no user@your-prod-server-ip "
                            cd /opt/app &&
                            docker compose -f docker-compose.prod.yml pull &&
                            docker compose -f docker-compose.prod.yml up -d
                        "
                    '''
                }
            }
        }
    }
}

