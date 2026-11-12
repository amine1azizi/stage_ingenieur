pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = 'amineazizi/elevator-backend'
        FRONTEND_IMAGE = 'amineazizi/elevator-frontend'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                checkout scm
            }
        }

        stage('Build with Maven and npm') {
            steps {
                dir('backend') {
                    sh 'chmod +x mvnw && ./mvnw -B -DskipTests clean package'
                }
                dir('frontend') {
                    sh 'npm ci --no-audit --no-fund && npm run build'
                }
            }
        }

        stage('Run Tests') {
            steps {
                withCredentials([file(credentialsId: 'app-env', variable: 'ENV_FILE')]) {
                    dir('backend') {
                        sh '''
                            docker network connect elevator-management_default jenkins || true
                            tr -d '\\r' < "$ENV_FILE" > /tmp/app.env
                            set -a
                            . /tmp/app.env
                            set +a
                            export SPRING_DATA_MONGODB_URI="mongodb://mongodb:27017/elevator_test"
                            ./mvnw -B test
                        '''
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Analyse SonarQube') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    dir('backend') {
                        sh './mvnw -B sonar:sonar -Dsonar.projectKey=elevator-management-backend -Dsonar.projectName=elevator-management-backend -Dsonar.host.url=http://sonarqube:9000 -Dsonar.token=$SONAR_TOKEN'
                    }
                }
            }
        }

        stage('Build Docker images') {
            steps {
                sh '''
                    docker build -t $BACKEND_IMAGE:$IMAGE_TAG -t $BACKEND_IMAGE:latest backend
                    docker build -t $FRONTEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest frontend
                '''
            }
        }

        stage('Docker Login and Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push $BACKEND_IMAGE:$IMAGE_TAG
                        docker push $BACKEND_IMAGE:latest
                        docker push $FRONTEND_IMAGE:$IMAGE_TAG
                        docker push $FRONTEND_IMAGE:latest
                    '''
                }
            }
        }

        stage('Restart Services with Docker Compose') {
            steps {
                withCredentials([file(credentialsId: 'app-env', variable: 'ENV_FILE')]) {
                    sh '''
                        tr -d '\\r' < "$ENV_FILE" > .env
                        docker compose -p elevator-management up -d --build
                        docker compose -p elevator-management ps
                        rm -f .env
                    '''
                }
            }
        }
    }
}
