## VSCode Quarkus
Prototype VSCode Quarkus tools extension.
Based on https://github.com/tsurdilo/quarkus-vsc

## What has been implemented?
* Generating a Quarkus Maven Project
  * Default values for groupId, artifactId etc.
  * "Last Used" option when selecting extensions
  * Back button works
  * No intermediate delay when going through the wizard
* Adding Quarkus extensions to a Quarkus project
  * Able to run the terminal commands to add Quarkus extensions to current project
* `settings.json` looks like the following:
```
"quarkus.tools.starter": {
    "apiUrl": "http://quarkus-generator.6923.rh-us-east-1.openshiftapps.com",
    "defaults": {
        "groupId": {last used groupId},
        "artifactId": {last used artifactId}",
        "projectVersion": {last used projectVersion},
        "packageName": {last used packageName},
        "resourceName": {last used resourceName},
        "extensions": [
            {
                "name": "Flyway",
                "labels": [
                    "flyway",
                    "database",
                    "data"
                ],
                "groupId": "io.quarkus",
                "artifactId": "quarkus-flyway",
                "guide": "https://quarkus.io/guides/flyway-guide"
            }
        ]
    }
}
```


## What needs to be done?
* Hide the `Quarkus: Add extensions to current project` command when the current project is not a Quarkus extension.
* Handle the situation where the current project has `.mvnw` or not. Currently when the user adds Quarkus extensions after
creating a starter project, the terminal command that runs is always prefixed with `mvn`.
* When adding extensions, extensions that are already installed should be excluded from the list of extensions.
* `settings.json`
  * The user cannot edit anything in `quarkus.tools.starter` without going into `settings.json`. Might be a poor experience to users.
  * Find a better place to store the last used extensions. [Spring Boot Initializr](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-initializr) does not save its last used extensions in `settings.json`.
  * Too much information is being saved for last used extensions. Only the artifactId should be saved.
* Many features are missing.
