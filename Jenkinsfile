    pipeline {
        agent {
            label "linux"
        }

        tools {
            nodejs "latest"
            dockerTool "docker"
        }

        stages {
            stage("Backend Test") {
                steps {
                    script {
                        docker.image('maven:3.3.3').inside {
        sh 'mvn --version'
      }
                        // docker.image('mariadb:latest').withRun("--platform linux/arm64 -e MARIADB_ROOT_PASSWORD=password") { c -> 
                        //     sh "while ! mariadb-admin -u root --password=password ping; do echo 'waiting for mariadb; sleep 1; done;'"

                        //     sh "mariadb-admin create cloud-test --password=password"

                        //     sh "npm ci"

                        //     sh "npm run mikro-orm:test migration:fresh -- --seed"

                        //     sh "npm run test:unit:cov"
                        // }
                    }
                }
            }
        }
    }