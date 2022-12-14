import { randomUUID } from 'crypto'
import { BrowserWindow } from 'electron'
import { PROJECTS_FOLDER_PATH } from '../../constants'
import {
  CREATE_COMMAND_ENDPOINT,
  CREATE_PROJECT_ENDPOINT,
  EDITOR_CLOSE_PRISMA_STUDIO_ENDPOINT,
  EDITOR_LAUNCH_PRISMA_STUDIO_ENDPOINT,
  EDITOR_LAYOUT_NODES_ENDPOINT,
  GET_EDITOR_DATA_ENDPOINT,
  GET_FOLDER_DIRECTORY_ENDPOINT,
  GET_GLOBAL_SETTINGS_ENDPOINT,
  GET_PRISMA_DOCUMENT_ENDPOINT,
  GET_PRISMA_SCHEMA_PATH_ENDPOINT,
  GET_PROJECTS_LIST_ENDPOINT,
  UPDATE_PROJECT_ENDPOINT
} from '@shared/common/configs/api'
import { GlobalSettings, Project } from '@shared/common/models/Project'
import { createFile, readDirectoryFiles, readDirectoryPath } from '../../services/filesManager'
import {
  getPrismaDocument,
  getPrismaPreviewFeaturesList,
  readPrismaSchemaFile,
  readPrismaSchemaFilePath
} from '../../services/prisma'
import { WindowManager } from './models'
import WindowsManagerBase from './WindowsManagerBase'
import { readEditorData, ReadEditorDataOptions } from '../../services/editor'
import { Diagram } from '@shared/common/models/Diagram'
import { DiagramLayout } from '@shared/common/configs/diagrams'
import { layoutDiagramElements } from '../../services/diagrams'
import { PrismaCommand } from '@shared/common/models/Prisma'
import CommandsManager from '../commandsManager/CommandsManager'

export default class WindowsManager extends WindowsManagerBase {
  protected appWindow: WindowManager | undefined

  private readonly commandsManager = new CommandsManager()

  protected createAppWindow() {
    this.appWindow = this.createWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true
    })

    const browserWindow = this.appWindow!.getWindow()

    this.appWindow.createApiRoute(GET_PRISMA_DOCUMENT_ENDPOINT, async () => {
      const schemaSrc = await readPrismaSchemaFile(browserWindow)

      if (!schemaSrc) return schemaSrc

      return getPrismaDocument(schemaSrc)
    })

    this.appWindow.createApiRoute(GET_PRISMA_SCHEMA_PATH_ENDPOINT, () =>
      readPrismaSchemaFilePath(browserWindow)
    )

    this.appWindow.createApiRoute(GET_FOLDER_DIRECTORY_ENDPOINT, () =>
      readDirectoryPath(browserWindow, {
        title: 'Open project directory',
        buttonLabel: 'Open'
      })
    )

    this.appWindow.createApiRoute(GET_PROJECTS_LIST_ENDPOINT, async () => {
      const projects = await readDirectoryFiles(PROJECTS_FOLDER_PATH)

      return projects.map((project) => JSON.parse(project))
    })

    this.appWindow.createApiRoute(CREATE_PROJECT_ENDPOINT, async (args: Omit<Project, 'id'>) => {
      const id = randomUUID()
      const fileName = `${id}.json`

      const project: Project = { id, ...args }

      await createFile(PROJECTS_FOLDER_PATH, fileName, JSON.stringify(project))

      return project
    })

    this.appWindow.createApiRoute(GET_EDITOR_DATA_ENDPOINT, (args: ReadEditorDataOptions) =>
      readEditorData(args)
    )

    this.appWindow.createApiRoute(
      EDITOR_LAYOUT_NODES_ENDPOINT,
      async ({ diagram, layout }: { diagram: Diagram; layout: DiagramLayout }) =>
        layoutDiagramElements(diagram, layout)
    )

    this.appWindow.createApiRoute(GET_GLOBAL_SETTINGS_ENDPOINT, async () => {
      const settings: GlobalSettings = {
        prisma: {
          previewFeaturesList: getPrismaPreviewFeaturesList()
        }
      }

      return settings
    })

    this.appWindow.createApiRoute(UPDATE_PROJECT_ENDPOINT, async (project: Project) => {
      const fileName = `${project.id}.json`

      await createFile(PROJECTS_FOLDER_PATH, fileName, JSON.stringify(project))

      return project
    })

    this.appWindow.createApiRoute(
      CREATE_COMMAND_ENDPOINT,
      async (args: { project: Project; command: PrismaCommand }) => {
        const { project, command } = args

        const id = randomUUID()
        const fileName = `${project.id}.json`

        const fragment = { [id]: command }

        project.commands = project.commands ? { ...project.commands, ...fragment } : fragment

        await createFile(PROJECTS_FOLDER_PATH, fileName, JSON.stringify(project))

        return project
      }
    )

    this.appWindow.createApiRoute(
      EDITOR_LAUNCH_PRISMA_STUDIO_ENDPOINT,
      async (project: Project) => {
        const { prismaStudioPort, projectDirectory } = project
        this.commandsManager.launchPrismaStudio(prismaStudioPort, projectDirectory)
      }
    )

    this.appWindow.createApiRoute(EDITOR_CLOSE_PRISMA_STUDIO_ENDPOINT, async () => {
      this.commandsManager.killPrismaStudio()
    })
  }

  protected get allWindowsCount() {
    return BrowserWindow.getAllWindows().length
  }

  protected onAppClose() {
    return this.commandsManager.killAllProcesses()
  }
}
