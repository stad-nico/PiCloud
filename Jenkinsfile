    pipeline {
        agent {
            label "linux"
        }

        stages {
            stage("Parallel") {
                parallel {
                    stage("Frontend") {

                    }

                    stage("Backend") {
                        stages {
                            stage("Unit Tests") {

                            }

                            stage("Integration Tests")
                        }
                    }
                }
            }
        }
    }