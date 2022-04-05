#!/usr/bin/env groovy

node('rhel8'){
    stage('Checkout repos') {
        deleteDir()
        def hasLsp4mpDir = fileExists 'lsp4mp'
        if (!hasLsp4mpDir){
            sh 'mkdir lsp4mp'
        }
        dir ('lsp4mp') {
            git url: 'https://github.com/eclipse/lsp4mp.git'
        }
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
        def nodeHome = tool 'nodejs-12.13.1'
        env.PATH="${env.PATH}:${nodeHome}/bin"
        sh 'npm install -g typescript "vsce@<2"'
    }

    stage('Build') {
        env.JAVA_HOME="${tool 'openjdk-11'}"
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
            sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-quarkus/ <<< \$'put -p ${filesToPush[0].path}'"
            stash name:'vsix', includes:filesToPush[0].path
            def tgzFilesToPush = findFiles(glob: '**.tgz')
            stash name:'tgz', includes:tgzFilesToPush[0].path
            sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-quarkus/ <<< \$'put -p ${tgzFilesToPush[0].path}'"
        }
    }

    if('true'.equals(publishToMarketPlace)){
        timeout(time:5, unit:'DAYS') {
            input message:'Approve deployment?', submitter: 'fbricon,rgrunber,azerr,davthomp'
        }

        stage("Publish to Marketplaces") {
            unstash 'vsix'
            unstash 'tgz'
            def vsix = findFiles(glob: '**.vsix')
            // VS Code Marketplace
            withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
            }

            // open-vsx Marketplace
            sh 'npm install -g "ovsx@<0.3.0"'
            withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
              sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
            }

            archiveArtifacts artifacts:"**.vsix,**.tgz"

            stage "Promote the build to stable"
            sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-quarkus/ <<< \$'put -p ${vsix[0].path}'"
            def tgz = findFiles(glob: '**.tgz')
            sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-quarkus/ <<< \$'put -p ${tgz[0].path}'"
        }
    }
}
