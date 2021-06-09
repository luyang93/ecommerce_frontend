'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const path = require("path")
const url = require("url")
const child = require("child_process")
const MACOS = "darwin"
const WINDOWS = "win32"

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


var killStr = ""
var appPath = path.join(app.getAppPath(), "backend", "manage.py" )
var execPath = "python3"

var log = require("electron-log")
log.transports.console.level = true
log.transports.file.level = true
log.transports.file.level = "info"

if ( process.platform == WINDOWS ) {
  appPath = appPath.replace(/\\/g, "\\\\")
  execPath = path.join(app.getAppPath(), "env", "bin", "python3" )
} else if ( process.platform == MACOS ) {
  var macAbsolutePath = path.join(app.getAppPath(), "env", "bin", "python3")
  var env_path = macAbsolutePath+((process.env.PATH)?":"+process.env.PATH:"")
  process.env.PATH = env_path
  execPath = path.join(app.getAppPath(), "env", "bin", "python3" )
} else {
  log.error("Not on Windows or macOS?")
  throw new Error("Not on Windows or macOS?")
}

log.info("Environment:\n", process.env)

const childProcess = child.spawn(execPath, [appPath, "runserver", "0.0.0.0:8000")
childProcess.stdout.on("data", (data) => {
  log.info("stdout:\n", `${data}`)
})
childProcess.stderr.on("data", (data) => {
  log.info("stderr:\n", `${data}`)
})

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) 
    runBackend()
    createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  runBackend()
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
