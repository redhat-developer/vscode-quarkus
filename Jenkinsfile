#!/usr/bin/env groovy

node('rhel7'){
    stage('Checkout repos') {
        deleteDir()
        def hasServerDir = fileExists 'quarkus-ls'
        if (!hasServerDir){
            sh 'mkdir quarkus-ls'
        }
        dir ('quarkus-ls') {
            git url: 'https://github.com/redhat-developer/quarkus-ls.git' 
        }
        def hasClientDir = fileExists 'vscode-quarkus'
        if (!hasClientDir) {
            sh 'mkdir vscode-quarkus'
        }
        dir ('vscode-quarkus') {
            git url: 'https://github.com/redhat-developer/vscode-quarkus.git'
        }
    }

    stage('Install requirements') {
        def nodeHome = tool 'nodejs-8.11.1'
        env.PATH="${env.PATH}:${nodeHome}/bin"
        sh "npm install -g typescript vsce"
    }

    stage('Build') {
        env.JAVA_HOME="${tool 'openjdk-1.8'}"
        env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
        dir ('vscode-quarkus') {
            sh "npm install --ignore-scripts"
            sh "npm install"
            sh "npm run build"
            sh "npm run vscode:prepublish"
        }
    }

    withEnv(['JUNIT_REPORT_PATH=report.xml']) {
        stage('Test') {
            wrap([$class: 'Xvnc']) {
                dir ('vscode-quarkus') {
                    sh "npm test --silent"
                    //junit 'report.xml'
                }
            }
        }
    }

    stage('Package') {
        dir ('vscode-quarkus') {
            def packageJson = readJSON file: 'package.json'
            sh "vsce package -o ../vscode-quarkus-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
            sh "npm pack && mv vscode-quarkus-${packageJson.version}.tgz ../vscode-quarkus-${packageJson.version}-${env.BUILD_NUMBER}.tgz"
        }
    }

    if(params.UPLOAD_LOCATION) {
        stage('Snapshot') {
            def filesToPush = findFiles(glob: '**.vsix')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${filesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/vscode-quarkus/"
            stash name:'vsix', includes:filesToPush[0].path
            def tgzFilesToPush = findFiles(glob: '**.tgz')
            stash name:'tgz', includes:tgzFilesToPush[0].path
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgzFilesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/vscode-quarkus/"
        }
    }

    if('true'.equals(publishToMarketPlace)){
        timeout(time:5, unit:'DAYS') {
            input message:'Approve deployment?', submitter: 'fbricon,azerr,dakwon'
        }

        stage("Publish to Marketplace") {
            unstash 'vsix'
            unstash 'tgz'
            withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                def vsix = findFiles(glob: '**.vsix')
                sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
            }
            archiveArtifacts artifacts:"**.vsix,**.tgz"

            stage "Promote the build to stable"
            def vsix = findFiles(glob: '**.vsix')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/stable/vscode-quarkus/"
            def tgz = findFiles(glob: '**.tgz')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgz[0].path} ${UPLOAD_LOCATION}/stable/vscode-quarkus/"
        }
    }
}