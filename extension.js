// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let page=1;
  let name='';
  let data={};
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "someone-github-stars" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');

    vscode.window.showInputBox({placeHolder:'输入要查询的Name'}).then(editor=>{
      if (!editor) {
        return;
      }
      name=editor;
      getData();
    })


	});

  function getData(){
    console.log(name,page)
    axios.get(`https://api.github.com/users/${name}/starred?page=${page}&per_page=100`).then(res => {
      debugger;
      let arr = res.data
      if (arr && arr.length) {
        arr.reduce((monitor, item) => {
          if (item.language) {
            if (monitor[item.language]) {
              monitor[item.language].push(item)
            } else {
              monitor[item.language] = [item]
            }
          } else {
            monitor["Other"] ? monitor["Other"].push(item) : (monitor["Other"] = [item])
          }
          return monitor
        }, data)
        page++
        getData()
      } else {
        if (!Object.keys(data).length) {
		      vscode.window.showInformationMessage('无数据！');
        } else {
          debugger;
          console.log(data);
          // let md = new MarkdownIt({ html: true, linkify: true });
          // let mdStr='';
          // for(let key in this.data){
          //   mdStr+=`\n## ${key}`;
          //   let list=this.data[key];
          //   for(let obj of list){
          //     mdStr+=`\n- [${obj.name}](${obj.html_url})<svg
          //       xmlns="http://www.w3.org/2000/svg"
          //       aria-hidden="true"
          //       x="0px"
          //       y="0px"
          //       viewBox="0 0 100 100"
          //       width="15"
          //       height="15"
          //       class="icon outbound"
          //     >
          //       <path
          //         fill="currentColor"
          //         d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
          //       ></path>
          //       <polygon fill="currentColor" points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"></polygon>
          //     </svg> ${obj.description}`;
          //   }
          // }
          // this.htmlStr = md.render(mdStr);
        }
      }
    }).catch(error=>{
		  vscode.window.showInformationMessage(error);
    })
  }

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
