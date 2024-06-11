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
                        stage("Unit Tests") {
                            steps {
                                script {
                                    sh "docker network inspect cloud-test >/dev/null 2>&1 || docker network create cloud-test"

                                    sh "docker run --rm --network=cloud-test --name=mariadb -d -e MARIADB_ROOT_PASSWORD=password -e MARIADB_DATABASE=cloud-test mariadb:latest"
                                    sh 'while ! docker exec -i mariadb mariadb-admin ping --password=password > /dev/null 2>&1; do echo "Warten auf MariaDB Container..."; sleep 1; done'

                                    sh "docker build -f backend/Dockerfile.test --tag=cloud/backend:test backend"
                                    sh "docker run -d --network=cloud-test -e DB_URL=mysql://root@localhost:3306 -e DB_NAME=cloud-test -e DB_PASSWORD=password cloud/backend:test"

                                    sh "docker stop mariadb"

                                    sh "docker volume prune"
                                }
                            }
                        }

                        stage("Integration Tests") {
                            steps {
                                echo "T"
                            }
                        }
                    }
                }
            }
        }
    }
}