import { PrismaCommand, PrismaDatasource, PrismaGenerator } from './Prisma'

export interface Project {
  id: string
  name: string
  schema: string
  projectDirectory?: string
  prismaStudioPort?: number
  commands?: Record<string, PrismaCommand>
}

export interface ProjectSettings {
  prisma: ProjectPrismaSettings
}

export interface ProjectPrismaSettings {
  datasources: Record<string, PrismaDatasource>
  generators: Record<string, PrismaGenerator>
}

export interface GlobalSettings {
  prisma: GlobalPrismaSettings
}

export interface GlobalPrismaSettings {
  previewFeaturesList: string[]
}
