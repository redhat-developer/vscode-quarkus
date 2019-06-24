import { executeInTerminal } from "../terminal/quarkusterminalutils";

export function add() {
  console.log('about to execute something in terminal');
  const command = 'quarkus:add-extension -Dextensions="io.quarkus:quarkus-vertx"';
  executeInTerminal(command, true); 
}