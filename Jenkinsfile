pipeline {
    agent {
        label "linux"
    }

    tools {
        nodejs "latest"
    }

    stages {
        stage("Backend Install") {
            steps {
                dir("backend") {
                    sh "npm ci"
                }
            }
        }

        stage("Backend Unit Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:unit:cov"
                }
            }

            post {
                always {
                    recordCoverage(
                        enabledForFailure: true,
                        tools: [[parser: 'COBERTURA', pattern: 'coverage/cobertura-coverage.xml']],
                        qualityGates: [
                            [criticality: 'NOTE', integerThreshold: 80, metric: 'LINE', threshold: 80.0], 
                            [criticality: 'NOTE', integerThreshold: 80, metric: 'BRANCH', threshold: 80.0]
                        ]
                    )
                }
            }
        }

        stage("Backend Integration Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:integration"
                }
            }
        }

        stage("Backend e2e Tests") {
            steps {
                dir("backend") {
                    sh "npm run test:e2e"
                }
            }
        }
    }
}