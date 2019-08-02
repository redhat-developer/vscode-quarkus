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

const serverName = 'com.redhat.quarkus.ls-uber.jar';
const extensionName = 'com.redhat.quarkus.jdt.core-*.jar';
const extensionVersionless = 'com.redhat.quarkus.jdt.core.jar';
const serverDir = '../quarkus-ls/quarkus.ls/com.redhat.quarkus.ls';
const extensionDir = '../quarkus-ls/quarkus.jdt';

gulp.task('buildServer', (done) => {
  cp.execSync(mvnw() + ' clean verify', { cwd: serverDir , stdio: 'inherit' });
  gulp.src(serverDir + '/target/' + serverName)
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildExtension', (done) => {
  cp.execSync(mvnw() + ' clean verify -f com.redhat.quarkus.jdt.core/pom.xml', { cwd: extensionDir, stdio: 'inherit' });
  gulp.src(extensionDir + '/com.redhat.quarkus.jdt.core/target/' + extensionName)
    .pipe(rename(extensionVersionless))
    .pipe(gulp.dest('./jars'));
  done();
});

gulp.task('build', gulp.series('buildServer', 'buildExtension'));

function mvnw() {
	return isWin() ? 'mvnw.cmd' : './mvnw';
}

function isWin() {
	return /^win/.test(process.platform);
}