pipeline {
  agent any
  environment {
    DOCKERHUB_REPO = "spotluru/swe645-site"
    IMAGE_TAG      = "${env.BUILD_NUMBER}"
  }
  triggers { githubPush() }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} -t ${DOCKERHUB_REPO}:latest .
            docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
            docker push ${DOCKERHUB_REPO}:latest
            docker logout
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          kubectl set image deployment/swe645-web web=${DOCKERHUB_REPO}:${IMAGE_TAG} --record
          kubectl rollout status deployment/swe645-web --timeout=180s
        '''
      }
    }

    stage('Smoke Check') {
      steps {
        sh '''
          kubectl get deploy swe645-web
          kubectl get pods -l app=swe645-web -o wide
          kubectl get svc  swe645-web-svc
        '''
      }
    }
  }

  post {
    failure { sh 'kubectl rollout undo deployment/swe645-web || true' }
  }
}
