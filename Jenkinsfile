pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "a52447879/nodejs_app"
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDENTIALS = credentials('dockerhub_id')
    }
    stages {
        stage('Git Pulling Code') {
            steps {
                echo 'Pulling code from GitHub.....'
                git 'https://github.com/rara-record/docker-nodejs.git'
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
                // 환경 확인
                sh 'node --version'
                sh 'npm --version'

                // 의존성 설치
                sh 'npm ci'
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
                sshagent(['deploy_ssh_key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no root@158.247.244.57 "
                            docker login -u $DOCKER_CREDENTIALS_USR -p $DOCKER_CREDENTIALS_PSW &&
                            cd /path/to/project &&
                            docker-compose pull &&
                            docker-compose up -d --remove-orphans
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'rm -f .env'
            sh 'docker system prune -f'
        }
    }
}

