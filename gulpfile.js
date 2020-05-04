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

const microprofileServerName = 'com.redhat.microprofile.ls-uber.jar';
const extensions = ['com.redhat.microprofile.jdt.core', 'com.redhat.microprofile.jdt.quarkus'];
const microprofileServerDir = '../quarkus-ls/microprofile.ls/com.redhat.microprofile.ls';
const extensionDir = '../quarkus-ls/microprofile.jdt';

const quarkusServerExtName = 'com.redhat.quarkus.ls-0.0.1-SNAPSHOT.jar';
const quarkusServerExtDir = '../quarkus-ls/quarkus.ls.ext/com.redhat.quarkus.ls'

gulp.task('buildMicroProfileServer', (done) => {
  cp.execSync(mvnw() + ' clean verify -DskipTests', { cwd: microprofileServerDir , stdio: 'inherit' });
  gulp.src(microprofileServerDir + '/target/' + microprofileServerName)
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildQuarkusServerExt', (done) => {
  cp.execSync(mvnw() + ' clean verify -DskipTests', { cwd: quarkusServerExtDir , stdio: 'inherit' });
  gulp.src(quarkusServerExtDir + '/target/' + quarkusServerExtName)
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildExtension', (done) => {
  cp.execSync(mvnw() + ' -pl "' + extensions.join(',') + '" clean verify -DskipTests' , { cwd: extensionDir, stdio: 'inherit' });
  extensions.forEach(extension => {
    gulp.src(extensionDir + '/' + extension + '/target/' + extension + '-*.jar')
      .pipe(rename(extension + '.jar'))
      .pipe(gulp.dest('./jars'));
  });
  done();
});

gulp.task('build', gulp.series('buildMicroProfileServer', 'buildQuarkusServerExt', 'buildExtension'));

function mvnw() {
	return isWin() ? 'mvnw.cmd' : './mvnw';
}

function isWin() {
	return /^win/.test(process.platform);
}
