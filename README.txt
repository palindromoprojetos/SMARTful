# Introduction 
TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project. 

# Getting Started
TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:
1.	Installation process
2.	Software dependencies
3.	Latest releases
4.	API references

# Build and Test
TODO: Describe and show how to build your code and run the tests. 

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

# Como deixar o NodeJS rodando como serviço

A solução para isso chama-se : Windows Service

https://pt.stackoverflow.com/questions/277299/como-deixar-o-nodejs-rodando-como-servi%C3%A7o

Por padrão, o seu site Node.js ficará executando enquanto a janela do console que iniciou seu site estiver funcionando. Se você fechar ela, ou seu servidor reiniciar, já era, seu site vai ficar fora do ar até que você execute o npm start de novo.

Para que isso não aconteça, você deve instalar seu site como um Windows Service. Para fazer isso, primeiro instale o módulo node-windows globalmente:
npm install -g node-windows

Agora rode o seguinte comando (dentro da pasta do seu projeto) para incluir uma referência deste módulo ao seu projeto:
npm link node-windows

Depois, dentro do seu projeto Node.js (na raiz) crie um arquivo service.js com o seguinte conteúdo:

var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Nome da sua Aplicação',
  description: 'Apenas uma descrição',
  script: 'C:\\domains\\sitenodejs\\bin\\www'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
Troque as propriedades name e description de acordo com seu gosto, mas atente à propriedade script nesse código, que deve conter o caminho absoluto até o arquivo JS que inicia sua aplicação. No meu caso, como estou usando express, estou apontando para o arquivo www que fica na pasta bin do projeto (curiosamente ele não possui extensão, mas é um arquivo).

Se você fez tudo corretamente, vá até Ferramentas Administrativas > Serviços (Administrative Tools > Services ou services.msc no Run/Executar do Windows) e seu serviço vai aparecer lá com o name que definiu ali no script, lhe permitindo alterar suas configurações de inicialização, dar Start, Stop, etc.

Caso precise remover esse serviço (para instalar uma versão mais atualizada, por exemplo) rode o comando abaixo no cmd:

SC STOP servicename
SC DELETE servicename
Espero que ajude :)

