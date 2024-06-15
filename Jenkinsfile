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
                                sh "docker build -f backend/Dockerfile.test --tag=cloud/backend:test backend"
                                sh "docker run --rm --network=cloud-test --name=backend -e DB_URL=mysql://root@mariadb:3306 -e DB_NAME=cloud-test -e DB_PASSWORD=password cloud/backend:test"
                            }
                        }

                        stage("Integration Tests") {
                            steps {
                                echo "T"
                            }
                        }

                        post {
                            always {
                                sh "docker stop mariadb"
                                sh "docker volume prune -f"
                            }
                        }
                    }
                }
            }
        }
    }
}