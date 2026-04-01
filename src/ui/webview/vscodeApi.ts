declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  setState: (state: any) => void;
  getState: () => any;
};

const _vscode = acquireVsCodeApi();

export function postMessage(command: string, data?: Record<string, any>): void {
  _vscode.postMessage({ command, ...data });
}

export function getVsState(): any {
  return _vscode.getState();
}

export function setVsState(state: any): void {
  _vscode.setState(state);
}
