pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "a52447879/nodejs_app"
        DOCKER_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDENTIALS = credentials('dockerhub_id')
        DEPLOY_SERVER = "158.247.238.111"
        DEPLOY_PATH = "/root/docker-nodejs"
        MYSQL_CREDS = credentials('mysql_credentials')
    }
    stages {
        stage('Git Pulling Code') {
            steps {
                echo 'Pulling code from GitHub.....'
                git branch: 'main', url: 'https://github.com/rara-record/docker-nodejs.git', credentialsId: 'github_token'
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
                echo 'Skipping tests for now...'
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

        stage('Prepare Deployment') {
            steps {
                sh '''
                    # 프로덕션용 환경 변수 파일 생성
                    cat << EOF > .env
                    MYSQL_HOST=mysql_server
                    MYSQL_DATABASE=test_db
                    MYSQL_USER=${MYSQL_CREDS_USR}
                    MYSQL_PASSWORD=${MYSQL_CREDS_PSW}
                    EOF
                '''
            }
        }

        stage('Setup Remote Server') {
            steps {
                sshagent(['deploy_ssh_key']) {
                    sh '''
                        # 배포 디렉토리 생성
                        ssh -o StrictHostKeyChecking=no root@${DEPLOY_SERVER} "mkdir -p ${DEPLOY_PATH}"
                    '''
                }
            }
        }

        stage('Copy Deployment Files') {
            steps {
                sshagent(['deploy_ssh_key']) {
                    sh '''
                        # 필요한 파일들을 서버에 복사
                        scp -o StrictHostKeyChecking=no .env docker-compose.yml init.sql root@${DEPLOY_SERVER}:${DEPLOY_PATH}/
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sshagent(['deploy_ssh_key']) {
                    sh '''
                        # Docker 로그인 및 컨테이너 실행
                        ssh -o StrictHostKeyChecking=no root@${DEPLOY_SERVER} "
                            cd ${DEPLOY_PATH} &&
                            docker login -u $DOCKER_CREDENTIALS_USR -p $DOCKER_CREDENTIALS_PSW &&
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
            // 오래된 이미지와 컨테이너만 정리
            sh '''
                docker image prune -a --force --filter "until=24h"
                docker container prune --force --filter "until=24h"
            '''
        }
    }
}

