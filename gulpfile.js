/**
 * Copyright 2019 Red Hat, Inc. and others.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gulp = require('gulp');
const rename = require('gulp-rename');
const cp = require('child_process');

const quarkusServerExtDir = '../quarkus-ls/quarkus.ls.ext/com.redhat.quarkus.ls'
const quarkusServerExt = 'com.redhat.quarkus.ls';

const quarkusExtensionDir = '../quarkus-ls/quarkus.jdt.ext';
const quarkusExtension = 'com.redhat.microprofile.jdt.quarkus';

const quteServerDir = '../quarkus-ls/qute.ls/com.redhat.qute.ls'
const quteServer = 'com.redhat.qute.ls-uber.jar';

const quteExtensionDir = '../quarkus-ls/qute.jdt';
const quteExtension = 'com.redhat.qute.jdt';

gulp.task('buildServer', (done) => {
  cp.execSync(mvnw() + ' clean verify -DskipTests', { cwd: quarkusServerExtDir , stdio: 'inherit' });
  gulp.src(quarkusServerExtDir + '/target/' + quarkusServerExt + '-!(*sources).jar')
    .pipe(rename(quarkusServerExt + '.jar'))
    .pipe(gulp.dest('./server'));
  // copy over any dependencies not provided by mp-ls
  // dependencies are copied into /target/lib by the maven-dependency-plugin
  gulp.src(quarkusServerExtDir + '/target/lib/*.jar')
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildExtension', (done) => {
  cp.execSync(mvnw() + ' -pl "' + quarkusExtension + '" clean verify -DskipTests', { cwd: quarkusExtensionDir, stdio: 'inherit' });
  gulp.src(quarkusExtensionDir + '/' + quarkusExtension + '/target/' + quarkusExtension + '-!(*sources).jar')
    .pipe(rename(quarkusExtension + '.jar'))
    .pipe(gulp.dest('./jars'));
  done();
});

gulp.task('buildQuteServer', (done) => {
  cp.execSync(mvnw() + ' clean install -DskipTests', { cwd: quteServerDir , stdio: 'inherit' });
  gulp.src(quteServerDir + '/target/' + quteServer)
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildQuteExtension', (done) => {
  cp.execSync(mvnw() + ' -pl "' + quteExtension + '" clean verify -DskipTests', { cwd: quteExtensionDir, stdio: 'inherit' });
  gulp.src(quteExtensionDir + '/' + quteExtension + '/target/' + quteExtension + '-!(*sources).jar')
    .pipe(rename(quteExtension + '.jar'))
    .pipe(gulp.dest('./jars'));
  done();
});

gulp.task('build', gulp.series('buildServer', 'buildExtension','buildQuteServer', 'buildQuteExtension'));

function mvnw() {
	return isWin() ? 'mvnw.cmd' : './mvnw';
}

function isWin() {
	return /^win/.test(process.platform);
}
