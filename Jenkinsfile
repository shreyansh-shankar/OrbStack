pipeline {
	agent {
		label 'go-make-agent'
	}

	options {
		timestamps()
	}

	environment {
		CLI_CHANGED = "false"
	}

	stages {

		stage('Checkout source code') {
			steps {
				checkout scm
			}
		}

		stage('Detect Changed Components') {
			steps {
				script {
					def config = readYaml file: '.ci/components.yaml'

					def changedFiles = sh(
                        script: '''
                            if git rev-parse HEAD~1 >/dev/null 2>&1; then
                                git diff --name-only HEAD~1 HEAD
                            else
                                git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim().split('\n')

					echo ""
					echo "======================== Changed Files ========================"
					
					changedFiles.each {
						echo it
					}

					echo ""
					echo "=================== Component Analysis ========================"

					config.components.each { componentName, component -> 
						boolean changed = false

						component.paths.each { pattern ->

                            def regex = pattern
                                .replace(".", "\\.")
                                .replace("**", ".*")
                                .replace("*", "[^/]*")

                            changedFiles.each { file ->

                                if (file ==~ regex) {
                                    changed = true
                                }

                            }

                        }
						echo "${changed ? '✓' : '✗'} ${componentName}"

                        if (componentName == "cli") {
                            env.CLI_CHANGED = changed.toString()
                        }
					}

					echo ""
					echo "CLI_CHANGED = ${env.CLI_CHANGED}"
				}
			}
		}

		stage('Verify the CLI') {
			steps {
				sh 'make verify'
			}
		}

		stage('')  {

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

