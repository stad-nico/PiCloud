pipeline {
    agent {
        label "linux"
    }

    stages {
        stage("-Backend-\n Install") {
            steps {
                sh "cd backend"
                sh "npm install"
            }
        }

        stage("-Backend-\n Unit Tests") {
            steps {
                sh "npm run test:unit"
            }
        }

        stage("-Backend-\n Integration Tests") {
            steps {
                sh "npm run test:integration"
            }
        }

        stage("-Backend-\n End2End Tests") {
            steps {
                sh "npm run test:e2e"
            }
        }
    }
}