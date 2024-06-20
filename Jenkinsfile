pipeline {
    agent {
        label "linux"
    }

    stages {
        stage("Parallel") {
            parallel {
                stage("Frontend") {
                    steps {
                        echo "T"
                    }
                }
            
               stage("Backend") {
                    stages {
                        stage("Prepare Database") {
                            steps {
                                sh "docker network inspect cloud-test >/dev/null 2>&1 || docker network create cloud-test"

                                sh "docker run --rm --network=cloud-test --name=mariadb -d -p 3306:3306/tcp -e MARIADB_ROOT_PASSWORD=password -e MARIADB_DATABASE=cloud-test mariadb:latest"
                                sh 'while ! docker exec -i mariadb mariadb --password=password -e "SHOW DATABASES;" > /dev/null 2>&1; do echo "Warten auf MariaDB Container..."; sleep 1; done'
                            }
                        }

                        stage("Unit Tests") {
                            steps {
                                dir("backend") {
                                    sh "docker build -f Dockerfile.test --tag=cloud/backend:test ."
                                    sh "docker run --network=cloud-test --name=backend -e DB_URL=mysql://root@mariadb:3306 -e DB_NAME=cloud-test -e DB_PASSWORD=password cloud/backend:test"
                                    sh "docker cp backend:/app/coverage/ coverage"
                                
                                    recordCoverage(qualityGates: [[integerThreshold: 90, metric: 'LINE', threshold: 90.0], [integerThreshold: 90, metric: 'BRANCH', threshold: 90.0]], tools: [[parser: 'COBERTURA', pattern: '**/coverage/cobertura-coverage.xml']])
                                
                                    sh "docker rm backend"
                                }
                            }
                        }

                        stage("Integration Tests") {
                            steps {
                                echo "T"
                            }
                        }
                    }

                    post {
                        always {
                            script {
                                try {
                                    sh "docker rm backend"
                                } catch (Exception e) {}
                                
                                sh "docker stop mariadb"
                                sh "docker volume prune -f"
                                sh "docker image prune -f"
                            }
                        }
                    }
                }
            }
        }
    }
}