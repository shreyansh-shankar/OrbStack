pipeline {
	agent jenkins-go-agent

	options {
		timestamps()
	}

	stages {

		stage('Checkout') {
			steps {
				checkout scm
			}
		}

		stage('Verify') {
			steps {
				sh 'make verify'
			}
		}

		stage('Build Release Artifacts') {
			steps {
				sh 'make dist'
			}
		}

		stage('Archive Artifacts') {
			steps {
				archiveArtifacts(
					artifacts: 'dist/**',
					fingerprint: true
				)
			}
		}
	}

	post {
		success {
			echo 'Build completed successfully.'
		}

		failure {
			echo 'Build failed.'
		}

		always {
			cleanWs()
		}
	}
}

