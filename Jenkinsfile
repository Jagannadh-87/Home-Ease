// HomeEase – Declarative CI/CD pipeline (Windows Jenkins)
pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: false, description: 'Push images to Docker Hub (needs dockerhub-creds)')
  }

  environment {
    APP_NAME             = 'HomeEase'
    APP_VERSION          = '1.0.0'
    DEPLOY_ENV           = 'jenkins-docker'
    IMAGE_PREFIX         = 'homeease'
    JWT_SECRET           = credentials('homeease-jwt-secret')
    COMPOSE_PROJECT_NAME = 'homeease'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT      = bat(returnStdout: true, script: '@git rev-parse HEAD').trim()
          env.GIT_SHORT       = bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
          env.BUILD_TIMESTAMP = powershell(returnStdout: true, script: "(Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')").trim()
          env.IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_SHORT}"
          echo "Build #${env.BUILD_NUMBER} | commit ${env.GIT_SHORT} | image tag ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Check Tools') {
      steps {
        bat '''
          node -v
          npm -v
          java -version
          mvn -v
          docker --version
          docker compose version
        '''
      }
    }

    stage('Install Dependencies') {
      parallel {
        stage('Backend')  { steps { dir('backend')  { bat 'npm ci' } } }
        stage('Frontend') { steps { dir('frontend') { bat 'npm ci' } } }
      }
    }

    stage('Backend Tests') {
      steps { dir('backend') { bat 'npm test' } }
    }

    stage('Build Frontend') {
      steps { dir('frontend') { bat 'npm run build' } }
    }

    stage('Maven Build & Test') {
      steps { dir('maven-demo') { bat 'mvn -B clean compile test package' } }
      post {
        always  { junit allowEmptyResults: true, testResults: 'maven-demo/target/surefire-reports/*.xml' }
        success { archiveArtifacts artifacts: 'maven-demo/target/*.jar', fingerprint: true }
      }
    }

    stage('Build Docker Images') {
      steps { bat 'docker compose build' }
    }

    stage('Push to Docker Hub (optional)') {
      when { expression { params.PUSH_TO_DOCKERHUB } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          bat '''
            echo %DH_PASS%| docker login -u %DH_USER% --password-stdin
            docker tag %IMAGE_PREFIX%/backend:%IMAGE_TAG% %DH_USER%/homeease-backend:%IMAGE_TAG%
            docker push %DH_USER%/homeease-backend:%IMAGE_TAG%
            docker tag %IMAGE_PREFIX%/frontend:%IMAGE_TAG% %DH_USER%/homeease-frontend:%IMAGE_TAG%
            docker push %DH_USER%/homeease-frontend:%IMAGE_TAG%
            docker logout
          '''
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps { bat 'docker compose up --build -d --remove-orphans' }
    }

    stage('Health Check') {
      steps {
        powershell '''
          $ok = $false
          for ($i = 1; $i -le 12; $i++) {
            try {
              $r = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost" -TimeoutSec 5
              if ($r.StatusCode -eq 200) { $ok = $true; break }
            } catch { }
            Write-Host "Waiting for app... attempt $i"
            Start-Sleep -Seconds 5
          }
          if (-not $ok) { Write-Error "Health check failed"; exit 1 }
          Write-Host "Health check passed"
        '''
      }
    }
  }

  post {
    success {
      echo "Deployed build #${env.BUILD_NUMBER}. Open http://localhost"
      mail to: 'karrijagannadhcse87@gmail.com',
           subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
           body: "Build succeeded.\nDetails: ${env.BUILD_URL}"
    }
    failure {
      echo 'Pipeline FAILED. Showing container logs.'
      bat(returnStatus: true, script: 'docker compose ps')
      bat(returnStatus: true, script: 'docker compose logs --tail=60')
      mail to: 'karrijagannadh87@gmail.com',
           subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
           body: "Build failed.\nCheck: ${env.BUILD_URL}"
    }
    always {
      bat(returnStatus: true, script: 'docker image prune -f')
    }
  }
}
