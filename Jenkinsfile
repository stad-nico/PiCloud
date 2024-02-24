pipeline {
    triggers {
        pollSCM("")
    }

    agent {
        label "linux"
    }

    stages {
        stage("-Backend-\n Install") {
            steps {
                dir("backend") {
                    sh "npm install"
                }
            }
        }

        stage("-Backend-\n Unit Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:unit"
                }
            }
        }

        stage("-Backend-\n Integration Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:integration"
                }
            }
        }

        stage("-Backend-\n End2End Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:e2e"
                }
            }
        }
    }
}