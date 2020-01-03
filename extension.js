// The module 'vscode' contains the VS Code extensibility API
const vscode=require('vscode');
const axios=require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  class Stars {
    constructor(page, name) {
      this.page = page
      this.name = name
      this.data={}
    }
    loading(text,getData) {
      return vscode.window.withProgress({
        title: `Searching for ${text}`,
        location: vscode.ProgressLocation.Notification,
        cancellable: true
      }, (progress, token) => {
        token.onCancellationRequested(() => {
          return Promise.resolve()
        })
        return getData()
      })
    }
    showInformationMessage(message) {
      return vscode.window.showInformationMessage(message)
    }
    showErrorMessage(message) {
      return vscode.window.showErrorMessage(message)
    }
    showTextDocument(options) {
      return vscode.window.showTextDocument(options)
    }
    SnippetString(value) {
      return new vscode.SnippetString(value)
    }
    showInputBox(options) {
      return vscode.window.showInputBox(options)
    }
    getData() {
      return axios.get(`https://api.github.com/users/${this.name}/starred?page=${this.page}&per_page=100`)
    }
  }
  console.log('Congratulations, your extension "someone-github-stars" is now active!');

  let disposable = vscode.commands.registerCommand('extension.githubStars', function () {
    let stars=new Stars(1,'');
    stars.showInputBox({ placeHolder: 'Input Search Name' }).then(editor => {
      if (!editor) {
        return;
      }
      stars.name = editor;
      stars.loading(editor,getData)
      function getData() {
        return new Promise((resolve, reject) =>{
          get();
          function get(){
            stars.getData().then(res => {
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
                }, stars.data)
                stars.page++
                get()
              } else {
                if (!Object.keys(stars.data).length) {
                  stars.showInformationMessage('No Data');
                } else {
                  let mdStr = `# ${stars.name} Stars\n`;
                  for (let key in stars.data) {
                    mdStr += `\n\n## ${key}`;
                    let list = stars.data[key];
                    for (let obj of list) {
                      mdStr += `\n- [${obj.name}](${obj.html_url})`;
                    }
                  }
                  stars.showTextDocument({ languageId: 'markdown', isUntitled: false }).then(e => {
                    e.insertSnippet(stars.SnippetString(mdStr));
                  })
                  resolve();
                }
              }
            }).catch(error => {
              reject();
              stars.showErrorMessage(error.message);
            })
          }
        });
      }
    })
  });
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