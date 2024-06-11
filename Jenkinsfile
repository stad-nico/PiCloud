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
                                // agent {
                                //     dockerfile {
                                //         filename "Dockerfile.test"
                                //     }
                                // }

                                steps {
                                    script {
                                        docker.image("mariadb").inside("-e MARIADB_ROOT_PASSWORD=password") {
                                            sh "while ! mariadb-admin ping; do sleep 1; done"
                                        }   
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