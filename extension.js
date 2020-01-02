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
  let page = 1;
  let name = '';
  let data = {};
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "someone-github-stars" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.githubStars', function () {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInputBox({ placeHolder: '输入要查询的Name' }).then(editor => {
      if (!editor) {
        return;
      }
      name = editor;
      vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left).show();
      getData();
    })
  });

  function getData() {
    axios.get(`https://api.github.com/users/${name}/starred?page=${page}&per_page=100`).then(res => {
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
          let mdStr = '';
          for (let key in data) {
            mdStr += `\n## ${key}`;
            let list = data[key];
            for (let obj of list) {
              mdStr += `\n- [${obj.name}](${obj.html_url})`;
            }
          }
          vscode.window.showTextDocument({ languageId: 'markdown', isUntitled: false }).then(e => {
            e.insertSnippet(new vscode.SnippetString(mdStr));
            page = 1;
            name = "";
            data = [];
          })
          // disposable.dispose();
        }
      }
    }).catch(error => {
      vscode.window.showErrorMessage(error.message);
    })
  }
  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  console.log('your extension "someone-github-stars" is now deactivate!');
}

module.exports = {
  activate,
  deactivate
}