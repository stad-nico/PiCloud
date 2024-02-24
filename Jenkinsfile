pipeline {
    triggers {
        pollSCM("")
    }

    agent {
        label "linux"
    }

    stages {
        stage("Backend<br>Install") {
            steps {
                dir("backend") {
                    sh "npm install"
                }
            }
        }

        stage("Backend<br>Unit Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:unit"
                }
            }
        }

        stage("Backend<br>Integration Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:integration"
                }
            }
        }

        stage("Backend<br>End2End Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:e2e"
                }
            }
        }
    }
}