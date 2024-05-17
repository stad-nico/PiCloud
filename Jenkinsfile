pipeline {
    agent {
        label "linux"
    }

    tools {
        nodejs "latest"
        docker "latest"
    }

    stages {
        stage("Backend Test") {
            steps {
                script {
                    docker.image('mariadb:latest').withRun("-e MARIADB_ROOT_PASSWORD=password") { c -> 
                        sh "while ! mariadb-admin -u root --password=password ping; do echo 'waiting for mariadb; sleep 1; done;'"

                        sh "mariadb-admin create cloud-test --password=password"

                        sh "npm ci"

                        sh "npm run mikro-orm:test migration:fresh -- --seed"

                        sh "npm run test:unit:cov"
                    }
                }
            }
        }
    }
}