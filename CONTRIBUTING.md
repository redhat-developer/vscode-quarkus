# Contribution Guide

Contributions are extremely welcome, no matter how big or small.
If you have any questions or suggestions we are happy to hear them.

## Project Structure
For vscode-quarkus to work, it relies on the
[Quarkus language server](https://github.com/redhat-developer/quarkus-ls/tree/master/quarkus.ls)
and the 
[Quarkus jdt.ls extension](https://github.com/redhat-developer/quarkus-ls/tree/master/quarkus.jdt)
. The Quarkus language server is responsible for providing
[LSP language features](https://microsoft.github.io/language-server-protocol/specification)
to VSCode, while the Quarkus jdt.ls extension is responsible for listening
to Java classpath changes and generating config setting metadata for
the `application.properties` file.
The reason why 
[vscode-java](https://github.com/redhat-developer/vscode-jav) 
is required for vscode-quarkus to work, is because vscode-java
starts the [jdt.ls](https://github.com/eclipse/eclipse.jdt.ls)
language server, which is required to run the Quarkus jdt.ls extension.  

![](images/componentDiagram.png)  
The image above represents communication between the three components. 
As the image implies, the Quarkus Language Server cannot directly 
communicate with the Quarkus jdt.ls extension and vice-versa. They must 
communicate via vscode-quarkus.  

Here is an example of how the components work together for
`application.properties` completion.  

Step 1. A Quarkus project is open is VSCode, and completion has been 
invoked inside the `application.properties` file, which sends a
`textDocument/completion` request to the Quarkus language server.  

Step 2. Quarkus language server checks its cache if completion options
exist.  
* If it exists the Quarkus language server sends them to VSCode 
as the response to the `textDocument/completion` request.
Communication is complete, and does not proceed to Step 3 
and onwards.
* If it does not exist, the Quarkus language server sends a 
custom request, `quarkus/projectInfo` to vscode-quarkus.  
Proceed to Step 3.  

Step 3. vscode-quarkus receives the `quarkus/projectInfo` request,
and runs the `quarkus.java.projectInfo` command. This command was
defined by the Quarkus jdt.ls extension.  

Step 4. The Quarkus jdt.ls extension receives the command, determines
information about the currently opened Quarkus project and returns
the information to vscode-quarkus.  

The information is computed by scanning all classes annotated with `@ConfigRoot` Quarkus annotation from all project classpath JARs and generating the proper Quarkus properties.

For instance if the project has a `pom.xml` with this dependency:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-core-deployment</artifactId>
</dependency>
```

The scanner will collect the [io.quarkus.deployment.ApplicationConfig](https://github.com/quarkusio/quarkus/blob/master/core/deployment/src/main/java/io/quarkus/deployment/ApplicationConfig.java) class annotated with `@ConfigRoot` and will generate a Quarkus property for each field:

 * `quarkus.application.name` for the `name` field.
 * `quarkus.application.version` for the `version` field.
 
In addition, the Quarkus jdt.ls extension is able to manage `Quarkus deployment JAR`. 

For instance if the project has a `pom.xml` with this dependency:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm</artifactId>
</dependency>
```

this JAR doesn't contain the classes annotated with `@ConfigRoot`. The JAR which contains those classes is `quarkus-hibernate-orm-deployment*.jar`. This information comes from 
the `META-INF/quarkus-extension.properties` of the `quarkus-hibernate-orm*.jar` as a property:
		 
```
deployment-artifact=io.quarkus\:quarkus-hibernate-orm-deployment\:0.21.1
```

Under the hood, the quarkus jdt.ls extension delegates the resolution (i.e. download) of those deployment jars to Maven, regardless of the user project's build system. So, a project depending on:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm</artifactId>
</dependency>
```

will generate some hibernate properties like:

 * `quarkus.hibernate-orm.dialect`
 * `quarkus.hibernate-orm.sql-load-script`
 
despite the fact that the following dependency was not declared in the `pom.xml`:

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-deployment</artifactId>
</dependency>
```
 
Step 5. vscode-quarkus receives the project information and sends it
to the Quarkus language server.  

Step 6. Quarkus language server receives the information, adds it 
to its cache, and returns the completion options stored in the 
project information as the response to the `textDocument/completion`
request. 


## Development Setup

### Installation Prerequisites

  * [Visual Studio Code](https://code.visualstudio.com/)
  * [Node.js](https://nodejs.org/en/)
  * [JDK 8+](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

### Setup
Step 1. Fork and clone this repository  

Step 2. Fork and clone the Quarkus jdt.ls extension and Quarkus language server, both located
in this [repository](https://github.com/redhat-developer/quarkus-ls).  

**Note:** Ensure that the cloned repositories are siblings:

```
YOUR_FOLDER/
         ├──── vscode-quarkus/
         │      
         ├──── quarkus-ls/
```  
Step 3. Navigate into `vscode-quarkus/`
```bash
$ cd vscode-quarkus/
```  
Step 4. Install npm dependencies
```bash
$ npm install
```  

Step 5. Build the Quarkus language server and Quarkus jdt.ls extension
```bash
$ npm run build
```
This script does two things.
1. Builds the Quarkus language server and places the jar in 
`vscode-quarkus/server/`.
2. Builds the Quarkus jdt.ls extension and places the jar in 
`vscode-quarkus/jars/`.  

In addition to `npm run build`, there are two more build scripts:  
`npm run build-server` only builds the Quarkus language server and places the jar in `vscode-quarkus/server/`.  
`npm run build-ext` only builds the Quarkus jdt.ls extension and places the jar in `vscode-quarkus/jars/`.

### Running vscode-quarkus
Step 1. Open `vscode-quarkus/` in VSCode.  

Step 2. Open the Debugging tab, select and run 
"Launch Extension (vscode-quarkus)" at the top left.
![](images/runExtension.png)

## Debugging  
### Debugging the Quarkus language server:
In an IDE of your choice, set the debugger configuration to connect
to localhost, port 1064.  

If using VSCode, open `quarkus-ls/quarkus.ls/` in VSCode. The proper
debugger configurations are already defined in `.vscode/`.
There should be a "Debug (Attach) - Remote (quarkus.ls)" option
at the top left of the Debugging tab.
![](images/runDebugger.png)  

The JVM arguments used to start the Quarkus language
server are specified
[here](https://github.com/redhat-developer/vscode-xml/blob/35c122edcce09038e853dfab112dd76813302034/src/javaServerStarter.ts#L26).

### Debugging the Quarkus jdt.ls extension:
Only Eclipse can be used to debug the Quarkus jdt.ls extension.  

Step 1. Open the jdt.ls source code in a new workspace in Eclipse by
following the setup
steps in the jdt.ls GitHub repository 
[here](https://github.com/eclipse/eclipse.jdt.ls#first-time-setup).  

Step 2. In the same workspace, import the projects in
`quarkus-ls/quarkus.jdt`.

Step 3. In the Debug dropdown menu, open "Debug Configurations...".  
![](images/debugConfigMenu.png)  

Step 4. Create a new "Remote Java Application" launch configuration.
Set the following settings and click "Apply".  
![](images/debugConfig.png)

