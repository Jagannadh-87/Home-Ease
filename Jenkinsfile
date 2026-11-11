// HomeEase – Declarative CI/CD pipeline
// Needs on the Jenkins machine: git, node 20 + npm, JDK 17 + maven, docker + docker compose plugin, curl
// Needs Jenkins credentials: 'homeease-jwt-secret' (Secret text), optional 'dockerhub-creds' (Username/password)
pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  triggers { githubPush() }   // fired by the GitHub webhook -> http://<jenkins>/github-webhook/

  parameters {
    booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: false, description: 'Push images to Docker Hub (needs the dockerhub-creds credential)')
  }

  environment {
    APP_NAME           = 'HomeEase'
    APP_VERSION        = '1.0.0'
    DEPLOY_ENV         = 'jenkins-docker'
    IMAGE_PREFIX       = 'homeease'
    JWT_SECRET         = credentials('homeease-jwt-secret')   // never hardcoded
    COMPOSE_PROJECT_NAME = 'homeease'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT       = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
          env.GIT_SHORT        = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
          env.BUILD_TIMESTAMP  = sh(returnStdout: true, script: 'date -u +%Y-%m-%dT%H:%M:%SZ').trim()
          env.IMAGE_TAG        = "${env.BUILD_NUMBER}-${env.GIT_SHORT}"
          echo "Build #${env.BUILD_NUMBER} | commit ${env.GIT_SHORT} | image tag ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Check Tools') {
      steps { sh 'node -v && npm -v && java -version && mvn -v && docker --version && docker compose version' }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Backend')  { steps { dir('backend')  { sh 'npm ci' } } }
        stage('Frontend') { steps { dir('frontend') { sh 'npm ci' } } }
      }
    }

    stage('Backend Tests') {
      steps { dir('backend') { sh 'npm test' } }
    }

    stage('Build Frontend') {
      steps { dir('frontend') { sh 'npm run build' } }
    }

    stage('Maven Build & Test') {
      steps { dir('maven-demo') { sh 'mvn -B clean compile test package' } }
      post {
        always  { junit allowEmptyResults: true, testResults: 'maven-demo/target/surefire-reports/*.xml' }
        success { archiveArtifacts artifacts: 'maven-demo/target/*.jar', fingerprint: true }
      }
    }

    stage('Build Docker Images') {
      steps { sh 'docker compose build' }   // images tagged homeease/backend:$IMAGE_TAG and homeease/frontend:$IMAGE_TAG
    }

    stage('Push to Docker Hub (optional)') {
      when { expression { params.PUSH_TO_DOCKERHUB } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            for svc in backend frontend; do
              docker tag  ${IMAGE_PREFIX}/${svc}:${IMAGE_TAG} ${DH_USER}/homeease-${svc}:${IMAGE_TAG}
              docker push ${DH_USER}/homeease-${svc}:${IMAGE_TAG}
            done
            docker logout
          '''
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps { sh 'docker compose up --build -d --remove-orphans' }
    }

    stage('Health Check') {
      steps { sh 'bash devops/health-check.sh' }
    }
  }

  post {
    success { echo "Deployed build #${env.BUILD_NUMBER} (${env.GIT_SHORT}). Open http://localhost and check Admin > DevOps Build Inspector." }
    failure {
      echo 'Pipeline FAILED. Showing container logs for debugging.'
      sh 'docker compose ps || true; docker compose logs --tail=60 || true'
    }
    always { sh 'docker image prune -f || true' }
  }
}
